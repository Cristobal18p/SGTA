// editar-perfil.js - Lógica de la página de edición de perfil TecnoTaller

// Configuración de la API
const API_CONFIG = {
  baseURL: "http://localhost:3000/api",
  endpoints: {
    perfil: "/perfil",
    usuarios: "/usuarios",
    personal: "/personal",
  },
};

// Variables globales
let userId = localStorage.getItem("userId");
console.log("User ID:", userId);
let personalId = null;
let originalProfileData = {}; // Datos originales para comparación

// Verificar autenticación
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "./index.html";
    return false;
  }
  return true;
}

// Función para hacer peticiones autenticadas
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}${endpoint}`,
      mergedOptions
    );

    console.log(`Petición a: ${API_CONFIG.baseURL}${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("userId");
      window.location.href = "./index.html";
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      const text = await response.text();
      console.error("Respuesta no es JSON:", text);
      throw new Error("La respuesta del servidor no es JSON válido");
    }
  } catch (error) {
    console.error("Error en petición API:", error);
    throw error;
  }
}

// Cargar datos del perfil
async function loadProfileData() {
  try {
    // Verificar que tenemos un userId válido
    if (!userId || userId === "null") {
      showNotification(
        "Error",
        "No se encontró el ID del usuario. Por favor, inicia sesión nuevamente.",
        "error"
      );
      setTimeout(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("userId");
        window.location.href = "./index.html";
      }, 2000);
      return;
    }

    const profileData = await apiRequest(
      `${API_CONFIG.endpoints.perfil}/${userId}`
    );

    console.log("Datos recibidos del backend:", profileData);

    if (profileData) {
      // Verificar que los elementos existen antes de asignar valores
      const elementos = [
        "nombre_usuario",
        "email_usuario",
        "primer_nombre",
        "segundo_nombre",
        "primer_apellido",
        "segundo_apellido",
        "numero_cedula",
        "telefono",
        "email_personal",
        "nacionalidad",
      ];

      elementos.forEach((id) => {
        const elemento = document.getElementById(id);
        if (!elemento) {
          console.warn(`Elemento con ID '${id}' no encontrado en el DOM`);
        }
      });

      // Asignar valores a los campos
      if (document.getElementById("nombre_usuario")) {
        document.getElementById("nombre_usuario").value =
          profileData.NOMBRE_USUARIO || "";
      }
      if (document.getElementById("email_usuario")) {
        document.getElementById("email_usuario").value =
          profileData.EMAIL_USUARIO || "";
      }
      if (document.getElementById("primer_nombre")) {
        document.getElementById("primer_nombre").value =
          profileData.PRIMER_NOMBRE || "";
      }
      if (document.getElementById("segundo_nombre")) {
        document.getElementById("segundo_nombre").value =
          profileData.SEGUNDO_NOMBRE || "";
      }
      if (document.getElementById("primer_apellido")) {
        document.getElementById("primer_apellido").value =
          profileData.PRIMER_APELLIDO || "";
      }
      if (document.getElementById("segundo_apellido")) {
        document.getElementById("segundo_apellido").value =
          profileData.SEGUNDO_APELLIDO || "";
      }
      if (document.getElementById("numero_cedula")) {
        document.getElementById("numero_cedula").value =
          profileData.NUMERO_CEDULA || "";
      }
      if (document.getElementById("telefono")) {
        document.getElementById("telefono").value = profileData.TELEFONO || "";
      }
      if (document.getElementById("email_personal")) {
        document.getElementById("email_personal").value =
          profileData.EMAIL_PERSONAL || "";
      }
      if (document.getElementById("nacionalidad")) {
        document.getElementById("nacionalidad").value =
          profileData.NOMBRE_NACIONALIDAD || "";
      }
    }

    console.log("Datos del perfil cargados correctamente");

    // Guardar snapshot de los datos originales para comparación
    originalProfileData = profileData;
  } catch (error) {
    console.error("Error cargando datos del perfil:", error);
    showNotification(
      "Error",
      "No se pudieron cargar los datos del perfil",
      "error"
    );
  }
}

