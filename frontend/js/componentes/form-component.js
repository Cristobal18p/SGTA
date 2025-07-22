// Componente reutilizable para formularios
class FormComponent {
  constructor(formId, options = {}) {
    this.formId = formId;
    this.options = {
      validation: true,
      realTimeValidation: false,
      showErrorMessages: true,
      resetAfterSubmit: false,
      ...options,
    };

    this.validators = {};
    this.errors = {};
    this.isValid = true;

    this.callbacks = {
      onSubmit: [],
      onValidate: [],
      onChange: [],
      onReset: [],
    };

    this.init();
  }

  init() {
    this.form = document.getElementById(this.formId);
    if (!this.form) {
      console.error(`Formulario con ID ${this.formId} no encontrado`);
      return;
    }
    this.setupEventListeners();
    this.setupValidation();
  }

  setupEventListeners() {
    // Submit del formulario
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Cambios en campos para validación en tiempo real
    if (this.options.realTimeValidation) {
      const inputs = this.form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.addEventListener("blur", () => this.validateField(input));
        input.addEventListener("input", () => this.clearFieldError(input));
      });
    }

    // Cambios en cualquier campo
    this.form.addEventListener("change", (e) => {
      this.callbacks.onChange.forEach((callback) =>
        callback(e.target, this.getData())
      );
    });
  }

  setupValidation() {
    // Configurar validadores por defecto basados en atributos HTML
    const requiredFields = this.form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      this.addValidator(
        field.name || field.id,
        "required",
        (value) => {
          return value && value.toString().trim() !== "";
        },
        "Este campo es obligatorio"
      );
    });

    const emailFields = this.form.querySelectorAll('input[type="email"]');
    emailFields.forEach((field) => {
      this.addValidator(
        field.name || field.id,
        "email",
        (value) => {
          if (!value) return true; // Solo validar si hay valor
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        "Ingrese un email válido"
      );
    });

    const numberFields = this.form.querySelectorAll('input[type="number"]');
    numberFields.forEach((field) => {
      this.addValidator(
        field.name || field.id,
        "number",
        (value) => {
          if (!value) return true;
          return !isNaN(value) && isFinite(value);
        },
        "Ingrese un número válido"
      );
    });

    const telFields = this.form.querySelectorAll('input[type="tel"]');
    telFields.forEach((field) => {
      this.addValidator(
        field.name || field.id,
        "phone",
        (value) => {
          if (!value) return true;
          const phoneRegex = /^[\+]?[0-9\-\s\(\)]{8,}$/;
          return phoneRegex.test(value);
        },
        "Ingrese un teléfono válido"
      );
    });
  }

  // Métodos de validación
  addValidator(fieldName, validatorName, validatorFn, errorMessage) {
    if (!this.validators[fieldName]) {
      this.validators[fieldName] = {};
    }
    this.validators[fieldName][validatorName] = {
      fn: validatorFn,
      message: errorMessage,
    };
    return this;
  }

  removeValidator(fieldName, validatorName) {
    if (this.validators[fieldName]) {
      delete this.validators[fieldName][validatorName];
    }
    return this;
  }

  validateField(field) {
    const fieldName = field.name || field.id;
    const value = field.value;
    const validators = this.validators[fieldName];

    if (!validators) return true;

    // Limpiar errores previos del campo
    delete this.errors[fieldName];
    this.clearFieldError(field);

    // Ejecutar validadores
    for (const [validatorName, validator] of Object.entries(validators)) {
      if (!validator.fn(value)) {
        this.errors[fieldName] = validator.message;
        this.showFieldError(field, validator.message);
        return false;
      }
    }

    return true;
  }

  validateForm() {
    this.errors = {};
    this.isValid = true;

    const fields = this.form.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      const fieldValid = this.validateField(field);
      if (!fieldValid) {
        this.isValid = false;
      }
    });

    // Ejecutar callbacks de validación
    this.callbacks.onValidate.forEach((callback) => {
      const customErrors = callback(this.getData(), this.errors);
      if (customErrors && Object.keys(customErrors).length > 0) {
        this.errors = { ...this.errors, ...customErrors };
        this.isValid = false;

        // Mostrar errores personalizados
        Object.entries(customErrors).forEach(([fieldName, message]) => {
          const field = this.form.querySelector(
            `[name="${fieldName}"], #${fieldName}`
          );
          if (field) {
            this.showFieldError(field, message);
          }
        });
      }
    });

    return this.isValid;
  }

  showFieldError(field, message) {
    if (!this.options.showErrorMessages) return;

    this.clearFieldError(field);

    // Agregar clase de error al campo
    field.classList.add(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
    field.classList.remove(
      "border-gray-300",
      "focus:border-blue-500",
      "focus:ring-blue-500"
    );

    // Crear elemento de error
    const errorElement = document.createElement("div");
    errorElement.className = "text-red-600 text-sm mt-1";
    errorElement.textContent = message;
    errorElement.setAttribute("data-field-error", field.name || field.id);

    // Insertar después del campo
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  clearFieldError(field) {
    // Remover clases de error
    field.classList.remove(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500"
    );
    field.classList.add(
      "border-gray-300",
      "focus:border-blue-500",
      "focus:ring-blue-500"
    );

    // Remover mensaje de error
    const errorElement = field.parentNode.querySelector(
      `[data-field-error="${field.name || field.id}"]`
    );
    if (errorElement) {
      errorElement.remove();
    }
  }

  clearAllErrors() {
    const fields = this.form.querySelectorAll("input, select, textarea");
    fields.forEach((field) => this.clearFieldError(field));
    this.errors = {};
  }

  // Métodos de datos
  getData() {
    const formData = new FormData(this.form);
    const data = {};

    // Obtener datos de FormData
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Obtener datos adicionales de campos sin name
    const fieldsWithId = this.form.querySelectorAll(
      "input[id]:not([name]), select[id]:not([name]), textarea[id]:not([name])"
    );
    fieldsWithId.forEach((field) => {
      data[field.id] = field.value;
    });

    return data;
  }

  setData(data) {
    Object.entries(data).forEach(([key, value]) => {
      const field = this.form.querySelector(`[name="${key}"], #${key}`);
      if (field) {
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = value;
        } else {
          field.value = value || "";
        }
      }
    });
    return this;
  }

  reset() {
    this.form.reset();
    this.clearAllErrors();
    this.callbacks.onReset.forEach((callback) => callback());
    return this;
  }

  // Event handlers
  async handleSubmit(e) {
    e.preventDefault();

    if (this.options.validation && !this.validateForm()) {
      return;
    }

    const formData = this.getData();

    // Ejecutar callbacks de submit
    for (const callback of this.callbacks.onSubmit) {
      try {
        const result = await callback(formData, e);
        if (result === false) {
          return; // Cancelar submit
        }
      } catch (error) {
        console.error("Error en callback de submit:", error);
        return;
      }
    }

    if (this.options.resetAfterSubmit) {
      this.reset();
    }
  }

  // Métodos para agregar callbacks
  onSubmit(callback) {
    this.callbacks.onSubmit.push(callback);
    return this;
  }

  onValidate(callback) {
    this.callbacks.onValidate.push(callback);
    return this;
  }

  onChange(callback) {
    this.callbacks.onChange.push(callback);
    return this;
  }

  onReset(callback) {
    this.callbacks.onReset.push(callback);
    return this;
  }

  // Métodos utilitarios
  disable() {
    const fields = this.form.querySelectorAll(
      "input, select, textarea, button"
    );
    fields.forEach((field) => (field.disabled = true));
    return this;
  }

  enable() {
    const fields = this.form.querySelectorAll(
      "input, select, textarea, button"
    );
    fields.forEach((field) => (field.disabled = false));
    return this;
  }

  setFieldValue(fieldName, value) {
    const field = this.form.querySelector(
      `[name="${fieldName}"], #${fieldName}`
    );
    if (field) {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = value;
      } else {
        field.value = value;
      }
    }
    return this;
  }

  getFieldValue(fieldName) {
    const field = this.form.querySelector(
      `[name="${fieldName}"], #${fieldName}`
    );
    if (field) {
      if (field.type === "checkbox" || field.type === "radio") {
        return field.checked;
      } else {
        return field.value;
      }
    }
    return null;
  }

  showSubmitLoading() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = `
                <div class="flex items-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                </div>
            `;
      submitButton.setAttribute("data-original-text", originalText);
    }
  }

  hideSubmitLoading() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      const originalText = submitButton.getAttribute("data-original-text");
      if (originalText) {
        submitButton.innerHTML = originalText;
        submitButton.removeAttribute("data-original-text");
      }
    }
  }
}

