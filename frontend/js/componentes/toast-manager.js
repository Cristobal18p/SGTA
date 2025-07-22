// ============================================
// TOAST MANAGER - TecnoTaller
// ============================================

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.nextId = 1;

    // Esperar a que el DOM esté listo antes de inicializar
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.createContainer();
  }

  createContainer() {
    // Verificar que document.body esté disponible
    if (!document.body) {
      setTimeout(() => this.createContainer(), 100);
      return;
    }

    // Crear contenedor si no existe
    this.container = document.getElementById("toast-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "fixed top-4 right-4 z-50 space-y-2";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "info", duration = 3000) {
    const id = this.nextId++;
    const toast = this.createToast(id, message, type);

    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Animación de entrada
    setTimeout(() => {
      toast.classList.remove("translate-x-full", "opacity-0");
      toast.classList.add("translate-x-0", "opacity-100");
    }, 100);

    // Auto-remover después del tiempo especificado
    if (duration > 0) {
      setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    return id;
  }

  createToast(id, message, type) {
    const toast = document.createElement("div");
    toast.className = `
      transform transition-all duration-300 ease-in-out
      translate-x-full opacity-0
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      rounded-lg shadow-lg p-4 min-w-80 max-w-sm
      flex items-center space-x-3
    `;

    const iconConfig = {
      success: { icon: "fas fa-check-circle", color: "text-green-500" },
      error: { icon: "fas fa-exclamation-circle", color: "text-red-500" },
      warning: {
        icon: "fas fa-exclamation-triangle",
        color: "text-yellow-500",
      },
      info: { icon: "fas fa-info-circle", color: "text-blue-500" },
    };

    const config = iconConfig[type] || iconConfig.info;

    toast.innerHTML = `
      <div class="flex-shrink-0">
        <i class="${config.icon} ${config.color} text-lg"></i>
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          ${message}
        </p>
      </div>
      <button class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" onclick="window.toastManager.hide(${id})">
        <i class="fas fa-times"></i>
      </button>
    `;

    return toast;
  }

  hide(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    // Animación de salida
    toast.classList.remove("translate-x-0", "opacity-100");
    toast.classList.add("translate-x-full", "opacity-0");

    // Remover del DOM después de la animación
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 300);
  }

  hideAll() {
    this.toasts.forEach((toast, id) => {
      this.hide(id);
    });
  }

  success(message, duration = 3000) {
    return this.show(message, "success", duration);
  }

  error(message, duration = 5000) {
    return this.show(message, "error", duration);
  }

  warning(message, duration = 4000) {
    return this.show(message, "warning", duration);
  }

  info(message, duration = 3000) {
    return this.show(message, "info", duration);
  }
}

// Crear instancia global
window.toastManager = new ToastManager();

// Exportar para módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = ToastManager;
}
