const express = require('express');
const router = express.Router();

const {
  obtenerPersonal,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal
} = require('../controllers/personal.controller.js');

router.get('/', obtenerPersonal); // GET /api/personal
router.post('/', crearPersonal);   // POST /api/personal
router.put('/:personal_id', actualizarPersonal); // PUT /api/personal/5
router.delete('/:personal_id', eliminarPersonal); // DELETE /api/personal/5

module.exports = router;
