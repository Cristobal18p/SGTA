// ============================================
// MODALS MANAGER - TecnoTaller
// Funcionalidad específica de modales compartidos
// ============================================

class ModalsManager {
  constructor() {
    this.profileModal = null;
    this.appearanceModal = null;
    this.logoutConfirmModal = null; // Modal de confirmación de logout
    this.initialized = false;
    this.listenersAdded = false; // Evitar listeners duplicados
    this.logoutCallback = null; // Callback para logout
  }

  // Inicializar los modales después de que se cargue el componente
  init() {
    if (this.initialized) return;

    this.profileModal = document.getElementById("profileModal");
    this.appearanceModal = document.getElementById("appearanceModal");
    this.logoutConfirmModal = document.getElementById("logoutConfirmModal");

    if (!this.profileModal || !this.appearanceModal) {
      console.warn("Modal elements not found, retrying in 100ms...");
      setTimeout(() => this.init(), 100);
      return;
    }

    this.setupEventListeners();
    this.syncInitialTheme();
    this.initialized = true;
    console.log("ModalsManager initialized successfully");
  }

  setupEventListeners() {
    // No agregar listeners si ya se agregaron
    if (this.listenersAdded) {
      return;
    }
    // Profile Modal Events
    const closeProfileModalBtn = document.getElementById(
      "closeProfileModalBtn"
    );
    const openEditProfileBtn = document.getElementById("openEditProfileBtn");
    const openSettingsBtn = document.getElementById("openSettingsBtn");
    const profileLogoutBtn = document.getElementById("profileLogoutBtn");

    // Appearance Modal Events
    const closeModalBtn = document.getElementById("closeModalBtn");
    const applySettingsBtn = document.getElementById("applySettingsBtn");
    const darkModeToggle = document.getElementById("darkModeToggle");

    // Profile Modal Event Listeners
    if (closeProfileModalBtn) {
      closeProfileModalBtn.addEventListener("click", () =>
        this.closeProfileModal()
      );
    }

    if (openEditProfileBtn) {
      openEditProfileBtn.addEventListener("click", () =>
        this.handleEditProfile()
      );
    }

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener("click", () =>
        this.openAppearanceModal()
      );
    }