// Guardar cambios del perfil
async function saveProfile(formData) {
  try {
    // Verificar que tenemos un userId válido
    if (!userId || userId === "null") {
      throw new Error("No se encontró el ID del usuario");
    }

    // Preparar datos para actualizar (solo campos permitidos)
    const updateData = {};

    console.log("Datos del formulario:", formData);

    // Solo incluir campos que han cambiado y están permitidos
    if (
      formData.nombre_usuario !== undefined &&
      formData.nombre_usuario !== null &&
      String(formData.nombre_usuario).trim() !== ""
    ) {
      updateData.nombre_usuario = String(formData.nombre_usuario).trim();
    }

    if (
      formData.primer_nombre !== undefined &&
      formData.primer_nombre !== null &&
      String(formData.primer_nombre).trim() !== ""
    ) {
      updateData.primer_nombre = String(formData.primer_nombre).trim();
    }

    // Para segundo_nombre, permitir cadena vacía (puede ser null)
    if (formData.segundo_nombre !== undefined) {
      updateData.segundo_nombre = formData.segundo_nombre
        ? String(formData.segundo_nombre).trim()
        : null;
    }

    // Para primer_apellido, permitir cadena vacía (puede ser null)
    if (formData.primer_apellido !== undefined) {
      updateData.primer_apellido = formData.primer_apellido
        ? String(formData.primer_apellido).trim()
        : null;
    }

    // Para segundo_apellido, permitir cadena vacía (puede ser null)
    if (formData.segundo_apellido !== undefined) {
      updateData.segundo_apellido = formData.segundo_apellido
        ? String(formData.segundo_apellido).trim()
        : null;
    }

    if (
      formData.telefono !== undefined &&
      formData.telefono !== null &&
      String(formData.telefono).trim() !== ""
    ) {
      updateData.telefono = String(formData.telefono).trim();
    }

    if (
      formData.email_personal !== undefined &&
      formData.email_personal !== null &&
      String(formData.email_personal).trim() !== ""
    ) {
      updateData.email_personal = String(formData.email_personal).trim();
    }

    // Solo incluir contraseña si se proporcionó
    if (
      formData.clave_hash !== undefined &&
      formData.clave_hash !== null &&
      String(formData.clave_hash).trim() !== ""
    ) {
      updateData.clave_hash = String(formData.clave_hash).trim();
    }

    console.log("Datos a enviar:", updateData);

    // Verificar que hay al menos un campo para actualizar
    if (Object.keys(updateData).length === 0) {
      throw new Error("No hay cambios para guardar");
    }

    // Llamar al API para actualizar el perfil
    const response = await apiRequest(
      `${API_CONFIG.endpoints.perfil}/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(updateData),
      }
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Mensaje personalizado con el nombre del usuario
    const nombre =
      originalProfileData?.PRIMER_NOMBRE ||
      originalProfileData?.NOMBRE_USUARIO ||
      "Usuario";
    showNotification(
      "¡Actualización exitosa!",
      `¡Perfecto ${nombre}! Tu perfil se ha actualizado correctamente.`,
      "success"
    );

    // Limpiar campo de contraseña después de guardar exitosamente
    if (document.getElementById("clave_hash")) {
      document.getElementById("clave_hash").value = "";
    }

    // Recargar la página después de 2 segundos para mostrar los datos actualizados
    setTimeout(() => {
      window.location.reload();
    }, 2000); // Mínimo 2 segundos para ver el mensaje
  } catch (error) {
    console.error("Error guardando perfil:", error);
    showNotification(
      "Error",
      error.message || "No se pudo actualizar el perfil",
      "error"
    );
    throw error;
  }
}

// Mostrar notificación
function showNotification(title, message, type) {
  const notification = document.getElementById("notification");
  const icon = document.getElementById("notificationIcon");
  const iconClass = document.getElementById("notificationIconClass");
  const titleEl = document.getElementById("notificationTitle");
  const messageEl = document.getElementById("notificationMessage");

  // Configurar según el tipo
  if (type === "success") {
    icon.className =
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-green-500";
    iconClass.className = "fas fa-check text-white";
  } else if (type === "error") {
    icon.className =
      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-red-500";
    iconClass.className = "fas fa-exclamation-triangle text-white";
  }

  titleEl.textContent = title;
  messageEl.textContent = message;

  notification.classList.remove("hidden");

  // Auto-ocultar después de 5 segundos
  setTimeout(hideNotification, 5000);
}

// Ocultar notificación
function hideNotification() {
  document.getElementById("notification").classList.add("hidden");
}

// Toggle para mostrar/ocultar contraseña
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("togglePassword")) {
    document
      .getElementById("togglePassword")
      .addEventListener("click", function () {
        const passwordInput = document.getElementById("clave_hash");
        const eyeIcon = document.getElementById("eyeIcon");

        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          eyeIcon.className =
            "fas fa-eye-slash text-gray-400 hover:text-gray-600";
        } else {
          passwordInput.type = "password";
          eyeIcon.className = "fas fa-eye text-gray-400 hover:text-gray-600";
        }
      });
  }

  // Manejar envío del formulario
  if (document.getElementById("perfilForm")) {
    document
      .getElementById("perfilForm")
      .addEventListener("submit", async function (e) {
        e.preventDefault();

        const guardarBtn = document.getElementById("guardarBtn");
        const guardarText = document.getElementById("guardarText");

        // Deshabilitar botón y mostrar loading
        guardarBtn.disabled = true;
        guardarText.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

        try {
          const formData = new FormData(this);
          const data = Object.fromEntries(formData);

          // Validar campos requeridos
          if (!data.primer_nombre || !data.primer_nombre.trim()) {
            throw new Error("El primer nombre es obligatorio");
          }

          await saveProfile(data);
        } catch (error) {
          console.error("Error:", error);
          showNotification(
            "Error",
            error.message || "Error al guardar el perfil",
            "error"
          );
        } finally {
          // Rehabilitar botón
          guardarBtn.disabled = false;
          guardarText.innerHTML =
            '<i class="fas fa-save mr-2"></i>Guardar Cambios';
        }
      });
  }

  // Botón cancelar - redirección simple al dashboard
  if (document.getElementById("cancelarBtn")) {
    document
      .getElementById("cancelarBtn")
      .addEventListener("click", function () {
        console.log("Botón cancelar clickeado - redirigiendo al dashboard");
        window.location.href = "./dashboard.html";
      });
  }

  // Inicializar página
  if (checkAuth()) {
    loadProfileData();
  }
});
