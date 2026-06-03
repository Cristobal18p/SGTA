// Configuracion global del sistema

/**
 * Configuración principal del sistema
 * IMPORTANTE: Actualiza estas configuraciones segun tu entorno
 */
const CONFIG = {
  // Configuración de la API del Backend
  API: {
    //  CAMBIAR POR LA URL DE TU BACKEND
    BASE_URL: "http://localhost:3000/api",

    // Endpoints principales
    ENDPOINTS: {
      // Autenticación
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      VALIDATE: "/auth/validate",
      REFRESH: "/auth/refresh",

      // Módulos principales (coinciden con tus controladores)
      CLIENTES: "/clientes",
      CITAS: "/citas",
      VEHICULOS: "/vehiculos",
      FACTURAS: "/facturas",
      SERVICIOS: "/servicios",
      PRODUCTOS: "/productos",
      PERSONAL: "/personal",
      USUARIOS: "/usuarios",
      SUCURSALES: "/sucursales",
      PROVEEDORES: "/proveedores",
      INVENTARIO: "/inventario_sucursal",

      // Catálogos
      PAISES: "/paises",
      PROVINCIAS: "/provincias",
      DISTRITOS: "/distritos",
      CORREGIMIENTOS: "/corregimientos",
      DIRECCIONES: "/direcciones",
      NACIONALIDADES: "/nacionalidades",
      TIPOS_CLIENTES: "/tipos_clientes",
      TIPOS_COMBUSTIBLE: "/tipos_combustible",
      MARCAS_VEHICULOS: "/marcas_vehiculos",
      MODELOS_VEHICULOS: "/modelos_vehiculos",
      METODOS_PAGOS: "/metodos_pagos",
      ROL: "/rol",

      // Reportes y detalles
      DETALLES_CITAS: "/detalles_citas",
      DETALLES_FACTURAS: "/detalles_facturas",
      HISTORIAL_TECNICO: "/historial_tecnico",
      ASIGNACIONES_TECNICOS: "/asignaciones_tecnicos",
    },

    // Configuración de timeouts
    TIMEOUT: 30000, // 30 segundos

    // Headers por defecto
    DEFAULT_HEADERS: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  },

  // Configuración de autenticación
  AUTH: {
    TOKEN_KEY: "authToken",
    LOGIN_TIME_KEY: "loginTime",
    USER_DATA_KEY: "userData",
    TOKEN_EXPIRY_HOURS: 24, // Horas antes de expirar el token
    REFRESH_THRESHOLD_MINUTES: 30, // Renovar token si quedan menos de 30 min
  },

  // Configuración de la aplicación
  APP: {
    NAME: "TecnoTaller",
    VERSION: "1.0.0",
    DESCRIPTION: "Sistema de Gestión para Taller Automotriz",
    COMPANY: "TecnoTaller",
    YEAR: new Date().getFullYear(),
  },

  // Configuración de UI
  UI: {
    // Paginación
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],

    // Mensajes
    MESSAGE_DURATION: 5000, // 5 segundos

    // Animaciones
    ANIMATION_DURATION: 300, // milisegundos

    // Colores del tema
    COLORS: {
      PRIMARY: "#1e40af",
      PRIMARY_DARK: "#1e3a8a",
      SECONDARY: "#3730a3",
      SUCCESS: "#059669",
      WARNING: "#d97706",
      ERROR: "#dc2626",
      GRAY_LIGHT: "#f3f4f6",
      GRAY_DARK: "#374151",
    },
  },

  // Configuración de validaciones
  VALIDATION: {
    // Reglas para formularios
    RULES: {
      EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE: /^[0-9]{8,15}$/,
      CEDULA: /^[0-9-]+$/,
      PASSWORD: {
        MIN_LENGTH: 6,
        REQUIRE_UPPERCASE: false,
        REQUIRE_LOWERCASE: false,
        REQUIRE_NUMBERS: true,
        REQUIRE_SYMBOLS: false,
      },
    },

    // Mensajes de error
    MESSAGES: {
      REQUIRED: "Este campo es obligatorio",
      EMAIL: "Ingresa un email válido",
      PHONE: "Ingresa un teléfono válido",
      CEDULA: "Ingresa una cédula válida",
      PASSWORD_TOO_SHORT: "La contraseña debe tener al menos {min} caracteres",
      PASSWORDS_DONT_MATCH: "Las contraseñas no coinciden",
    },
  },

  // Configuración de desarrollo
  DEVELOPMENT: {
    // Activar logs en consola
    DEBUG: true,

    // Mostrar errores detallados
    SHOW_DETAILED_ERRORS: true,
  },
};

