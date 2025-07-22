const express = require("express");
const router = express.Router();

const {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} = require("../controllers/servicios.controller.js");

router.get("/", obtenerServicios); // GET /api/servicios
router.post("/", crearServicio); // POST /api/servicios
router.put("/:servicio_id", actualizarServicio); // PUT /api/servicios/5
router.delete("/:servicio_id", eliminarServicio); // DELETE /api/servicios/5

module.exports = router;
