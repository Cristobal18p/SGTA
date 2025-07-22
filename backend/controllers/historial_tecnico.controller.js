const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODO EL HISTORIAL TÉCNICO (GET)
const obtenerHistorialTecnico = async (req, res) => {
  const sql = `SELECT * FROM HISTORIAL_TECNICO ORDER BY historial_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener historial técnico:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener historial técnico",
        details: error.message,
      });
  }
};

// CREAR HISTORIAL TÉCNICO (POST)
const crearHistorialTecnico = async (req, res) => {
  if (!req.body.vehiculo_id || !req.body.detalle_cita_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["vehiculo_id", "detalle_cita_id"],
    });
  }

  const sql = `
    INSERT INTO HISTORIAL_TECNICO (
      historial_id, vehiculo_id, detalle_cita_id, descripcion_trabajo, fecha_registro
    ) VALUES (
      historial_tecnico_seq.NEXTVAL, :vehiculo_id, :detalle_cita_id, :descripcion_trabajo, SYSDATE
    ) RETURNING historial_id INTO :historial_id
  `;

  const binds = {
    vehiculo_id: req.body.vehiculo_id,
    detalle_cita_id: req.body.detalle_cita_id,
    descripcion_trabajo: req.body.descripcion_trabajo,
    historial_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      historial_id: result.outBinds.historial_id[0],
      message: "Historial técnico creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear historial técnico",
        details: error.message,
      });
  }
};

// ACTUALIZAR HISTORIAL TÉCNICO (PUT)
const actualizarHistorialTecnico = async (req, res) => {
  const { historial_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { historial_id };
  const setClauses = [];

  const camposPermitidos = [
    "vehiculo_id",
    "detalle_cita_id",
    "descripcion_trabajo",
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
    UPDATE HISTORIAL_TECNICO
    SET ${setClauses.join(", ")}
    WHERE historial_id = :historial_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Historial técnico no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Historial técnico actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar historial técnico:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el historial técnico",
        details: error.message,
      });
  }
};

// ELIMINAR HISTORIAL TÉCNICO (DELETE)
const eliminarHistorialTecnico = async (req, res) => {
  const { historial_id } = req.params;
  const sql = `DELETE FROM HISTORIAL_TECNICO WHERE historial_id = :historial_id`;

  try {
    await simpleExecute(sql, { historial_id });
    res.json({ message: "Historial técnico eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar historial técnico:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el historial técnico",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerHistorialTecnico,
  crearHistorialTecnico,
  actualizarHistorialTecnico,
  eliminarHistorialTecnico,
};
