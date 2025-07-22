const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { simpleExecute } = require("../config/CR7.js");

// Clave secreta para JWT (🔧 CAMBIAR POR UNA CLAVE SEGURA EN PRODUCCIÓN)
const JWT_SECRET = "tecnotaller_secret_key_2025";
const JWT_EXPIRES_IN = "24h";

// LOGIN - Autenticar usuario
const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Validar campos obligatorios
    if (!usuario || !password) {
      return res.status(400).json({
        error: "Campos obligatorios faltantes",
        requeridos: ["usuario", "password"],
      });
    }

    // Buscar usuario en la base de datos por email o nombre de usuario
    const sql = `
      SELECT 
        u.USUARIO_ID,
        u.NOMBRE_USUARIO,
        u.EMAIL_USUARIO,
        u.CLAVE_HASH,
        u.ROL_ID,
        u.ESTADO,
        r.NOMBRE_ROL as ROL_NOMBRE,
        p.PERSONAL_ID,
        p.PRIMER_NOMBRE,
        p.SEGUNDO_NOMBRE,
        p.PRIMER_APELLIDO,
        p.SEGUNDO_APELLIDO,
        p.NUMERO_CEDULA,
        p.TELEFONO,
        p.EMAIL as EMAIL_PERSONAL,
        p.NACIONALIDAD_ID,
        n.NOMBRE_NACIONALIDAD
      FROM USUARIOS u
      LEFT JOIN ROL r ON u.ROL_ID = r.ROL_ID
      LEFT JOIN PERSONAL p ON u.USUARIO_ID = p.USUARIO_ID
      LEFT JOIN NACIONALIDADES n ON p.NACIONALIDAD_ID = n.NACIONALIDAD_ID
      WHERE (LOWER(u.EMAIL_USUARIO) = LOWER(:usuario) OR LOWER(u.NOMBRE_USUARIO) = LOWER(:usuario))
        AND u.ESTADO = 'ACTIVO'
    `;

    const result = await simpleExecute(sql, { usuario });

    // Verificar si el usuario existe
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario/email o contraseña incorrectos",
      });
    }

    const usuarioDB = result.rows[0];

    // Verificar contraseña
    let passwordValida = false;
    // Log para depuración
    console.log("Password recibido:", password);
    console.log("Password en BD:", usuarioDB.CLAVE_HASH);
    if (usuarioDB.CLAVE_HASH && usuarioDB.CLAVE_HASH.startsWith("$2b$")) {
      // Es un hash bcrypt
      passwordValida = await bcrypt.compare(password, usuarioDB.CLAVE_HASH);
    } else {
      // Comparación texto plano
      passwordValida = password === usuarioDB.CLAVE_HASH;
    }

    if (!passwordValida) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Usuario/email o contraseña incorrectos",
      });
    }

    // Generar token JWT
    const tokenPayload = {
      usuario_id: usuarioDB.USUARIO_ID,
      email: usuarioDB.EMAIL_USUARIO,
      rol_id: usuarioDB.ROL_ID,
      rol_id: usuarioDB.ROL_ID,
      rol_nombre: usuarioDB.ROL_NOMBRE,
      descripcion_rol: usuarioDB.DESCRIPCION_ROL,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Datos relevantes del usuario para el frontend
    const userData = {
      usuario_id: usuarioDB.USUARIO_ID,
      nombre_usuario: usuarioDB.NOMBRE_USUARIO,
      email_usuario: usuarioDB.EMAIL_USUARIO,
      estado: usuarioDB.ESTADO,
      rol_nombre: usuarioDB.ROL_NOMBRE,
      personal: usuarioDB.PERSONAL_ID
        ? {
            personal_id: usuarioDB.PERSONAL_ID,
            primer_nombre: usuarioDB.PRIMER_NOMBRE,
            segundo_nombre: usuarioDB.SEGUNDO_NOMBRE,
            primer_apellido: usuarioDB.PRIMER_APELLIDO,
            segundo_apellido: usuarioDB.SEGUNDO_APELLIDO,
            numero_cedula: usuarioDB.NUMERO_CEDULA,
            telefono: usuarioDB.TELEFONO,
            email: usuarioDB.EMAIL_PERSONAL,
            nacionalidad_id: usuarioDB.NACIONALIDAD_ID,
            nombre_nacionalidad: usuarioDB.NOMBRE_NACIONALIDAD,
          }
        : null,
    };

    // Respuesta exitosa
    res.status(200).json({
      token,
      user: userData,
      message: "Login exitoso",
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
};

// VALIDAR TOKEN - Verificar si el token es válido
const validateToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    // Verificar si el header existe
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        valid: false,
        error: "Token no proporcionado",
      });
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Opcional: Verificar si el usuario aún existe y está activo
    const sql = `
      SELECT 
        u.USUARIO_ID,
        u.NOMBRE_USUARIO,
        u.EMAIL_USUARIO,
        u.CLAVE_HASH,
        u.ROL_ID,
        u.ESTADO,
        r.NOMBRE_ROL as ROL_NOMBRE,
        p.PERSONAL_ID,
        p.PRIMER_NOMBRE,
        p.SEGUNDO_NOMBRE,
        p.PRIMER_APELLIDO,
        p.SEGUNDO_APELLIDO,
        p.NUMERO_CEDULA,
        p.TELEFONO,
        p.EMAIL as EMAIL_PERSONAL,
        p.NACIONALIDAD_ID,
        n.NOMBRE_NACIONALIDAD
      FROM USUARIOS u
      LEFT JOIN ROL r ON u.ROL_ID = r.ROL_ID
      LEFT JOIN PERSONAL p ON u.USUARIO_ID = p.USUARIO_ID
      LEFT JOIN NACIONALIDADES n ON p.NACIONALIDAD_ID = n.NACIONALIDAD_ID
      WHERE u.USUARIO_ID = :usuario_id AND u.ESTADO = 'ACTIVO'
    `;

    const result = await simpleExecute(sql, { usuario_id: decoded.usuario_id });

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        valid: false,
        error: "Usuario no encontrado o inactivo",
      });
    }

    const usuario = result.rows[0];

    // Token válido
    res.status(200).json({
      valid: true,
      user: {
        usuario_id: usuario.USUARIO_ID,
        nombre_usuario: usuario.NOMBRE_USUARIO,
        email_usuario: usuario.EMAIL_USUARIO,
        estado: usuario.ESTADO,
        rol_nombre: usuario.ROL_NOMBRE,
        personal: usuario.PERSONAL_ID
          ? {
              personal_id: usuario.PERSONAL_ID,
              primer_nombre: usuario.PRIMER_NOMBRE,
              segundo_nombre: usuario.SEGUNDO_NOMBRE,
              primer_apellido: usuario.PRIMER_APELLIDO,
              segundo_apellido: usuario.SEGUNDO_APELLIDO,
              numero_cedula: usuario.NUMERO_CEDULA,
              telefono: usuario.TELEFONO,
              email: usuario.EMAIL_PERSONAL,
              nacionalidad_id: usuario.NACIONALIDAD_ID,
              nombre_nacionalidad: usuario.NOMBRE_NACIONALIDAD,
            }
          : null,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        valid: false,
        error: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        valid: false,
        error: "Token inválido",
      });
    }

    console.error("Error validando token:", error);
    res.status(500).json({
      valid: false,
      error: "Error interno del servidor",
      details: error.message,
    });
  }
};

// LOGOUT - Cerrar sesión (opcional, para limpiar el token en el frontend)
const logout = async (req, res) => {
  // En JWT no necesitamos hacer nada en el servidor
  // El frontend debe eliminar el token del localStorage
  res.status(200).json({
    message: "Logout exitoso",
  });
};

// REFRESH TOKEN - Renovar token (opcional)
const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token no proporcionado",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Generar nuevo token
    const newTokenPayload = {
      usuario_id: decoded.usuario_id,
      email: decoded.email,
      rol_id: decoded.rol_id,
    };

    const newToken = jwt.sign(newTokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      token: newToken,
      message: "Token renovado exitosamente",
    });
  } catch (error) {
    console.error("Error renovando token:", error);
    res.status(401).json({
      error: "Error al renovar token",
      details: error.message,
    });
  }
};

module.exports = {
  login,
  validateToken,
  logout,
  refreshToken,
};
