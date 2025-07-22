const express = require("express");
const router = express.Router();
const {
  login,
  validateToken,
  logout,
  refreshToken,
} = require("../controllers/auth.controller");

// POST /api/auth/login - Iniciar sesión
router.post("/login", login);

// GET /api/auth/validate - Validar token
router.get("/validate", validateToken);

// POST /api/auth/logout - Cerrar sesión
router.post("/logout", logout);

// POST /api/auth/refresh - Renovar token
router.post("/refresh", refreshToken);

module.exports = router;
