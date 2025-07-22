const express = require("express");
const router = express.Router();

const {
  obtenerNacionalidades,
  crearNacionalidad,
  actualizarNacionalidad,
  eliminarNacionalidad,
} = require("../controllers/nacionalidades.controller.js");

router.get("/", obtenerNacionalidades); // GET /api/nacionalidades
router.post("/", crearNacionalidad); // POST /api/nacionalidades
router.put("/:nacionalidad_id", actualizarNacionalidad); // PUT /api/nacionalidades/5
router.delete("/:nacionalidad_id", eliminarNacionalidad); // DELETE /api/nacionalidades/5

module.exports = router;
