const express = require("express");
const router = express.Router();

const {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  totalVehiculos,
  vehiculosEnServicio,
  vehiculosProximoMantenimiento,
  marcaMasPopular
} = require("../controllers/vehiculos.controller.js");

// CRUD
router.get("/", obtenerVehiculos); // GET /api/vehiculos
router.post("/", crearVehiculo); // POST /api/vehiculos
router.put("/:vehiculo_id", actualizarVehiculo); // PUT /api/vehiculos/5
router.delete("/:vehiculo_id", eliminarVehiculo); // DELETE /api/vehiculos/5

// Estadísticas
router.get("/total", totalVehiculos); // GET /api/vehiculos/total
router.get("/en-servicio", vehiculosEnServicio); // GET /api/vehiculos/en-servicio
router.get("/proximo-mantenimiento", vehiculosProximoMantenimiento); // GET /api/vehiculos/proximo-mantenimiento
router.get("/marca-popular", marcaMasPopular); // GET /api/vehiculos/marca-popular

module.exports = router;
