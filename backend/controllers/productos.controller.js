const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS PRODUCTOS (GET)
const obtenerProductos = async (req, res) => {
  const sql = `SELECT * FROM PRODUCTOS ORDER BY producto_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener productos", details: error.message });
  }
};

// CREAR PRODUCTO (POST)
const crearProducto = async (req, res) => {
  if (!req.body.codigo_producto || !req.body.nombre_producto) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["codigo_producto", "nombre_producto"],
    });
  }

  const sql = `
    INSERT INTO PRODUCTOS (
      producto_id, codigo_producto, nombre_producto, cantidad_disponible, precio_base, precio_venta
    ) VALUES (
      productos_seq.NEXTVAL, :codigo_producto, :nombre_producto, :cantidad_disponible, :precio_base, :precio_venta
    ) RETURNING producto_id INTO :producto_id
  `;

  const binds = {
    codigo_producto: req.body.codigo_producto,
    nombre_producto: req.body.nombre_producto,
    cantidad_disponible: req.body.cantidad_disponible,
    precio_base: req.body.precio_base,
    precio_venta: req.body.precio_venta,
    producto_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      producto_id: result.outBinds.producto_id[0],
      message: "Producto creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear producto", details: error.message });
  }
};

// ACTUALIZAR PRODUCTO (PUT)
const actualizarProducto = async (req, res) => {
  const { producto_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { producto_id };
  const setClauses = [];

  const camposPermitidos = [
    "codigo_producto",
    "nombre_producto",
    "cantidad_disponible",
    "precio_base",
    "precio_venta",
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
    UPDATE PRODUCTOS
    SET ${setClauses.join(", ")}
    WHERE producto_id = :producto_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el producto",
        details: error.message,
      });
  }
};

// ELIMINAR PRODUCTO (DELETE)
const eliminarProducto = async (req, res) => {
  const { producto_id } = req.params;
  const sql = `DELETE FROM PRODUCTOS WHERE producto_id = :producto_id`;

  try {
    await simpleExecute(sql, { producto_id });
    res.json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el producto", details: error.message });
  }
};

module.exports = {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
