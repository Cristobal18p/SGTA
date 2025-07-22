const express = require("express");
const router = express.Router();

const {
  obtenerModelosVehiculos,
  crearModeloVehiculo,
  actualizarModeloVehiculo,
  eliminarModeloVehiculo,
} = require("../controllers/modelos_vehiculos.controller.js");

router.get("/", obtenerModelosVehiculos); // GET /api/modelos_vehiculos
router.post("/", crearModeloVehiculo); // POST /api/modelos_vehiculos
router.put("/:modelo_id", actualizarModeloVehiculo); // PUT /api/modelos_vehiculos/5
router.delete("/:modelo_id", eliminarModeloVehiculo); // DELETE /api/modelos_vehiculos/5

module.exports = router;
