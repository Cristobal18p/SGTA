// Módulo de Gestión de Clientes
class ClientesManager {
  constructor() {
    this.apiUrl = window.API_CONFIG?.baseURL || "http://localhost:3000/api";
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalPages = 0;
    this.filtros = {
      busqueda: "",
      tipoCliente: "",
      estado: "",
    };
    this.clienteEditando = null;
    this.modal = null;
    this.form = null;
    this.init();
  }

  async init() {
    console.log("🚀 Inicializando módulo de Clientes...");

    this.setupComponents();
    this.setupEventListeners();

    // Cargar datos base con logging
    console.log("📊 Cargando datos base...");
    await this.cargarTiposClientes();
    console.log("✅ Tipos de clientes cargados");

    await this.cargarNacionalidades();
    console.log("✅ Nacionalidades cargadas");

    await this.cargarProvincias();
    console.log("✅ Provincias cargadas");

    await this.cargarClientes();
    console.log("✅ Lista de clientes cargada");

    // Verificar que todos los selectores estén disponibles
    this.verificarSelectores();

    console.log("✅ Módulo de Clientes inicializado completamente");
  }

  // Nueva función para verificar que todos los selectores estén disponibles
  verificarSelectores() {
    const selectores = [
      { id: "provinciaId", nombre: "Provincias" },
      { id: "distritoId", nombre: "Distritos" },
      { id: "corregimientoId", nombre: "Corregimientos" },
      { id: "tipoClienteId", nombre: "Tipos de Cliente" },
      { id: "nacionalidadId", nombre: "Nacionalidades" },
    ];

    console.log("🔍 Verificando selectores disponibles:");

    selectores.forEach(({ id, nombre }) => {
      const elemento = document.getElementById(id);
      if (elemento) {
        const opciones = elemento.options.length;
        const habilitado = !elemento.disabled;
        console.log(
          `  ✅ ${nombre}: ${opciones} opciones, ${
            habilitado ? "habilitado" : "deshabilitado"
          }`
        );
      } else {
        console.warn(`  ❌ ${nombre}: elemento no encontrado`);
      }
    });
  }

