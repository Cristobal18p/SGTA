const express = require("express");
const router = express.Router();

const {
  obtenerMarcasVehiculos,
  crearMarcaVehiculo,
  actualizarMarcaVehiculo,
  eliminarMarcaVehiculo,
} = require("../controllers/marcas_vehiculos.controller.js");

router.get("/", obtenerMarcasVehiculos); // GET /api/marcas_vehiculos
router.post("/", crearMarcaVehiculo); // POST /api/marcas_vehiculos
router.put("/:marca_id", actualizarMarcaVehiculo); // PUT /api/marcas_vehiculos/5
router.delete("/:marca_id", eliminarMarcaVehiculo); // DELETE /api/marcas_vehiculos/5

module.exports = router;
