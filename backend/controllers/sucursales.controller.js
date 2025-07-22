const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODAS LAS SUCURSALES (GET)
const obtenerSucursales = async (req, res) => {
  const sql = `SELECT * FROM SUCURSALES ORDER BY sucursal_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    res
      .status(500)
      .json({ error: "Error al obtener sucursales", details: error.message });
  }
};

// CREAR SUCURSAL (POST)
const crearSucursal = async (req, res) => {
  if (!req.body.nombre_sucursal) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_sucursal",
    });
  }

  const sql = `
    INSERT INTO SUCURSALES (
      sucursal_id, nombre_sucursal, telefono, direccion_id
    ) VALUES (
      sucursales_seq.NEXTVAL, :nombre_sucursal, :telefono, :direccion_id
    ) RETURNING sucursal_id INTO :sucursal_id
  `;

  const binds = {
    nombre_sucursal: req.body.nombre_sucursal,
    telefono: req.body.telefono,
    direccion_id: req.body.direccion_id,
    sucursal_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      sucursal_id: result.outBinds.sucursal_id[0],
      message: "Sucursal creada exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear sucursal", details: error.message });
  }
};

// ACTUALIZAR SUCURSAL (PUT)
const actualizarSucursal = async (req, res) => {
  const { sucursal_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { sucursal_id };
  const setClauses = [];

  const camposPermitidos = ["nombre_sucursal", "telefono", "direccion_id"];

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
    UPDATE SUCURSALES
    SET ${setClauses.join(", ")}
    WHERE sucursal_id = :sucursal_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Sucursal no encontrada con el ID proporcionado." });
    }

    res.json({ message: "Sucursal actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar sucursal:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar la sucursal",
        details: error.message,
      });
  }
};

// ELIMINAR SUCURSAL (DELETE)
const eliminarSucursal = async (req, res) => {
  const { sucursal_id } = req.params;
  const sql = `DELETE FROM SUCURSALES WHERE sucursal_id = :sucursal_id`;

  try {
    await simpleExecute(sql, { sucursal_id });
    res.json({ message: "Sucursal eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar sucursal:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar la sucursal", details: error.message });
  }
};

module.exports = {
  obtenerSucursales,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
};
