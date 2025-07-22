const express = require("express");
const router = express.Router();

const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller.js");

router.get("/", obtenerUsuarios); // GET /api/usuarios
router.post("/", crearUsuario); // POST /api/usuarios
router.put("/:usuario_id", actualizarUsuario); // PUT /api/usuarios/5
router.delete("/:usuario_id", eliminarUsuario); // DELETE /api/usuarios/5

module.exports = router;
