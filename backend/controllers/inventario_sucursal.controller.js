const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODO EL INVENTARIO POR SUCURSAL (GET)
const obtenerInventarioSucursal = async (req, res) => {
  const sql = `SELECT * FROM INVENTARIO_SUCURSAL ORDER BY inventario_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener inventario por sucursal:", error);
    res
      .status(500)
      .json({
        error: "Error al obtener inventario por sucursal",
        details: error.message,
      });
  }
};

// CREAR INVENTARIO POR SUCURSAL (POST)
const crearInventarioSucursal = async (req, res) => {
  if (!req.body.producto_id || !req.body.sucursal_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["producto_id", "sucursal_id"],
    });
  }

  const sql = `
    INSERT INTO INVENTARIO_SUCURSAL (
      inventario_id, producto_id, sucursal_id, cantidad_actual
    ) VALUES (
      inventario_sucursal_seq.NEXTVAL, :producto_id, :sucursal_id, :cantidad_actual
    ) RETURNING inventario_id INTO :inventario_id
  `;

  const binds = {
    producto_id: req.body.producto_id,
    sucursal_id: req.body.sucursal_id,
    cantidad_actual: req.body.cantidad_actual,
    inventario_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      inventario_id: result.outBinds.inventario_id[0],
      message: "Inventario por sucursal creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({
        error: "Error al crear inventario por sucursal",
        details: error.message,
      });
  }
};

// ACTUALIZAR INVENTARIO POR SUCURSAL (PUT)
const actualizarInventarioSucursal = async (req, res) => {
  const { inventario_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { inventario_id };
  const setClauses = [];

  const camposPermitidos = ["producto_id", "sucursal_id", "cantidad_actual"];

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
    UPDATE INVENTARIO_SUCURSAL
    SET ${setClauses.join(", ")}
    WHERE inventario_id = :inventario_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({
          message:
            "Inventario por sucursal no encontrado con el ID proporcionado.",
        });
    }

    res.json({ message: "Inventario por sucursal actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar inventario por sucursal:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el inventario por sucursal",
        details: error.message,
      });
  }
};

// ELIMINAR INVENTARIO POR SUCURSAL (DELETE)
const eliminarInventarioSucursal = async (req, res) => {
  const { inventario_id } = req.params;
  const sql = `DELETE FROM INVENTARIO_SUCURSAL WHERE inventario_id = :inventario_id`;

  try {
    await simpleExecute(sql, { inventario_id });
    res.json({ message: "Inventario por sucursal eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar inventario por sucursal:", error);
    res
      .status(500)
      .json({
        error: "Error al eliminar el inventario por sucursal",
        details: error.message,
      });
  }
};

module.exports = {
  obtenerInventarioSucursal,
  crearInventarioSucursal,
  actualizarInventarioSucursal,
  eliminarInventarioSucursal,
};
