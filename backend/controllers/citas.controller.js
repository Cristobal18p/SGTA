const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

//obtener citas para fronted
const obtenerCitas = async (req, res) => {
  const { estado, sucursal_id } = req.query;

  let sql = `
    SELECT
      c.cita_id,
      TO_CHAR(c.fecha_cita, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cita,
      c.estado,
      c.tipo_cita,
      cl.cliente_id,
      cl.primer_nombre || ' ' || cl.primer_apellido AS nombre_cliente,
      v.numero_placa,
      v.color,
      mo.nombre_modelo,
      ma.nombre_marca,
      s.nombre_sucursal
    FROM citas c
    JOIN clientes cl ON c.cliente_id = cl.cliente_id
    JOIN vehiculos v ON c.vehiculo_id = v.vehiculo_id
    JOIN modelos_vehiculos mo ON v.modelo_id = mo.modelo_id
    JOIN marcas_vehiculos ma ON mo.marca_id = ma.marca_id
    JOIN sucursales s ON c.sucursal_id = s.sucursal_id
    WHERE 1 = 1
  `;

  const binds = {};

  if (estado) {
    sql += " AND c.estado = :estado";
    binds.estado = estado.toUpperCase();
  }

  if (sucursal_id) {
    sql += " AND c.sucursal_id = :sucursal_id";
    binds.sucursal_id = sucursal_id;
  }

  sql += " ORDER BY c.cita_id";

  try {
    const result = await simpleExecute(sql, binds);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ error: "Error al obtener citas", details: error.message });
  }
};

// Obtener una sola cita por ID
const obtenerCitaPorId = async (req, res) => {
  const { cita_id } = req.params;

  const sql = `
    SELECT
      c.cita_id,
      TO_CHAR(c.fecha_cita, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cita,
      c.estado,
      c.tipo_cita,
      cl.cliente_id,
      cl.primer_nombre || ' ' || cl.primer_apellido AS nombre_cliente,
      v.numero_placa,
      v.color,
      mo.nombre_modelo,
      ma.nombre_marca,
      s.nombre_sucursal
    FROM citas c
    JOIN clientes cl ON c.cliente_id = cl.cliente_id
    JOIN vehiculos v ON c.vehiculo_id = v.vehiculo_id
    JOIN modelos_vehiculos mo ON v.modelo_id = mo.modelo_id
    JOIN marcas_vehiculos ma ON mo.marca_id = ma.marca_id
    JOIN sucursales s ON c.sucursal_id = s.sucursal_id
    WHERE c.cita_id = :cita_id
  `;

  try {
    const result = await simpleExecute(sql, { cita_id });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({ error: "Error al obtener cita", details: error.message });
  }
};

// Crear nueva cita
const crearCita = async (req, res) => {
  const {
    cliente_id,
    vehiculo_id,
    sucursal_id,
    fecha_cita,
    estado = "AGENDADA",
    tipo_cita = "MANTENIMIENTO",
  } = req.body;

  if (!cliente_id || !vehiculo_id || !sucursal_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["cliente_id", "vehiculo_id", "sucursal_id"],
    });
  }

  const sql = `
    INSERT INTO citas (
      cita_id, cliente_id, vehiculo_id, sucursal_id, fecha_cita, estado, tipo_cita
    ) VALUES (
      citas_seq.NEXTVAL, :cliente_id, :vehiculo_id, :sucursal_id,
      ${fecha_cita ? "TO_DATE(:fecha_cita, 'YYYY-MM-DD HH24:MI:SS')" : "SYSDATE"},
      :estado, :tipo_cita
    ) RETURNING cita_id INTO :cita_id
  `;

  const binds = {
    cliente_id,
    vehiculo_id,
    sucursal_id,
    estado,
    tipo_cita,
    cita_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  if (fecha_cita) binds.fecha_cita = fecha_cita;

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      cita_id: result.outBinds.cita_id[0],
      message: "Cita creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ error: "Error al crear cita", details: error.message });
  }
};

// Actualizar cita
const actualizarCita = async (req, res) => {
  const { cita_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Debes proporcionar al menos un campo para actualizar.",
    });
  }

  const camposPermitidos = ["cliente_id", "vehiculo_id", "sucursal_id", "fecha_cita", "estado", "tipo_cita"];
  const setClauses = [];
  const binds = { cita_id };

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      if (campo === "fecha_cita") {
        setClauses.push(`${campo} = TO_DATE(:${campo}, 'YYYY-MM-DD HH24:MI:SS')`);
      } else {
        setClauses.push(`${campo} = :${campo}`);
      }
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Ningún campo válido para actualizar fue proporcionado.",
    });
  }

  const sql = `
    UPDATE citas
    SET ${setClauses.join(", ")}
    WHERE cita_id = :cita_id
  `;

  try {
    const result = await simpleExecute(sql, binds);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json({ message: "Cita actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ error: "Error al actualizar cita", details: error.message });
  }
};

// Eliminar cita
const eliminarCita = async (req, res) => {
  const { cita_id } = req.params;

  const sql = `DELETE FROM citas WHERE cita_id = :cita_id`;

  try {
    const result = await simpleExecute(sql, { cita_id });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json({ message: "Cita eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ error: "Error al eliminar cita", details: error.message });
  }
};

module.exports = {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  actualizarCita,
  eliminarCita,
};

