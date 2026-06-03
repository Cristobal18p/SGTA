const { simpleExecute } = require("../config/CR7.js");

// 1. Ingresos Totales
const obtenerIngresosTotales = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    // Computar desde mockDb si está activo
    const mockDb = require("../config/mockDb.js");
    const total = mockDb.db.FACTURAS
      .filter(f => f.ESTADO === 'PAGADA')
      .reduce((sum, f) => sum + (f.TOTAL_FACTURA || f.TOTAL || 0), 0);
    return res.json({ ingresos_totales: total || 15420.50 }); // Fallback a valor dummy para que se vea bien
  }

  const sql = `SELECT NVL(SUM(total_factura), 0) AS ingresos_totales FROM facturas WHERE estado = 'PAGADA'`;
  try {
    const result = await simpleExecute(sql);
    res.json({ ingresos_totales: result.rows[0].INGRESOS_TOTALES || 0 });
  } catch (error) {
    console.error("Error al obtener ingresos totales:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 2. Servicios Realizados
const obtenerServiciosRealizados = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    const mockDb = require("../config/mockDb.js");
    const total = mockDb.db.CITAS.filter(c => c.ESTADO === 'COMPLETADA' || c.ESTADO === 'EN PROCESO').length;
    return res.json({ total_servicios: total || 84 });
  }

  const sql = `SELECT COUNT(*) AS total_servicios FROM citas WHERE estado IN ('COMPLETADA', 'EN PROCESO')`;
  try {
    const result = await simpleExecute(sql);
    res.json({ total_servicios: result.rows[0].TOTAL_SERVICIOS || 0 });
  } catch (error) {
    console.error("Error al obtener servicios realizados:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 3. Cantidad de Nuevos Clientes
const obtenerCantidadNuevosClientes = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    const mockDb = require("../config/mockDb.js");
    const total = mockDb.db.CLIENTES.filter(c => c.ESTADO === 'ACTIVO').length;
    return res.json({ nuevos_clientes: total || 12 });
  }

  const sql = `SELECT COUNT(*) AS nuevos_clientes FROM clientes WHERE estado = 'ACTIVO'`;
  try {
    const result = await simpleExecute(sql);
    res.json({ nuevos_clientes: result.rows[0].NUEVOS_CLIENTES || 0 });
  } catch (error) {
    console.error("Error al obtener cantidad de nuevos clientes:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 4. Ingresos Mensuales (para gráfico de líneas)
const obtenerIngresosMensuales = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    // Retornar datos mensuales simulados para el gráfico de líneas
    return res.json([
      { mes: "Ene 2026", total_ingresos: 4200 },
      { mes: "Feb 2026", total_ingresos: 5100 },
      { mes: "Mar 2026", total_ingresos: 4800 },
      { mes: "Abr 2026", total_ingresos: 6200 },
      { mes: "May 2026", total_ingresos: 7500 },
      { mes: "Jun 2026", total_ingresos: 8900 }
    ]);
  }

  const sql = `
    SELECT 
      TO_CHAR(fecha_emision, 'YYYY-MM') AS mes,
      SUM(total_factura) AS total_ingresos 
    FROM facturas 
    WHERE estado = 'PAGADA' 
    GROUP BY TO_CHAR(fecha_emision, 'YYYY-MM') 
    ORDER BY mes
  `;
  try {
    const result = await simpleExecute(sql);
    const data = result.rows.map(row => ({
      mes: row.MES,
      total_ingresos: row.TOTAL_INGRESOS
    }));
    res.json(data);
  } catch (error) {
    console.error("Error al obtener ingresos mensuales:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 5. Servicios Más Solicitados (para gráfico de barras)
const obtenerServiciosMasSolicitados = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    return res.json([
      { nombre_servicio: "Cambio de Aceite", cantidad: 45 },
      { nombre_servicio: "Alineación y Balanceo", cantidad: 32 },
      { nombre_servicio: "Diagnóstico Motor", cantidad: 28 },
      { nombre_servicio: "Frenos", cantidad: 18 },
      { nombre_servicio: "Sistema Eléctrico", cantidad: 12 }
    ]);
  }

  const sql = `
    SELECT s.nombre_servicio, COUNT(dc.servicio_id) AS cantidad 
    FROM detalles_citas dc 
    JOIN servicios s ON dc.servicio_id = s.servicio_id 
    GROUP BY s.nombre_servicio 
    ORDER BY cantidad DESC
  `;
  try {
    const result = await simpleExecute(sql);
    const data = result.rows.map(row => ({
      nombre_servicio: row.NOMBRE_SERVICIO,
      cantidad: row.CANTIDAD
    }));
    res.json(data);
  } catch (error) {
    console.error("Error al obtener servicios más solicitados:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 6. Top 10 Clientes (Análisis Detallado)
const obtenerClientesTop10 = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    return res.json([
      { nombre_completo: "Juan Pérez", total_gastado: 1250.75 },
      { nombre_completo: "María Gómez", total_gastado: 980.50 },
      { nombre_completo: "Carlos Rodríguez", total_gastado: 850.00 },
      { nombre_completo: "Ana Martínez", total_gastado: 640.20 },
      { nombre_completo: "Luis Torres", total_gastado: 520.00 }
    ]);
  }

  const sql = `
    SELECT 
      c.primer_nombre || ' ' || c.primer_apellido AS nombre_completo, 
      SUM(f.total_factura) AS total_gastado 
    FROM facturas f 
    JOIN clientes c ON f.cliente_id = c.cliente_id 
    WHERE f.estado = 'PAGADA' 
    GROUP BY c.primer_nombre, c.primer_apellido 
    ORDER BY total_gastado DESC
    FETCH FIRST 10 ROWS ONLY
  `;
  try {
    const result = await simpleExecute(sql);
    const data = result.rows.map(row => ({
      nombre_completo: row.NOMBRE_COMPLETO,
      total_gastado: row.TOTAL_GASTADO
    }));
    res.json(data);
  } catch (error) {
    console.error("Error al obtener top clientes:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 7. Rendimiento de Técnicos (Análisis Detallado)
const obtenerRendimientoTecnico = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    return res.json([
      { nombre_completo: "Carlos Mecánico", servicios_realizados: 34 },
      { nombre_completo: "José Eléctrico", servicios_realizados: 28 },
      { nombre_completo: "Luis Suspensión", servicios_realizados: 22 }
    ]);
  }

  const sql = `
    SELECT 
      p.primer_nombre || ' ' || p.primer_apellido AS nombre_completo, 
      COUNT(at.asignacion_id) AS servicios_realizados 
    FROM asignaciones_tecnicos at 
    JOIN personal p ON at.personal_id = p.personal_id 
    GROUP BY p.primer_nombre, p.primer_apellido 
    ORDER BY servicios_realizados DESC
  `;
  try {
    const result = await simpleExecute(sql);
    const data = result.rows.map(row => ({
      nombre_completo: row.NOMBRE_COMPLETO,
      servicios_realizados: row.SERVICIOS_REALIZADOS
    }));
    res.json(data);
  } catch (error) {
    console.error("Error al obtener rendimiento técnico:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

// 8. Estado del Inventario (Análisis Detallado)
const obtenerEstadoInventario = async (req, res) => {
  if (process.env.USE_MOCK_DB === "true") {
    return res.json([
      { nombre_sucursal: "Sucursal Central", nombre_producto: "Filtro de Aceite Toyota", cantidad_actual: 50 },
      { nombre_sucursal: "Sucursal Central", nombre_producto: "Aceite Sintético 5W-30", cantidad_actual: 8 }, // Low stock (trigger low stock indicator)
      { nombre_sucursal: "Sucursal Albrook", nombre_producto: "Pastillas de Freno Delanteras", cantidad_actual: 15 }
    ]);
  }

  const sql = `
    SELECT 
      s.nombre_sucursal, 
      p.nombre_producto, 
      isuc.cantidad AS cantidad_actual 
    FROM inventario_sucursal isuc 
    JOIN sucursales s ON isuc.sucursal_id = s.sucursal_id 
    JOIN productos p ON isuc.producto_id = p.producto_id
  `;
  try {
    const result = await simpleExecute(sql);
    const data = result.rows.map(row => ({
      nombre_sucursal: row.NOMBRE_SUCURSAL,
      nombre_producto: row.NOMBRE_PRODUCTO,
      cantidad_actual: row.CANTIDAD_ACTUAL
    }));
    res.json(data);
  } catch (error) {
    console.error("Error al obtener estado de inventario:", error);
    res.status(500).json({ error: "Error en base de datos", details: error.message });
  }
};

module.exports = {
  obtenerIngresosTotales,
  obtenerServiciosRealizados,
  obtenerCantidadNuevosClientes,
  obtenerIngresosMensuales,
  obtenerServiciosMasSolicitados,
  obtenerClientesTop10,
  obtenerRendimientoTecnico,
  obtenerEstadoInventario
};
