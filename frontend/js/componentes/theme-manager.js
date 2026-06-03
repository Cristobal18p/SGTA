// Theme Manager centralizado

class ThemeManager {
  constructor() {
    this.currentTheme = "light";
    this.storageKey = "tecnotaller-theme";
    this.observers = new Set();
    this.initialized = false;

    // Esperar a que el DOM esté listo antes de inicializar
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    if (this.initialized) return;

    // Verificar que el DOM esté disponible
    if (!document.documentElement || !document.body) {
      setTimeout(() => this.init(), 100);
      return;
    }

    // Limpiar configuraciones de tema anteriores
    this.cleanup();

    // Cargar tema guardado o usar light por defecto
    const savedTheme = localStorage.getItem(this.storageKey) || "light";
    this.setTheme(savedTheme, false); // false para no notificar en la inicialización
    this.initialized = true;
    console.log(` ThemeManager inicializado con tema: ${this.currentTheme}`);
  }

  // Cambiar tema
  setTheme(theme, notify = true) {
    const oldTheme = this.currentTheme;
    this.currentTheme = theme;

    // Guardar en localStorage
    localStorage.setItem(this.storageKey, theme);

    // Aplicar clases CSS
    this.applyThemeToDOM();

    // Notificar a observadores si es necesario
    if (notify) {
      this.notifyObservers(oldTheme, theme);

      // Mostrar notificación solo si hay un cambio real de tema
      if (oldTheme !== theme && window.toastManager) {
        const mode = theme === "dark" ? "oscuro" : "claro";
        window.toastManager.show(`Modo ${mode} activado`, "success");
      }
    }

    console.log(` Tema cambiado de ${oldTheme} a ${theme}`);
  }

  // Alternar entre light y dark
  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(newTheme);
  }

  // Aplicar tema al DOM
  applyThemeToDOM() {
    const html = document.documentElement;
    const body = document.body;

    // Verificar que los elementos existan
    if (!html || !body) {
      return;
    }

    // Remover todas las clases de tema
    html.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    // Aplicar nueva clase de tema
    html.classList.add(this.currentTheme);
    body.classList.add(this.currentTheme);

    // Actualizar atributo data-theme para CSS
    html.setAttribute("data-theme", this.currentTheme);

    // Actualizar toggles en modales
    this.updateToggleButtons();
  }

  // Actualizar todos los botones toggle
  updateToggleButtons() {
    const toggles = document.querySelectorAll(
      "#darkModeToggle, [data-theme-toggle]"
    );
    toggles.forEach((toggle) => {
      if (toggle.type === "checkbox") {
        toggle.checked = this.isDark();
      }
    });
  }

  // Obtener tema actual
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Verificar si es tema oscuro
  isDark() {
    return this.currentTheme === "dark";
  }

  // Suscribir observador para cambios de tema
  subscribe(callback) {
    this.observers.add(callback);

    // Retornar función para desuscribirse
    return () => {
      this.observers.delete(callback);
    };
  }

  // Notificar a todos los observadores
  notifyObservers(oldTheme, newTheme) {
    this.observers.forEach((callback) => {
      try {
        callback(newTheme, oldTheme);
      } catch (error) {
        console.error("Error en observer del tema:", error);
      }
    });
  }

  // Forzar actualización de todos los componentes (sin notificaciones)
  forceUpdate() {
    this.applyThemeToDOM();
    // No notificar a observadores en forceUpdate para evitar notificaciones duplicadas
  }

  // Limpiar almacenamiento de temas antiguos
  cleanup() {
    const oldKeys = ["darkMode", "tecnotaller-dark-mode", "theme"];
    oldKeys.forEach((key) => {
      if (key !== this.storageKey) {
        localStorage.removeItem(key);
      }
    });
  }

  // Método para compatibilidad con código existente
  setDarkMode(isDark) {
    this.setTheme(isDark ? "dark" : "light");
  }

  // Método para compatibilidad con código existente
  resetToLight() {
    this.setTheme("light");
  }

  // Método para compatibilidad con código existente
  forceComponentsRerender() {
    this.forceUpdate();
  }
}

// Crear instancia global
window.themeManager = new ThemeManager();

// Crear alias para compatibilidad con código existente
if (!window.TecnoTaller) {
  window.TecnoTaller = {};
}
window.TecnoTaller.globalThemeManager = window.themeManager;

// Exportar para módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeManager;
}