  setupComponents() {
    // Obtener referencias al modal y formulario nativos
    this.modal = document.getElementById("modalCliente");
    this.form = document.getElementById("formCliente");

    // Variable para controlar listeners de ESC (evitar duplicados)
    this.escListenerAdded = false;

    // Configurar eventos del modal
    if (this.modal) {
      // Cerrar modal con botones de cerrar (X y Cancelar)
      const closeBtns = this.modal.querySelectorAll(
        ".modal-close, .btn-close, [data-action='close']"
      );
      console.log(`Botones de cerrar encontrados: ${closeBtns.length}`);
      closeBtns.forEach((btn, index) => {
        console.log(`Botón ${index + 1}:`, btn.id || btn.className);
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Cerrando modal desde botón: ${btn.id || "sin ID"}`);
          this.cerrarModal();
        });
      });

      // Cerrar modal haciendo clic fuera
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.cerrarModal();
        }
      });

      // Cerrar modal con ESC (solo una vez)
      if (!this.escListenerAdded) {
        document.addEventListener("keydown", (e) => {
          if (
            e.key === "Escape" &&
            this.modal &&
            !this.modal.classList.contains("hidden")
          ) {
            this.cerrarModal();
          }
        });
        this.escListenerAdded = true;
      }
    }

    // Configurar eventos del formulario
    if (this.form) {
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.manejarSubmitFormulario();
      });
    }
  }

  setupEventListeners() {
    // Botón Nuevo Cliente
    const btnNuevoCliente = document.getElementById("btnNuevoCliente");
    btnNuevoCliente?.addEventListener("click", () => this.abrirModalNuevo());

    // Filtros y búsqueda
    const searchCliente = document.getElementById("searchCliente");
    const filterTipoCliente = document.getElementById("filterTipoCliente");
    const filterEstado = document.getElementById("filterEstado");
    const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

    searchCliente?.addEventListener("input", (e) =>
      this.handleBusqueda(e.target.value)
    );
    filterTipoCliente?.addEventListener("change", (e) =>
      this.handleFiltroTipo(e.target.value)
    );
    filterEstado?.addEventListener("change", (e) =>
      this.handleFiltroEstado(e.target.value)
    );
    btnLimpiarFiltros?.addEventListener("click", () => this.limpiarFiltros());

    // Paginación
    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");
    btnAnterior?.addEventListener("click", () =>
      this.cambiarPagina(this.currentPage - 1)
    );
    btnSiguiente?.addEventListener("click", () =>
      this.cambiarPagina(this.currentPage + 1)
    );

    // Event listeners para los selectores de ubicación geográfica
    const selectProvincia = document.getElementById("provinciaId");
    const selectDistrito = document.getElementById("distritoId");
    const selectCorregimiento = document.getElementById("corregimientoId");

    selectProvincia?.addEventListener("change", (e) =>
      this.cargarDistritos(e.target.value)
    );
    selectDistrito?.addEventListener("change", (e) =>
      this.cargarCorregimientos(e.target.value)
    );
  }

  // ===============================
  // CRUD DE CLIENTES
  // ===============================

  async cargarClientes() {
    try {
      // Mostrar loading en la tabla
      this.mostrarLoadingTabla();

      // Intentar usar la API real primero, luego usar datos de ejemplo
      let response;
      try {
        const params = new URLSearchParams({
          page: this.currentPage,
          limit: this.pageSize,
          ...this.filtros,
        });

        response = await window.apiClient.get(
          `/clientes/modulo`,
          Object.fromEntries(params)
        );
      } catch (apiError) {
        console.warn(
          "API no disponible, usando datos de ejemplo:",
          apiError.message
        );

        // Usar datos de ejemplo si la API no está disponible
        if (window.DATOS_EJEMPLO) {
          response = window.DATOS_EJEMPLO.paginarClientes(
            window.DATOS_EJEMPLO.clientes,
            this.currentPage,
            this.pageSize,
            this.filtros
          );
          await window.DATOS_EJEMPLO.simularDelay(300); // Simular delay de red
        } else {
          throw new Error("No hay datos disponibles");
        }
      }

      if (response.success) {
        /*console.log("Datos recibidos del backend:", {
          dataLength: response.data?.length,
          firstItem: response.data?.[0],
          pagination: response.pagination
        });*/

        this.renderizarTablaClientes(response.data);
        this.actualizarPaginacion(response.pagination);
        this.actualizarContador(response.pagination.total);
      } else {
        throw new Error(response.message || "Error al cargar clientes");
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      this.mostrarError(
        "Error al cargar la lista de clientes: " + error.message
      );
      this.renderizarTablaClientes([]); // Mostrar tabla vacía en caso de error
    }
  }

  mostrarLoadingTabla() {
    const tbody = document.getElementById("tablaClientes");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>Cargando clientes...</p>
                        </div>
                    </td>
                </tr>
            `;
    }
  }

  async guardarCliente(datosCliente) {
    try {
      // Primero, crear la dirección si es un cliente nuevo o actualizar si cambió
      let direccionId = null;

      if (!this.clienteEditando) {
        // Cliente nuevo: crear dirección primero
        direccionId = await this.crearDireccion({
          corregimiento_id: parseInt(datosCliente.corregimientoId),
          detalle_direccion: datosCliente.detalleDireccion,
        });
        console.log("✅ Dirección creada con ID:", direccionId);
      } else {
        // Cliente existente: usar direccion_id existente o actualizar si cambió
        direccionId = this.clienteEditando.direccion_id;
        console.log("✅ Usando dirección existente con ID:", direccionId);
        console.log("📋 Datos del cliente editando:", this.clienteEditando);

        // Verificar si los datos de dirección han cambiado
        const ubicacionVerificacion =
          this.verificarCambioUbicacion(datosCliente);
        if (ubicacionVerificacion.huboChangio) {
          console.log("📍 Datos de dirección han cambiado, actualizando...");
          await this.actualizarDireccion(
            direccionId,
            ubicacionVerificacion.datosNuevos
          );
          console.log("✅ Dirección actualizada exitosamente");
        } else {
          console.log(
            "📍 No hay cambios en la dirección, manteniéndola como está"
          );
        }
      }

      // Determinar qué datos enviar (todos para cliente nuevo, solo cambios para edición)
      let datosBackend;

      if (!this.clienteEditando) {
        // Cliente nuevo: enviar todos los datos obligatorios
        datosBackend = {
          primer_nombre: datosCliente.primerNombre,
          segundo_nombre: datosCliente.segundoNombre || null,
          primer_apellido: datosCliente.primerApellido,
          segundo_apellido: datosCliente.segundoApellido || null,
          numero_cedula: datosCliente.numeroCedula,
          telefono: datosCliente.telefono,
          email: datosCliente.email,
          sexo: datosCliente.sexo,
          tipo_cliente_id: parseInt(datosCliente.tipoClienteId),
          direccion_id: direccionId,
          nacionalidad_id: parseInt(datosCliente.nacionalidadId),
          estado: datosCliente.estado || "ACTIVO",
          observaciones: datosCliente.observaciones || null, // Incluir observaciones
        };
      } else {
        // Cliente existente: enviar solo los campos que cambiaron
        datosBackend = this.obtenerCambiosCliente(datosCliente);
        console.log("🔄 Solo enviando campos modificados:", datosBackend);
      }

      console.log("Datos del formulario recibidos:", datosCliente);
      console.log("Observaciones del formulario:", datosCliente.observaciones);
      console.log("Datos transformados para enviar al backend:", datosBackend);
      console.log("Modo edición:", !!this.clienteEditando);

      if (this.clienteEditando) {
        console.log("Datos del cliente original:", this.clienteEditando);
      }

      // Validación simplificada
      const erroresValidacion = [];

      if (!this.clienteEditando) {
        // Modo NUEVO: validar todos los campos obligatorios
        if (
          !datosBackend.primer_nombre ||
          datosBackend.primer_nombre.trim() === ""
        ) {
          erroresValidacion.push("Primer nombre es obligatorio");
        }
        if (
          !datosBackend.primer_apellido ||
          datosBackend.primer_apellido.trim() === ""
        ) {
          erroresValidacion.push("Primer apellido es obligatorio");
        }
        if (
          !datosBackend.numero_cedula ||
          datosBackend.numero_cedula.trim() === ""
        ) {
          erroresValidacion.push("Número de cédula es obligatorio");
        }
        if (!datosBackend.telefono || datosBackend.telefono.trim() === "") {
          erroresValidacion.push("Teléfono es obligatorio");
        }
        if (!datosBackend.email || datosBackend.email.trim() === "") {
          erroresValidacion.push("Email es obligatorio");
        }
        if (
          !datosBackend.sexo ||
          (datosBackend.sexo !== "M" && datosBackend.sexo !== "F")
        ) {
          erroresValidacion.push("Sexo debe ser M o F");
        }
        if (
          !datosBackend.tipo_cliente_id ||
          isNaN(datosBackend.tipo_cliente_id) ||
          datosBackend.tipo_cliente_id <= 0
        ) {
          erroresValidacion.push(
            "Tipo de cliente es obligatorio y debe ser válido"
          );
        }
        if (
          !datosBackend.direccion_id ||
          isNaN(datosBackend.direccion_id) ||
          datosBackend.direccion_id <= 0
        ) {
          erroresValidacion.push("Dirección es obligatoria y debe ser válida");
        }
        if (
          !datosBackend.nacionalidad_id ||
          isNaN(datosBackend.nacionalidad_id) ||
          datosBackend.nacionalidad_id <= 0
        ) {
          erroresValidacion.push(
            "Nacionalidad es obligatoria y debe ser válida"
          );
        }
      } else {
        // Modo EDICIÓN: solo validar si no hay cambios
        if (Object.keys(datosBackend).length === 0) {
          console.log("ℹ️ No hay cambios para guardar");
          this.mostrarInfo("No se detectaron cambios en los datos del cliente");
          this.mostrarLoadingFormulario(false);
          return;
        }

        // Validar solo los campos que están presentes en los cambios
        if (
          datosBackend.primer_nombre !== undefined &&
          (!datosBackend.primer_nombre ||
            datosBackend.primer_nombre.trim() === "")
        ) {
          erroresValidacion.push("Primer nombre no puede estar vacío");
        }
        if (
          datosBackend.primer_apellido !== undefined &&
          (!datosBackend.primer_apellido ||
            datosBackend.primer_apellido.trim() === "")
        ) {
          erroresValidacion.push("Primer apellido no puede estar vacío");
        }
        if (
          datosBackend.telefono !== undefined &&
          (!datosBackend.telefono || datosBackend.telefono.trim() === "")
        ) {
          erroresValidacion.push("Teléfono no puede estar vacío");
        }
        if (
          datosBackend.email !== undefined &&
          (!datosBackend.email || datosBackend.email.trim() === "")
        ) {
          erroresValidacion.push("Email no puede estar vacío");
        }

        // En modo edición solo validar observaciones (siempre se envían)
        console.log("✅ Validación de edición: solo campos modificados");
      }

      if (erroresValidacion.length > 0) {
        console.error("Errores de validación:", erroresValidacion);
        throw new Error(
          `Errores de validación:\n${erroresValidacion.join("\n")}`
        );
      }

      console.log(
        "✅ Validación frontend exitosa, enviando datos al backend..."
      );

      const url = this.clienteEditando
        ? `/clientes/${this.clienteEditando.cliente_id}`
        : `/clientes`;

      const method = this.clienteEditando ? "put" : "post";

      const response = await window.apiClient[method](url, datosBackend);

      if (response.success) {
        const esNuevo = !this.clienteEditando;
        const mensaje = esNuevo
          ? "✅ Cliente creado exitosamente"
          : "✅ Cliente actualizado exitosamente";

        // Cerrar modal INMEDIATAMENTE
        this.cerrarModal();

        // Mostrar mensaje de éxito
        this.mostrarExito(mensaje);

        // Recargar la lista de clientes
        await this.cargarClientes();

        console.log(
          `✅ Cliente ${
            esNuevo ? "creado" : "actualizado"
          } y modal cerrado correctamente`
        );
      } else {
        throw new Error(response.message || "Error al guardar cliente");
      }
    } catch (error) {
      console.error("Error completo al guardar cliente:", error);

      // Intentar obtener más detalles del error
      let mensajeError = "Error al guardar cliente";

      if (error.response) {
        // Error de respuesta HTTP
        console.error("Detalles del error HTTP:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });

        if (error.response.status === 400) {
          // Error de validación del backend
          if (error.response.data && error.response.data.error) {
            mensajeError = `Error de validación: ${error.response.data.error}`;

            // Si hay campos requeridos específicos
            if (error.response.data.requeridos) {
              mensajeError += `\nCampos requeridos: ${error.response.data.requeridos.join(
                ", "
              )}`;
            }
          } else {
            mensajeError =
              "Error de validación: Verifique que todos los campos estén correctamente completados";
          }
        } else if (error.response.status === 500) {
          mensajeError =
            "Error interno del servidor. Contacte al administrador.";
        } else {
          mensajeError = `Error HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        mensajeError = error.message;
      }

      this.mostrarError(mensajeError);
    } finally {
      // Asegurar que SIEMPRE se quite el loading
      this.mostrarLoadingFormulario(false);
    }
  }

  // Función para obtener solo los campos que cambiaron en modo edición
  obtenerCambiosCliente(datosFormulario) {
    const cambios = {};

    // Mapeo de campos del formulario a campos del backend
    const mapeosCampos = {
      primerNombre: "primer_nombre",
      segundoNombre: "segundo_nombre",
      primerApellido: "primer_apellido",
      segundoApellido: "segundo_apellido",
      telefono: "telefono",
      email: "email",
      observaciones: "observaciones", // Siempre incluir observaciones
    };

    // Comparar cada campo
    Object.entries(mapeosCampos).forEach(([campoForm, campoBackend]) => {
      const valorFormulario = datosFormulario[campoForm];
      const valorOriginal = this.clienteEditando[campoForm];

      // Campos de texto (manejar valores vacíos y nulls)
      const valorFormLimpio = valorFormulario ? valorFormulario.trim() : "";
      const valorOrigLimpio = valorOriginal ? valorOriginal.trim() : "";

      // Para observaciones, siempre incluir (aunque no hayan cambiado)
      if (campoForm === "observaciones") {
        cambios[campoBackend] = valorFormLimpio || null;
        console.log(
          `� Observaciones siempre incluidas:`,
          cambios[campoBackend]
        );
      } else if (valorFormLimpio !== valorOrigLimpio) {
        cambios[campoBackend] = valorFormLimpio || null;
        console.log(
          `� Campo ${campoForm} cambió: "${valorOrigLimpio}" → "${valorFormLimpio}"`
        );
      }
    });

    // Verificar si hay cambios en la ubicación
    const ubicacionCambio = this.verificarCambioUbicacion(datosFormulario);
    if (ubicacionCambio.huboChangio) {
      console.log(
        "📍 Se detectaron cambios en la ubicación, estos se manejarán por separado"
      );
      // Los cambios de ubicación se manejan en la función de dirección
    }

    console.log("📋 Cambios finales a enviar:", cambios);
    return cambios;
  }

  // Nueva función para verificar cambios en ubicación
  verificarCambioUbicacion(datosFormulario) {
    const provinciaFormulario = datosFormulario.provinciaId
      ? parseInt(datosFormulario.provinciaId)
      : null;
    const distritoFormulario = datosFormulario.distritoId
      ? parseInt(datosFormulario.distritoId)
      : null;
    const corregimientoFormulario = datosFormulario.corregimientoId
      ? parseInt(datosFormulario.corregimientoId)
      : null;
    const detalleFormulario = datosFormulario.detalleDireccion
      ? datosFormulario.detalleDireccion.trim()
      : "";

    const provinciaOriginal = this.direccionOriginal
      ? this.direccionOriginal.provincia_id
      : this.clienteEditando.provincia_id;
    const distritoOriginal = this.direccionOriginal
      ? this.direccionOriginal.distrito_id
      : this.clienteEditando.distrito_id;
    const corregimientoOriginal = this.direccionOriginal
      ? this.direccionOriginal.corregimiento_id
      : this.clienteEditando.corregimiento_id;
    const detalleOriginal = this.direccionOriginal
      ? this.direccionOriginal.detalle_direccion
        ? this.direccionOriginal.detalle_direccion.trim()
        : ""
      : this.clienteEditando.detalle_direccion
      ? this.clienteEditando.detalle_direccion.trim()
      : "";

    const hubocambio =
      (provinciaFormulario && provinciaFormulario !== provinciaOriginal) ||
      (distritoFormulario && distritoFormulario !== distritoOriginal) ||
      (corregimientoFormulario &&
        corregimientoFormulario !== corregimientoOriginal) ||
      (detalleFormulario && detalleFormulario !== detalleOriginal);

    console.log("� Verificando cambios de ubicación:", {
      original: {
        provincia_id: provinciaOriginal,
        distrito_id: distritoOriginal,
        corregimiento_id: corregimientoOriginal,
        detalle: detalleOriginal,
      },
      formulario: {
        provincia_id: provinciaFormulario,
        distrito_id: distritoFormulario,
        corregimiento_id: corregimientoFormulario,
        detalle: detalleFormulario,
      },
      huboChangio: hubocambio,
    });

    return {
      huboChangio: hubocambio,
      datosNuevos: hubocambio
        ? {
            corregimiento_id: corregimientoFormulario || corregimientoOriginal,
            detalle_direccion: detalleFormulario || detalleOriginal,
          }
        : null,
    };
  }

  async eliminarCliente(clienteId) {
    // Crear modal de confirmación personalizado
    const confirmado = await this.mostrarConfirmacion(
      "Confirmar Eliminación",
      "¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.",
      "Eliminar",
      "Cancelar"
    );

    if (!confirmado) return;

    try {
      console.log(`🔄 Eliminando cliente ${clienteId}`);

      const response = await window.apiClient.delete(`/clientes/${clienteId}`);

      console.log("📋 Respuesta del servidor:", response);

      // Verificar si la respuesta indica éxito
      if (
        response.success === true ||
        response.message?.includes("exitosamente")
      ) {
        this.mostrarExito("Cliente eliminado exitosamente");
        await this.cargarClientes();
      } else {
        throw new Error(
          response.message || response.error || "Error al eliminar cliente"
        );
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      // Si el mensaje de error contiene "exitosamente", es en realidad un éxito mal manejado
      if (error.message && error.message.includes("exitosamente")) {
        console.log(
          "⚠️ Éxito detectado erróneamente como error, procesando como éxito"
        );
        this.mostrarExito("Cliente eliminado exitosamente");
        await this.cargarClientes();
      } else {
        this.mostrarError("Error al eliminar cliente: " + error.message);
      }
    }
  }

  async cambiarEstadoCliente(clienteId, estadoActual) {
    const nuevoEstado = estadoActual === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const accion = nuevoEstado === "ACTIVO" ? "activar" : "desactivar";

    // Crear modal de confirmación personalizado
    const confirmado = await this.mostrarConfirmacion(
      `Confirmar ${accion.charAt(0).toUpperCase() + accion.slice(1)}`,
      `¿Está seguro de que desea ${accion} este cliente?`,
      accion.charAt(0).toUpperCase() + accion.slice(1),
      "Cancelar"
    );

    if (!confirmado) return;

    try {
      console.log(
        `🔄 Cambiando estado de cliente ${clienteId} de ${estadoActual} a ${nuevoEstado}`
      );

      // Ahora que el backend permite actualizar solo el estado, enviamos solo ese campo
      const response = await window.apiClient.put(`/clientes/${clienteId}`, {
        estado: nuevoEstado,
      });

      console.log("📋 Respuesta del servidor:", response);

      // Verificar si la respuesta indica éxito
      if (
        response.success === true ||
        response.message?.includes("exitosamente")
      ) {
        this.mostrarExito(
          `Cliente ${
            accion === "activar" ? "activado" : "desactivado"
          } exitosamente`
        );
        await this.cargarClientes();
      } else {
        throw new Error(
          response.message || response.error || `Error al ${accion} cliente`
        );
      }
    } catch (error) {
      console.error(`Error al ${accion} cliente:`, error);

      // Si el mensaje de error contiene "exitosamente", es en realidad un éxito mal manejado
      if (error.message && error.message.includes("exitosamente")) {
        console.log(
          "⚠️ Éxito detectado erróneamente como error, procesando como éxito"
        );
        this.mostrarExito(
          `Cliente ${
            accion === "activar" ? "activado" : "desactivado"
          } exitosamente`
        );
        await this.cargarClientes();
      } else {
        this.mostrarError(`Error al ${accion} cliente: ` + error.message);
      }
    }
  }

  // Modal de confirmación personalizado para el módulo
  mostrarConfirmacion(
    titulo,
    mensaje,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar"
  ) {
    return new Promise((resolve) => {
      // Crear modal de confirmación dinámicamente
      const modalConfirm = document.createElement("div");
      modalConfirm.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      modalConfirm.innerHTML = `
        <div class="bg-white rounded-lg p-6 m-4 max-w-md w-full">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">${titulo}</h3>
            <p class="mt-2 text-sm text-gray-600">${mensaje}</p>
          </div>
          <div class="flex justify-end space-x-3">
            <button class="cancel-btn px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              ${textoCancelar}
            </button>
            <button class="confirm-btn px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              ${textoConfirmar}
            </button>
          </div>
        </div>
      `;

      // Agregar al DOM
      document.body.appendChild(modalConfirm);
      document.body.style.overflow = "hidden";

      // Event listeners
      const confirmBtn = modalConfirm.querySelector(".confirm-btn");
      const cancelBtn = modalConfirm.querySelector(".cancel-btn");

      const cleanup = () => {
        document.body.removeChild(modalConfirm);
        document.body.style.overflow = "";
      };

      confirmBtn.addEventListener("click", () => {
        cleanup();
        resolve(true);
      });

      cancelBtn.addEventListener("click", () => {
        cleanup();
        resolve(false);
      });

      // Cerrar con ESC
      const handleEsc = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", handleEsc);
          cleanup();
          resolve(false);
        }
      };
      document.addEventListener("keydown", handleEsc);

      // Cerrar haciendo clic fuera
      modalConfirm.addEventListener("click", (e) => {
        if (e.target === modalConfirm) {
          cleanup();
          resolve(false);
        }
      });
    });
  }

  // ===============================
  // RENDERIZADO DE DATOS
  // ===============================

  renderizarTablaClientes(clientes) {
    const tbody = document.getElementById("tablaClientes");
    if (!tbody) return;

    if (!clientes || clientes.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                            <p class="text-lg font-medium mb-2">No hay clientes registrados</p>
                            <p class="text-sm">Comience agregando un nuevo cliente</p>
                        </div>
                    </td>
                </tr>
            `;
      return;
    }

    tbody.innerHTML = clientes
      .map((cliente) => {
        const id = cliente.cliente_id || cliente.id;
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-800">
                                    ${this.getIniciales(
                                      cliente.primer_nombre,
                                      cliente.primer_apellido
                                    )}
                                </span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${this.getNombreCompleto(cliente)}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${cliente.numero_cedula || "N/A"}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>${cliente.email || "Sin email"}</div>
                    <div class="text-xs text-gray-400">${
                      cliente.telefono || "Sin teléfono"
                    }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getTipoClienteStyle(
                      cliente.tipo_cliente_nombre || cliente.tipo_cliente_id
                    )}">
                        ${
                          cliente.tipo_cliente_nombre || cliente.tipo_cliente_id
                        }
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getEstadoStyle(
                      cliente.estado
                    )}">
                        ${cliente.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${this.formatearFecha(cliente.fecha_registro)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors" 
                                onclick="clientesManager.editarCliente(${id})" 
                                title="Editar cliente">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-${
                          cliente.estado === "ACTIVO" ? "orange" : "green"
                        }-600 hover:text-${
          cliente.estado === "ACTIVO" ? "orange" : "green"
        }-800 p-1 rounded transition-colors" 
                                onclick="clientesManager.cambiarEstadoCliente(${id}, '${
          cliente.estado
        }')" 
                                title="${
                                  cliente.estado === "ACTIVO"
                                    ? "Desactivar"
                                    : "Activar"
                                } cliente">
                            <i class="fas fa-${
                              cliente.estado === "ACTIVO"
                                ? "user-slash"
                                : "user-check"
                            }"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-800 p-1 rounded transition-colors" 
                                onclick="clientesManager.eliminarCliente(${id})" 
                                title="Eliminar cliente">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
      })
      .join("");
  }

  // ===============================
  // MODAL Y FORMULARIOS NATIVOS
  // ===============================

  abrirModal(titulo = "Cliente") {
    if (!this.modal) return;

    // Configurar título
    const modalTitle = this.modal.querySelector(".modal-title");
    if (modalTitle) modalTitle.textContent = titulo;

    // Mostrar modal
    this.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevenir scroll
  }

  cerrarModal() {
    console.log("🔴 Iniciando cierre de modal...");

    if (!this.modal) {
      console.warn("❌ Modal no encontrado");
      return;
    }

    // Ocultar modal con animación
    this.modal.classList.add("hidden");
    console.log("✅ Modal ocultado");

    // Restaurar scroll del body
    document.body.style.overflow = "";

    // Limpiar estado de edición
    this.clienteEditando = null;
    this.direccionOriginal = null;

    // Resetear formulario completamente
    if (this.form) {
      this.form.reset();

      // Limpiar errores de validación visibles
      const errorElements = this.form.querySelectorAll(
        ".error-message, .text-red-500"
      );
      errorElements.forEach((el) => el.remove());

      // Restaurar campos a estado normal
      const inputs = this.form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.classList.remove("border-red-500", "error");
        input.disabled = false; // Restaurar campos deshabilitados
      });
    }

    // Restaurar botón de submit a estado normal
    this.mostrarLoadingFormulario(false);

    // Mostrar todos los campos de dirección por defecto
    this.mostrarCamposDireccion();

    // Limpiar información de dirección actual si existe
    const direccionInfo = document.getElementById("direccionActualInfo");
    if (direccionInfo) {
      direccionInfo.remove();
    }

    console.log("✅ Modal cerrado y limpiado correctamente");
  }

