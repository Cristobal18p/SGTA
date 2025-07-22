// Componente reutilizable para modales
class ModalComponent {
  constructor(modalId, options = {}) {
    this.modalId = modalId;
    this.options = {
      backdrop: true, // Cerrar al hacer clic fuera
      keyboard: true, // Cerrar con ESC
      focus: true, // Enfocar al abrir
      ...options,
    };
    this.isOpen = false;
    this.callbacks = {
      onOpen: [],
      onClose: [],
      onBeforeOpen: [],
      onBeforeClose: [],
    };
    this.init();
  }

  init() {
    this.modal = document.getElementById(this.modalId);
    if (!this.modal) {
      console.error(`Modal con ID ${this.modalId} no encontrado`);
      return;
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Cerrar con backdrop
    if (this.options.backdrop) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Cerrar con ESC
    if (this.options.keyboard) {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }

    // Buscar botones de cerrar dentro del modal
    const closeButtons = this.modal.querySelectorAll("[data-modal-close]");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });
  }

  async open() {
    // Ejecutar callbacks antes de abrir
    for (const callback of this.callbacks.onBeforeOpen) {
      const result = await callback();
      if (result === false) return; // Cancelar apertura
    }

    this.modal.classList.remove("hidden");
    this.isOpen = true;

    // Foco en el modal
    if (this.options.focus) {
      const firstFocusable = this.modal.querySelector(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Prevenir scroll del body
    document.body.style.overflow = "hidden";

    // Ejecutar callbacks después de abrir
    this.callbacks.onOpen.forEach((callback) => callback());
  }

  async close() {
    // Ejecutar callbacks antes de cerrar
    for (const callback of this.callbacks.onBeforeClose) {
      const result = await callback();
      if (result === false) return; // Cancelar cierre
    }

    this.modal.classList.add("hidden");
    this.isOpen = false;

    // Restaurar scroll del body
    document.body.style.overflow = "";

    // Ejecutar callbacks después de cerrar
    this.callbacks.onClose.forEach((callback) => callback());
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // Métodos para agregar callbacks
  onOpen(callback) {
    this.callbacks.onOpen.push(callback);
    return this;
  }

  onClose(callback) {
    this.callbacks.onClose.push(callback);
    return this;
  }

  onBeforeOpen(callback) {
    this.callbacks.onBeforeOpen.push(callback);
    return this;
  }

  onBeforeClose(callback) {
    this.callbacks.onBeforeClose.push(callback);
    return this;
  }

  // Utilidades para el contenido del modal
  setTitle(title) {
    const titleElement = this.modal.querySelector("[data-modal-title]");
    if (titleElement) {
      titleElement.textContent = title;
    }
    return this;
  }

  setContent(content) {
    const contentElement = this.modal.querySelector("[data-modal-content]");
    if (contentElement) {
      contentElement.innerHTML = content;
    }
    return this;
  }
}

// Factory para crear modales rápidamente
class ModalFactory {
  static createConfirmModal(message, options = {}) {
    const modalId = "confirm-modal-" + Date.now();
    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className =
      "hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";

    modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-md w-full p-6">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <i class="fas fa-exclamation-triangle text-yellow-600"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900">Confirmar acción</h3>
                    </div>
                </div>
                <div class="mb-6">
                    <p class="text-gray-700">${message}</p>
                </div>
                <div class="flex justify-end space-x-3">
                    <button type="button" data-modal-close 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                        ${options.cancelText || "Cancelar"}
                    </button>
                    <button type="button" id="confirm-button" 
                            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                        ${options.confirmText || "Confirmar"}
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    return new Promise((resolve) => {
      const modalComponent = new ModalComponent(modalId, { backdrop: false });

      const confirmBtn = modal.querySelector("#confirm-button");
      const cleanup = () => {
        document.body.removeChild(modal);
      };

      confirmBtn.addEventListener("click", () => {
        modalComponent.close();
        cleanup();
        resolve(true);
      });

      modalComponent.onClose(() => {
        cleanup();
        resolve(false);
      });

      modalComponent.open();
    });
  }

  static createAlertModal(message, type = "info") {
    const modalId = "alert-modal-" + Date.now();
    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className =
      "hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";

    const iconConfig = {
      success: {
        icon: "fas fa-check-circle",
        color: "text-green-600",
        bg: "bg-green-100",
      },
      error: {
        icon: "fas fa-exclamation-circle",
        color: "text-red-600",
        bg: "bg-red-100",
      },
      warning: {
        icon: "fas fa-exclamation-triangle",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      },
      info: {
        icon: "fas fa-info-circle",
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
    };

    const config = iconConfig[type] || iconConfig.info;

    modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-md w-full p-6">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0 w-10 h-10 rounded-full ${
                      config.bg
                    } flex items-center justify-center">
                        <i class="${config.icon} ${config.color}"></i>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-medium text-gray-900">
                            ${type.charAt(0).toUpperCase() + type.slice(1)}
                        </h3>
                    </div>
                </div>
                <div class="mb-6">
                    <p class="text-gray-700">${message}</p>
                </div>
                <div class="flex justify-end">
                    <button type="button" data-modal-close 
                            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                        Aceptar
                    </button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    const modalComponent = new ModalComponent(modalId);
    modalComponent.onClose(() => {
      document.body.removeChild(modal);
    });

    modalComponent.open();

    // Auto-cerrar después de 5 segundos para éxito
    if (type === "success") {
      setTimeout(() => {
        if (modalComponent.isOpen) {
          modalComponent.close();
        }
      }, 5000);
    }

    return modalComponent;
  }
}

// Exportar para uso global
window.ModalComponent = ModalComponent;
window.ModalFactory = ModalFactory;
