const express = require("express");
const router = express.Router();

const {
  obtenerRoles,
  crearRol,
  actualizarRol,
  eliminarRol,
} = require("../controllers/rol.controller.js");

router.get("/", obtenerRoles); // GET /api/rol
router.post("/", crearRol); // POST /api/rol
router.put("/:rol_id", actualizarRol); // PUT /api/rol/5
router.delete("/:rol_id", eliminarRol); // DELETE /api/rol/5

module.exports = router;
