// Navbar Manager - control del navbar y sidebar

class NavbarManager {
  constructor() {
    this.userMenuBtn = null;
    this.notificationsBtn = null;
    this.sidebarToggleBtn = null;
    this.sidebar = null;
    this.sidebarOverlay = null;
    this.initialized = false;
    this.initRetries = 0;
    this.maxRetries = 50; // Máximo 5 segundos de reintentos
  }

  // Inicializar el navbar después de que se cargue el componente
  init() {
    if (this.initialized) return;

    this.userMenuBtn = document.getElementById("userMenuBtn");
    this.notificationsBtn = document.getElementById("notificationsBtn");
    this.sidebarToggleBtn = document.getElementById("sidebarToggle");
    this.sidebar = document.getElementById("sidebar");
    this.sidebarOverlay = document.getElementById("sidebarOverlay");

    if (
      !this.userMenuBtn ||
      !this.sidebarToggleBtn ||
      !this.sidebar ||
      !this.sidebarOverlay
    ) {
      this.initRetries++;
      if (this.initRetries < this.maxRetries) {
        // Usar requestAnimationFrame para un mejor timing
        requestAnimationFrame(() => {
          setTimeout(() => this.init(), 200);
        });
        return;
      } else {
        console.warn(
          "NavbarManager: Navbar/Sidebar elements not found after maximum retries. Some functionality may be limited."
        );
        // Continuar con inicialización parcial si algunos elementos están disponibles
      }
    }

    this.setupEventListeners();
    this.updateUserInfo();
    this.updateActiveNavItem();
    this.setupThemeListener();
    this.initialized = true;
    console.log(
      "NavbarManager initialized successfully with sidebar control"
    );
  }

