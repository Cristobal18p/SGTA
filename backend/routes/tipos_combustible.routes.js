const express = require("express");
const router = express.Router();

const {
  obtenerTiposCombustible,
  crearTipoCombustible,
  actualizarTipoCombustible,
  eliminarTipoCombustible,
} = require("../controllers/tipos_combustible.controller.js");

router.get("/", obtenerTiposCombustible); // GET /api/tipos_combustible
router.post("/", crearTipoCombustible); // POST /api/tipos_combustible
router.put("/:tipo_combustible_id", actualizarTipoCombustible); // PUT /api/tipos_combustible/5
router.delete("/:tipo_combustible_id", eliminarTipoCombustible); // DELETE /api/tipos_combustible/5

module.exports = router;
