const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS FACTURAS (GET)
const obtenerFacturas = async (req, res) => {
  const sql = `SELECT * FROM FACTURAS ORDER BY factura_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener facturas:", error);
    res
      .status(500)
      .json({ error: "Error al obtener facturas", details: error.message });
  }
};

// CREAR FACTURA (POST)
const crearFactura = async (req, res) => {
  if (!req.body.numero_factura || !req.body.cliente_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["numero_factura", "cliente_id"],
    });
  }

  const sql = `
    INSERT INTO FACTURAS (
      factura_id, numero_factura, cliente_id, cita_id, total_factura, metodo_pago_id, fecha_emision
    ) VALUES (
      facturas_seq.NEXTVAL, :numero_factura, :cliente_id, :cita_id, :total_factura, :metodo_pago_id, SYSDATE
    ) RETURNING factura_id INTO :factura_id
  `;

  const binds = {
    numero_factura: req.body.numero_factura,
    cliente_id: req.body.cliente_id,
    cita_id: req.body.cita_id,
    total_factura: req.body.total_factura,
    metodo_pago_id: req.body.metodo_pago_id,
    factura_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      factura_id: result.outBinds.factura_id[0],
      message: "Factura creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear factura", details: error.message });
  }
};

// ACTUALIZAR FACTURA (PUT)
const actualizarFactura = async (req, res) => {
  const { factura_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { factura_id };
  const setClauses = [];

  const camposPermitidos = [
    "numero_factura",
    "cliente_id",
    "cita_id",
    "total_factura",
    "metodo_pago_id",
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
    UPDATE FACTURAS
    SET ${setClauses.join(", ")}
    WHERE factura_id = :factura_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Factura no encontrada con el ID proporcionado." });
    }

    res.json({ message: "Factura actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar factura:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar la factura",
        details: error.message,
      });
  }
};

// ELIMINAR FACTURA (DELETE)
const eliminarFactura = async (req, res) => {
  const { factura_id } = req.params;
  const sql = `DELETE FROM FACTURAS WHERE factura_id = :factura_id`;

  try {
    await simpleExecute(sql, { factura_id });
    res.json({ message: "Factura eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar factura:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar la factura", details: error.message });
  }
};

module.exports = {
  obtenerFacturas,
  crearFactura,
  actualizarFactura,
  eliminarFactura,
};
