const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS TIPOS DE COMBUSTIBLE (GET)
const obtenerTiposCombustible = async (req, res) => {
  const sql = `SELECT * FROM TIPOS_COMBUSTIBLE ORDER BY tipo_combustible_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener tipos de combustible:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener tipos de combustible",
        details: error.message,
      });
  }
};

// CREAR TIPO DE COMBUSTIBLE (POST)
const crearTipoCombustible = async (req, res) => {
  if (!req.body.descripcion_combustible) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "descripcion_combustible",
    });
  }

  const sql = `
    INSERT INTO TIPOS_COMBUSTIBLE (
      tipo_combustible_id, descripcion_combustible
    ) VALUES (
      tipos_combustible_seq.NEXTVAL, :descripcion_combustible
    ) RETURNING tipo_combustible_id INTO :tipo_combustible_id
  `;

  const binds = {
    descripcion_combustible: req.body.descripcion_combustible,
    tipo_combustible_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      tipo_combustible_id: result.outBinds.tipo_combustible_id[0],
      message: "Tipo de combustible creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear tipo de combustible",
        details: error.message,
      });
  }
};

// ACTUALIZAR TIPO DE COMBUSTIBLE (PUT)
const actualizarTipoCombustible = async (req, res) => {
  const { tipo_combustible_id } = req.params;

  if (!req.body.descripcion_combustible) {
    return res
      .status(400)
      .json({
        error:
          "Debes proporcionar el campo descripcion_combustible para actualizar.",
      });
  }

  const sql = `
    UPDATE TIPOS_COMBUSTIBLE
    SET descripcion_combustible = :descripcion_combustible
    WHERE tipo_combustible_id = :tipo_combustible_id
  `;

  const binds = {
    tipo_combustible_id,
    descripcion_combustible: req.body.descripcion_combustible,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Tipo de combustible no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Tipo de combustible actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar tipo de combustible:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el tipo de combustible",
        details: error.message,
      });
  }
};

// ELIMINAR TIPO DE COMBUSTIBLE (DELETE)
const eliminarTipoCombustible = async (req, res) => {
  const { tipo_combustible_id } = req.params;
  const sql = `DELETE FROM TIPOS_COMBUSTIBLE WHERE tipo_combustible_id = :tipo_combustible_id`;

  try {
    await simpleExecute(sql, { tipo_combustible_id });
    res.json({ message: "Tipo de combustible eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar tipo de combustible:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el tipo de combustible",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerTiposCombustible,
  crearTipoCombustible,
  actualizarTipoCombustible,
  eliminarTipoCombustible,
};
