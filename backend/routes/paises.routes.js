const express = require("express");
const router = express.Router();

const {
  obtenerPaises,
  crearPais,
  actualizarPais,
  eliminarPais,
} = require("../controllers/paises.controller.js");

router.get("/", obtenerPaises); // GET /api/paises
router.post("/", crearPais); // POST /api/paises
router.put("/:pais_id", actualizarPais); // PUT /api/paises/5
router.delete("/:pais_id", eliminarPais); // DELETE /api/paises/5

module.exports = router;
