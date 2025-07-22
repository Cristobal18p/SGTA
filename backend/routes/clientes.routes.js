const express = require("express");
const router = express.Router();

const {
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  mostrarModuloCliente,
  obtenerClientePorId,
} = require("../controllers/clientes.controller.js");

router.get("/modulo", mostrarModuloCliente); // GET /api/clientes/modulo
router.get("/:cliente_id", obtenerClientePorId); // GET /api/clientes/5
router.post("/", crearCliente); // POST /api/clientes
router.put("/:cliente_id", actualizarCliente); // PUT /api/clientes/5
router.delete("/:cliente_id", eliminarCliente); // DELETE /api/clientes/5

module.exports = router;
