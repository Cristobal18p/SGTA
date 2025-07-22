const express = require("express");
const router = express.Router();

const {
  obtenerSucursales,
  crearSucursal,
  actualizarSucursal,
  eliminarSucursal,
} = require("../controllers/sucursales.controller.js");

router.get("/", obtenerSucursales); // GET /api/sucursales
router.post("/", crearSucursal); // POST /api/sucursales
router.put("/:sucursal_id", actualizarSucursal); // PUT /api/sucursales/5
router.delete("/:sucursal_id", eliminarSucursal); // DELETE /api/sucursales/5

module.exports = router;
