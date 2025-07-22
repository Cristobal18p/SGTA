const express = require("express");
const router = express.Router();

const {
  obtenerPerfil,
  actualizarPerfil,
} = require("../controllers/perfil.controller.js");

router.get("/:usuario_id", obtenerPerfil); // GET  /api/perfil/2
router.put("/:usuario_id", actualizarPerfil); // PUT /api/perfil/2

module.exports = router;
