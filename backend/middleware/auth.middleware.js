const jwt = require("jsonwebtoken");
const { simpleExecute } = require("../config/CR7.js");

// Clave secreta para JWT (cargada desde variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno. Configura tu archivo .env");
}

// Middleware para verificar token de autenticación
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Verificar si el header existe
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Acceso denegado",
        message: "Token de autenticación requerido",
      });
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Opcional: Verificar si el usuario aún existe y está activo
    const sql = `
      SELECT usuario_id, email, activo, rol_id
      FROM USUARIOS 
      WHERE usuario_id = :usuario_id AND activo = 1
    `;

    const result = await simpleExecute(sql, { usuario_id: decoded.usuario_id });

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        error: "Acceso denegado",
        message: "Usuario no encontrado o inactivo",
      });
    }

    // Agregar información del usuario al request
    req.user = {
      usuario_id: decoded.usuario_id,
      email: decoded.email,
      rol_id: decoded.rol_id,
    };

    next(); // Continuar con la siguiente función
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado",
        message: "Por favor, inicia sesión nuevamente",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token inválido",
        message: "Token de autenticación inválido",
      });
    }

    console.error("Error en middleware de autenticación:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
};

// Middleware para verificar roles específicos
const verifyRole = (rolesPermitidos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "Usuario no autenticado",
        });
      }

      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (!rolesPermitidos.includes(req.user.rol_id)) {
        return res.status(403).json({
          error: "Acceso denegado",
          message: "No tienes permisos para realizar esta acción",
        });
      }

      next();
    } catch (error) {
      console.error("Error en middleware de roles:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        details: error.message,
      });
    }
  };
};

module.exports = {
  verifyToken,
  verifyRole,
};