    if (profileLogoutBtn) {
      profileLogoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Appearance Modal Event Listeners
    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () =>
        this.closeAppearanceModal()
      );
    }

    if (applySettingsBtn) {
      applySettingsBtn.addEventListener("click", () => this.applySettings());
    }

    if (darkModeToggle) {
      darkModeToggle.addEventListener("change", (e) =>
        this.handleThemeToggle(e)
      );
    }

    // Close modals on outside click
    this.profileModal?.addEventListener("click", (e) => {
      if (e.target === this.profileModal) {
        this.closeProfileModal();
      }
    });

    this.appearanceModal?.addEventListener("click", (e) => {
      if (e.target === this.appearanceModal) {
        this.closeAppearanceModal();
      }
    });

    // Close modals with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!this.profileModal?.classList.contains("hidden")) {
          this.closeProfileModal();
        }
        if (!this.appearanceModal?.classList.contains("hidden")) {
          this.closeAppearanceModal();
        }
      }
    });

    // Modal de confirmación de logout
    if (this.logoutConfirmModal) {
      const confirmBtn = this.logoutConfirmModal.querySelector(
        ".logout-confirm-yes"
      );
      const cancelBtn =
        this.logoutConfirmModal.querySelector(".logout-confirm-no");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          this.logoutConfirmModal.classList.add("hidden");
          if (typeof this.logoutCallback === "function") {
            this.logoutCallback();
          }
        });
      }
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          this.logoutConfirmModal.classList.add("hidden");
        });
      }
    }

    // Marcar que los listeners han sido agregados
    this.listenersAdded = true;
  }

  // Profile Modal Methods
  openProfileModal() {
    this.profileModal?.classList.remove("hidden");
    // Obtener usuario_id desde localStorage o cookie
    const userData = localStorage.getItem("userData");
    let usuario_id = null;
    if (userData) {
      try {
        const user = JSON.parse(userData);
        usuario_id = user.usuario_id;
      } catch (e) {
        usuario_id = null;
      }
    }
    if (!usuario_id) {
      // Si no hay usuario_id, mostrar valores por defecto
      const nameEl = document.getElementById("profileModalUserName");
      const roleEl = document.getElementById("profileModalUserRole");
      const emailEl = document.getElementById("profileModalUserEmail");
      if (nameEl) nameEl.textContent = "Usuario";
      if (roleEl) roleEl.textContent = "Sin rol";
      if (emailEl) emailEl.textContent = "No disponible";
      return;
    }
    // Consultar la API para obtener el perfil actualizado
    fetch(`/api/perfil/${usuario_id}`)
      .then((res) => res.json())
      .then((perfil) => {
        const nameEl = document.getElementById("profileModalUserName");
        const roleEl = document.getElementById("profileModalUserRole");
        const emailEl = document.getElementById("profileModalUserEmail");
        if (nameEl) nameEl.textContent = perfil.NOMBRE_USUARIO || "Usuario";
        if (roleEl) roleEl.textContent = perfil.NOMBRE_ROL || "Sin rol";
        if (emailEl)
          emailEl.textContent = perfil.EMAIL_USUARIO || "No disponible";
      })
      .catch(() => {
        // Si hay error, mostrar valores por defecto
        const nameEl = document.getElementById("profileModalUserName");
        const roleEl = document.getElementById("profileModalUserRole");
        const emailEl = document.getElementById("profileModalUserEmail");
        if (nameEl) nameEl.textContent = "Usuario";
        if (roleEl) roleEl.textContent = "Sin rol";
        if (emailEl) emailEl.textContent = "No disponible";
      });
  }

  closeProfileModal() {
    this.profileModal?.classList.add("hidden");
  }

  // Appearance Modal Methods
  openAppearanceModal() {
    this.appearanceModal?.classList.remove("hidden");
    this.closeProfileModal(); // Close profile modal when opening settings

    // Sync toggle state with current theme
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle && window.themeManager) {
      darkModeToggle.checked = window.themeManager.isDark();
    }
  }

  closeAppearanceModal() {
    this.appearanceModal?.classList.add("hidden");
  }

  // Handle edit profile action
  handleEditProfile() {
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "editar-perfil.html") {
      this.closeProfileModal();
      if (window.toastManager) {
        window.toastManager.show(
          "Ya estás en la página de editar perfil",
          "info"
        );
      }
    } else {
      window.location.href = "editar-perfil.html";
    }
  }

  // Handle logout
  handleLogout() {
    // Mostrar modal personalizado en vez de confirm()
    if (this.logoutConfirmModal) {
      this.logoutConfirmModal.classList.remove("hidden");
      this.logoutCallback = () => {
        if (
          window.navbarManager &&
          typeof window.navbarManager.logoutWithFarewell === "function"
        ) {
          window.navbarManager.logoutWithFarewell(() => {
            this.closeProfileModal();
            window.location.href = "index.html";
          });
        } else {
          if (window.toastManager) {
            window.toastManager.show("Cerrando sesión...", "info");
          }
          localStorage.removeItem("authToken");
          localStorage.removeItem("loginTime");
          localStorage.removeItem("userId");
          localStorage.removeItem("userName");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userData");
          setTimeout(() => {
            this.closeProfileModal();
            window.location.href = "index.html";
          }, 1000);
        }
      };
    } else {
      // Fallback clásico si el modal no está disponible
      if (window.toastManager) {
        window.toastManager.show("Cerrando sesión...", "info");
      }
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginTime");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userData");
      setTimeout(() => {
        this.closeProfileModal();
        window.location.href = "index.html";
      }, 1000);
    }
  }

  // Handle theme toggle
  handleThemeToggle(event) {
    const isDark = event.target.checked;

    if (window.themeManager) {
      window.themeManager.setTheme(isDark ? "dark" : "light");
    } else {
      console.error("❌ ThemeManager no encontrado");
    }
  }

  // Apply settings
  applySettings() {
    this.closeAppearanceModal();
  }

  // Sync initial theme
  syncInitialTheme() {
    // Esperar a que ThemeManager esté disponible
    const waitForThemeManager = () => {
      if (window.themeManager && window.themeManager.initialized) {
        // Actualizar toggle basado en el estado del ThemeManager
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (darkModeToggle) {
          darkModeToggle.checked = window.themeManager.isDark();
        }

        console.log(
          `🎨 ModalsManager sincronizado - Modo ${
            window.themeManager.isDark() ? "oscuro" : "claro"
          }`
        );
      } else {
        setTimeout(waitForThemeManager, 100);
      }
    };

    waitForThemeManager();
  }

  // Method to reinitialize if needed
  reinit() {
    this.initialized = false;
    this.init();

    // Re-sincronizar con ThemeManager después de reinicializar
    setTimeout(() => {
      if (window.themeManager) {
        window.themeManager.updateToggleButtons();
      }
    }, 100);
  }

  // Método para recibir actualizaciones de tema
  updateTheme(newTheme) {
    console.log(`🎭 ModalsManager: Actualizando a tema ${newTheme}`);
    this.syncInitialTheme();
  }

  // Función utilitaria para mostrar modal de confirmación genérico
  showConfirmModal(title, message, onConfirm, onCancel, options = {}) {
    const confirmModal = document.getElementById("confirmModal");
    const confirmTitle = document.getElementById("confirmTitle");
    const confirmMessage = document.getElementById("confirmMessage");
    const confirmAccept = document.getElementById("confirmAccept");
    const confirmCancel = document.getElementById("confirmCancel");
    const confirmIcon = document.getElementById("confirmIcon");

    if (!confirmModal) {
      console.error("Modal de confirmación no encontrado");
      return;
    }

    // Configurar contenido
    if (confirmTitle) confirmTitle.textContent = title || "Confirmar Acción";
    if (confirmMessage)
      confirmMessage.textContent =
        message || "¿Está seguro de que desea continuar?";

    // Configurar icono y botón según el tipo
    if (options.type === "danger") {
      if (confirmIcon) {
        confirmIcon.className =
          "fas fa-exclamation-triangle text-2xl text-red-600";
        confirmIcon.parentElement.className =
          "w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4";
      }
      if (confirmAccept) {
        confirmAccept.textContent =
          options.confirmText || "Sí, descartar cambios";
        confirmAccept.className =
          "px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all";
      }
    } else {
      if (confirmIcon) {
        confirmIcon.className =
          "fas fa-question-circle text-2xl text-amber-600";
        confirmIcon.parentElement.className =
          "w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4";
      }
      if (confirmAccept) {
        confirmAccept.textContent = options.confirmText || "Confirmar";
        confirmAccept.className =
          "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all";
      }
    }

    if (confirmCancel) {
      confirmCancel.textContent = options.cancelText || "Cancelar";
    }

    // Limpiar eventos anteriores
    const newConfirmAccept = confirmAccept.cloneNode(true);
    const newConfirmCancel = confirmCancel.cloneNode(true);
    confirmAccept.parentNode.replaceChild(newConfirmAccept, confirmAccept);
    confirmCancel.parentNode.replaceChild(newConfirmCancel, confirmCancel);

    // Configurar nuevos eventos
    newConfirmAccept.addEventListener("click", () => {
      confirmModal.classList.add("hidden");
      if (onConfirm) onConfirm();
    });

    newConfirmCancel.addEventListener("click", () => {
      confirmModal.classList.add("hidden");
      if (onCancel) onCancel();
    });

    // Cerrar con ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        confirmModal.classList.add("hidden");
        document.removeEventListener("keydown", handleEsc);
        if (onCancel) onCancel();
      }
    };
    document.addEventListener("keydown", handleEsc);

    // Cerrar al hacer clic fuera del modal
    const handleOutsideClick = (e) => {
      if (e.target === confirmModal) {
        confirmModal.classList.add("hidden");
        confirmModal.removeEventListener("click", handleOutsideClick);
        if (onCancel) onCancel();
      }
    };
    confirmModal.addEventListener("click", handleOutsideClick);

    // Mostrar modal
    confirmModal.classList.remove("hidden");
  }
}

// Crear instancia global
window.modalsManager = new ModalsManager();

// Alias para compatibilidad (usado en navbar-manager)
window.modalsAPI = window.modalsManager;

// Auto-inicializar cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
  window.modalsManager.init();
});
