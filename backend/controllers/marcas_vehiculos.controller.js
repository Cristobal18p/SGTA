const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS MARCAS DE VEHÍCULOS (GET)
const obtenerMarcasVehiculos = async (req, res) => {
  const sql = `SELECT * FROM MARCAS_VEHICULOS ORDER BY marca_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener marcas de vehículos:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener marcas de vehículos",
        details: error.message,
      });
  }
};

// CREAR MARCA DE VEHÍCULO (POST)
const crearMarcaVehiculo = async (req, res) => {
  if (!req.body.nombre_marca) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_marca",
    });
  }

  const sql = `
    INSERT INTO MARCAS_VEHICULOS (
      marca_id, nombre_marca
    ) VALUES (
      marcas_vehiculos_seq.NEXTVAL, :nombre_marca
    ) RETURNING marca_id INTO :marca_id
  `;

  const binds = {
    nombre_marca: req.body.nombre_marca,
    marca_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      marca_id: result.outBinds.marca_id[0],
      message: "Marca de vehículo creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear marca de vehículo",
        details: error.message,
      });
  }
};

// ACTUALIZAR MARCA DE VEHÍCULO (PUT)
const actualizarMarcaVehiculo = async (req, res) => {
  const { marca_id } = req.params;

  if (!req.body.nombre_marca) {
    return res
      .status(400)
      .json({
        error: "Debes proporcionar el campo nombre_marca para actualizar.",
      });
  }

  const sql = `
    UPDATE MARCAS_VEHICULOS
    SET nombre_marca = :nombre_marca
    WHERE marca_id = :marca_id
  `;

  const binds = {
    marca_id,
    nombre_marca: req.body.nombre_marca,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Marca de vehículo no encontrada con el ID proporcionado.",
        });
    }

    res.json({ message: "Marca de vehículo actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar marca de vehículo:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar la marca de vehículo",
        details: error.message,
      });
  }
};

// ELIMINAR MARCA DE VEHÍCULO (DELETE)
const eliminarMarcaVehiculo = async (req, res) => {
  const { marca_id } = req.params;
  const sql = `DELETE FROM MARCAS_VEHICULOS WHERE marca_id = :marca_id`;

  try {
    await simpleExecute(sql, { marca_id });
    res.json({ message: "Marca de vehículo eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar marca de vehículo:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar la marca de vehículo",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerMarcasVehiculos,
  crearMarcaVehiculo,
  actualizarMarcaVehiculo,
  eliminarMarcaVehiculo,
};
