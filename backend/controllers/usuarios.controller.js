const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS USUARIOS (GET)
const obtenerUsuarios = async (req, res) => {
  const sql = `SELECT * FROM USUARIOS ORDER BY usuario_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener usuarios", details: error.message });
  }
};

// CREAR USUARIO (POST)
const crearUsuario = async (req, res) => {
  if (
    !req.body.nombre_usuario ||
    !req.body.email_usuario ||
    !req.body.clave_hash ||
    !req.body.rol_id
  ) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["nombre_usuario", "email_usuario", "clave_hash", "rol_id"],
    });
  }

  const sql = `
    INSERT INTO USUARIOS (
      usuario_id, nombre_usuario, email_usuario, clave_hash, rol_id, estado, fecha_creacion
    ) VALUES (
      usuarios_seq.NEXTVAL, :nombre_usuario, :email_usuario, :clave_hash, :rol_id, :estado, SYSDATE
    ) RETURNING usuario_id INTO :usuario_id
  `;

  const binds = {
    nombre_usuario: req.body.nombre_usuario,
    email_usuario: req.body.email_usuario,
    clave_hash: req.body.clave_hash,
    rol_id: req.body.rol_id,
    estado: req.body.estado || "ACTIVO",
    usuario_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      usuario_id: result.outBinds.usuario_id[0],
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear usuario", details: error.message });
  }
};

// ACTUALIZAR USUARIO (PUT)
const actualizarUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { usuario_id };
  const setClauses = [];

  const camposPermitidos = [
    "nombre_usuario",
    "email_usuario",
    "clave_hash",
    "rol_id",
    "estado",
  ];

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`);
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res
      .status(400)
      .json({
        error: "Ningún campo válido para actualizar fue proporcionado.",
      });
  }

  const sql = `
    UPDATE USUARIOS
    SET ${setClauses.join(", ")}
    WHERE usuario_id = :usuario_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el usuario",
        details: error.message,
      });
  }
};

// ELIMINAR USUARIO (DELETE)
const eliminarUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  const sql = `DELETE FROM USUARIOS WHERE usuario_id = :usuario_id`;

  try {
    await simpleExecute(sql, { usuario_id });
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el usuario", details: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
