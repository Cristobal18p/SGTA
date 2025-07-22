const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS TIPOS DE CLIENTES (GET)
const obtenerTiposClientes = async (req, res) => {
  const sql = `SELECT * FROM TIPOS_CLIENTES ORDER BY tipo_cliente_id`;

  try {
    const result = await simpleExecute(sql);

    // Normalizar los nombres de campos de Oracle para el frontend
    const tiposNormalizados = result.rows.map((row) => ({
      tipo_cliente_id: row.TIPO_CLIENTE_ID,
      descripcion_tipo: row.DESCRIPCION_TIPO,
    }));

    res.status(200).json({
      success: true,
      data: tiposNormalizados,
    });
  } catch (error) {
    console.error("Error al obtener tipos de clientes:", error);
    res.status(500).json({
      error: "Error al obtener tipos de clientes",
      details: error.message,
    });
  }
};

// CREAR TIPO DE CLIENTE (POST)
const crearTipoCliente = async (req, res) => {
  if (!req.body.descripcion_tipo) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "descripcion_tipo",
    });
  }

  const sql = `
    INSERT INTO TIPOS_CLIENTES (
      tipo_cliente_id, descripcion_tipo
    ) VALUES (
      tipos_clientes_seq.NEXTVAL, :descripcion_tipo
    ) RETURNING tipo_cliente_id INTO :tipo_cliente_id
  `;

  const binds = {
    descripcion_tipo: req.body.descripcion_tipo,
    tipo_cliente_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      tipo_cliente_id: result.outBinds.tipo_cliente_id[0],
      message: "Tipo de cliente creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({
      error: "Error al crear tipo de cliente",
      details: error.message,
    });
  }
};

// ACTUALIZAR TIPO DE CLIENTE (PUT)
const actualizarTipoCliente = async (req, res) => {
  const { tipo_cliente_id } = req.params;

  if (!req.body.descripcion_tipo) {
    return res.status(400).json({
      error: "Debes proporcionar el campo descripcion_tipo para actualizar.",
    });
  }

  const sql = `
    UPDATE TIPOS_CLIENTES
    SET descripcion_tipo = :descripcion_tipo
    WHERE tipo_cliente_id = :tipo_cliente_id
  `;

  const binds = {
    tipo_cliente_id,
    descripcion_tipo: req.body.descripcion_tipo,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res.status(404).json({
        message: "Tipo de cliente no encontrado con el ID proporcionado.",
      });
    }

    res.json({ message: "Tipo de cliente actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar tipo de cliente:", error);
    res.status(500).json({
      error: "Error al actualizar el tipo de cliente",
      details: error.message,
    });
  }
};

// ELIMINAR TIPO DE CLIENTE (DELETE)
const eliminarTipoCliente = async (req, res) => {
  const { tipo_cliente_id } = req.params;
  const sql = `DELETE FROM TIPOS_CLIENTES WHERE tipo_cliente_id = :tipo_cliente_id`;

  try {
    await simpleExecute(sql, { tipo_cliente_id });
    res.json({ message: "Tipo de cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar tipo de cliente:", error);
    res.status(500).json({
      error: "Error al eliminar el tipo de cliente",
      details: error.message,
    });
  }
};

module.exports = {
  obtenerTiposClientes,
  crearTipoCliente,
  actualizarTipoCliente,
  eliminarTipoCliente,
};
