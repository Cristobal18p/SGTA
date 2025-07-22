const express = require("express");
const router = express.Router();

const {
  obtenerDistritos,
  crearDistrito,
  actualizarDistrito,
  eliminarDistrito,
} = require("../controllers/distritos.controller.js");

router.get("/", obtenerDistritos); // GET /api/distritos
router.post("/", crearDistrito); // POST /api/distritos
router.put("/:distrito_id", actualizarDistrito); // PUT /api/distritos/5
router.delete("/:distrito_id", eliminarDistrito); // DELETE /api/distritos/5

module.exports = router;
