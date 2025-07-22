const express = require("express");
const router = express.Router();

const {
  obtenerDetallesFacturas,
  crearDetalleFactura,
  actualizarDetalleFactura,
  eliminarDetalleFactura,
} = require("../controllers/detalles_facturas.controller.js");

router.get("/", obtenerDetallesFacturas); // GET /api/detalles_facturas
router.post("/", crearDetalleFactura); // POST /api/detalles_facturas
router.put("/:detalle_factura_id", actualizarDetalleFactura); // PUT /api/detalles_facturas/5
router.delete("/:detalle_factura_id", eliminarDetalleFactura); // DELETE /api/detalles_facturas/5

module.exports = router;
