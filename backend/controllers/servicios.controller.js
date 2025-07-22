const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS SERVICIOS (GET)
const obtenerServicios = async (req, res) => {
  const sql = `SELECT * FROM SERVICIOS ORDER BY servicio_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res
      .status(500)
      .json({ error: "Error al obtener servicios", details: error.message });
  }
};

// CREAR SERVICIO (POST)
const crearServicio = async (req, res) => {
  if (!req.body.nombre_servicio) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_servicio",
    });
  }

  const sql = `
    INSERT INTO SERVICIOS (
      servicio_id, nombre_servicio, descripcion_servicio, precio_base
    ) VALUES (
      servicios_seq.NEXTVAL, :nombre_servicio, :descripcion_servicio, :precio_base
    ) RETURNING servicio_id INTO :servicio_id
  `;

  const binds = {
    nombre_servicio: req.body.nombre_servicio,
    descripcion_servicio: req.body.descripcion_servicio,
    precio_base: req.body.precio_base,
    servicio_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      servicio_id: result.outBinds.servicio_id[0],
      message: "Servicio creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear servicio", details: error.message });
  }
};

// ACTUALIZAR SERVICIO (PUT)
const actualizarServicio = async (req, res) => {
  const { servicio_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { servicio_id };
  const setClauses = [];

  const camposPermitidos = [
    "nombre_servicio",
    "descripcion_servicio",
    "precio_base",
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
    UPDATE SERVICIOS
    SET ${setClauses.join(", ")}
    WHERE servicio_id = :servicio_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Servicio no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Servicio actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el servicio",
        details: error.message,
      });
  }
};

// ELIMINAR SERVICIO (DELETE)
const eliminarServicio = async (req, res) => {
  const { servicio_id } = req.params;
  const sql = `DELETE FROM SERVICIOS WHERE servicio_id = :servicio_id`;

  try {
    await simpleExecute(sql, { servicio_id });
    res.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el servicio", details: error.message });
  }
};

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
};
