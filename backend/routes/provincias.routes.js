const express = require("express");
const router = express.Router();

const {
  obtenerProvincias,
  crearProvincia,
  actualizarProvincia,
  eliminarProvincia,
} = require("../controllers/provincias.controller.js");

router.get("/", obtenerProvincias); // GET /api/provincias
router.post("/", crearProvincia); // POST /api/provincias
router.put("/:provincia_id", actualizarProvincia); // PUT /api/provincias/5
router.delete("/:provincia_id", eliminarProvincia); // DELETE /api/provincias/5

module.exports = router;
