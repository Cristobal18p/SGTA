const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS MÉTODOS DE PAGO (GET)
const obtenerMetodosPagos = async (req, res) => {
  const sql = `SELECT * FROM METODOS_PAGOS ORDER BY metodo_pago_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener métodos de pago:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener métodos de pago",
        details: error.message,
      });
  }
};

// CREAR MÉTODO DE PAGO (POST)
const crearMetodoPago = async (req, res) => {
  if (!req.body.descripcion_metodo) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "descripcion_metodo",
    });
  }

  const sql = `
    INSERT INTO METODOS_PAGOS (
      metodo_pago_id, descripcion_metodo
    ) VALUES (
      metodos_pagos_seq.NEXTVAL, :descripcion_metodo
    ) RETURNING metodo_pago_id INTO :metodo_pago_id
  `;

  const binds = {
    descripcion_metodo: req.body.descripcion_metodo,
    metodo_pago_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      metodo_pago_id: result.outBinds.metodo_pago_id[0],
      message: "Método de pago creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear método de pago", details: error.message });
  }
};

// ACTUALIZAR MÉTODO DE PAGO (PUT)
const actualizarMetodoPago = async (req, res) => {
  const { metodo_pago_id } = req.params;

  if (!req.body.descripcion_metodo) {
    return res
      .status(400)
      .json({
        error:
          "Debes proporcionar el campo descripcion_metodo para actualizar.",
      });
  }

  const sql = `
    UPDATE METODOS_PAGOS
    SET descripcion_metodo = :descripcion_metodo
    WHERE metodo_pago_id = :metodo_pago_id
  `;

  const binds = {
    metodo_pago_id,
    descripcion_metodo: req.body.descripcion_metodo,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Método de pago no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Método de pago actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar método de pago:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el método de pago",
        details: error.message,
      });
  }
};

// ELIMINAR MÉTODO DE PAGO (DELETE)
const eliminarMetodoPago = async (req, res) => {
  const { metodo_pago_id } = req.params;
  const sql = `DELETE FROM METODOS_PAGOS WHERE metodo_pago_id = :metodo_pago_id`;

  try {
    await simpleExecute(sql, { metodo_pago_id });
    res.json({ message: "Método de pago eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el método de pago",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerMetodosPagos,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
};
