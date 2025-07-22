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
    this.setupComponents();
    this.setupEventListeners();
    await this.cargarTiposClientes();
    await this.cargarNacionalidades();
    await this.cargarProvincias();
    await this.cargarClientes();
    console.log("Módulo de Clientes inicializado");
  }

  setupComponents() {
    // Inicializar modal component
    this.modal = new ModalComponent("modalCliente");
    this.modal.onClose(() => {
      this.clienteEditando = null;
      if (this.form) {
        this.form.reset();
      }
    });

    // Inicializar form component
    this.form = new FormComponent("formCliente", {
      validation: true,
      realTimeValidation: true,
      showErrorMessages: true,
    });

    // Agregar validaciones personalizadas
    this.form.addValidator(
      "numeroCedula",
      "cedula",
      (value) => {
        if (!value) return true;
        // Validación básica de formato de cédula panameña
        const cedulaRegex = /^[0-9]{1,2}-[0-9]{1,4}-[0-9]{1,6}$/;
        return cedulaRegex.test(value);
      },
      "Formato de cédula inválido (Ej: 8-123-456)"
    );

    // Callback para submit del formulario
    this.form.onSubmit(async (formData) => {
      this.form.showSubmitLoading();
      try {
        await this.guardarCliente(formData);
      } finally {
        this.form.hideSubmitLoading();
      }
    });
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
      // Primero, crear la dirección si es un cliente nuevo
      let direccionId = null;

      if (!this.clienteEditando) {
        // Cliente nuevo: crear dirección primero
        direccionId = await this.crearDireccion({
          corregimiento_id: parseInt(datosCliente.corregimientoId),
          detalle_direccion: datosCliente.detalleDireccion,
        });
        console.log("✅ Dirección creada con ID:", direccionId);
      } else {
        // Cliente existente: usar direccion_id existente o crear nueva si cambió
        direccionId = this.clienteEditando.direccion_id;
        // TODO: Implementar lógica para actualizar dirección si cambió
      }

      // Transformar los datos del formulario al formato del backend
      const datosBackend = {
        primer_nombre: datosCliente.primerNombre,
        segundo_nombre: datosCliente.segundoNombre || null,
        primer_apellido: datosCliente.primerApellido,
        segundo_apellido: datosCliente.segundoApellido || null,
        numero_cedula: datosCliente.numeroCedula,
        telefono: datosCliente.telefono,
        email: datosCliente.email,
        sexo: datosCliente.sexo,
        tipo_cliente_id: parseInt(datosCliente.tipoClienteId),
        direccion_id: direccionId, // Usar el ID de la dirección creada
        nacionalidad_id: parseInt(datosCliente.nacionalidadId),
        estado: datosCliente.estado || "ACTIVO",
      };

      console.log("Datos del formulario recibidos:", datosCliente);
      console.log("Datos transformados para enviar al backend:", datosBackend);

      // Validar campos obligatorios antes de enviar
      const camposObligatorios = [
        "primer_nombre",
        "primer_apellido",
        "numero_cedula",
        "telefono",
        "email",
        "sexo",
        "tipo_cliente_id",
        "direccion_id",
        "nacionalidad_id",
      ];

      // Validación más específica para cada campo
      const erroresValidacion = [];

      // Validar campos de texto
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

      // Validar campos numéricos
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
        erroresValidacion.push("Nacionalidad es obligatoria y debe ser válida");
      }

      // Validar campos de dirección (solo para clientes nuevos)
      if (!this.clienteEditando) {
        if (
          !datosCliente.corregimientoId ||
          isNaN(parseInt(datosCliente.corregimientoId))
        ) {
          erroresValidacion.push("Debe seleccionar un corregimiento válido");
        }
        if (
          !datosCliente.detalleDireccion ||
          datosCliente.detalleDireccion.trim() === ""
        ) {
          erroresValidacion.push("Detalle de dirección es obligatorio");
        }
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
        this.mostrarExito(
          this.clienteEditando
            ? "Cliente actualizado exitosamente"
            : "Cliente creado exitosamente"
        );
        this.modal.close();
        await this.cargarClientes();
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
    }
  }

  async eliminarCliente(clienteId) {
    const confirmado = await ModalFactory.createConfirmModal(
      "¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.",
      {
        confirmText: "Eliminar",
        cancelText: "Cancelar",
      }
    );

    if (!confirmado) return;

    try {
      const response = await window.apiClient.delete(`/clientes/${clienteId}`);

      if (response.success) {
        this.mostrarExito("Cliente eliminado exitosamente");
        await this.cargarClientes();
      } else {
        throw new Error(response.message || "Error al eliminar cliente");
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      this.mostrarError("Error al eliminar cliente: " + error.message);
    }
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
  // MODAL Y FORMULARIOS
  // ===============================

  abrirModalNuevo() {
    this.clienteEditando = null;
    this.modal.setTitle("Nuevo Cliente");
    this.form.reset();
    this.mostrarCamposDireccion();
    this.modal.open();
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

        // Mapear los datos del cliente a los nombres exactos de los campos del formulario
        const formData = {
          // Campos de identificación
          cliente_id: cliente.cliente_id,

          // Nombres y apellidos
          primerNombre: cliente.primer_nombre || "",
          segundoNombre: cliente.segundo_nombre || "",
          primerApellido: cliente.primer_apellido || "",
          segundoApellido: cliente.segundo_apellido || "",

          // Documento y contacto

          telefono: cliente.telefono || "",
          email: cliente.email || "",

          // Otros datos
          tipoClienteId: cliente.tipo_cliente_id || "",
        };

        console.log("Datos mapeados para el formulario:", formData);

        this.clienteEditando = formData;
        this.modal.setTitle("Editar Cliente");
        this.form.setData(formData);

        // Para edición, ocultar los campos de ubicación geográfica ya que la dirección ya existe
        this.ocultarCamposDireccion();

        this.modal.open();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al cargar cliente:", error);
      this.mostrarError("Error al cargar los datos del cliente");
    }
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
      const response = await window.apiClient.get("/provincias");
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
      let response;
      try {
        response = await window.apiClient.get(
          `/distritos?provincia_id=${provinciaId}`
        );
      } catch (apiError) {
        console.warn("API distritos no disponible, usando datos estáticos");
        response = {
          success: true,
          data: [
            { distrito_id: 1, nombre_distrito: "Panamá", provincia_id: 1 },
            {
              distrito_id: 2,
              nombre_distrito: "San Miguelito",
              provincia_id: 1,
            },
          ].filter((d) => d.provincia_id == provinciaId),
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

        // Limpiar corregimientos
        selectCorregimiento.innerHTML =
          '<option value="">Seleccionar corregimiento</option>';
        selectCorregimiento.disabled = true;
      }
    } catch (error) {
      console.error("Error al cargar distritos:", error);
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
      let response;
      try {
        response = await window.apiClient.get(
          `/corregimientos?distrito_id=${distritoId}`
        );
      } catch (apiError) {
        console.warn(
          "API corregimientos no disponible, usando datos estáticos"
        );
        response = {
          success: true,
          data: [
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
          ].filter((c) => c.distrito_id == distritoId),
        };
      }

      if (response.success) {
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
      }
    } catch (error) {
      console.error("Error al cargar corregimientos:", error);
    }
  }

  async crearDireccion(datosDireccion) {
    try {
      console.log("Creando dirección con datos:", datosDireccion);

      const response = await window.apiClient.post(
        "/direcciones",
        datosDireccion
      );

      if (response.direccion_id) {
        return response.direccion_id;
      } else {
        throw new Error("No se recibió el ID de la dirección creada");
      }
    } catch (error) {
      console.error("Error al crear dirección:", error);
      throw new Error("Error al crear la dirección: " + error.message);
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
    if (window.ToastManager) {
      window.ToastManager.show(mensaje, "success");
    } else {
      alert(mensaje);
    }
  }

  mostrarError(mensaje) {
    if (window.ToastManager) {
      window.ToastManager.show(mensaje, "error");
    } else {
      alert(mensaje);
    }
  }

  mostrarInfo(mensaje) {
    if (window.ToastManager) {
      window.ToastManager.show(mensaje, "info");
    } else {
      alert(mensaje);
    }
  }
}

// Inicializar el manager cuando el DOM esté listo
let clientesManager;

document.addEventListener("DOMContentLoaded", async () => {
  // Esperar a que los componentes globales estén listos
  if (window.loadCommonComponents) {
    await window.loadCommonComponents();
  }

  // Inicializar el manager de clientes
  clientesManager = new ClientesManager();

  // Hacer disponible globalmente para las acciones de la tabla
  window.clientesManager = clientesManager;

  console.log("Módulo Clientes cargado completamente");
});

// Exportar para uso global
window.ClientesManager = ClientesManager;
