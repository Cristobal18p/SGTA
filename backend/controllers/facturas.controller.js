const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS FACTURAS CON PAGINACIÓN Y FILTROS
const obtenerFacturas = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const busqueda = req.query.busqueda || "";
  const estado = req.query.estado || "";
  const metodoPago = req.query.metodoPago || "";
  const fechaInicio = req.query.fechaInicio || "";
  const fechaFin = req.query.fechaFin || "";
  const clienteId = req.query.clienteId || "";

  let whereClause = "";
  let binds = {
    offset: offset,
    limit_offset: offset + limit,
  };

  const condiciones = [];

  if (busqueda) {
    condiciones.push(`(
      UPPER(C.PRIMER_NOMBRE || ' ' || C.PRIMER_APELLIDO) LIKE UPPER(:busqueda) OR
      UPPER(F.NUMERO_FACTURA) LIKE UPPER(:busqueda) OR
      UPPER(C.NUMERO_CEDULA) LIKE UPPER(:busqueda)
    )`);
    binds.busqueda = `%${busqueda}%`;
  }

  if (estado) {
    condiciones.push(`F.ESTADO = :estado`);
    binds.estado = estado;
  }

  if (metodoPago) {
    condiciones.push(`MP.DESCRIPCION_METODO = :metodoPago`);
    binds.metodoPago = metodoPago;
  }

  if (clienteId) {
    condiciones.push(`F.CLIENTE_ID = :clienteId`);
    binds.clienteId = clienteId;
  }

  if (fechaInicio && fechaFin) {
    condiciones.push(
      `F.FECHA_EMISION BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`
    );
    binds.fechaInicio = fechaInicio;
    binds.fechaFin = fechaFin;
  } else if (fechaInicio) {
    condiciones.push(`F.FECHA_EMISION >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')`);
    binds.fechaInicio = fechaInicio;
  } else if (fechaFin) {
    condiciones.push(`F.FECHA_EMISION <= TO_DATE(:fechaFin, 'YYYY-MM-DD')`);
    binds.fechaFin = fechaFin;
  }

  if (condiciones.length > 0) {
    whereClause = `WHERE ${condiciones.join(" AND ")}`;
  }

  const sql = `
    SELECT * FROM (
      SELECT 
        F.FACTURA_ID,
        F.NUMERO_FACTURA,
        F.CLIENTE_ID,
        C.PRIMER_NOMBRE || ' ' || C.PRIMER_APELLIDO AS NOMBRE_CLIENTE,
        C.NUMERO_CEDULA,
        TO_CHAR(F.FECHA_EMISION, 'YYYY-MM-DD') AS FECHA_EMISION,
        F.SUBTOTAL,
        F.IMPUESTOS,
        F.TOTAL_FACTURA,
        F.DESCUENTO,
        F.ESTADO,
        F.ESTADO_FACTURA,
        F.METODO_PAGO_ID,
        MP.DESCRIPCION_METODO AS METODO_PAGO,
        F.OBSERVACIONES,
        F.CITA_ID,
        ROW_NUMBER() OVER (ORDER BY F.FECHA_EMISION DESC) AS rn
      FROM FACTURAS F
      LEFT JOIN CLIENTES C ON F.CLIENTE_ID = C.CLIENTE_ID
      LEFT JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
      ${whereClause}
    )
    WHERE rn > :offset AND rn <= :limit_offset
  `;

  const countSql = `
    SELECT COUNT(*) as total
    FROM FACTURAS F
    LEFT JOIN CLIENTES C ON F.CLIENTE_ID = C.CLIENTE_ID
    LEFT JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
    ${whereClause}
  `;

  try {
    const countBinds = { ...binds };
    delete countBinds.offset;
    delete countBinds.limit_offset;

    const [result, countResult] = await Promise.all([
      simpleExecute(sql, binds),
      simpleExecute(countSql, countBinds),
    ]);

    const totalRecords = countResult.rows[0].TOTAL;
    const totalPages = Math.ceil(totalRecords / limit);

    const facturas = result.rows.map((row) => ({
      factura_id: row.FACTURA_ID,
      numero_factura: row.NUMERO_FACTURA,
      cliente_id: row.CLIENTE_ID,
      nombre_cliente: row.NOMBRE_CLIENTE,
      numero_cedula: row.NUMERO_CEDULA,
      fecha_emision: row.FECHA_EMISION,
      subtotal: parseFloat(row.SUBTOTAL) || 0,
      impuestos: parseFloat(row.IMPUESTOS) || 0,
      descuento: parseFloat(row.DESCUENTO) || 0,
      total_factura: parseFloat(row.TOTAL_FACTURA) || 0,
      estado: row.ESTADO,
      estado_factura: row.ESTADO_FACTURA,
      metodo_pago_id: row.METODO_PAGO_ID,
      metodo_pago: row.METODO_PAGO,
      observaciones: row.OBSERVACIONES,
      cita_id: row.CITA_ID,
    }));

    res.status(200).json({
      success: true,
      data: facturas,
      pagination: {
        currentPage: page,
        totalPages,
        total: totalRecords,
        from: offset + 1,
        to: Math.min(offset + limit, totalRecords),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res.status(500).json({
      error: "Error al obtener facturas",
      details: error.message,
    });
  }
};

// OBTENER FACTURA POR ID
const obtenerFacturaPorId = async (req, res) => {
  const { facturaId } = req.params;

  const sql = `
    SELECT 
      F.FACTURA_ID,
      F.NUMERO_FACTURA,
      F.CLIENTE_ID,
      C.PRIMER_NOMBRE || ' ' || C.PRIMER_APELLIDO AS NOMBRE_CLIENTE,
      C.NUMERO_CEDULA,
      C.TELEFONO,
      C.EMAIL,
      TO_CHAR(F.FECHA_EMISION, 'YYYY-MM-DD') AS FECHA_EMISION,
      F.SUBTOTAL,
      F.IMPUESTOS,
      F.DESCUENTO,
      F.TOTAL_FACTURA,
      F.ESTADO,
      F.ESTADO_FACTURA,
      F.METODO_PAGO_ID,
      MP.DESCRIPCION_METODO AS METODO_PAGO,
      F.OBSERVACIONES,
      F.CITA_ID
    FROM FACTURAS F
    LEFT JOIN CLIENTES C ON F.CLIENTE_ID = C.CLIENTE_ID
    LEFT JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
    WHERE F.FACTURA_ID = :facturaId
  `;

  const detallesSql = `
    SELECT 
      DF.DETALLE_FACTURA_ID,
      DF.TIPO_ITEM,
      DF.DESCRIPCION_ITEM,
      DF.CANTIDAD,
      DF.TOTAL_LINEA
    FROM DETALLES_FACTURAS DF
    WHERE DF.FACTURA_ID = :facturaId
    ORDER BY DF.DETALLE_FACTURA_ID
  `;

  try {
    const [facturaResult, detallesResult] = await Promise.all([
      simpleExecute(sql, { facturaId }),
      simpleExecute(detallesSql, { facturaId }),
    ]);

    if (facturaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    const factura = facturaResult.rows[0];
    const detalles = detallesResult.rows.map((row) => ({
      detalle_factura_id: row.DETALLE_FACTURA_ID,
      tipo_item: row.TIPO_ITEM,
      descripcion_item: row.DESCRIPCION_ITEM,
      cantidad: parseFloat(row.CANTIDAD) || 0,
      total_linea: parseFloat(row.TOTAL_LINEA) || 0,
    }));

    const facturaCompleta = {
      factura_id: factura.FACTURA_ID,
      numero_factura: factura.NUMERO_FACTURA,
      cliente_id: factura.CLIENTE_ID,
      nombre_cliente: factura.NOMBRE_CLIENTE,
      numero_cedula: factura.NUMERO_CEDULA,
      telefono: factura.TELEFONO,
      email: factura.EMAIL,
      fecha_emision: factura.FECHA_EMISION,
      subtotal: parseFloat(factura.SUBTOTAL) || 0,
      impuestos: parseFloat(factura.IMPUESTOS) || 0,
      descuento: parseFloat(factura.DESCUENTO) || 0,
      total_factura: parseFloat(factura.TOTAL_FACTURA) || 0,
      estado: factura.ESTADO,
      estado_factura: factura.ESTADO_FACTURA,
      metodo_pago_id: factura.METODO_PAGO_ID,
      metodo_pago: factura.METODO_PAGO,
      observaciones: factura.OBSERVACIONES,
      cita_id: factura.CITA_ID,
      detalles: detalles,
    };

    res.status(200).json({
      success: true,
      data: facturaCompleta,
    });
  } catch (error) {
    console.error("Error al obtener factura:", error);
    res.status(500).json({
      error: "Error al obtener factura",
      details: error.message,
    });
  }
};

// CREAR NUEVA FACTURA
const crearFactura = async (req, res) => {
  const { cliente_id, cita_id, metodo_pago_id, observaciones, detalles } =
    req.body;

  // Validaciones
  if (!cliente_id) {
    return res.status(400).json({ error: "Cliente es requerido" });
  }

  if (!metodo_pago_id) {
    return res.status(400).json({ error: "Método de pago es requerido" });
  }

  if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ error: "Debe incluir al menos un detalle" });
  }

  // Validar detalles
  for (const detalle of detalles) {
    if (
      !detalle.tipo_item ||
      !detalle.descripcion_item ||
      !detalle.cantidad ||
      !detalle.total_linea
    ) {
      return res.status(400).json({
        error:
          "Cada detalle debe tener tipo_item, descripcion_item, cantidad y total_linea",
      });
    }
  }

  try {
    // Calcular totales
    let subtotal = 0;
    const detallesCalculados = detalles.map((detalle) => {
      const cantidad = parseFloat(detalle.cantidad);
      const totalLinea = parseFloat(detalle.total_linea);
      subtotal += totalLinea;

      return {
        tipo_item: detalle.tipo_item,
        descripcion_item: detalle.descripcion_item,
        cantidad: cantidad,
        total_linea: totalLinea,
      };
    });

    const descuento = parseFloat(req.body.descuento) || 0;
    const impuestos = (subtotal - descuento) * 0.07; // 7% de impuesto
    const totalFactura = subtotal - descuento + impuestos;

    // Generar número de factura
    const numeroFactura = `FAC-${Date.now()}`;

    // Insertar factura
    const facturaBinds = {
      cliente_id,
      cita_id: cita_id || null,
      numero_factura: numeroFactura,
      subtotal,
      descuento,
      impuestos,
      total_factura: totalFactura,
      metodo_pago_id,
      observaciones: observaciones || null,
      factura_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };

    const facturaSql = `
      INSERT INTO FACTURAS (
        FACTURA_ID, CLIENTE_ID, CITA_ID, NUMERO_FACTURA, FECHA_EMISION,
        SUBTOTAL, DESCUENTO, IMPUESTOS, TOTAL_FACTURA, ESTADO, 
        ESTADO_FACTURA, METODO_PAGO_ID, OBSERVACIONES
      ) VALUES (
        facturas_seq.NEXTVAL, :cliente_id, :cita_id, :numero_factura, SYSDATE,
        :subtotal, :descuento, :impuestos, :total_factura, 'PENDIENTE',
        'EMITIDA', :metodo_pago_id, :observaciones
      ) RETURNING FACTURA_ID INTO :factura_id
    `;

    const facturaResult = await simpleExecute(facturaSql, facturaBinds);
    const facturaId = facturaResult.outBinds.factura_id[0];

    // Insertar detalles
    for (const detalle of detallesCalculados) {
      const detalleSql = `
        INSERT INTO DETALLES_FACTURAS (
          DETALLE_FACTURA_ID, FACTURA_ID, TIPO_ITEM, DESCRIPCION_ITEM, CANTIDAD, TOTAL_LINEA
        ) VALUES (
          detalles_facturas_seq.NEXTVAL, :factura_id, :tipo_item, :descripcion_item, :cantidad, :total_linea
        )
      `;

      await simpleExecute(detalleSql, {
        factura_id: facturaId,
        tipo_item: detalle.tipo_item,
        descripcion_item: detalle.descripcion_item,
        cantidad: detalle.cantidad,
        total_linea: detalle.total_linea,
      });
    }

    res.status(201).json({
      success: true,
      message: "Factura creada exitosamente",
      data: {
        factura_id: facturaId,
        numero_factura: numeroFactura,
        total_factura: totalFactura,
      },
    });
  } catch (error) {
    console.error("Error al crear factura:", error);
    res.status(500).json({
      error: "Error al crear factura",
      details: error.message,
    });
  }
};

