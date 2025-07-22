const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS ASIGNACIONES DE TÉCNICOS (GET)
const obtenerAsignacionesTecnicos = async (req, res) => {
  const sql = `SELECT * FROM ASIGNACIONES_TECNICOS ORDER BY asignacion_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener asignaciones de técnicos:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener asignaciones de técnicos",
        details: error.message,
      });
  }
};

// CREAR ASIGNACIÓN DE TÉCNICO (POST)
const crearAsignacionTecnico = async (req, res) => {
  if (!req.body.detalle_cita_id || !req.body.personal_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["detalle_cita_id", "personal_id"],
    });
  }

  const sql = `
    INSERT INTO ASIGNACIONES_TECNICOS (
      asignacion_id, detalle_cita_id, personal_id, porcentaje_participacion
    ) VALUES (
      asignaciones_tecnicos_seq.NEXTVAL, :detalle_cita_id, :personal_id, :porcentaje_participacion
    ) RETURNING asignacion_id INTO :asignacion_id
  `;

  const binds = {
    detalle_cita_id: req.body.detalle_cita_id,
    personal_id: req.body.personal_id,
    porcentaje_participacion: req.body.porcentaje_participacion,
    asignacion_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      asignacion_id: result.outBinds.asignacion_id[0],
      message: "Asignación de técnico creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear asignación de técnico",
        details: error.message,
      });
  }
};

// ACTUALIZAR ASIGNACIÓN DE TÉCNICO (PUT)
const actualizarAsignacionTecnico = async (req, res) => {
  const { asignacion_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { asignacion_id };
  const setClauses = [];

  const camposPermitidos = [
    "detalle_cita_id",
    "personal_id",
    "porcentaje_participacion",
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
    UPDATE ASIGNACIONES_TECNICOS
    SET ${setClauses.join(", ")}
    WHERE asignacion_id = :asignacion_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message:
            "Asignación de técnico no encontrada con el ID proporcionado.",
        });
    }

    res.json({ message: "Asignación de técnico actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar asignación de técnico:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar la asignación de técnico",
        details: error.message,
      });
  }
};

// ELIMINAR ASIGNACIÓN DE TÉCNICO (DELETE)
const eliminarAsignacionTecnico = async (req, res) => {
  const { asignacion_id } = req.params;
  const sql = `DELETE FROM ASIGNACIONES_TECNICOS WHERE asignacion_id = :asignacion_id`;

  try {
    await simpleExecute(sql, { asignacion_id });
    res.json({ message: "Asignación de técnico eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar asignación de técnico:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar la asignación de técnico",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerAsignacionesTecnicos,
  crearAsignacionTecnico,
  actualizarAsignacionTecnico,
  eliminarAsignacionTecnico,
};