  setupEventListeners() {
    // Sidebar toggle button (hamburguesa)
    if (this.sidebarToggleBtn) {
      this.sidebarToggleBtn.addEventListener("click", () => {
        this.toggleSidebar();
      });
    }

    // Sidebar overlay click to close
    if (this.sidebarOverlay) {
      this.sidebarOverlay.addEventListener("click", () => {
        this.closeSidebar();
      });
    }

    // Escape key to close sidebar
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isSidebarOpen()) {
        this.closeSidebar();
      }
    });

    // Handle window resize
    window.addEventListener("resize", () => this.handleResize());

    // User menu button - abre el modal de perfil
    if (this.userMenuBtn) {
      this.userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.modalsAPI) {
          window.modalsAPI.openProfileModal();
        }
      });
    }

    // Notifications button
    if (this.notificationsBtn) {
      this.notificationsBtn.addEventListener("click", () => {
        this.showNotifications();
      });
    }
  }

  // Mostrar notificaciones
  showNotifications() {
    if (window.toastManager) {
      window.toastManager.show("Tienes 3 notificaciones nuevas", "info");
    } else {
      alert("Tienes 3 notificaciones nuevas");
    }
  }

  // Funcionalidad del sidebar

  // Toggle del sidebar
  toggleSidebar() {
    console.log(" Hamburger button clicked!");

    if (!this.sidebar) {
      console.error(" Sidebar element not found!");
      return;
    }

    if (this.isSidebarOpen()) {
      console.log(" Closing sidebar...");
      this.closeSidebar();
    } else {
      console.log(" Opening sidebar...");
      this.openSidebar();
    }
  }

  openSidebar() {
    this.sidebar.classList.remove("-translate-x-full");
    this.sidebar.classList.add("translate-x-0");
    this.sidebarOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent scrolling on mobile
  }

  closeSidebar() {
    this.sidebar.classList.remove("translate-x-0");
    this.sidebar.classList.add("-translate-x-full");
    this.sidebarOverlay.classList.add("hidden");
    document.body.style.overflow = ""; // Restore scrolling
  }

  isSidebarOpen() {
    return (
      this.sidebar && !this.sidebar.classList.contains("-translate-x-full")
    );
  }

  // Actualizar el elemento activo según la página actual
  updateActiveNavItem() {
    const currentPage =
      window.location.pathname.split("/").pop().replace(".html", "") ||
      "dashboard";

    // Remover clases activas de todos los elementos
    document
      .querySelectorAll(".sidebar-nav-item, [data-page]")
      .forEach((item) => {
        item.classList.remove("bg-blue-600", "text-white");
        item.classList.add("text-gray-700", "hover:bg-gray-100");

        const icon = item.querySelector("i");
        if (icon) {
          icon.classList.remove("text-white");
          icon.classList.add("text-gray-500");
        }
      });

    // Agregar clase activa al elemento actual
    const activeItem = document.querySelector(`[data-page="${currentPage}"]`);
    if (activeItem) {
      activeItem.classList.remove("text-gray-700", "hover:bg-gray-100");
      activeItem.classList.add("bg-blue-600", "text-white");

      const icon = activeItem.querySelector("i");
      if (icon) {
        icon.classList.remove("text-gray-500");
        icon.classList.add("text-white");
      }
    }
  }

  // Manejar cambios de tamaño de pantalla
  handleResize() {
    const isMobile = window.innerWidth < 768;

    if (!isMobile && this.isSidebarOpen()) {
      // En desktop, cerrar sidebar si está abierto
      this.closeSidebar();
    }
  }

  // Funcionalidad del navbar

  // Actualizar información del usuario en el navbar
  updateUserInfo() {
    this.updateDisplayName();
  }

  // Método específico para actualizar el nombre mostrado
  updateDisplayName() {
    const userData = localStorage.getItem("userData");
    let usuario_id = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        usuario_id = user.USUARIO_ID || user.usuario_id;
      } catch (e) {
        usuario_id = null;
      }
    }
    if (!usuario_id) {
      this.setDefaultUserData();
      return;
    }
    // Consultar la API para obtener el perfil actualizado
    fetch(`/api/perfil/${usuario_id}`)
      .then((res) => res.json())
      .then((perfil) => {
        // Mostrar solo primer nombre y segundo apellido, y el rol
        const nombreMostrar =
          `${perfil.PRIMER_NOMBRE || ""} ${
            perfil.PRIMER_APELLIDO || ""
          }`.trim() || "Usuario";
        const rolMostrar = perfil.NOMBRE_ROL || "Sin rol asignado";

        // Actualizar elementos del navbar principal
        const userFullNameElement = document.getElementById("userFullName");
        const userRoleElement = document.getElementById("userRole");
        if (userFullNameElement) {
          userFullNameElement.textContent = nombreMostrar;
        }
        if (userRoleElement) {
          userRoleElement.textContent = rolMostrar;
        }

        // Actualizar elementos del dropdown
        const dropdownUserName = document.getElementById("dropdownUserName");
        const dropdownUserRole = document.getElementById("dropdownUserRole");
        if (dropdownUserName) {
          dropdownUserName.textContent = nombreMostrar;
        }
        if (dropdownUserRole) {
          dropdownUserRole.textContent = rolMostrar;
        }

        console.log(" Información de usuario actualizada en navbar");
      })
      .catch(() => {
        this.setDefaultUserData();
      });
  }

  // Establecer datos de usuario por defecto
  setDefaultUserData() {
    const elements = [
      { id: "userFullName", defaultText: "Usuario" },
      { id: "userRole", defaultText: "Sin rol asignado" },
      { id: "dropdownUserName", defaultText: "Usuario" },
      { id: "dropdownUserRole", defaultText: "Sin rol asignado" },
      { id: "dropdownUserEmail", defaultText: "No disponible" },
    ];

    elements.forEach((element) => {
      const el = document.getElementById(element.id);
      if (el) {
        el.textContent = element.defaultText;
      }
    });
  }

  // Actualizar contador de notificaciones
  updateNotificationCount(count) {
    const badge = document.querySelector(
      "#notificationsBtn .notification-badge"
    );
    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? "99+" : count.toString();
        badge.classList.remove("hidden");
      } else {
        badge.classList.add("hidden");
      }
    }
  }

  // Método para reinicializar si es necesario
  reinit() {
    this.initialized = false;
    this.init();
  }

  // Escuchar cambios de tema del ThemeManager
  setupThemeListener() {
    const waitForThemeManager = () => {
      if (window.themeManager && window.themeManager.initialized) {
        window.themeManager.subscribe((newTheme, oldTheme) => {
          console.log(` NavbarManager: Aplicando tema ${newTheme}`);

          // Forzar actualización inmediata de los elementos
          setTimeout(() => {
            if (this.sidebar && this.userMenuBtn) {
              // Triggerar reflow para asegurar que las clases CSS se apliquen
              this.sidebar.style.visibility = "hidden";
              this.sidebar.offsetHeight; // Force reflow
              this.sidebar.style.visibility = "";
            }
          }, 10);
        });
      } else {
        setTimeout(waitForThemeManager, 100);
      }
    };

    waitForThemeManager();
  }

  // Método para recibir actualizaciones de tema
  updateTheme(newTheme) {
    console.log(` NavbarManager: Actualizando a tema ${newTheme}`);
    // La actualización se maneja automáticamente por CSS
  }
}

// Crear instancia global
window.navbarManager = new NavbarManager();

// No auto-inicializar aquí, dejar que app-initializer lo maneje
// La inicialización se hará a través del componente loader y app-initializer