// ACTUALIZAR ESTADO DE FACTURA
const actualizarEstadoFactura = async (req, res) => {
  const { facturaId } = req.params;
  const { estado } = req.body;

  // Validar que el estado sea válido
  const estadosValidos = ["PENDIENTE", "PAGADA", "CANCELADA", "ANULADA"];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: "Estado inválido",
      message: `El estado debe ser uno de: ${estadosValidos.join(", ")}`,
    });
  }

  // Verificar que la factura existe
  const verificarSql = `
    SELECT FACTURA_ID, ESTADO, NUMERO_FACTURA 
    FROM FACTURAS 
    WHERE FACTURA_ID = :facturaId
  `;

  try {
    const verificarResult = await simpleExecute(verificarSql, { facturaId });

    if (verificarResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Factura no encontrada",
      });
    }

    const facturaActual = verificarResult.rows[0];

    // Validar transiciones de estado
    if (facturaActual.ESTADO === "ANULADA") {
      return res.status(400).json({
        error: "No se puede cambiar el estado de una factura anulada",
      });
    }

    // Actualizar estado
    const updateSql = `
      UPDATE FACTURAS 
      SET ESTADO = :estado, 
          ESTADO_FACTURA = CASE 
            WHEN :estado = 'PAGADA' THEN 'PAGADA'
            WHEN :estado = 'CANCELADA' THEN 'CANCELADA' 
            WHEN :estado = 'ANULADA' THEN 'ANULADA'
            ELSE 'EMITIDA'
          END
      WHERE FACTURA_ID = :facturaId
    `;

    await simpleExecute(updateSql, { estado, facturaId });

    res.status(200).json({
      success: true,
      message: `Estado de factura ${facturaActual.NUMERO_FACTURA} actualizado a ${estado}`,
      data: {
        factura_id: facturaId,
        estado_anterior: facturaActual.ESTADO,
        estado_nuevo: estado,
      },
    });
  } catch (error) {
    console.error("Error al actualizar estado de factura:", error);
    res.status(500).json({
      error: "Error al actualizar estado de factura",
      details: error.message,
    });
  }
};

