const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS VEHÍCULOS (DETALLADO)
const obtenerVehiculos = async (req, res) => {
  const sql = `
    SELECT V.vehiculo_id, V.numero_placa, C.nombre_cliente AS propietario, 
           V.anio_fabricacion, TC.nombre_combustible, V.kilometraje, MO.nombre_modelo
    FROM VEHICULOS V
    JOIN CLIENTES C ON V.cliente_id = C.cliente_id
    JOIN MODELOS MO ON V.modelo_id = MO.modelo_id
    JOIN TIPO_COMBUSTIBLE TC ON V.tipo_combustible_id = TC.tipo_combustible_id
    ORDER BY V.vehiculo_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ error: "Error al obtener vehículos", details: error.message });
  }
};

// ESTADÍSTICAS
const totalVehiculos = async (req, res) => {
  const sql = `SELECT COUNT(*) AS total FROM VEHICULOS`;
  try {
    const result = await simpleExecute(sql);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al contar vehículos", details: err.message });
  }
};

const vehiculosEnServicio = async (req, res) => {
  const sql = `
    SELECT COUNT(DISTINCT C.vehiculo_id) AS en_servicio
    FROM CITAS C
    WHERE C.estado = 'EN PROCESO'`;
  try {
    const result = await simpleExecute(sql);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al contar vehículos en servicio", details: err.message });
  }
};

const vehiculosProximoMantenimiento = async (req, res) => {
  const sql = `
    SELECT COUNT(*) AS proximos_mantenimientos
    FROM VEHICULOS
    WHERE proximo_mantenimiento <= SYSDATE + 30`; // Ajusta según cómo guardes fechas
  try {
    const result = await simpleExecute(sql);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al contar próximos mantenimientos", details: err.message });
  }
};

const marcaMasPopular = async (req, res) => {
  try {
    const sql = `
      SELECT M.NOMBRE_MARCA, COUNT(*) AS CANTIDAD
      FROM VEHICULOS V
      JOIN MARCAS M ON V.MARCA_ID = M.MARCA_ID
      GROUP BY M.NOMBRE_MARCA
      ORDER BY CANTIDAD DESC
      FETCH FIRST 1 ROWS ONLY
    `;

    const result = await simpleExecute(sql);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "No hay marcas registradas" });
    }

    const [marcaMasPopular] = result.rows;
    res.json({
      marca_mas_popular: marcaMasPopular.NOMBRE_MARCA,
      cantidad: marcaMasPopular.CANTIDAD,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener marca popular",
      details: error.message,
    });
  }
};

// CRUD VEHÍCULOS
const crearVehiculo = async (req, res) => {
  if (!req.body.modelo_id || !req.body.tipo_combustible_id || !req.body.cliente_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["modelo_id", "tipo_combustible_id", "cliente_id"]
    });
  }

  const sql = `
    INSERT INTO VEHICULOS (
      vehiculo_id, numero_placa, modelo_id, tipo_combustible_id,
      cliente_id, color, anio_fabricacion, kilometraje
    ) VALUES (
      vehiculos_seq.NEXTVAL, :numero_placa, :modelo_id, :tipo_combustible_id,
      :cliente_id, :color, :anio_fabricacion, :kilometraje
    ) RETURNING vehiculo_id INTO :vehiculo_id`;

  const binds = {
    numero_placa: req.body.numero_placa,
    modelo_id: req.body.modelo_id,
    tipo_combustible_id: req.body.tipo_combustible_id,
    cliente_id: req.body.cliente_id,
    color: req.body.color,
    anio_fabricacion: req.body.anio_fabricacion,
    kilometraje: req.body.kilometraje || 0,
    vehiculo_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      vehiculo_id: result.outBinds.vehiculo_id[0],
      message: "Vehículo creado exitosamente"
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res.status(500).json({ error: "Error al crear vehículo", details: error.message });
  }
};

const actualizarVehiculo = async (req, res) => {
  const { vehiculo_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { vehiculo_id };
  const setClauses = [];

  const camposPermitidos = [
    "numero_placa", "modelo_id", "tipo_combustible_id",
    "cliente_id", "color", "anio_fabricacion", "kilometraje"
  ];

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`);
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res.status(400).json({ error: "Ningún campo válido para actualizar fue proporcionado." });
  }

  const sql = `
    UPDATE VEHICULOS
    SET ${setClauses.join(", ")}
    WHERE vehiculo_id = :vehiculo_id`;

  try {
    const resultado = await simpleExecute(sql, binds);
    if (resultado.rowsAffected === 0) {
      return res.status(404).json({ message: "Vehículo no encontrado con el ID proporcionado." });
    }
    res.json({ message: "Vehículo actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    res.status(500).json({ error: "Error al actualizar el vehículo", details: error.message });
  }
};

const eliminarVehiculo = async (req, res) => {
  const { vehiculo_id } = req.params;
  const sql = `DELETE FROM VEHICULOS WHERE vehiculo_id = :vehiculo_id`;

  try {
    await simpleExecute(sql, { vehiculo_id });
    res.json({ message: "Vehículo eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    res.status(500).json({ error: "Error al eliminar el vehículo", details: error.message });
  }
};

module.exports = {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  totalVehiculos,
  vehiculosEnServicio,
  vehiculosProximoMantenimiento,
  marcaMasPopular
};
