// index.js - Lógica de login para TecnoTaller

// CONFIGURACIÓN DE LA API
const API_CONFIG = {
  baseURL: "http://localhost:3000/api",
  endpoints: {
    login: "/auth/login",
    validate: "/auth/validate",
  },
};

// ELEMENTOS DEL DOM
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = document.getElementById("loginBtnText");
const loginSpinner = document.getElementById("loginSpinner");
const messageContainer = document.getElementById("messageContainer");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const errorText = document.getElementById("errorText");
const successText = document.getElementById("successText");

// Mostrar/ocultar contraseña
togglePasswordBtn.addEventListener("click", function () {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);

  if (type === "password") {
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  } else {
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  }
});

// Función para mostrar mensajes
function showMessage(type, message) {
  messageContainer.classList.remove("hidden");

  if (type === "error") {
    errorMessage.classList.remove("hidden");
    successMessage.classList.add("hidden");
    errorText.textContent = message;
  } else {
    successMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");
    successText.textContent = message;
  }

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    messageContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");
    successMessage.classList.add("hidden");
  }, 5000);
}

// Función para cambiar estado del botón de login
function setLoginLoading(loading) {
  if (loading) {
    loginBtn.disabled = true;
    loginBtnText.classList.add("hidden");
    loginSpinner.classList.remove("hidden");
    loginBtn.classList.add("opacity-75");
  } else {
    loginBtn.disabled = false;
    loginBtnText.classList.remove("hidden");
    loginSpinner.classList.add("hidden");
    loginBtn.classList.remove("opacity-75");
  }
}

// FUNCIÓN DE LOGIN - CONEXIÓN CON API
async function loginUser(credentials) {
  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error en el login");
    }

    return data;
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
}

// Función para guardar token en localStorage
function saveAuthToken(token) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("loginTime", Date.now().toString());
}

// Función para redirigir al dashboard
function redirectToDashboard() {
  window.location.href = "/sistema/dashboard.html";
}

// MANEJO DEL FORMULARIO DE LOGIN
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = emailInput.value.trim();
  const password = passwordInput.value;

  // Validaciones básicas
  if (!usuario || !password) {
    showMessage("error", "Por favor, completa todos los campos");
    return;
  }

  if (password.length < 4) {
    showMessage("error", "La contraseña debe tener al menos 4 caracteres");
    return;
  }

  setLoginLoading(true);

  try {
    const result = await loginUser({
      usuario: usuario,
      password: password,
    });

    showMessage("success", "Login exitoso. Redirigiendo...");

    if (result.token) {
      saveAuthToken(result.token);
      // Guardar datos completos del usuario
      if (result.user) {
        localStorage.setItem("userData", JSON.stringify(result.user));
        localStorage.setItem("userId", result.user.usuario_id);
      }
    }

    setTimeout(() => {
      redirectToDashboard();
    }, 1500);
  } catch (error) {
    let errorMsg = "Error al iniciar sesión";

    if (error.message.includes("fetch")) {
      errorMsg =
        "Error de conexión. Verifica que el servidor esté funcionando.";
    } else {
      errorMsg = error.message;
    }

    showMessage("error", errorMsg);
  } finally {
    setLoginLoading(false);
  }
});

// VERIFICAR SI YA ESTÁ LOGUEADO
function checkExistingLogin() {
  const token = localStorage.getItem("authToken");
  const loginTime = localStorage.getItem("loginTime");

  if (token && loginTime) {
    const now = Date.now();
    const timeDiff = now - parseInt(loginTime);
    const hoursElapsed = timeDiff / (1000 * 60 * 60);

    if (hoursElapsed < 24) {
      redirectToDashboard();
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("userId");
      localStorage.removeItem("userData");
    }
  }
}

document.addEventListener("DOMContentLoaded", checkExistingLogin);
