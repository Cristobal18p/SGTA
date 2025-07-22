const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS ROLES (GET)
const obtenerRoles = async (req, res) => {
  const sql = `SELECT * FROM ROL ORDER BY rol_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
    console.log("Roles correctamente mostrado");
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res
      .status(500)
      .json({ error: "Error al obtener roles", details: error.message });
  }
};

// CREAR ROL (POST)
const crearRol = async (req, res) => {
  if (!req.body.nombre_rol || !req.body.descripcion_rol) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["nombre_rol", "descripcion_rol"],
    });
  }

  const sql = `
    INSERT INTO ROL (
      rol_id, nombre_rol, descripcion_rol
    ) VALUES (
      rol_seq.NEXTVAL, :nombre_rol, :descripcion_rol
    ) RETURNING rol_id INTO :rol_id
  `;

  const binds = {
    nombre_rol: req.body.nombre_rol,
    descripcion_rol: req.body.descripcion_rol,
    rol_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      rol_id: result.outBinds.rol_id[0],
      message: "Rol creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear rol", details: error.message });
  }
};

// ACTUALIZAR ROL (PUT)
const actualizarRol = async (req, res) => {
  const { rol_id } = req.params;

  if (!req.body.nombre_rol && !req.body.descripcion_rol) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { rol_id };
  const setClauses = [];

  if (req.body.nombre_rol) {
    setClauses.push("nombre_rol = :nombre_rol");
    binds.nombre_rol = req.body.nombre_rol;
  }

  if (req.body.descripcion_rol) {
    setClauses.push("descripcion_rol = :descripcion_rol");
    binds.descripcion_rol = req.body.descripcion_rol;
  }

  const sql = `
    UPDATE ROL
    SET ${setClauses.join(", ")}
    WHERE rol_id = :rol_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Rol no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Rol actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el rol", details: error.message });
  }
};

// ELIMINAR ROL (DELETE)
const eliminarRol = async (req, res) => {
  const { rol_id } = req.params;
  const sql = `DELETE FROM ROL WHERE rol_id = :rol_id`;

  try {
    await simpleExecute(sql, { rol_id });
    res.json({ message: "Rol eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar rol:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el rol", details: error.message });
  }
};

module.exports = {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
};
