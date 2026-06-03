const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER DIRECCIÓN POR ID CON DATOS DE UBICACIÓN COMPLETOS (GET)
const obtenerDireccionPorId = async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      d.direccion_id,
      d.corregimiento_id,
      d.detalle_direccion,
      c.nombre_corregimiento,
      dt.distrito_id,
      dt.nombre_distrito,
      p.provincia_id,
      p.nombre_provincia
    FROM DIRECCIONES d
    JOIN CORREGIMIENTOS c ON d.corregimiento_id = c.corregimiento_id
    JOIN DISTRITOS dt ON c.distrito_id = dt.distrito_id
    JOIN PROVINCIAS p ON dt.provincia_id = p.provincia_id
    WHERE d.direccion_id = :id
  `;

  try {
    const result = await simpleExecute(sql, { id });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Dirección no encontrada",
      });
    }

    // Normalizar los nombres de campos de Oracle para el frontend
    const direccionNormalizada = {
      direccion_id: result.rows[0].DIRECCION_ID,
      corregimiento_id: result.rows[0].CORREGIMIENTO_ID,
      detalle_direccion: result.rows[0].DETALLE_DIRECCION,
      nombre_corregimiento: result.rows[0].NOMBRE_CORREGIMIENTO,
      distrito_id: result.rows[0].DISTRITO_ID,
      nombre_distrito: result.rows[0].NOMBRE_DISTRITO,
      provincia_id: result.rows[0].PROVINCIA_ID,
      nombre_provincia: result.rows[0].NOMBRE_PROVINCIA,
    };

    console.log("Direccion completa obtenida:", direccionNormalizada);

    res.status(200).json({
      success: true,
      data: direccionNormalizada,
    });
  } catch (error) {
    console.error("Error al obtener dirección por ID:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener dirección",
      details: error.message,
    });
  }
};

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
      success: true,
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

    res.json({
      success: true,
      message: "Dirección actualizada exitosamente",
    });
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
  obtenerDireccionPorId,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
};
