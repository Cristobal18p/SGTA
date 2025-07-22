const express = require("express");
const router = express.Router();

const {
  obtenerMetodosPagos,
  crearMetodoPago,
  actualizarMetodoPago,
  eliminarMetodoPago,
} = require("../controllers/metodos_pagos.controller.js");

router.get("/", obtenerMetodosPagos); // GET /api/metodos_pagos
router.post("/", crearMetodoPago); // POST /api/metodos_pagos
router.put("/:metodo_pago_id", actualizarMetodoPago); // PUT /api/metodos_pagos/5
router.delete("/:metodo_pago_id", eliminarMetodoPago); // DELETE /api/metodos_pagos/5

module.exports = router;
