const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS NACIONALIDADES (GET)
const obtenerNacionalidades = async (req, res) => {
  const sql = `SELECT * FROM NACIONALIDADES ORDER BY nacionalidad_id`;

  try {
    const result = await simpleExecute(sql);

    // Normalizar los nombres de campos de Oracle para el frontend
    const nacionalidadesNormalizadas = result.rows.map((row) => ({
      nacionalidad_id: row.NACIONALIDAD_ID,
      nombre_nacionalidad: row.NOMBRE_NACIONALIDAD,
    }));

    res.status(200).json({
      success: true,
      data: nacionalidadesNormalizadas,
    });
  } catch (error) {
    console.error("Error al obtener nacionalidades:", error);
    res.status(500).json({
      error: "Error al obtener nacionalidades",
      details: error.message,
    });
  }
};

// CREAR NACIONALIDAD (POST)
const crearNacionalidad = async (req, res) => {
  if (!req.body.nombre_nacionalidad) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_nacionalidad",
    });
  }

  const sql = `
    INSERT INTO NACIONALIDADES (
      nacionalidad_id, nombre_nacionalidad
    ) VALUES (
      nacionalidades_seq.NEXTVAL, :nombre_nacionalidad
    ) RETURNING nacionalidad_id INTO :nacionalidad_id
  `;

  const binds = {
    nombre_nacionalidad: req.body.nombre_nacionalidad,
    nacionalidad_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      nacionalidad_id: result.outBinds.nacionalidad_id[0],
      message: "Nacionalidad creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear nacionalidad", details: error.message });
  }
};

// ACTUALIZAR NACIONALIDAD (PUT)
const actualizarNacionalidad = async (req, res) => {
  const { nacionalidad_id } = req.params;

  if (!req.body.nombre_nacionalidad) {
    return res.status(400).json({
      error: "Debes proporcionar el campo nombre_nacionalidad para actualizar.",
    });
  }

  const sql = `
    UPDATE NACIONALIDADES
    SET nombre_nacionalidad = :nombre_nacionalidad
    WHERE nacionalidad_id = :nacionalidad_id
  `;

  const binds = {
    nacionalidad_id,
    nombre_nacionalidad: req.body.nombre_nacionalidad,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({
        message: "Nacionalidad no encontrada con el ID proporcionado.",
      });
    }

    res.json({ message: "Nacionalidad actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar nacionalidad:", error);
    res.status(500).json({
      error: "Error al actualizar la nacionalidad",
      details: error.message,
    });
  }
};

// ELIMINAR NACIONALIDAD (DELETE)
const eliminarNacionalidad = async (req, res) => {
  const { nacionalidad_id } = req.params;
  const sql = `DELETE FROM NACIONALIDADES WHERE nacionalidad_id = :nacionalidad_id`;

  try {
    await simpleExecute(sql, { nacionalidad_id });
    res.json({ message: "Nacionalidad eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar nacionalidad:", error);
    res.status(500).json({
      error: "Error al eliminar la nacionalidad",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerNacionalidades,
  crearNacionalidad,
  actualizarNacionalidad,
  eliminarNacionalidad,
};
