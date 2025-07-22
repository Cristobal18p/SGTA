const express = require("express");
const router = express.Router();

const {
  obtenerTiposClientes,
  crearTipoCliente,
  actualizarTipoCliente,
  eliminarTipoCliente,
} = require("../controllers/tipos_clientes.controller.js");

router.get("/", obtenerTiposClientes); // GET /api/tipos_clientes
router.post("/", crearTipoCliente); // POST /api/tipos_clientes
router.put("/:tipo_cliente_id", actualizarTipoCliente); // PUT /api/tipos_clientes/5
router.delete("/:tipo_cliente_id", eliminarTipoCliente); // DELETE /api/tipos_clientes/5

module.exports = router;