// OBTENER DATOS PARA FORMULARIO DE FACTURAS
const obtenerDatosFormulario = async (req, res) => {
  try {
    console.log("Obteniendo datos para formulario de facturas...");

    // Consulta para clientes
    const clientesSql = `
      SELECT 
        CLIENTE_ID,
        PRIMER_NOMBRE || ' ' || PRIMER_APELLIDO AS NOMBRE_COMPLETO,
        NUMERO_CEDULA,
        TELEFONO,
        EMAIL
      FROM CLIENTES
      WHERE ACTIVO = 'S'
      ORDER BY PRIMER_NOMBRE, PRIMER_APELLIDO
    `;

    // Consulta para citas
    const citasSql = `
      SELECT 
        C.CITA_ID,
        C.NUMERO_CITA,
        CL.PRIMER_NOMBRE || ' ' || CL.PRIMER_APELLIDO AS NOMBRE_CLIENTE,
        TO_CHAR(C.FECHA_CITA, 'DD/MM/YYYY') AS FECHA_CITA,
        C.ESTADO
      FROM CITAS C
      LEFT JOIN CLIENTES CL ON C.CLIENTE_ID = CL.CLIENTE_ID
      WHERE C.ESTADO IN ('CONFIRMADA', 'COMPLETADA')
      ORDER BY C.FECHA_CITA DESC
    `;

    // Consulta para productos
    const productosSql = `
      SELECT 
        P.PRODUCTO_ID,
        P.NOMBRE_PRODUCTO,
        P.PRECIO_VENTA,
        NVL(IS.STOCK_ACTUAL, 0) AS STOCK_SUCURSAL
      FROM PRODUCTOS P
      LEFT JOIN INVENTARIO_SUCURSAL IS ON P.PRODUCTO_ID = IS.PRODUCTO_ID
      WHERE P.ACTIVO = 'S'
      ORDER BY P.NOMBRE_PRODUCTO
    `;

    // Consulta para servicios
    const serviciosSql = `
      SELECT 
        SERVICIO_ID,
        NOMBRE_SERVICIO,
        PRECIO_SERVICIO
      FROM SERVICIOS
      WHERE ACTIVO = 'S'
      ORDER BY NOMBRE_SERVICIO
    `;

    // Ejecutar todas las consultas en paralelo
    const [clientesResult, citasResult, productosResult, serviciosResult] =
      await Promise.all([
        simpleExecute(clientesSql, {}),
        simpleExecute(citasSql, {}),
        simpleExecute(productosSql, {}),
        simpleExecute(serviciosSql, {}),
      ]);

    console.log("Consultas ejecutadas exitosamente");
    console.log(
      `Resultados: ${clientesResult.rows.length} clientes, ${citasResult.rows.length} citas, ${productosResult.rows.length} productos, ${serviciosResult.rows.length} servicios`
    );

    res.status(200).json({
      success: true,
      data: {
        clientes: clientesResult.rows || [],
        citas: citasResult.rows || [],
        productos: productosResult.rows || [],
        servicios: serviciosResult.rows || [],
      },
    });
  } catch (error) {
    console.error("Error al obtener datos de formulario:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener datos para el formulario",
      details: error.message,
    });
  }
};