  async manejarSubmitFormulario() {
    if (!this.form) return;

    // Mostrar loading
    this.mostrarLoadingFormulario(true);

    try {
      // Validar formulario
      if (!this.validarFormulario()) {
        this.mostrarLoadingFormulario(false);
        return;
      }

      // Obtener datos del formulario
      const formData = new FormData(this.form);
      const datosCliente = Object.fromEntries(formData.entries());

      console.log("Datos del formulario a enviar:", datosCliente);

      // Guardar cliente
      await this.guardarCliente(datosCliente);
    } catch (error) {
      console.error("Error en submit:", error);
      this.mostrarError("Error al procesar el formulario: " + error.message);
      this.mostrarLoadingFormulario(false);
    }
  }

  validarFormulario() {
    if (!this.form) return false;

    const errores = [];

    // Validar campos obligatorios
    const camposObligatorios = [
      { name: "primerNombre", label: "Primer nombre" },
      { name: "primerApellido", label: "Primer apellido" },
      { name: "telefono", label: "Teléfono" },
      { name: "email", label: "Email" },
    ];

    // Solo validar campos de ubicación y documentos para clientes nuevos
    if (!this.clienteEditando) {
      camposObligatorios.push(
        { name: "numeroCedula", label: "Número de cédula" },
        { name: "sexo", label: "Sexo" },
        { name: "tipoClienteId", label: "Tipo de cliente" },
        { name: "nacionalidadId", label: "Nacionalidad" },
        { name: "provinciaId", label: "Provincia" },
        { name: "distritoId", label: "Distrito" },
        { name: "corregimientoId", label: "Corregimiento" },
        { name: "detalleDireccion", label: "Detalle de dirección" }
      );
    } else {
      // En modo edición, también validar campos de dirección si están visibles
      camposObligatorios.push(
        { name: "provinciaId", label: "Provincia" },
        { name: "distritoId", label: "Distrito" },
        { name: "corregimientoId", label: "Corregimiento" },
        { name: "detalleDireccion", label: "Detalle de dirección" }
      );
    }

    // Verificar campos obligatorios
    camposObligatorios.forEach((campo) => {
      const elemento = this.form.querySelector(`[name="${campo.name}"]`);

      // Saltar validación si el campo está deshabilitado (campos no editables en modo edición)
      if (elemento && elemento.disabled) {
        console.log(
          `⏭️ Saltando validación de campo deshabilitado: ${campo.label}`
        );
        return;
      }

      if (!elemento || !elemento.value.trim()) {
        errores.push(`${campo.label} es obligatorio`);
      }
    });

    // Validar formato de cédula (solo para clientes nuevos)
    if (!this.clienteEditando) {
      const cedulaElement = this.form.querySelector('[name="numeroCedula"]');
      const cedula = cedulaElement?.value;
      if (cedula && !/^[0-9]{1,2}-[0-9]{1,4}-[0-9]{1,6}$/.test(cedula)) {
        errores.push("Formato de cédula inválido (Ej: 8-123-456)");
      }
    }

    // Validar email
    const email = this.form.querySelector('[name="email"]')?.value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.push("Formato de email inválido");
    }

