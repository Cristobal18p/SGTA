const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// Obtener perfiles completo
const obtenerPerfil = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const sqlPerfil = `
      SELECT 
        u.usuario_id, 
        u.nombre_usuario, 
        u.email_usuario, 
        p.primer_nombre, 
        p.segundo_nombre, 
        p.primer_apellido,
        p.segundo_apellido,
        p.numero_cedula, 
        p.telefono, 
        p.email AS email_personal, 
        n.nombre_nacionalidad,
        r.nombre_rol
      FROM USUARIOS u
      JOIN PERSONAL p ON u.usuario_id = p.usuario_id
      JOIN NACIONALIDADES n ON p.nacionalidad_id = n.nacionalidad_id
      JOIN ROL r ON u.rol_id = r.rol_id
      WHERE u.usuario_id = :usuario_id
    `;

    const result = await simpleExecute(sqlPerfil, { usuario_id });

    res.status(200).json(result.rows[0] || null);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res
      .status(500)
      .json({ error: "Error al obtener perfil", details: error.message });
  }
};

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
  const { usuario_id } = req.params;
  const {
    nombre_usuario,
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    telefono,
    email_personal,
    clave_hash,
  } = req.body;

  try {
    // Validar que al menos un campo sea proporcionado
    if (
      !nombre_usuario &&
      !primer_nombre &&
      segundo_nombre === undefined &&
      primer_apellido === undefined &&
      segundo_apellido === undefined &&
      !telefono &&
      !email_personal &&
      !clave_hash
    ) {
      return res.status(400).json({
        error: "Debe proporcionar al menos un campo para actualizar",
      });
    }

    // Inicializar arrays para construir la consulta dinámicamente
    const updateFieldsUsuarios = [];
    const updateFieldsPersonal = [];
    const paramsUsuarios = { usuario_id };
    const paramsPersonal = { usuario_id };

    // Construir consulta para tabla USUARIOS
    if (nombre_usuario) {
      updateFieldsUsuarios.push("nombre_usuario = :nombre_usuario");
      paramsUsuarios.nombre_usuario = nombre_usuario;
    }
    if (clave_hash) {
      updateFieldsUsuarios.push("clave_hash = :clave_hash");
      paramsUsuarios.clave_hash = clave_hash;
    }

    // Construir consulta para tabla PERSONAL
    if (primer_nombre) {
      updateFieldsPersonal.push("primer_nombre = :primer_nombre");
      paramsPersonal.primer_nombre = primer_nombre;
    }
    if (segundo_nombre !== undefined) {
      updateFieldsPersonal.push("segundo_nombre = :segundo_nombre");
      paramsPersonal.segundo_nombre = segundo_nombre;
    }
    if (primer_apellido !== undefined) {
      updateFieldsPersonal.push("primer_apellido = :primer_apellido");
      paramsPersonal.primer_apellido = primer_apellido;
    }
    if (segundo_apellido !== undefined) {
      updateFieldsPersonal.push("segundo_apellido = :segundo_apellido");
      paramsPersonal.segundo_apellido = segundo_apellido;
    }
    if (telefono) {
      updateFieldsPersonal.push("telefono = :telefono");
      paramsPersonal.telefono = telefono;
    }
    if (email_personal) {
      updateFieldsPersonal.push("email = :email_personal");
      paramsPersonal.email_personal = email_personal;
    }

    // Ejecutar actualizaciones
    const promises = [];

    if (updateFieldsUsuarios.length > 0) {
      const sqlUsuarios = `UPDATE USUARIOS SET ${updateFieldsUsuarios.join(
        ", "
      )} WHERE usuario_id = :usuario_id`;
      promises.push(simpleExecute(sqlUsuarios, paramsUsuarios));
    }

    if (updateFieldsPersonal.length > 0) {
      const sqlPersonal = `UPDATE PERSONAL SET ${updateFieldsPersonal.join(
        ", "
      )} WHERE usuario_id = :usuario_id`;
      promises.push(simpleExecute(sqlPersonal, paramsPersonal));
    }

    // Ejecutar todas las actualizaciones
    await Promise.all(promises);

    res.status(200).json({
      message: "Perfil actualizado correctamente",
      updated_fields: {
        usuarios: updateFieldsUsuarios.length > 0,
        personal: updateFieldsPersonal.length > 0,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      error: "Error al actualizar perfil",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
};
