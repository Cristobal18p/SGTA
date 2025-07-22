const express = require("express");
const router = express.Router();

const {
  obtenerCorregimientos,
  crearCorregimiento,
  actualizarCorregimiento,
  eliminarCorregimiento,
} = require("../controllers/corregimientos.controller.js");

router.get("/", obtenerCorregimientos); // GET /api/corregimientos
router.post("/", crearCorregimiento); // POST /api/corregimientos
router.put("/:corregimiento_id", actualizarCorregimiento); // PUT /api/corregimientos/5
router.delete("/:corregimiento_id", eliminarCorregimiento); // DELETE /api/corregimientos/5

module.exports = router;
