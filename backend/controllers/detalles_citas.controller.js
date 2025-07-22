const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS DETALLES DE CITAS (GET)
const obtenerDetallesCitas = async (req, res) => {
  const sql = `SELECT * FROM DETALLES_CITAS ORDER BY detalle_cita_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalles de citas:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener detalles de citas",
        details: error.message,
      });
  }
};

// CREAR DETALLE DE CITA (POST)
const crearDetalleCita = async (req, res) => {
  if (!req.body.cita_id || !req.body.servicio_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["cita_id", "servicio_id"],
    });
  }

  const sql = `
    INSERT INTO DETALLES_CITAS (
      detalle_cita_id, cita_id, servicio_id, precio_acordado, observaciones
    ) VALUES (
      detalles_citas_seq.NEXTVAL, :cita_id, :servicio_id, :precio_acordado, :observaciones
    ) RETURNING detalle_cita_id INTO :detalle_cita_id
  `;

  const binds = {
    cita_id: req.body.cita_id,
    servicio_id: req.body.servicio_id,
    precio_acordado: req.body.precio_acordado,
    observaciones: req.body.observaciones,
    detalle_cita_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      detalle_cita_id: result.outBinds.detalle_cita_id[0],
      message: "Detalle de cita creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear detalle de cita",
        details: error.message,
      });
  }
};

// ACTUALIZAR DETALLE DE CITA (PUT)
const actualizarDetalleCita = async (req, res) => {
  const { detalle_cita_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { detalle_cita_id };
  const setClauses = [];

  const camposPermitidos = [
    "cita_id",
    "servicio_id",
    "precio_acordado",
    "observaciones",
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
    UPDATE DETALLES_CITAS
    SET ${setClauses.join(", ")}
    WHERE detalle_cita_id = :detalle_cita_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Detalle de cita no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Detalle de cita actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar detalle de cita:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el detalle de cita",
        details: error.message,
      });
  }
};

// ELIMINAR DETALLE DE CITA (DELETE)
const eliminarDetalleCita = async (req, res) => {
  const { detalle_cita_id } = req.params;
  const sql = `DELETE FROM DETALLES_CITAS WHERE detalle_cita_id = :detalle_cita_id`;

  try {
    await simpleExecute(sql, { detalle_cita_id });
    res.json({ message: "Detalle de cita eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar detalle de cita:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el detalle de cita",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerDetallesCitas,
  crearDetalleCita,
  actualizarDetalleCita,
  eliminarDetalleCita,
};