// OBTENER ESTADÍSTICAS DE FACTURAS
const obtenerEstadisticas = async (req, res) => {
  const fechaInicio = req.query.fechaInicio || "";
  const fechaFin = req.query.fechaFin || "";

  let whereClause = "";
  let binds = {};

  if (fechaInicio && fechaFin) {
    whereClause = `WHERE F.FECHA_EMISION BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
    binds.fechaInicio = fechaInicio;
    binds.fechaFin = fechaFin;
  } else if (fechaInicio) {
    whereClause = `WHERE F.FECHA_EMISION >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')`;
    binds.fechaInicio = fechaInicio;
  } else if (fechaFin) {
    whereClause = `WHERE F.FECHA_EMISION <= TO_DATE(:fechaFin, 'YYYY-MM-DD')`;
    binds.fechaFin = fechaFin;
  }

  // Consulta para estadísticas generales
  const estadisticasSql = `
    SELECT 
      COUNT(*) as TOTAL_FACTURAS,
      SUM(CASE WHEN ESTADO = 'PENDIENTE' THEN 1 ELSE 0 END) as FACTURAS_PENDIENTES,
      SUM(CASE WHEN ESTADO = 'PAGADA' THEN 1 ELSE 0 END) as FACTURAS_PAGADAS,
      SUM(CASE WHEN ESTADO = 'CANCELADA' THEN 1 ELSE 0 END) as FACTURAS_CANCELADAS,
      SUM(CASE WHEN ESTADO = 'ANULADA' THEN 1 ELSE 0 END) as FACTURAS_ANULADAS,
      COALESCE(SUM(TOTAL_FACTURA), 0) as MONTO_TOTAL,
      COALESCE(SUM(CASE WHEN ESTADO = 'PAGADA' THEN TOTAL_FACTURA ELSE 0 END), 0) as MONTO_PAGADO,
      COALESCE(SUM(CASE WHEN ESTADO = 'PENDIENTE' THEN TOTAL_FACTURA ELSE 0 END), 0) as MONTO_PENDIENTE,
      COALESCE(AVG(TOTAL_FACTURA), 0) as TICKET_PROMEDIO
    FROM FACTURAS F
    ${whereClause}
  `;

  // Consulta para ventas por mes (últimos 6 meses)
  const ventasPorMesSql = `
    SELECT 
      TO_CHAR(F.FECHA_EMISION, 'YYYY-MM') as MES,
      TO_CHAR(F.FECHA_EMISION, 'MM/YYYY') as MES_FORMATO,
      COUNT(*) as CANTIDAD_FACTURAS,
      COALESCE(SUM(TOTAL_FACTURA), 0) as TOTAL_VENTAS
    FROM FACTURAS F
    WHERE F.FECHA_EMISION >= ADD_MONTHS(SYSDATE, -6)
    AND F.ESTADO != 'ANULADA'
    GROUP BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM'), TO_CHAR(F.FECHA_EMISION, 'MM/YYYY')
    ORDER BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM')
  `;

  // Consulta para top 5 clientes
  const topClientesSql = `
    SELECT * FROM (
      SELECT 
        C.CLIENTE_ID,
        C.PRIMER_NOMBRE || ' ' || C.PRIMER_APELLIDO as NOMBRE_CLIENTE,
        C.NUMERO_CEDULA,
        COUNT(F.FACTURA_ID) as TOTAL_FACTURAS,
        COALESCE(SUM(F.TOTAL_FACTURA), 0) as TOTAL_COMPRAS
      FROM CLIENTES C
      INNER JOIN FACTURAS F ON C.CLIENTE_ID = F.CLIENTE_ID
      WHERE F.ESTADO != 'ANULADA'
      ${whereClause.replace("WHERE", "AND")}
      GROUP BY C.CLIENTE_ID, C.PRIMER_NOMBRE, C.PRIMER_APELLIDO, C.NUMERO_CEDULA
      ORDER BY TOTAL_COMPRAS DESC
    )
    WHERE ROWNUM <= 5
  `;

  // Consulta para métodos de pago más usados
  const metodosPagoSql = `
    SELECT 
      MP.DESCRIPCION_METODO,
      COUNT(F.FACTURA_ID) as CANTIDAD_USOS,
      COALESCE(SUM(F.TOTAL_FACTURA), 0) as MONTO_TOTAL
    FROM FACTURAS F
    INNER JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
    WHERE F.ESTADO != 'ANULADA'
    ${whereClause.replace("WHERE", "AND")}
    GROUP BY MP.DESCRIPCION_METODO
    ORDER BY CANTIDAD_USOS DESC
  `;

  try {
    const [estadisticasResult, ventasResult, clientesResult, metodosResult] =
      await Promise.all([
        simpleExecute(estadisticasSql, binds),
        simpleExecute(ventasPorMesSql, {}),
        simpleExecute(topClientesSql, binds),
        simpleExecute(metodosPagoSql, binds),
      ]);

    const estadisticas = estadisticasResult.rows[0];
    const ventasPorMes = ventasResult.rows.map((row) => ({
      mes: row.MES,
      mes_formato: row.MES_FORMATO,
      cantidad_facturas: parseInt(row.CANTIDAD_FACTURAS),
      total_ventas: parseFloat(row.TOTAL_VENTAS) || 0,
    }));

    const topClientes = clientesResult.rows.map((row) => ({
      cliente_id: row.CLIENTE_ID,
      nombre_cliente: row.NOMBRE_CLIENTE,
      numero_cedula: row.NUMERO_CEDULA,
      total_facturas: parseInt(row.TOTAL_FACTURAS),
      total_compras: parseFloat(row.TOTAL_COMPRAS) || 0,
    }));

    const metodosPago = metodosResult.rows.map((row) => ({
      descripcion_metodo: row.DESCRIPCION_METODO,
      cantidad_usos: parseInt(row.CANTIDAD_USOS),
      monto_total: parseFloat(row.MONTO_TOTAL) || 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        resumen: {
          total_facturas: parseInt(estadisticas.TOTAL_FACTURAS),
          facturas_pendientes: parseInt(estadisticas.FACTURAS_PENDIENTES),
          facturas_pagadas: parseInt(estadisticas.FACTURAS_PAGADAS),
          facturas_canceladas: parseInt(estadisticas.FACTURAS_CANCELADAS),
          facturas_anuladas: parseInt(estadisticas.FACTURAS_ANULADAS),
          monto_total: parseFloat(estadisticas.MONTO_TOTAL) || 0,
          monto_pagado: parseFloat(estadisticas.MONTO_PAGADO) || 0,
          monto_pendiente: parseFloat(estadisticas.MONTO_PENDIENTE) || 0,
          ticket_promedio: parseFloat(estadisticas.TICKET_PROMEDIO) || 0,
        },
        ventas_por_mes: ventasPorMes,
        top_clientes: topClientes,
        metodos_pago: metodosPago,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
      details: error.message,
    });
  }
};

// GENERAR REPORTE DE VENTAS
const generarReporteVentas = async (req, res) => {
  const fechaInicio = req.query.fechaInicio || "";
  const fechaFin = req.query.fechaFin || "";
  const clienteId = req.query.clienteId || "";
  const metodoPago = req.query.metodoPago || "";
  const estado = req.query.estado || "";
  const groupBy = req.query.groupBy || "dia"; // dia, mes, cliente

  let whereClause = "";
  let binds = {};
  const condiciones = [];

  if (fechaInicio && fechaFin) {
    condiciones.push(
      `F.FECHA_EMISION BETWEEN TO_DATE(:fechaInicio, 'YYYY-MM-DD') AND TO_DATE(:fechaFin, 'YYYY-MM-DD')`
    );
    binds.fechaInicio = fechaInicio;
    binds.fechaFin = fechaFin;
  } else if (fechaInicio) {
    condiciones.push(`F.FECHA_EMISION >= TO_DATE(:fechaInicio, 'YYYY-MM-DD')`);
    binds.fechaInicio = fechaInicio;
  } else if (fechaFin) {
    condiciones.push(`F.FECHA_EMISION <= TO_DATE(:fechaFin, 'YYYY-MM-DD')`);
    binds.fechaFin = fechaFin;
  }

  if (clienteId) {
    condiciones.push(`F.CLIENTE_ID = :clienteId`);
    binds.clienteId = clienteId;
  }

  if (metodoPago) {
    condiciones.push(`MP.DESCRIPCION_METODO = :metodoPago`);
    binds.metodoPago = metodoPago;
  }

  if (estado) {
    condiciones.push(`F.ESTADO = :estado`);
    binds.estado = estado;
  }

  if (condiciones.length > 0) {
    whereClause = `WHERE ${condiciones.join(" AND ")}`;
  }

  let selectClause = "";
  let groupByClause = "";
  let orderByClause = "";

  switch (groupBy) {
    case "mes":
      selectClause = `
        TO_CHAR(F.FECHA_EMISION, 'YYYY-MM') as PERIODO,
        TO_CHAR(F.FECHA_EMISION, 'MM/YYYY') as PERIODO_FORMATO,
        'Mes' as TIPO_PERIODO,
      `;
      groupByClause = `GROUP BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM'), TO_CHAR(F.FECHA_EMISION, 'MM/YYYY')`;
      orderByClause = `ORDER BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM')`;
      break;

    case "cliente":
      selectClause = `
        C.CLIENTE_ID as PERIODO,
        C.PRIMER_NOMBRE || ' ' || C.PRIMER_APELLIDO as PERIODO_FORMATO,
        'Cliente' as TIPO_PERIODO,
      `;
      groupByClause = `GROUP BY C.CLIENTE_ID, C.PRIMER_NOMBRE, C.PRIMER_APELLIDO`;
      orderByClause = `ORDER BY TOTAL_VENTAS DESC`;
      break;

    default: // dia
      selectClause = `
        TO_CHAR(F.FECHA_EMISION, 'YYYY-MM-DD') as PERIODO,
        TO_CHAR(F.FECHA_EMISION, 'DD/MM/YYYY') as PERIODO_FORMATO,
        'Día' as TIPO_PERIODO,
      `;
      groupByClause = `GROUP BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM-DD'), TO_CHAR(F.FECHA_EMISION, 'DD/MM/YYYY')`;
      orderByClause = `ORDER BY TO_CHAR(F.FECHA_EMISION, 'YYYY-MM-DD')`;
      break;
  }

  const reporteSql = `
    SELECT 
      ${selectClause}
      COUNT(F.FACTURA_ID) as CANTIDAD_FACTURAS,
      COALESCE(SUM(F.SUBTOTAL), 0) as TOTAL_SUBTOTAL,
      COALESCE(SUM(F.DESCUENTO), 0) as TOTAL_DESCUENTOS,
      COALESCE(SUM(F.IMPUESTOS), 0) as TOTAL_IMPUESTOS,
      COALESCE(SUM(F.TOTAL_FACTURA), 0) as TOTAL_VENTAS,
      COALESCE(AVG(F.TOTAL_FACTURA), 0) as PROMEDIO_VENTA
    FROM FACTURAS F
    LEFT JOIN CLIENTES C ON F.CLIENTE_ID = C.CLIENTE_ID
    LEFT JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
    ${whereClause}
    ${groupByClause}
    ${orderByClause}
  `;

  // Consulta para totales generales
  const totalesSql = `
    SELECT 
      COUNT(F.FACTURA_ID) as TOTAL_FACTURAS,
      COALESCE(SUM(F.SUBTOTAL), 0) as TOTAL_SUBTOTAL,
      COALESCE(SUM(F.DESCUENTO), 0) as TOTAL_DESCUENTOS,
      COALESCE(SUM(F.IMPUESTOS), 0) as TOTAL_IMPUESTOS,
      COALESCE(SUM(F.TOTAL_FACTURA), 0) as TOTAL_VENTAS,
      COALESCE(AVG(F.TOTAL_FACTURA), 0) as PROMEDIO_VENTA
    FROM FACTURAS F
    LEFT JOIN CLIENTES C ON F.CLIENTE_ID = C.CLIENTE_ID
    LEFT JOIN METODOS_PAGOS MP ON F.METODO_PAGO_ID = MP.METODO_PAGO_ID
    ${whereClause}
  `;

  try {
    const [reporteResult, totalesResult] = await Promise.all([
      simpleExecute(reporteSql, binds),
      simpleExecute(totalesSql, binds),
    ]);

    const reporte = reporteResult.rows.map((row) => ({
      periodo: row.PERIODO,
      periodo_formato: row.PERIODO_FORMATO,
      tipo_periodo: row.TIPO_PERIODO,
      cantidad_facturas: parseInt(row.CANTIDAD_FACTURAS),
      total_subtotal: parseFloat(row.TOTAL_SUBTOTAL) || 0,
      total_descuentos: parseFloat(row.TOTAL_DESCUENTOS) || 0,
      total_impuestos: parseFloat(row.TOTAL_IMPUESTOS) || 0,
      total_ventas: parseFloat(row.TOTAL_VENTAS) || 0,
      promedio_venta: parseFloat(row.PROMEDIO_VENTA) || 0,
    }));

    const totales = totalesResult.rows[0];

    res.status(200).json({
      success: true,
      data: {
        filtros: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          cliente_id: clienteId,
          metodo_pago: metodoPago,
          estado: estado,
          agrupado_por: groupBy,
        },
        totales: {
          total_facturas: parseInt(totales.TOTAL_FACTURAS),
          total_subtotal: parseFloat(totales.TOTAL_SUBTOTAL) || 0,
          total_descuentos: parseFloat(totales.TOTAL_DESCUENTOS) || 0,
          total_impuestos: parseFloat(totales.TOTAL_IMPUESTOS) || 0,
          total_ventas: parseFloat(totales.TOTAL_VENTAS) || 0,
          promedio_venta: parseFloat(totales.PROMEDIO_VENTA) || 0,
        },
        reporte: reporte,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte de ventas:", error);
    res.status(500).json({
      error: "Error al generar reporte de ventas",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerFacturas,
  obtenerFacturaPorId,
  crearFactura,
  obtenerDatosFormulario,
  actualizarEstadoFactura,
  obtenerEstadisticas,
  generarReporteVentas,
};
