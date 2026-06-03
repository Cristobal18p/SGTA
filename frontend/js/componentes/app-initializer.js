// Inicializador de aplicacion

class AppInitializer {
  constructor() {
    this.initialized = false;
    this.componentsLoaded = false;
    this.managersReady = false;
  }

  async init() {
    if (this.initialized) return;

    console.log(" Iniciando TecnoTaller...");

    try {
      // 1. Asegurar que ThemeManager esté disponible
      await this.waitForThemeManager();

      // 2. Cargar componentes
      await this.loadComponents();

      // 3. Inicializar managers
      await this.initializeManagers();

      // 4. Configurar listeners globales
      this.setupGlobalListeners();

      this.initialized = true;
      console.log(" TecnoTaller inicializado correctamente");
    } catch (error) {
      console.error(" Error al inicializar TecnoTaller:", error);
    }
  }

  async waitForThemeManager(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkThemeManager = () => {
        if (window.themeManager && window.themeManager.initialized) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("ThemeManager no disponible después del timeout"));
        } else {
          setTimeout(checkThemeManager, 50);
        }
      };

      checkThemeManager();
    });
  }
  async loadComponents() {
    if (this.componentsLoaded) return;

    console.log(" Cargando componentes...");

    if (window.loadCommonComponents) {
      await window.loadCommonComponents();
      this.componentsLoaded = true;
      console.log(" Componentes cargados");
    } else {
      throw new Error("loadCommonComponents no encontrado");
    }
  }

  async initializeManagers() {
    if (this.managersReady) return;

    console.log(" Inicializando managers...");

    // Esperar a que los managers estén disponibles
    await this.waitForManagers();

    // Dar tiempo adicional para que los elementos DOM estén completamente disponibles
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 200);
      });
    });

    // Inicializar managers solo si no están ya inicializados
    if (window.navbarManager && !window.navbarManager.initialized) {
      window.navbarManager.init();
    }

    if (window.modalsManager && !window.modalsManager.initialized) {
      window.modalsManager.init();
    }

    // Sincronizar después de la inicialización
    setTimeout(() => {
      if (window.navbarManager && window.navbarManager.updateDisplayName) {
        window.navbarManager.updateDisplayName();
      }

      if (window.modalsManager && window.modalsManager.syncInitialTheme) {
        window.modalsManager.syncInitialTheme();
      }

      this.managersReady = true;
      console.log(" Managers inicializados");
    }, 200);
  }

  async waitForManagers(timeout = 3000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkManagers = () => {
        if (window.navbarManager && window.modalsManager) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Managers no disponibles"));
        } else {
          setTimeout(checkManagers, 100);
        }
      };

      checkManagers();
    });
  }

  setupGlobalListeners() {
    // Listener para errores de tema
    window.addEventListener("error", (event) => {
      if (event.message && event.message.includes("theme")) {
        console.warn(" Error relacionado con tema detectado:", event.message);
        // Intentar recuperar aplicando tema por defecto
        if (window.themeManager) {
          window.themeManager.applyThemeToDOM();
        }
      }
    });

    // Listener para cambios de visibilidad de página
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && window.themeManager) {
        // Revalidar tema cuando la página vuelve a ser visible
        window.themeManager.applyThemeToDOM();
      }
    });
  }
}

// Crear instancia global
window.appInitializer = new AppInitializer();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.appInitializer.init();
  });
} else {
  window.appInitializer.init();
}
