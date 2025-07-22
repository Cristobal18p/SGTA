const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS DIRECCIONES (GET)
const obtenerDirecciones = async (req, res) => {
  const sql = `SELECT * FROM DIRECCIONES ORDER BY direccion_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    res
      .status(500)
      .json({ error: "Error al obtener direcciones", details: error.message });
  }
};

// CREAR DIRECCIÓN (POST)
const crearDireccion = async (req, res) => {
  if (!req.body.corregimiento_id || !req.body.detalle_direccion) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["corregimiento_id", "detalle_direccion"],
    });
  }

  const sql = `
    INSERT INTO DIRECCIONES (
      corregimiento_id, detalle_direccion
    ) VALUES (
      :corregimiento_id, :detalle_direccion
    ) RETURNING direccion_id INTO :direccion_id
  `;

  const binds = {
    corregimiento_id: req.body.corregimiento_id,
    detalle_direccion: req.body.detalle_direccion,
    direccion_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      direccion_id: result.outBinds.direccion_id[0],
      message: "Dirección creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear dirección", details: error.message });
  }
};

// ACTUALIZAR DIRECCIÓN (PUT)
const actualizarDireccion = async (req, res) => {
  const { direccion_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { direccion_id };
  const setClauses = [];

  const camposPermitidos = ["corregimiento_id", "detalle_direccion"];

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
    UPDATE DIRECCIONES
    SET ${setClauses.join(", ")}
    WHERE direccion_id = :direccion_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Dirección no encontrada con el ID proporcionado." });
    }

    res.json({ message: "Dirección actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    res.status(500).json({
      error: "Error al actualizar la dirección",
      details: error.message,
    });
  }
};

// ELIMINAR DIRECCIÓN (BORRADO LÓGICO)
const eliminarDireccion = async (req, res) => {
  const { direccion_id } = req.params;
  // Cambia el estado a 'ELIMINADO' en vez de borrar físicamente
  const sql = `UPDATE DIRECCIONES SET estado = 'ELIMINADO' WHERE direccion_id = :direccion_id`;

  try {
    const resultado = await simpleExecute(sql, { direccion_id });
    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Dirección no encontrada con el ID proporcionado." });
    }
    res.json({ message: "Dirección eliminada (borrado lógico) exitosamente" });
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    res.status(500).json({
      error: "Error al eliminar la dirección",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerDirecciones,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
};
