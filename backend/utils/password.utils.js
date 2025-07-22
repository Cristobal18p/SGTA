const bcrypt = require("bcrypt");

// Función para hashear contraseñas
async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Contraseña original: ${password}`);
    console.log(`Contraseña hasheada: ${hashedPassword}`);
    return hashedPassword;
  } catch (error) {
    console.error("Error al hashear contraseña:", error);
  }
}

// Función para verificar contraseñas
async function verifyPassword(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Contraseña válida: ${isValid}`);
    return isValid;
  } catch (error) {
    console.error("Error al verificar contraseña:", error);
  }
}

// Ejemplos de uso
async function examples() {
  console.log("=== GENERADOR DE CONTRASEÑAS HASHEADAS ===\n");

  // Hashear contraseñas comunes para testing
  await hashPassword("admin123");
  await hashPassword("user123");
  await hashPassword("tecnico123");

  console.log("\n=== EJEMPLO DE VERIFICACIÓN ===");
  const hash = "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
  await verifyPassword("admin123", hash);
  await verifyPassword("wrongpassword", hash);
}

// Ejecutar ejemplos si se ejecuta directamente
if (require.main === module) {
  examples();
}

module.exports = {
  hashPassword,
  verifyPassword,
};
