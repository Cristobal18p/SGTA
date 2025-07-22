const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS PROVEEDORES (GET)
const obtenerProveedores = async (req, res) => {
  const sql = `SELECT * FROM PROVEEDORES ORDER BY proveedor_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    res
      .status(500)
      .json({ error: "Error al obtener proveedores", details: error.message });
  }
};

// CREAR PROVEEDOR (POST)
const crearProveedor = async (req, res) => {
  if (!req.body.nombre_proveedor) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_proveedor",
    });
  }

  const sql = `
    INSERT INTO PROVEEDORES (
      proveedor_id, nombre_proveedor, telefono, direccion_id
    ) VALUES (
      proveedores_seq.NEXTVAL, :nombre_proveedor, :telefono, :direccion_id
    ) RETURNING proveedor_id INTO :proveedor_id
  `;

  const binds = {
    nombre_proveedor: req.body.nombre_proveedor,
    telefono: req.body.telefono,
    direccion_id: req.body.direccion_id,
    proveedor_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      proveedor_id: result.outBinds.proveedor_id[0],
      message: "Proveedor creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear proveedor", details: error.message });
  }
};

// ACTUALIZAR PROVEEDOR (PUT)
const actualizarProveedor = async (req, res) => {
  const { proveedor_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { proveedor_id };
  const setClauses = [];

  const camposPermitidos = ["nombre_proveedor", "telefono", "direccion_id"];

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
    UPDATE PROVEEDORES
    SET ${setClauses.join(", ")}
    WHERE proveedor_id = :proveedor_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Proveedor no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Proveedor actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el proveedor",
        details: error.message,
      });
  }
};

// ELIMINAR PROVEEDOR (DELETE)
const eliminarProveedor = async (req, res) => {
  const { proveedor_id } = req.params;
  const sql = `DELETE FROM PROVEEDORES WHERE proveedor_id = :proveedor_id`;

  try {
    await simpleExecute(sql, { proveedor_id });
    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el proveedor",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
