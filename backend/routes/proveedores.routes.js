const express = require("express");
const router = express.Router();

const {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("../controllers/proveedores.controller.js");

router.get("/", obtenerProveedores); // GET /api/proveedores
router.post("/", crearProveedor); // POST /api/proveedores
router.put("/:proveedor_id", actualizarProveedor); // PUT /api/proveedores/5
router.delete("/:proveedor_id", eliminarProveedor); // DELETE /api/proveedores/5

module.exports = router;
