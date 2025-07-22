const express = require("express");
const router = express.Router();

const {
  obtenerInventarioSucursal,
  crearInventarioSucursal,
  actualizarInventarioSucursal,
  eliminarInventarioSucursal,
} = require("../controllers/inventario_sucursal.controller.js");

router.get("/", obtenerInventarioSucursal); // GET /api/inventario_sucursal
router.post("/", crearInventarioSucursal); // POST /api/inventario_sucursal
router.put("/:inventario_id", actualizarInventarioSucursal); // PUT /api/inventario_sucursal/5
router.delete("/:inventario_id", eliminarInventarioSucursal); // DELETE /api/inventario_sucursal/5

module.exports = router;
