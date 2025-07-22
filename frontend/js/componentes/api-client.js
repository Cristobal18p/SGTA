// Configuración global de la API
window.API_CONFIG = {
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Utilidad para hacer peticiones HTTP con manejo de errores
class ApiClient {
  constructor(baseURL = window.API_CONFIG.baseURL) {
    this.baseURL = baseURL;
    this.timeout = window.API_CONFIG.timeout;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...window.API_CONFIG.headers,
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Obtener el contenido de la respuesta
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        responseData = { error: "Respuesta no válida del servidor" };
      }

      if (!response.ok) {
        // Crear un error más detallado que preserve la información de la respuesta
        const error = new Error(
          responseData.error ||
            responseData.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );

        // Agregar propiedades adicionales al error para debugging
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          url: url,
        };

        console.error("Error de API:", {
          url: url,
          method: config.method || "GET",
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        });

        throw error;
      }

      return responseData;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Tiempo de espera agotado. Verifique su conexión.");
      }

      // Si ya es nuestro error personalizado, mantenerlo
      if (error.response) {
        throw error;
      }

      // Para otros errores de red
      console.error("Error de red:", error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

// Instancia global del cliente API
window.apiClient = new ApiClient();
