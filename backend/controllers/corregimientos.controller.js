const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS CORREGIMIENTOS (GET)
const obtenerCorregimientos = async (req, res) => {
  let sql = `SELECT * FROM CORREGIMIENTOS`;
  const binds = {};

  // Filtrar por distrito si se proporciona el parámetro
  if (req.query.distrito_id) {
    sql += ` WHERE distrito_id = :distrito_id`;
    binds.distrito_id = req.query.distrito_id;
  }

  sql += ` ORDER BY corregimiento_id`;

  try {
    const result = await simpleExecute(sql, binds);

    // Normalizar los nombres de campos de Oracle (MAYÚSCULAS) a minúsculas
    const corregimientosNormalizados = result.rows.map((corregimiento) => ({
      corregimiento_id: corregimiento.CORREGIMIENTO_ID,
      nombre_corregimiento: corregimiento.NOMBRE_CORREGIMIENTO,
      distrito_id: corregimiento.DISTRITO_ID,
    }));

    res.status(200).json({ success: true, data: corregimientosNormalizados });
  } catch (error) {
    console.error("Error al obtener corregimientos:", error);
    res.status(500).json({
      error: "Error al obtener corregimientos",
      details: error.message,
    });
  }
};

// CREAR CORREGIMIENTO (POST)
const crearCorregimiento = async (req, res) => {
  if (!req.body.nombre_corregimiento || !req.body.distrito_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["nombre_corregimiento", "distrito_id"],
    });
  }

  const sql = `
    INSERT INTO CORREGIMIENTOS (
      corregimiento_id, distrito_id, nombre_corregimiento
    ) VALUES (
      corregimientos_seq.NEXTVAL, :distrito_id, :nombre_corregimiento
    ) RETURNING corregimiento_id INTO :corregimiento_id
  `;

  const binds = {
    distrito_id: req.body.distrito_id,
    nombre_corregimiento: req.body.nombre_corregimiento,
    corregimiento_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      corregimiento_id: result.outBinds.corregimiento_id[0],
      message: "Corregimiento creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear corregimiento", details: error.message });
  }
};

// ACTUALIZAR CORREGIMIENTO (PUT)
const actualizarCorregimiento = async (req, res) => {
  const { corregimiento_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { corregimiento_id };
  const setClauses = [];

  const camposPermitidos = ["distrito_id", "nombre_corregimiento"];

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`);
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Ningún campo válido para actualizar fue proporcionado.",
    });
  }

  const sql = `
    UPDATE CORREGIMIENTOS
    SET ${setClauses.join(", ")}
    WHERE corregimiento_id = :corregimiento_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({
        message: "Corregimiento no encontrado con el ID proporcionado.",
      });
    }

    res.json({ message: "Corregimiento actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar corregimiento:", error);
    res.status(500).json({
      error: "Error al actualizar el corregimiento",
      details: error.message,
    });
  }
};

// ELIMINAR CORREGIMIENTO (DELETE)
const eliminarCorregimiento = async (req, res) => {
  const { corregimiento_id } = req.params;
  const sql = `DELETE FROM CORREGIMIENTOS WHERE corregimiento_id = :corregimiento_id`;

  try {
    await simpleExecute(sql, { corregimiento_id });
    res.json({ message: "Corregimiento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar corregimiento:", error);
    res.status(500).json({
      error: "Error al eliminar el corregimiento",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerCorregimientos,
  crearCorregimiento,
  actualizarCorregimiento,
  eliminarCorregimiento,
};
