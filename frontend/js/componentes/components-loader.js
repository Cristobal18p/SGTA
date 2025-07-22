// ============================================
// COMPONENT LOADER - TecnoTaller (Simplificado)
// ============================================

class ComponentLoader {
  constructor() {
    this.loadedComponents = new Set();
  }

  // Cargar un componente específico
  async loadComponent(url, containerId) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const container = document.getElementById(containerId);

      if (!container) {
        console.warn(`Container with id '${containerId}' not found`);
        return;
      }

      container.innerHTML = html;
      this.loadedComponents.add(url);
      console.log(`✅ Component loaded: ${url}`);
    } catch (error) {
      console.error(`❌ Error loading component ${url}:`, error);
    }
  }

  // Cargar múltiples componentes
  async loadComponents(components) {
    const loadPromises = components.map(({ url, containerId }) =>
      this.loadComponent(url, containerId)
    );
    await Promise.all(loadPromises);
  }
}

// Crear instancia global
window.componentLoader = new ComponentLoader();

// Función simplificada para cargar componentes comunes
window.loadCommonComponents = async function () {
  console.log("🔄 Cargando componentes compartidos...");

  const components = [
    { url: "../components/navbar.html", containerId: "navbar-container" },
    { url: "../components/sidebar.html", containerId: "sidebar-container" },
    {
      url: "../components/modals-shared.html",
      containerId: "modals-container",
    },
  ];

  try {
    await window.componentLoader.loadComponents(components);
    console.log("✅ Todos los componentes cargados exitosamente");
  } catch (error) {
    console.error("❌ Error cargando componentes:", error);
    return;
  }

  // Usar el ThemeManager centralizado
  console.log("🎨 Aplicando tema a través del ThemeManager...");

  // Esperar a que ThemeManager esté disponible
  let retries = 0;
  const maxRetries = 10;

  const waitForThemeManager = () => {
    if (window.themeManager && window.themeManager.initialized) {
      // Forzar actualización del tema actual
      window.themeManager.forceUpdate();
      console.log("✅ Tema aplicado vía ThemeManager centralizado");
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(waitForThemeManager, 100);
    } else {
      console.error("❌ ThemeManager no encontrado después de esperar");
    }
  };

  waitForThemeManager();

  // Reinicializar managers después de cargar componentes
  setTimeout(() => {
    // Solo actualizar elementos DOM sin reinicializar completamente
    if (window.navbarManager && window.navbarManager.updateDisplayName) {
      window.navbarManager.updateDisplayName();
    }

    if (window.modalsManager && window.modalsManager.syncInitialTheme) {
      window.modalsManager.syncInitialTheme();
    }

    console.log(
      `✅ Componentes cargados con tema: ${window.themeManager?.getCurrentTheme()}`
    );
  }, 200);
};
