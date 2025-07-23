const express = require("express");
const router = express.Router();

const {
  obtenerDirecciones,
  obtenerDireccionPorId,
  crearDireccion,
  actualizarDireccion,
  eliminarDireccion,
} = require("../controllers/direcciones.controller.js");

router.get("/", obtenerDirecciones); // GET /api/direcciones
router.get("/:id", obtenerDireccionPorId); // GET /api/direcciones/5
router.post("/", crearDireccion); // POST /api/direcciones
router.put("/:direccion_id", actualizarDireccion); // PUT /api/direcciones/5
router.delete("/:direccion_id", eliminarDireccion); // DELETE /api/direcciones/5

module.exports = router;
