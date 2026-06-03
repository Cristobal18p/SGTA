const { simpleExecute } = require("../config/CR7.js");

// Obtener configuración general de la empresa
const obtenerConfiguracion = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    const mockDb = require("../config/mockDb.js");
    return res.json({
      success: true,
      data: mockDb.db.CONFIGURACION[0]
    });
  }

  const sql = `SELECT * FROM configuracion WHERE configuracion_id = 1`;
  try {
    const result = await simpleExecute(sql);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Configuración no encontrada" });
    }
    // Normalizar a lowercase para el frontend
    const config = result.rows[0];
    res.json({
      success: true,
      data: {
        configuracion_id: config.CONFIGURACION_ID,
        nombre_empresa: config.NOMBRE_EMPRESA,
        ruc: config.RUC,
        telefono: config.TELEFONO,
        direccion: config.DIRECCION,
        email: config.EMAIL,
        itbms_porcentaje: config.ITBMS_PORCENTAJE
      }
    });
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// Actualizar configuración general
const actualizarConfiguracion = async (req, res) => {
  const { nombre_empresa, ruc, telefono, direccion, email, itbms_porcentaje } = req.body;

  if (process.env.USE_MOCK_DB === "true") {
    const mockDb = require("../config/mockDb.js");
    const conf = mockDb.db.CONFIGURACION[0];
    if (nombre_empresa !== undefined) conf.NOMBRE_EMPRESA = nombre_empresa;
    if (ruc !== undefined) conf.RUC = ruc;
    if (telefono !== undefined) conf.TELEFONO = telefono;
    if (direccion !== undefined) conf.DIRECCION = direccion;
    if (email !== undefined) conf.EMAIL = email;
    if (itbms_porcentaje !== undefined) conf.ITBMS_PORCENTAJE = Number(itbms_porcentaje);
    return res.json({ success: true, message: "Configuración actualizada exitosamente" });
  }

  const sql = `
    UPDATE configuracion 
    SET nombre_empresa = :nombre_empresa,
        ruc = :ruc,
        telefono = :telefono,
        direccion = :direccion,
        email = :email,
        itbms_porcentaje = :itbms_porcentaje
    WHERE configuracion_id = 1
  `;
  try {
    const result = await simpleExecute(sql, {
      nombre_empresa,
      ruc,
      telefono,
      direccion,
      email,
      itbms_porcentaje: Number(itbms_porcentaje)
    });
    res.json({ success: true, message: "Configuración actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// Obtener configuración específica por clave (para catálogos/estados dinámicos del frontend)
const obtenerConfiguracionPorClave = async (req, res) => {
  const { clave } = req.params;

  if (clave.toUpperCase() === "ESTADOS_FACTURA") {
    return res.json({
      success: true,
      data: [
        { clave: "PENDIENTE", valor: "Pendiente" },
        { clave: "PAGADA", valor: "Pagada" },
        { clave: "CANCELADA", valor: "Cancelada" },
        { clave: "VENCIDA", valor: "Vencida" }
      ]
    });
  }

  // Fallback genérico para otras claves de catálogo
  return res.json({
    success: true,
    data: []
  });
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerConfiguracionPorClave
};
