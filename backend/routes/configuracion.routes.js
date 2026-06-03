const express = require("express");
const router = express.Router();
const {
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerConfiguracionPorClave
} = require("../controllers/configuracion.controller.js");

router.get("/", obtenerConfiguracion);
router.put("/", actualizarConfiguracion);
router.get("/:clave", obtenerConfiguracionPorClave);

module.exports = router;
