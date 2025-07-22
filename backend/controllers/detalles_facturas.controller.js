const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS DETALLES DE FACTURAS (GET)
const obtenerDetallesFacturas = async (req, res) => {
  const sql = `SELECT * FROM DETALLES_FACTURAS ORDER BY detalle_factura_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener detalles de facturas:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener detalles de facturas",
        details: error.message,
      });
  }
};

// CREAR DETALLE DE FACTURA (POST)
const crearDetalleFactura = async (req, res) => {
  if (
    !req.body.factura_id ||
    !req.body.tipo_item ||
    !req.body.descripcion_item
  ) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["factura_id", "tipo_item", "descripcion_item"],
    });
  }

  const sql = `
    INSERT INTO DETALLES_FACTURAS (
      detalle_factura_id, factura_id, tipo_item, descripcion_item, cantidad, total_linea
    ) VALUES (
      detalles_facturas_seq.NEXTVAL, :factura_id, :tipo_item, :descripcion_item, :cantidad, :total_linea
    ) RETURNING detalle_factura_id INTO :detalle_factura_id
  `;

  const binds = {
    factura_id: req.body.factura_id,
    tipo_item: req.body.tipo_item,
    descripcion_item: req.body.descripcion_item,
    cantidad: req.body.cantidad,
    total_linea: req.body.total_linea,
    detalle_factura_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      detalle_factura_id: result.outBinds.detalle_factura_id[0],
      message: "Detalle de factura creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear detalle de factura",
        details: error.message,
      });
  }
};

// ACTUALIZAR DETALLE DE FACTURA (PUT)
const actualizarDetalleFactura = async (req, res) => {
  const { detalle_factura_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { detalle_factura_id };
  const setClauses = [];

  const camposPermitidos = [
    "factura_id",
    "tipo_item",
    "descripcion_item",
    "cantidad",
    "total_linea",
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
    UPDATE DETALLES_FACTURAS
    SET ${setClauses.join(", ")}
    WHERE detalle_factura_id = :detalle_factura_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Detalle de factura no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Detalle de factura actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar detalle de factura:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el detalle de factura",
        details: error.message,
      });
  }
};

// ELIMINAR DETALLE DE FACTURA (DELETE)
const eliminarDetalleFactura = async (req, res) => {
  const { detalle_factura_id } = req.params;
  const sql = `DELETE FROM DETALLES_FACTURAS WHERE detalle_factura_id = :detalle_factura_id`;

  try {
    await simpleExecute(sql, { detalle_factura_id });
    res.json({ message: "Detalle de factura eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar detalle de factura:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el detalle de factura",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerDetallesFacturas,
  crearDetalleFactura,
  actualizarDetalleFactura,
  eliminarDetalleFactura,
};
