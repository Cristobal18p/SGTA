const express = require("express");
const router = express.Router();

const {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require("../controllers/productos.controller.js");

router.get("/", obtenerProductos); // GET /api/productos
router.post("/", crearProducto); // POST /api/productos
router.put("/:producto_id", actualizarProducto); // PUT /api/productos/5
router.delete("/:producto_id", eliminarProducto); // DELETE /api/productos/5

module.exports = router;