// Funciones de utilidad globales

/**
 * Clase para manejar peticiones a la API
 */
class ApiClient {
  constructor() {
    this.baseURL = CONFIG.API.BASE_URL;
    this.timeout = CONFIG.API.TIMEOUT;
  }

  /**
   * Obtener headers con autenticación
   */
  getAuthHeaders() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    return {
      ...CONFIG.API.DEFAULT_HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Realizar petición HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Manejar respuestas no autorizadas
      if (response.status === 401) {
        this.handleUnauthorized();
        return null;
      }

      // Manejar errores HTTP
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado tiempo");
      }

      if (CONFIG.DEVELOPMENT.DEBUG) {
        console.error("Error en API:", error);
      }

      throw error;
    }
  }

  /**
   * Manejar tokens expirados
   */
  handleUnauthorized() {
    localStorage.removeItem(CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(CONFIG.AUTH.LOGIN_TIME_KEY);
    localStorage.removeItem(CONFIG.AUTH.USER_DATA_KEY);

    if (
      window.location.pathname !== "/index.html" &&
      !window.location.pathname.endsWith("/")
    ) {
      window.location.href = "./index.html";
    }
  }

  // Métodos HTTP
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

/**
 * Instancia global del cliente API
 */
const apiClient = new ApiClient();

/**
 * Utilidades generales
 */
const Utils = {
  /**
   * Formatear fecha para mostrar
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(date).toLocaleDateString("es-ES", {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Formatear moneda
   */
  formatCurrency(amount, currency = "USD") {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  /**
   * Validar email
   */
  isValidEmail(email) {
    return CONFIG.VALIDATION.RULES.EMAIL.test(email);
  },

  /**
   * Validar teléfono
   */
  isValidPhone(phone) {
    return CONFIG.VALIDATION.RULES.PHONE.test(phone);
  },

  /**
   * Mostrar notificación
   */
  showNotification(
    message,
    type = "info",
    duration = CONFIG.UI.MESSAGE_DURATION
  ) {
    // Esta función se puede expandir para usar una librería de notificaciones
    console.log(`${type.toUpperCase()}: ${message}`);

    // Implementación básica con alert (mejorar después)
    if (type === "error") {
      alert(`Error: ${message}`);
    }
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem(CONFIG.AUTH.TOKEN_KEY);
    const loginTime = localStorage.getItem(CONFIG.AUTH.LOGIN_TIME_KEY);

    if (!token || !loginTime) {
      return false;
    }

    // Verificar expiración
    const now = Date.now();
    const elapsed = now - parseInt(loginTime);
    const hoursElapsed = elapsed / (1000 * 60 * 60);

    return hoursElapsed < CONFIG.AUTH.TOKEN_EXPIRY_HOURS;
  },

  /**
   * Redirigir si no está autenticado
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "../index.html";
      return false;
    }
    return true;
  },

  /**
   * Log para desarrollo
   */
  debug(...args) {
    if (CONFIG.DEVELOPMENT.DEBUG) {
      console.log("[TecnoTaller Debug]:", ...args);
    }
  },
};

// Exportar configuracion global

// Hacer disponible globalmente
window.CONFIG = CONFIG;
window.apiClient = apiClient;
window.Utils = Utils;

// Log inicial
if (CONFIG.DEVELOPMENT.DEBUG) {
  console.log(" TecnoTaller inicializado correctamente");
  console.log(" Configuración:", CONFIG);
}
