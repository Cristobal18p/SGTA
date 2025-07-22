const { simpleExecute } = require("../config/CR7.js");

// OBTENER ESTADÍSTICAS GENERALES (GET)
const obtenerEstadisticas = async (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM clientes) AS total_clientes,
      (SELECT COUNT(*) FROM citas WHERE TRUNC(fecha_cita) = TRUNC(SYSDATE)) AS citas_hoy,
      (SELECT COUNT(*) FROM citas WHERE estado = 'AGENDADA') AS citas_pendientes,
      (SELECT COUNT(*) FROM vehiculos) AS total_vehiculos,
      (SELECT COUNT(*) FROM facturas WHERE EXTRACT(MONTH FROM fecha_emision) = EXTRACT(MONTH FROM SYSDATE) AND EXTRACT(YEAR FROM fecha_emision) = EXTRACT(YEAR FROM SYSDATE)) AS facturas_mes,
      (SELECT NVL(SUM(total_factura), 0) FROM facturas WHERE EXTRACT(MONTH FROM fecha_emision) = EXTRACT(MONTH FROM SYSDATE) AND EXTRACT(YEAR FROM fecha_emision) = EXTRACT(YEAR FROM SYSDATE)) AS ingreso_mes
    FROM dual
  `;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener estadísticas", details: error.message });
  }
};

module.exports = {
  obtenerEstadisticas,
};
