const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS MODELOS DE VEHÍCULOS (GET)
const obtenerModelosVehiculos = async (req, res) => {
  const sql = `SELECT * FROM MODELOS_VEHICULOS ORDER BY modelo_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener modelos de vehículos:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener modelos de vehículos",
        details: error.message,
      });
  }
};

// CREAR MODELO DE VEHÍCULO (POST)
const crearModeloVehiculo = async (req, res) => {
  if (!req.body.marca_id || !req.body.nombre_modelo) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["marca_id", "nombre_modelo"],
    });
  }

  const sql = `
    INSERT INTO MODELOS_VEHICULOS (
      modelo_id, marca_id, nombre_modelo, anio_inicio
    ) VALUES (
      modelos_vehiculos_seq.NEXTVAL, :marca_id, :nombre_modelo, :anio_inicio
    ) RETURNING modelo_id INTO :modelo_id
  `;

  const binds = {
    marca_id: req.body.marca_id,
    nombre_modelo: req.body.nombre_modelo,
    anio_inicio: req.body.anio_inicio,
    modelo_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      modelo_id: result.outBinds.modelo_id[0],
      message: "Modelo de vehículo creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear modelo de vehículo",
        details: error.message,
      });
  }
};

// ACTUALIZAR MODELO DE VEHÍCULO (PUT)
const actualizarModeloVehiculo = async (req, res) => {
  const { modelo_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { modelo_id };
  const setClauses = [];

  const camposPermitidos = ["marca_id", "nombre_modelo", "anio_inicio"];

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
    UPDATE MODELOS_VEHICULOS
    SET ${setClauses.join(", ")}
    WHERE modelo_id = :modelo_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message: "Modelo de vehículo no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Modelo de vehículo actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar modelo de vehículo:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el modelo de vehículo",
        details: error.message,
      });
  }
};

// ELIMINAR MODELO DE VEHÍCULO (DELETE)
const eliminarModeloVehiculo = async (req, res) => {
  const { modelo_id } = req.params;
  const sql = `DELETE FROM MODELOS_VEHICULOS WHERE modelo_id = :modelo_id`;

  try {
    await simpleExecute(sql, { modelo_id });
    res.json({ message: "Modelo de vehículo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar modelo de vehículo:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el modelo de vehículo",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerModelosVehiculos,
  crearModeloVehiculo,
  actualizarModeloVehiculo,
  eliminarModeloVehiculo,
};