// Factory para crear formularios comunes
class FormFactory {
  static createLoginForm(formId, onSubmit) {
    const form = new FormComponent(formId, {
      validation: true,
      realTimeValidation: true,
    });

    form.addValidator(
      "email",
      "required",
      (value) => value.trim() !== "",
      "El email es obligatorio"
    );
    form.addValidator(
      "password",
      "required",
      (value) => value.trim() !== "",
      "La contraseña es obligatoria"
    );
    form.addValidator(
      "password",
      "minLength",
      (value) => value.length >= 6,
      "La contraseña debe tener al menos 6 caracteres"
    );

    if (onSubmit) {
      form.onSubmit(onSubmit);
    }

    return form;
  }

  static createContactForm(formId, onSubmit) {
    const form = new FormComponent(formId, {
      validation: true,
      realTimeValidation: true,
    });

    form.addValidator(
      "name",
      "required",
      (value) => value.trim() !== "",
      "El nombre es obligatorio"
    );
    form.addValidator(
      "name",
      "minLength",
      (value) => value.length >= 2,
      "El nombre debe tener al menos 2 caracteres"
    );

    if (onSubmit) {
      form.onSubmit(onSubmit);
    }

    return form;
  }
}

// Exportar para uso global
window.FormComponent = FormComponent;
window.FormFactory = FormFactory;
