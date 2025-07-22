const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS PROVINCIAS (GET)
const obtenerProvincias = async (req, res) => {
  const sql = `SELECT * FROM PROVINCIAS ORDER BY provincia_id`;

  try {
    const result = await simpleExecute(sql);
    // Mapeo de claves a minúsculas
    const provincias = result.rows.map((prov) => ({
      provincia_id: prov.PROVINCIA_ID,
      pais_id: prov.PAIS_ID,
      nombre_provincia: prov.NOMBRE_PROVINCIA,
    }));
    res.status(200).json({ success: true, data: provincias });
  } catch (error) {
    console.error("Error al obtener provincias:", error);
    res
      .status(500)
      .json({ error: "Error al obtener provincias", details: error.message });
  }
};

// CREAR PROVINCIA (POST)
const crearProvincia = async (req, res) => {
  if (!req.body.nombre_provincia || !req.body.pais_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["nombre_provincia", "pais_id"],
    });
  }

  const sql = `
    INSERT INTO PROVINCIAS (
      provincia_id, pais_id, nombre_provincia
    ) VALUES (
      provincias_seq.NEXTVAL, :pais_id, :nombre_provincia
    ) RETURNING provincia_id INTO :provincia_id
  `;

  const binds = {
    pais_id: req.body.pais_id,
    nombre_provincia: req.body.nombre_provincia,
    provincia_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      provincia_id: result.outBinds.provincia_id[0],
      message: "Provincia creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear provincia", details: error.message });
  }
};

// ACTUALIZAR PROVINCIA (PUT)
const actualizarProvincia = async (req, res) => {
  const { provincia_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { provincia_id };
  const setClauses = [];

  const camposPermitidos = ["pais_id", "nombre_provincia"];

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
    UPDATE PROVINCIAS
    SET ${setClauses.join(", ")}
    WHERE provincia_id = :provincia_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Provincia no encontrada con el ID proporcionado." });
    }

    res.json({ message: "Provincia actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar provincia:", error);
    res.status(500).json({
      error: "Error al actualizar la provincia",
      details: error.message,
    });
  }
};

// ELIMINAR PROVINCIA (DELETE)
const eliminarProvincia = async (req, res) => {
  const { provincia_id } = req.params;
  const sql = `DELETE FROM PROVINCIAS WHERE provincia_id = :provincia_id`;

  try {
    await simpleExecute(sql, { provincia_id });
    res.json({ message: "Provincia eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar provincia:", error);
    res.status(500).json({
      error: "Error al eliminar la provincia",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerProvincias,
  crearProvincia,
  actualizarProvincia,
  eliminarProvincia,
};
