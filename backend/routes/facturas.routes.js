const express = require("express");
const router = express.Router();

const {
  obtenerFacturas,
  crearFactura,
  actualizarFactura,
  eliminarFactura,
} = require("../controllers/facturas.controller.js");

router.get("/", obtenerFacturas); // GET /api/facturas
router.post("/", crearFactura); // POST /api/facturas
router.put("/:factura_id", actualizarFactura); // PUT /api/facturas/5
router.delete("/:factura_id", eliminarFactura); // DELETE /api/facturas/5

module.exports = router;