    // Mostrar errores si existen
    if (errores.length > 0) {
      this.mostrarError("Errores de validación:\n" + errores.join("\n"));
      return false;
    }

    return true;
  }

  mostrarLoadingFormulario(mostrar) {
    // Buscar botón de submit con múltiples selectores incluyendo el nuevo ID
    const submitBtn = this.form?.querySelector(
      'button[type="submit"], #btnGuardar, .btn-submit, .btn-guardar, .submit-button'
    );

    if (!submitBtn) {
      console.warn("No se encontró el botón de submit en el formulario");
      return;
    }

    if (mostrar) {
      // Guardar el HTML original para restaurarlo después
      if (!submitBtn.dataset.originalHtml) {
        submitBtn.dataset.originalHtml = submitBtn.innerHTML;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add("loading");
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove("loading");

      // Restaurar HTML original o usar uno por defecto
      const originalHtml =
        submitBtn.dataset.originalHtml ||
        '<i class="fas fa-save mr-2"></i>Guardar Cliente';
      submitBtn.innerHTML = originalHtml;
    }
  }

  abrirModalNuevo() {
    // Limpiar completamente el estado anterior
    this.clienteEditando = null;

    // Abrir modal
    this.abrirModal("Nuevo Cliente");

    // Limpiar formulario completamente
    if (this.form) {
      this.form.reset();

      // Habilitar todos los campos
      const inputs = this.form.querySelectorAll("input, select, textarea");
      inputs.forEach((input) => {
        input.disabled = false;
        input.style.backgroundColor = "";
        input.title = "";
        input.classList.remove("border-red-500", "error");
      });
    }

    // Mostrar campos de dirección para nuevo cliente
    this.mostrarCamposDireccion();

    // Resetear selectores de dirección
    this.resetearSelectoresDireccion();

    console.log("Modal nuevo cliente abierto y limpiado");
  }

  ocultarCamposDireccion() {
    const camposDireccion = [
      "provinciaId",
      "distritoId",
      "corregimientoId",
      "detalleDireccion",
    ];

    camposDireccion.forEach((campoId) => {
      const campo = document.getElementById(campoId);
      const contenedor = campo?.closest("div");
      if (contenedor) {
        contenedor.style.display = "none";
      }

      // Quitar atributo required cuando se ocultan los campos
      if (campo) {
        campo.removeAttribute("required");
        console.log(`🔧 Atributo 'required' removido de ${campoId}`);
      }
    });

    // Ocultar también el título de dirección buscando por texto
    const titulos = document.querySelectorAll("h3");
    titulos.forEach((titulo) => {
      if (titulo.textContent.includes("Información de Dirección")) {
        titulo.style.display = "none";
      }
    });
  }

  mostrarCamposDireccion() {
    const camposDireccion = [
      "provinciaId",
      "distritoId",
      "corregimientoId",
      "detalleDireccion",
    ];

    camposDireccion.forEach((campoId) => {
      const campo = document.getElementById(campoId);
      const contenedor = campo?.closest("div");
      if (contenedor) {
        contenedor.style.display = "block";
      }

      // Restaurar atributo required cuando se muestran los campos
      if (campo) {
        campo.setAttribute("required", "");
        console.log(`🔧 Atributo 'required' restaurado en ${campoId}`);
      }
    });

    // Mostrar también el título de dirección buscando por texto
    const titulos = document.querySelectorAll("h3");
    titulos.forEach((titulo) => {
      if (titulo.textContent.includes("Información de Dirección")) {
        titulo.style.display = "block";
      }
    });

    // Resetear los selectores
    this.resetearSelectoresDireccion();
  }

  resetearSelectoresDireccion() {
    const selectDistrito = document.getElementById("distritoId");
    const selectCorregimiento = document.getElementById("corregimientoId");

    if (selectDistrito) {
      selectDistrito.innerHTML =
        '<option value="">Seleccionar distrito</option>';
      selectDistrito.disabled = true;
    }

    if (selectCorregimiento) {
      selectCorregimiento.innerHTML =
        '<option value="">Seleccionar corregimiento</option>';
      selectCorregimiento.disabled = true;
    }
  }

  async editarCliente(clienteId) {
    try {
      const response = await window.apiClient.get(`/clientes/${clienteId}`);

      if (response.success) {
        // Normalizar los datos para el formulario
        const cliente = response.data;

        console.log("Datos del cliente recibidos:", cliente);

        // Verificar que el cliente tenga direccion_id
        if (!cliente.direccion_id) {
          console.warn(
            "⚠️ Cliente no tiene direccion_id, usando valor por defecto"
          );
          cliente.direccion_id = 1; // Valor temporal para evitar errores
        }

        // Mapear los datos del cliente a los nombres exactos de los campos del formulario
        const formData = {
          // Campos de identificación
          cliente_id: cliente.cliente_id,
          direccion_id: cliente.direccion_id, // Importante para updates

          // Nombres y apellidos
          primerNombre: cliente.primer_nombre || "",
          segundoNombre: cliente.segundo_nombre || "",
          primerApellido: cliente.primer_apellido || "",
          segundoApellido: cliente.segundo_apellido || "",

          // Documento y contacto
          numeroCedula: cliente.numero_cedula || "",
          telefono: cliente.telefono || "",
          email: cliente.email || "",

          // Otros datos
          sexo: cliente.sexo || "",
          tipoClienteId: cliente.tipo_cliente_id || "",
          nacionalidadId: cliente.nacionalidad_id || "",

          // Datos de dirección para cargar
          provincia_id: cliente.provincia_id,
          distrito_id: cliente.distrito_id,
          corregimiento_id: cliente.corregimiento_id,
          detalle_direccion: cliente.detalle_direccion || "",

          // Nombres de ubicación para mostrar
          provincia_nombre:
            cliente.provincia_nombre || cliente.nombre_provincia,
          distrito_nombre: cliente.distrito_nombre || cliente.nombre_distrito,
          corregimiento_nombre:
            cliente.corregimiento_nombre || cliente.nombre_corregimiento,

          // Observaciones del cliente
          observaciones: cliente.observaciones || "",
        };

        console.log("Datos mapeados para el formulario:", formData);

        this.clienteEditando = formData;
        this.abrirModal("Editar Cliente");

        // Rellenar formulario con datos del cliente
        this.rellenarFormulario(formData);

        // Para edición, mostrar los campos de ubicación con datos cargados
        this.mostrarCamposDireccion();

        // Cargar y seleccionar los datos de ubicación
        await this.cargarDatosUbicacionEdicion(formData);

        // Deshabilitar campos que no deben editarse en modo edición
        this.configurarCamposEdicion();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al cargar cliente:", error);
      this.mostrarError("Error al cargar los datos del cliente");
    }
  }

  // Nueva función para cargar datos de ubicación en modo edición
  async cargarDatosUbicacionEdicion(datosCliente) {
    try {
      const selectProvincia = document.getElementById("provinciaId");
      const selectDistrito = document.getElementById("distritoId");
      const selectCorregimiento = document.getElementById("corregimientoId");
      const inputDetalle = document.getElementById("detalleDireccion");
      const inputObservaciones = document.getElementById("observaciones");

      console.log("🔄 Cargando datos de ubicación para edición:", {
        direccion_id: datosCliente.direccion_id,
        observaciones: datosCliente.observaciones,
      });

      // Establecer observaciones si existen
      if (inputObservaciones) {
        inputObservaciones.value = datosCliente.observaciones || "";
        console.log(
          "✅ Observaciones cargadas:",
          datosCliente.observaciones || "Sin observaciones"
        );
      }

      // Cargar datos de dirección desde el API
      if (datosCliente.direccion_id) {
        await this.cargarDireccionCompleta(datosCliente.direccion_id);
      } else {
        // Fallback: usar datos que vienen con el cliente si no hay direccion_id
        console.log("🔄 Usando datos de dirección del cliente como fallback");
        await this.cargarDireccionDesdeDatosCliente(datosCliente);
      }

      console.log(
        "✅ Datos de ubicación y observaciones cargados para edición"
      );
    } catch (error) {
      console.error("Error al cargar datos para edición:", error);
      this.mostrarError("Error al cargar los datos del cliente");
    }
  }

  // Nueva función para cargar dirección completa desde el API
  async cargarDireccionCompleta(direccionId) {
    try {
      console.log("🔄 Cargando dirección completa para ID:", direccionId);

      const response = await window.apiClient.get(
        `/direcciones/${direccionId}`
      );

      if (response.success) {
        const direccion = response.data;
        console.log("📍 Datos de dirección recibidos:", direccion);

        const selectProvincia = document.getElementById("provinciaId");
        const selectDistrito = document.getElementById("distritoId");
        const selectCorregimiento = document.getElementById("corregimientoId");
        const inputDetalle = document.getElementById("detalleDireccion");

        // 1. CARGAR Y SELECCIONAR PROVINCIA
        if (direccion.provincia_id && selectProvincia) {
          // Asegurar que las provincias estén cargadas primero
          await this.cargarProvincias();

          selectProvincia.value = direccion.provincia_id;
          selectProvincia.disabled = false;
          console.log("✅ Provincia seleccionada:", direccion.nombre_provincia);

          // 2. CARGAR Y SELECCIONAR DISTRITO
          if (direccion.distrito_id) {
            console.log(
              "🔄 Cargando distritos para provincia:",
              direccion.provincia_id
            );
            await this.cargarDistritos(direccion.provincia_id);

            // Pequeña pausa para asegurar que los distritos se carguen
            await new Promise((resolve) => setTimeout(resolve, 100));

            selectDistrito.value = direccion.distrito_id;
            selectDistrito.disabled = false;
            console.log("✅ Distrito seleccionado:", direccion.nombre_distrito);

            // 3. CARGAR Y SELECCIONAR CORREGIMIENTO
            if (direccion.corregimiento_id) {
              console.log(
                "🔄 Cargando corregimientos para distrito:",
                direccion.distrito_id
              );
              await this.cargarCorregimientos(direccion.distrito_id);

              // Pequeña pausa para asegurar que los corregimientos se carguen
              await new Promise((resolve) => setTimeout(resolve, 100));

              selectCorregimiento.value = direccion.corregimiento_id;
              selectCorregimiento.disabled = false;
              console.log(
                "✅ Corregimiento seleccionado:",
                direccion.nombre_corregimiento
              );
            } else {
              console.warn("⚠️ No hay corregimiento_id en la dirección");
            }
          } else {
            console.warn("⚠️ No hay distrito_id en la dirección");
          }
        } else {
          console.warn("⚠️ No hay provincia_id en la dirección");
        }

        // 4. ESTABLECER DETALLE DE DIRECCIÓN
        if (inputDetalle) {
          inputDetalle.value = direccion.detalle_direccion || "";
          console.log(
            "✅ Detalle de dirección cargado:",
            direccion.detalle_direccion
          );
        }

        // 5. VERIFICAR QUE TODOS LOS CAMPOS ESTÉN CORRECTAMENTE ESTABLECIDOS
        console.log("📋 Verificación final de selectores:", {
          provincia: {
            valor: selectProvincia?.value,
            texto:
              selectProvincia?.options[selectProvincia?.selectedIndex]?.text,
            habilitado: !selectProvincia?.disabled,
          },
          distrito: {
            valor: selectDistrito?.value,
            texto: selectDistrito?.options[selectDistrito?.selectedIndex]?.text,
            habilitado: !selectDistrito?.disabled,
          },
          corregimiento: {
            valor: selectCorregimiento?.value,
            texto:
              selectCorregimiento?.options[selectCorregimiento?.selectedIndex]
                ?.text,
            habilitado: !selectCorregimiento?.disabled,
          },
          detalle: inputDetalle?.value,
        });

        // Guardar datos originales para comparar cambios
        this.direccionOriginal = {
          provincia_id: direccion.provincia_id,
          distrito_id: direccion.distrito_id,
          corregimiento_id: direccion.corregimiento_id,
          detalle_direccion: direccion.detalle_direccion,
        };

        console.log("✅ Dirección completa cargada y configurada exitosamente");
      } else {
        console.warn("⚠️ No se pudo cargar la dirección:", response.message);
        this.mostrarError("No se pudo cargar los datos de dirección");
      }
    } catch (error) {
      console.error("❌ Error al cargar dirección completa:", error);
      this.mostrarError(
        "Error al cargar los datos de dirección: " + error.message
      );
    }
  }

  // Función fallback para cargar dirección desde datos del cliente
  async cargarDireccionDesdeDatosCliente(datosCliente) {
    try {
      console.log(
        "🔄 Cargando dirección desde datos del cliente:",
        datosCliente
      );

      const selectProvincia = document.getElementById("provinciaId");
      const selectDistrito = document.getElementById("distritoId");
      const selectCorregimiento = document.getElementById("corregimientoId");
      const inputDetalle = document.getElementById("detalleDireccion");

      // 1. CARGAR Y SELECCIONAR PROVINCIA
      if (datosCliente.provincia_id && selectProvincia) {
        await this.cargarProvincias();
        selectProvincia.value = datosCliente.provincia_id;
        selectProvincia.disabled = false;
        console.log(
          "✅ Provincia seleccionada desde datos cliente:",
          datosCliente.provincia_nombre
        );

        // 2. CARGAR Y SELECCIONAR DISTRITO
        if (datosCliente.distrito_id) {
          await this.cargarDistritos(datosCliente.provincia_id);
          await new Promise((resolve) => setTimeout(resolve, 100));

          selectDistrito.value = datosCliente.distrito_id;
          selectDistrito.disabled = false;
          console.log(
            "✅ Distrito seleccionado desde datos cliente:",
            datosCliente.distrito_nombre
          );

          // 3. CARGAR Y SELECCIONAR CORREGIMIENTO
          if (datosCliente.corregimiento_id) {
            await this.cargarCorregimientos(datosCliente.distrito_id);
            await new Promise((resolve) => setTimeout(resolve, 100));

            selectCorregimiento.value = datosCliente.corregimiento_id;
            selectCorregimiento.disabled = false;
            console.log(
              "✅ Corregimiento seleccionado desde datos cliente:",
              datosCliente.corregimiento_nombre
            );
          }
        }
      }

      // 4. ESTABLECER DETALLE DE DIRECCIÓN
      if (inputDetalle && datosCliente.detalle_direccion) {
        inputDetalle.value = datosCliente.detalle_direccion;
        console.log(
          "✅ Detalle de dirección cargado desde datos cliente:",
          datosCliente.detalle_direccion
        );
      }

      // Guardar datos originales para comparar cambios
      this.direccionOriginal = {
        provincia_id: datosCliente.provincia_id,
        distrito_id: datosCliente.distrito_id,
        corregimiento_id: datosCliente.corregimiento_id,
        detalle_direccion: datosCliente.detalle_direccion,
      };

      console.log("✅ Dirección cargada desde datos del cliente exitosamente");
    } catch (error) {
      console.error(
        "❌ Error al cargar dirección desde datos del cliente:",
        error
      );
    }
  }

  // Nueva función para configurar campos en modo edición
  configurarCamposEdicion() {
    if (!this.form) return;

    // Campos que no deben editarse en modo edición
    const camposNoEditables = [
      "numeroCedula", // La cédula no debe cambiar
      "sexo", // El sexo no debe cambiar
      "nacionalidadId", // La nacionalidad no debe cambiar
      "tipoClienteId", // El tipo de cliente no debe cambiar
    ];

    camposNoEditables.forEach((campo) => {
      const elemento = this.form.querySelector(`[name="${campo}"]`);
      if (elemento) {
        elemento.disabled = true;
        elemento.style.backgroundColor = "#f3f4f6";
        elemento.title = "Este campo no puede modificarse";
        // Quitar el atributo required para campos deshabilitados
        elemento.removeAttribute("required");
      }
    });

    console.log("✅ Campos configurados para modo edición");
  }

  rellenarFormulario(datos) {
    if (!this.form) return;

    Object.keys(datos).forEach((key) => {
      const campo = this.form.querySelector(`[name="${key}"]`);
      if (campo && datos[key] !== null && datos[key] !== undefined) {
        campo.value = datos[key];
      }
    });
  }

  // ===============================
  // FILTROS Y BÚSQUEDA
  // ===============================

  handleBusqueda(valor) {
    this.filtros.busqueda = valor;
    this.currentPage = 1;
    this.debounceCargarClientes();
  }

  handleFiltroTipo(valor) {
    this.filtros.tipoCliente = valor;
    this.currentPage = 1;
    this.cargarClientes();
  }

  handleFiltroEstado(valor) {
    this.filtros.estado = valor;
    this.currentPage = 1;
    this.cargarClientes();
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: "",
      tipoCliente: "",
      estado: "",
    };
    this.currentPage = 1;

    document.getElementById("searchCliente").value = "";
    document.getElementById("filterTipoCliente").value = "";
    document.getElementById("filterEstado").value = "";

    this.cargarClientes();
  }

  // Debounce para búsqueda
  debounceCargarClientes() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.cargarClientes();
    }, 300);
  }

  // ===============================
  // PAGINACIÓN
  // ===============================

  cambiarPagina(nuevaPagina) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages) return;
    this.currentPage = nuevaPagina;
    this.cargarClientes();
  }

  actualizarPaginacion(pagination) {
    this.totalPages = pagination.totalPages;

    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const paginaInfo = document.getElementById("paginaInfo");
    const numeroPaginas = document.getElementById("numeroPaginas");

    btnAnterior.disabled = this.currentPage === 1;
    btnSiguiente.disabled = this.currentPage === this.totalPages;

    paginaInfo.textContent = `${pagination.from || 0}-${
      pagination.to || 0
    } de ${pagination.total}`;

    // Generar números de página
    numeroPaginas.innerHTML = this.generarNumerosPagina();
  }

  generarNumerosPagina() {
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    let html = "";

    for (let i = startPage; i <= endPage; i++) {
      html += `
                <button class="px-3 py-1 text-sm rounded-md transition-colors ${
                  i === this.currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }" onclick="clientesManager.cambiarPagina(${i})">
                    ${i}
                </button>
            `;
    }

    return html;
  }

  actualizarContador(total) {
    const totalClientes = document.getElementById("totalClientes");
    if (totalClientes) {
      totalClientes.textContent = `Total: ${total} clientes`;
    }
  }

  // ===============================
  // DATOS AUXILIARES
  // ===============================

  async cargarProvincias() {
    try {
      console.log("🔄 Cargando provincias...");

      let response;
      try {
        response = await window.apiClient.get("/provincias");
      } catch (apiError) {
        console.warn("API provincias no disponible, usando datos estáticos");
        // Fallback a datos estáticos si la API no está disponible
        response = {
          success: true,
          data: [
            { provincia_id: 1, nombre_provincia: "Panamá" },
            { provincia_id: 2, nombre_provincia: "Coclé" },
            { provincia_id: 3, nombre_provincia: "Colón" },
            { provincia_id: 4, nombre_provincia: "Chiriquí" },
            { provincia_id: 5, nombre_provincia: "Herrera" },
            { provincia_id: 6, nombre_provincia: "Los Santos" },
            { provincia_id: 7, nombre_provincia: "Veraguas" },
            { provincia_id: 8, nombre_provincia: "Bocas del Toro" },
            { provincia_id: 9, nombre_provincia: "Darién" },
            { provincia_id: 10, nombre_provincia: "Panamá Oeste" },
          ],
        };
      }

      if (response.success) {
        const selectProvincia = document.getElementById("provinciaId");
        if (selectProvincia) {
          selectProvincia.innerHTML = `
            <option value="">Seleccionar provincia</option>
            ${response.data
              .map(
                (provincia) => `
                <option value="${provincia.provincia_id}">
                  ${provincia.nombre_provincia}
                </option>
            `
              )
              .join("")}
          `;

          // Habilitar el selector de provincias
          selectProvincia.disabled = false;
          console.log(
            `✅ ${response.data.length} provincias cargadas exitosamente`
          );
        }
      } else {
        throw new Error("No se pudo cargar la lista de provincias");
      }
    } catch (error) {
      console.error("Error al cargar provincias:", error);
      this.mostrarError(
        "No se pudo cargar la lista de provincias desde la API."
      );
    }
  }

  async cargarDistritos(provinciaId) {
    const selectDistrito = document.getElementById("distritoId");
    const selectCorregimiento = document.getElementById("corregimientoId");

    if (!provinciaId) {
      selectDistrito.innerHTML =
        '<option value="">Seleccionar distrito</option>';
      selectDistrito.disabled = true;
      selectCorregimiento.innerHTML =
        '<option value="">Seleccionar corregimiento</option>';
      selectCorregimiento.disabled = true;
      return;
    }

    try {
      console.log(`🔄 Cargando distritos para provincia ${provinciaId}...`);

      let response;
      try {
        response = await window.apiClient.get(
          `/distritos?provincia_id=${provinciaId}`
        );
      } catch (apiError) {
        console.warn("API distritos no disponible, usando datos estáticos");

        // Datos estáticos más completos por provincia
        const distritosEstaticos = {
          1: [
            // Panamá
            { distrito_id: 1, nombre_distrito: "Panamá", provincia_id: 1 },
            {
              distrito_id: 2,
              nombre_distrito: "San Miguelito",
              provincia_id: 1,
            },
            { distrito_id: 3, nombre_distrito: "Arraiján", provincia_id: 1 },
            { distrito_id: 4, nombre_distrito: "La Chorrera", provincia_id: 1 },
            { distrito_id: 5, nombre_distrito: "Pacora", provincia_id: 1 },
          ],
          2: [
            // Coclé
            { distrito_id: 6, nombre_distrito: "Penonomé", provincia_id: 2 },
            { distrito_id: 7, nombre_distrito: "Aguadulce", provincia_id: 2 },
            { distrito_id: 8, nombre_distrito: "Antón", provincia_id: 2 },
          ],
          3: [
            // Colón
            { distrito_id: 9, nombre_distrito: "Colón", provincia_id: 3 },
            { distrito_id: 10, nombre_distrito: "Chagres", provincia_id: 3 },
          ],
          4: [
            // Chiriquí
            { distrito_id: 11, nombre_distrito: "David", provincia_id: 4 },
            { distrito_id: 12, nombre_distrito: "Bugaba", provincia_id: 4 },
            { distrito_id: 13, nombre_distrito: "Boquerón", provincia_id: 4 },
          ],
        };

        response = {
          success: true,
          data: distritosEstaticos[provinciaId] || [],
        };
      }

      if (response.success) {
        selectDistrito.innerHTML = `
          <option value="">Seleccionar distrito</option>
          ${response.data
            .map(
              (distrito) => `
              <option value="${distrito.distrito_id || distrito.id}">
                ${distrito.nombre_distrito || distrito.nombre}
              </option>
          `
            )
            .join("")}
        `;
        selectDistrito.disabled = false;
        console.log(
          `✅ ${response.data.length} distritos cargados para provincia ${provinciaId}`
        );

        // Limpiar corregimientos cuando se cambia el distrito
        selectCorregimiento.innerHTML =
          '<option value="">Seleccionar corregimiento</option>';
        selectCorregimiento.disabled = true;
      }
    } catch (error) {
      console.error("Error al cargar distritos:", error);
      this.mostrarError("Error al cargar los distritos");
    }
  }

  async cargarCorregimientos(distritoId) {
    const selectCorregimiento = document.getElementById("corregimientoId");

    if (!distritoId) {
      selectCorregimiento.innerHTML =
        '<option value="">Seleccionar corregimiento</option>';
      selectCorregimiento.disabled = true;
      return;
    }

    try {
      console.log(`🔄 Cargando corregimientos para distrito ${distritoId}...`);

      let response;
      try {
        response = await window.apiClient.get(
          `/corregimientos?distrito_id=${distritoId}`
        );
      } catch (apiError) {
        console.warn(
          "API corregimientos no disponible, usando datos estáticos"
        );

        // Datos estáticos más completos por distrito
        const corregimientosEstaticos = {
          1: [
            // Panamá
            {
              corregimiento_id: 1,
              nombre_corregimiento: "Casco Antiguo",
              distrito_id: 1,
            },
            {
              corregimiento_id: 2,
              nombre_corregimiento: "San Felipe",
              distrito_id: 1,
            },
            {
              corregimiento_id: 3,
              nombre_corregimiento: "El Chorrillo",
              distrito_id: 1,
            },
            {
              corregimiento_id: 4,
              nombre_corregimiento: "Santa Ana",
              distrito_id: 1,
            },
            {
              corregimiento_id: 5,
              nombre_corregimiento: "Calidonia",
              distrito_id: 1,
            },
            {
              corregimiento_id: 6,
              nombre_corregimiento: "Bella Vista",
              distrito_id: 1,
            },
            {
              corregimiento_id: 7,
              nombre_corregimiento: "Betania",
              distrito_id: 1,
            },
            {
              corregimiento_id: 8,
              nombre_corregimiento: "Pueblo Nuevo",
              distrito_id: 1,
            },
            {
              corregimiento_id: 9,
              nombre_corregimiento: "Río Abajo",
              distrito_id: 1,
            },
            {
              corregimiento_id: 10,
              nombre_corregimiento: "Juan Díaz",
              distrito_id: 1,
            },
          ],
          2: [
            // San Miguelito
            {
              corregimiento_id: 11,
              nombre_corregimiento: "Amelia Denis de Icaza",
              distrito_id: 2,
            },
            {
              corregimiento_id: 12,
              nombre_corregimiento: "Belisario Frías",
              distrito_id: 2,
            },
            {
              corregimiento_id: 13,
              nombre_corregimiento: "José Domingo Espinar",
              distrito_id: 2,
            },
            {
              corregimiento_id: 14,
              nombre_corregimiento: "Mateo Iturralde",
              distrito_id: 2,
            },
            {
              corregimiento_id: 15,
              nombre_corregimiento: "Omar Torrijos",
              distrito_id: 2,
            },
            {
              corregimiento_id: 16,
              nombre_corregimiento: "Rufina Alfaro",
              distrito_id: 2,
            },
            {
              corregimiento_id: 17,
              nombre_corregimiento: "Villa Lucre",
              distrito_id: 2,
            },
          ],
          3: [
            // Arraiján
            {
              corregimiento_id: 18,
              nombre_corregimiento: "Arraiján",
              distrito_id: 3,
            },
            {
              corregimiento_id: 19,
              nombre_corregimiento: "Nuevo Chorrillo",
              distrito_id: 3,
            },
            {
              corregimiento_id: 20,
              nombre_corregimiento: "Veracruz",
              distrito_id: 3,
            },
          ],
          4: [
            // La Chorrera
            {
              corregimiento_id: 21,
              nombre_corregimiento: "La Chorrera",
              distrito_id: 4,
            },
            {
              corregimiento_id: 22,
              nombre_corregimiento: "Barrio Balboa",
              distrito_id: 4,
            },
            {
              corregimiento_id: 23,
              nombre_corregimiento: "El Coco",
              distrito_id: 4,
            },
          ],
          6: [
            // Penonomé
            {
              corregimiento_id: 24,
              nombre_corregimiento: "Penonomé",
              distrito_id: 6,
            },
            {
              corregimiento_id: 25,
              nombre_corregimiento: "Coclé",
              distrito_id: 6,
            },
            {
              corregimiento_id: 26,
              nombre_corregimiento: "Río Grande",
              distrito_id: 6,
            },
          ],
          11: [
            // David
            {
              corregimiento_id: 27,
              nombre_corregimiento: "David",
              distrito_id: 11,
            },
            {
              corregimiento_id: 28,
              nombre_corregimiento: "Pedregal",
              distrito_id: 11,
            },
            {
              corregimiento_id: 29,
              nombre_corregimiento: "San Carlos",
              distrito_id: 11,
            },
            {
              corregimiento_id: 30,
              nombre_corregimiento: "San Pablo Nuevo",
              distrito_id: 11,
            },
          ],
        };

        response = {
          success: true,
          data: corregimientosEstaticos[distritoId] || [],
        };
      }

      if (response.success && response.data.length > 0) {
        selectCorregimiento.innerHTML = `
          <option value="">Seleccionar corregimiento</option>
          ${response.data
            .map(
              (corregimiento) => `
              <option value="${
                corregimiento.corregimiento_id || corregimiento.id
              }">
                ${corregimiento.nombre_corregimiento || corregimiento.nombre}
              </option>
          `
            )
            .join("")}
        `;
        selectCorregimiento.disabled = false;
        console.log(
          `✅ ${response.data.length} corregimientos cargados para distrito ${distritoId}`
        );
      } else {
        console.warn(
          `⚠️ No se encontraron corregimientos para distrito ${distritoId}`
        );
        selectCorregimiento.innerHTML =
          '<option value="">No hay corregimientos disponibles</option>';
        selectCorregimiento.disabled = true;
      }
    } catch (error) {
      console.error("Error al cargar corregimientos:", error);
      this.mostrarError("Error al cargar los corregimientos");
    }
  }

  // ===============================
  // GESTIÓN DE DIRECCIONES
  // ===============================

  // Función para verificar si la dirección ha cambiado
  async verificarCambioDireccion(datosCliente, direccionId) {
    try {
      // Si no tenemos datos de dirección nuevos, no hay cambio (mantener originales)
      if (!datosCliente.corregimientoId && !datosCliente.detalleDireccion) {
        console.log(
          "🔍 No hay datos de dirección en el formulario, manteniendo originales"
        );
        return false;
      }

      // Si solo tenemos algunos datos, usar los originales para los faltantes
      const corregimientoIdNuevo = datosCliente.corregimientoId
        ? parseInt(datosCliente.corregimientoId)
        : this.clienteEditando.corregimiento_id;

      const detalleNuevo = datosCliente.detalleDireccion
        ? datosCliente.detalleDireccion.trim()
        : this.clienteEditando.detalle_direccion || "";

      const corregimientoIdOriginal = this.clienteEditando.corregimiento_id;
      const detalleOriginal = this.clienteEditando.detalle_direccion || "";

      const cambio =
        corregimientoIdNuevo !== corregimientoIdOriginal ||
        detalleNuevo !== detalleOriginal;

      console.log("🔍 Verificando cambio de dirección:", {
        original: {
          corregimiento_id: corregimientoIdOriginal,
          detalle: detalleOriginal,
        },
        nuevo: {
          corregimiento_id: corregimientoIdNuevo,
          detalle: detalleNuevo,
        },
        cambio,
      });

      return cambio;
    } catch (error) {
      console.error("Error al verificar cambio de dirección:", error);
      return false; // En caso de error, no cambiar
    }
  }

  // Función para actualizar una dirección existente
  async actualizarDireccion(direccionId, datosDireccion) {
    try {
      console.log(
        `🔄 Actualizando dirección ${direccionId} con datos:`,
        datosDireccion
      );

      const response = await window.apiClient.put(
        `/direcciones/${direccionId}`,
        datosDireccion
      );

      console.log("📋 Respuesta del servidor:", response);

      // Verificar si la respuesta indica éxito
      if (
        response.success === true ||
        response.message?.includes("exitosamente")
      ) {
        console.log("✅ Dirección actualizada exitosamente");
        return true;
      } else {
        throw new Error(
          response.message || response.error || "Error al actualizar dirección"
        );
      }
    } catch (error) {
      console.error("Error al actualizar dirección:", error);

      // Si el mensaje de error contiene "exitosamente", es en realidad un éxito mal manejado
      if (error.message && error.message.includes("exitosamente")) {
        console.log(
          "⚠️ Éxito detectado erróneamente como error, procesando como éxito"
        );
        console.log("✅ Dirección actualizada exitosamente");
        return true;
      } else {
        throw error;
      }
    }
  }

  async crearDireccion(datosDireccion) {
    try {
      console.log("🔄 Creando dirección con datos:", datosDireccion);

      const response = await window.apiClient.post(
        "/direcciones",
        datosDireccion
      );

      console.log("📋 Respuesta del servidor:", response);

      // Verificar si tenemos el ID de la dirección creada
      if (response.direccion_id) {
        console.log(
          "✅ Dirección creada exitosamente con ID:",
          response.direccion_id
        );
        return response.direccion_id;
      } else {
        throw new Error("No se recibió el ID de la dirección creada");
      }
    } catch (error) {
      console.error("Error al crear dirección:", error);

      // Si el mensaje de error contiene "exitosamente" pero no tenemos el ID, necesitamos manejar esto
      if (error.message && error.message.includes("exitosamente")) {
        console.log("⚠️ Mensaje de éxito detectado pero sin ID de dirección");
        throw new Error(
          "Error al obtener el ID de la dirección creada, aunque la creación fue exitosa"
        );
      } else {
        throw new Error("Error al crear la dirección: " + error.message);
      }
    }
  }

  async cargarTiposClientes() {
    try {
      // Cargar tipos de clientes desde la API
      let response;
      try {
        response = await window.apiClient.get("/tipos_clientes");
      } catch (apiError) {
        console.warn(
          "API tipos clientes no disponible, usando datos estáticos"
        );
        // Fallback a datos estáticos si la API no está disponible
        response = {
          success: true,
          data: [
            { tipo_cliente_id: 1, descripcion_tipo: "NATURAL" },
            { tipo_cliente_id: 2, descripcion_tipo: "CORPORATIVO" },
          ],
        };
      }

      if (response.success) {
        const selectTipo = document.getElementById("tipoClienteId");
        const selectFiltroTipo = document.getElementById("filterTipoCliente");

        // Opciones para el formulario (usando IDs)
        const tiposOptions = `
          <option value="">Seleccionar tipo</option>
          ${response.data
            .map(
              (tipo) => `
              <option value="${tipo.tipo_cliente_id || tipo.id}">${
                tipo.descripcion_tipo || tipo.nombre
              }</option>
          `
            )
            .join("")}
        `;

        // Opciones para el filtro (usando nombres/descripciones)
        const filtroOptions = `
          <option value="">Todos los tipos</option>
          ${response.data
            .map(
              (tipo) => `
              <option value="${tipo.descripcion_tipo || tipo.nombre}">${
                tipo.descripcion_tipo || tipo.nombre
              }</option>
          `
            )
            .join("")}
        `;

        if (selectTipo) {
          selectTipo.innerHTML = tiposOptions;
        }

        if (selectFiltroTipo) {
          selectFiltroTipo.innerHTML = filtroOptions;
        }
      }
    } catch (error) {
      console.error("Error al cargar tipos de clientes:", error);
      // Mantener opciones por defecto en caso de error
    }
  }

  async cargarNacionalidades() {
    try {
      // Cargar nacionalidades desde la API
      let response;
      try {
        response = await window.apiClient.get("/nacionalidades");
      } catch (apiError) {
        console.warn(
          "API nacionalidades no disponible, usando datos de ejemplo"
        );

        // Fallback a datos de ejemplo si están disponibles
        if (window.DATOS_EJEMPLO) {
          response = await window.DATOS_EJEMPLO.simularRespuestaAPI(
            window.DATOS_EJEMPLO.nacionalidades,
            200
          );
        } else {
          // Fallback final a datos estáticos básicos
          response = {
            success: true,
            data: [
              { nacionalidad_id: 1, nombre_nacionalidad: "Panameña" },
              { nacionalidad_id: 2, nombre_nacionalidad: "Extranjera" },
            ],
          };
        }
      }

      if (response.success) {
        const selectNacionalidad = document.getElementById("nacionalidadId");
        if (selectNacionalidad) {
          selectNacionalidad.innerHTML = `
            <option value="">Seleccionar nacionalidad</option>
            ${response.data
              .map(
                (nac) => `
                <option value="${nac.nacionalidad_id || nac.id}">
                  ${nac.nombre_nacionalidad || nac.nombre}
                </option>
            `
              )
              .join("")}
          `;
        }
      }
    } catch (error) {
      console.error("Error al cargar nacionalidades:", error);
      // Mantener opción por defecto si hay error
    }
  }

  // ===============================
  // UTILIDADES Y HELPERS
  // ===============================

  // Función para probar la carga de selectores manualmente (útil para debugging)
  async probarCargaSelectores() {
    console.log("🧪 Probando carga manual de selectores...");

    try {
      // Probar provincias
      console.log("1️⃣ Probando provincias...");
      await this.cargarProvincias();

      // Probar distritos (usando provincia 1 - Panamá)
      console.log("2️⃣ Probando distritos para Panamá...");
      await this.cargarDistritos(1);

      // Probar corregimientos (usando distrito 1 - Panamá)
      console.log("3️⃣ Probando corregimientos para Panamá...");
      await this.cargarCorregimientos(1);

      // Verificar estado final
      this.verificarSelectores();

      console.log("✅ Prueba de carga completada");
    } catch (error) {
      console.error("❌ Error en prueba de carga:", error);
    }
  }

  // Función para recargar todos los datos
  async recargarTodosLosDatos() {
    console.log("🔄 Recargando todos los datos...");

    try {
      await this.cargarTiposClientes();
      await this.cargarNacionalidades();
      await this.cargarProvincias();
      await this.cargarClientes();

      console.log("✅ Todos los datos recargados exitosamente");
      this.verificarSelectores();
    } catch (error) {
      console.error("❌ Error al recargar datos:", error);
      this.mostrarError("Error al recargar los datos: " + error.message);
    }
  }

  // Función para resetear completamente el estado del módulo
  resetearEstado() {
    this.clienteEditando = null;
    this.currentPage = 1;

    // Cerrar modal si está abierto
    if (this.modal && !this.modal.classList.contains("hidden")) {
      this.cerrarModal();
    }

    // Limpiar filtros
    this.limpiarFiltros();

    console.log("🔄 Estado del módulo reseteado");
  }

  getIniciales(primerNombre, primerApellido) {
    const inicial1 = primerNombre ? primerNombre.charAt(0).toUpperCase() : "";
    const inicial2 = primerApellido
      ? primerApellido.charAt(0).toUpperCase()
      : "";
    return inicial1 + inicial2;
  }

  getNombreCompleto(cliente) {
    const nombres = [
      cliente.primer_nombre,
      cliente.segundo_nombre,
      cliente.primer_apellido,
      cliente.segundo_apellido,
    ].filter(Boolean);
    return nombres.join(" ") || "Sin nombre";
  }

  getTipoClienteStyle(tipo) {
    switch (tipo) {
      case "NATURAL":
        return "bg-green-100 text-green-800";
      case "CORPORATIVO":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  getEstadoStyle(estado) {
    switch (estado) {
      case "ACTIVO":
        return "bg-green-100 text-green-800";
      case "INACTIVO":
        return "bg-yellow-100 text-yellow-800";
      case "ELIMINADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  formatearFecha(fecha) {
    if (!fecha) return "N/A";
    try {
      return new Date(fecha).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  }

  // ===============================
  // NOTIFICACIONES
  // ===============================

  mostrarExito(mensaje) {
    if (window.toastManager) {
      window.toastManager.show(mensaje, "success");
    } else {
      alert(mensaje);
    }
  }

  mostrarError(mensaje) {
    if (window.toastManager) {
      window.toastManager.show(mensaje, "error");
    } else {
      alert(mensaje);
    }
  }

  mostrarInfo(mensaje) {
    if (window.toastManager) {
      window.toastManager.show(mensaje, "info");
    } else {
      alert(mensaje);
    }
  }
}

// Inicializar el manager cuando el DOM esté listo
let clientesManager;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar directamente sin esperar componentes globales
  clientesManager = new ClientesManager();

  // Hacer disponible globalmente para las acciones de la tabla
  window.clientesManager = clientesManager;

  console.log("Módulo Clientes cargado completamente - Modo independiente");
});

// Exportar para uso global
window.ClientesManager = ClientesManager;
