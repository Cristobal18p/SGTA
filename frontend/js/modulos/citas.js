// ============================================
// MÓDULO DE CITAS - TecnoTaller
// Gestión completa de citas del sistema
// ============================================

class CitasModule {
  constructor() {
    this.citas = [];
    this.filteredCitas = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 0;

    // Referencias a elementos del DOM
    this.modal = null;
    this.form = null;
    this.tabla = null;
    this.modalDetalle = null;
    this.vistaCalendario = null;
    this.vistaTabla = null;

    // Estado del formulario
    this.editMode = false;
    this.currentCitaId = null;

    // Estado de la vista
    this.vistaActual = "tabla"; // 'tabla' o 'calendario'
    this.fechaCalendario = new Date();

    // Cache para selectores
    this.clientes = [];
    this.vehiculos = [];
    this.sucursales = [];
    this.servicios = [];

    // Configuración de la API
    this.baseUrl = window.location.origin;

    this.init();
  }

  async init() {
    console.log("📅 Inicializando módulo de citas...");

    // Esperar a que el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    console.log("Configurando elementos del DOM...");
    console.log("URL base:", this.baseUrl);

    // Referencias a elementos del DOM
    this.modal = document.getElementById("modalCita");
    this.form = document.getElementById("formCita");
    this.tabla = document.getElementById("tablaCitas");
    this.modalDetalle = document.getElementById("modalDetalleCita");
    this.vistaCalendario = document.getElementById("vistaCalendario");
    this.vistaTabla = document.getElementById("vistaTabla");

    console.log("🔧 Modal encontrado:", !!this.modal);
    console.log("🔧 Formulario encontrado:", !!this.form);
    console.log("🔧 Tabla encontrada:", !!this.tabla);
    console.log("🔧 Modal detalle encontrado:", !!this.modalDetalle);
    console.log("🔧 Vista calendario encontrada:", !!this.vistaCalendario);
    console.log("🔧 Vista tabla encontrada:", !!this.vistaTabla);

    // Configurar event listeners
    this.setupEventListeners();

    // Cargar datos iniciales
    this.loadInitialData();
  }

  setupEventListeners() {
    // Botón nueva cita
    const btnNueva = document.getElementById("btnNuevaCita");
    if (btnNueva) {
      btnNueva.addEventListener("click", () => this.showCreateModal());
    }

    // Botón vista calendario
    const btnVistaCalendario = document.getElementById("btnVistaCalendario");
    if (btnVistaCalendario) {
      btnVistaCalendario.addEventListener("click", () => this.toggleVista());
    }

    // Modal: cerrar
    const btnCerrar = document.getElementById("btnCerrarModal");
    if (btnCerrar) {
      btnCerrar.addEventListener("click", () => this.closeModal());
    }

    const btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => this.closeModal());
    }

    // Modal detalle: cerrar
    const btnCerrarModalDetalle = document.getElementById(
      "btnCerrarModalDetalle"
    );
    if (btnCerrarModalDetalle) {
      btnCerrarModalDetalle.addEventListener("click", () =>
        this.closeModalDetalle()
      );
    }

    const btnCerrarDetalle = document.getElementById("btnCerrarDetalle");
    if (btnCerrarDetalle) {
      btnCerrarDetalle.addEventListener("click", () =>
        this.closeModalDetalle()
      );
    }

    // Navegación del calendario
    const btnMesAnterior = document.getElementById("btnMesAnterior");
    if (btnMesAnterior) {
      btnMesAnterior.addEventListener("click", () => this.mesAnterior());
    }

    const btnMesSiguiente = document.getElementById("btnMesSiguiente");
    if (btnMesSiguiente) {
      btnMesSiguiente.addEventListener("click", () => this.mesSiguiente());
    }

    const btnHoy = document.getElementById("btnHoy");
    if (btnHoy) {
      btnHoy.addEventListener("click", () => this.irAHoy());
    }

    // Formulario: submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Búsqueda y filtros
    const searchInput = document.getElementById("searchCita");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.filterCitas());
    }

    const filterEstado = document.getElementById("filterEstado");
    if (filterEstado) {
      filterEstado.addEventListener("change", () => this.filterCitas());
    }

    const filterSucursal = document.getElementById("filterSucursal");
    if (filterSucursal) {
      filterSucursal.addEventListener("change", () => this.filterCitas());
    }

    const filterTipo = document.getElementById("filterTipoCita");
    if (filterTipo) {
      filterTipo.addEventListener("change", () => this.filterCitas());
    }

    const btnLimpiar = document.getElementById("btnLimpiarFiltros");
    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", () => this.clearFilters());
    }

    // Paginación
    const btnAnterior = document.getElementById("btnAnterior");
    if (btnAnterior) {
      btnAnterior.addEventListener("click", () => this.previousPage());
    }

    const btnSiguiente = document.getElementById("btnSiguiente");
    if (btnSiguiente) {
      btnSiguiente.addEventListener("click", () => this.nextPage());
    }

    // Selector de cliente - cargar vehículos
    const clienteSelect = document.getElementById("clienteId");
    if (clienteSelect) {
      clienteSelect.addEventListener("change", (e) =>
        this.loadVehiculosByCliente(e.target.value)
      );
    }

    // Cerrar modal con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (!this.modal?.classList.contains("hidden")) {
          this.closeModal();
        }
        if (!this.modalDetalle?.classList.contains("hidden")) {
          this.closeModalDetalle();
        }
      }
    });

    // Cerrar modal al hacer clic fuera
    if (this.modal) {
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    if (this.modalDetalle) {
      this.modalDetalle.addEventListener("click", (e) => {
        if (e.target === this.modalDetalle) {
          this.closeModalDetalle();
        }
      });
    }

    // Event listeners para servicios
    this.setupServiciosEventListeners();
  }

  setupServiciosEventListeners() {
    // Botón agregar servicio
    const btnAgregarServicio = document.getElementById("btnAgregarServicio");
    if (btnAgregarServicio) {
      btnAgregarServicio.addEventListener("click", () =>
        this.agregarServicio()
      );
    }

    // Delegación de eventos para servicios dinámicos
    const serviciosContainer = document.getElementById("serviciosContainer");
    if (serviciosContainer) {
      // Cambio en selector de servicio - autocompletar precio
      serviciosContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("servicio-select")) {
          this.onServicioSelectChange(e.target);
        }
      });

      // Eliminar servicio
      serviciosContainer.addEventListener("click", (e) => {
        if (e.target.closest(".btn-eliminar-servicio")) {
          this.eliminarServicio(e.target.closest(".btn-eliminar-servicio"));
        }
      });
    }
  }

  async loadInitialData() {
    try {
      console.log("📊 Cargando datos iniciales...");

      // Verificar que el servidor esté disponible
      await this.checkServerHealth();

      // Cargar datos en paralelo
      await Promise.all([this.loadCitas(), this.loadSelectorsData()]);

      // Cargar estadísticas después de tener las citas cargadas
      await this.loadEstadisticas();

      console.log("✅ Datos iniciales cargados correctamente");
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);

      // Intentar cargar al menos las estadísticas locales si hay datos
      if (this.citas && this.citas.length > 0) {
        console.log("🔄 Intentando calcular estadísticas locales...");
        this.calcularEstadisticasLocales();
      }

      this.showToast(
        "Error al cargar los datos iniciales. Verifique que el servidor esté corriendo en el puerto 3000.",
        "error"
      );
    }
  }

  async checkServerHealth() {
    try {
      console.log("🔍 Verificando estado del servidor...");
      const response = await fetch(`${this.baseUrl}/api/citas`);
      if (response.ok) {
        console.log("✅ Servidor respondiendo correctamente");
      } else {
        throw new Error(`Servidor respondió con estado: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error de conectividad del servidor:", error);
      throw new Error(
        "No se puede conectar al servidor. Verifique que esté corriendo en el puerto 3000."
      );
    }
  }

  async loadSelectorsData() {
    try {
      console.log("📋 Cargando datos para selectores...");

      // Cargar clientes desde el endpoint correcto que incluye todos los datos relacionados
      console.log("🔄 Cargando clientes desde la API...");
      try {
        const clientesData = await this.apiCall("/api/clientes/modulo");
        console.log("📋 Respuesta de clientes/modulo:", clientesData);

        // Extraer el array de clientes de la respuesta
        if (Array.isArray(clientesData)) {
          this.clientes = clientesData;
        } else if (clientesData && Array.isArray(clientesData.data)) {
          this.clientes = clientesData.data;
        } else if (clientesData && Array.isArray(clientesData.clientes)) {
          this.clientes = clientesData.clientes;
        } else if (clientesData && typeof clientesData === "object") {
          // Buscar arrays en la respuesta (para compatibilidad con diferentes estructuras)
          const possibleArrays = Object.values(clientesData).filter(
            Array.isArray
          );
          this.clientes = possibleArrays.length > 0 ? possibleArrays[0] : [];
        } else {
          this.clientes = [];
        }

        console.log(`✅ ${this.clientes.length} clientes cargados`);
      } catch (error) {
        console.error("❌ Error cargando clientes:", error);
        this.clientes = [];
      }

      // Cargar vehículos con información del cliente
      console.log("🔄 Cargando vehículos...");
      try {
        const vehiculosData = await this.apiCall("/api/vehiculos");
        console.log("📋 Respuesta de vehículos:", vehiculosData);

        // Extraer el array de vehículos de la respuesta
        if (Array.isArray(vehiculosData)) {
          this.vehiculos = vehiculosData;
        } else if (vehiculosData && Array.isArray(vehiculosData.data)) {
          this.vehiculos = vehiculosData.data;
        } else if (vehiculosData && Array.isArray(vehiculosData.vehiculos)) {
          this.vehiculos = vehiculosData.vehiculos;
        } else {
          this.vehiculos = [];
        }

        console.log(`✅ ${this.vehiculos.length} vehículos cargados`);
      } catch (error) {
        console.error("❌ Error cargando vehículos:", error);
        this.vehiculos = [];
      }

      // Cargar sucursales
      console.log("🔄 Cargando sucursales...");
      try {
        const sucursalesData = await this.apiCall("/api/sucursales");
        console.log("📋 Respuesta de sucursales:", sucursalesData);

        // Extraer el array de sucursales de la respuesta
        if (Array.isArray(sucursalesData)) {
          this.sucursales = sucursalesData;
        } else if (sucursalesData && Array.isArray(sucursalesData.data)) {
          this.sucursales = sucursalesData.data;
        } else if (sucursalesData && Array.isArray(sucursalesData.sucursales)) {
          this.sucursales = sucursalesData.sucursales;
        } else {
          this.sucursales = [];
        }

        console.log(`✅ ${this.sucursales.length} sucursales cargadas`);
      } catch (error) {
        console.error("❌ Error cargando sucursales:", error);
        this.sucursales = [];
      }

      // Cargar servicios
      console.log("🔄 Cargando servicios...");
      try {
        const serviciosData = await this.apiCall("/api/servicios");
        console.log("📋 Respuesta de servicios:", serviciosData);

        // Extraer el array de servicios de la respuesta
        if (Array.isArray(serviciosData)) {
          this.servicios = serviciosData;
        } else if (serviciosData && Array.isArray(serviciosData.data)) {
          this.servicios = serviciosData.data;
        } else if (serviciosData && Array.isArray(serviciosData.servicios)) {
          this.servicios = serviciosData.servicios;
        } else {
          this.servicios = [];
        }

        console.log(`✅ ${this.servicios.length} servicios cargados`);
      } catch (error) {
        console.error("❌ Error cargando servicios:", error);
        this.servicios = [];
      }

      // Poblar selectores con los datos disponibles
      this.populateClienteSelector();
      this.populateSucursalSelector();
      this.populateServiciosSelector();
      this.populateFilterSelectors();

      console.log("✅ Datos de selectores procesados");
    } catch (error) {
      console.error("❌ Error general cargando datos de selectores:", error);
    }
  }

  async loadVehiculosByCliente(clienteId) {
    if (!clienteId) {
      this.clearVehiculoSelector();
      return;
    }

    try {
      console.log(`🔄 Cargando vehículos para cliente ID: ${clienteId}`);

      // Filtrar vehículos por cliente ID
      const vehiculosCliente = this.vehiculos.filter((vehiculo) => {
        const vehiculoClienteId = vehiculo.CLIENTE_ID || vehiculo.cliente_id;
        return vehiculoClienteId == clienteId;
      });

      console.log(
        `📋 Vehículos encontrados para cliente ${clienteId}:`,
        vehiculosCliente
      );

      this.populateVehiculoSelector(vehiculosCliente);

      if (vehiculosCliente.length === 0) {
        console.log(
          `⚠️ No se encontraron vehículos para el cliente ${clienteId}`
        );
        this.showToast(
          "El cliente seleccionado no tiene vehículos registrados",
          "warning"
        );
      }
    } catch (error) {
      console.error("❌ Error cargando vehículos del cliente:", error);
      this.clearVehiculoSelector();
      this.showToast("Error al cargar los vehículos del cliente", "error");
    }
  }

  populateClienteSelector() {
    const selector = document.getElementById("clienteId");
    if (!selector) {
      console.error("❌ Selector clienteId no encontrado en el DOM");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar cliente</option>';

    if (!Array.isArray(this.clientes)) {
      console.error("❌ this.clientes no es un array:", this.clientes);
      return;
    }

    console.log(
      `📋 Poblando selector de clientes con ${this.clientes.length} opciones`
    );

    this.clientes.forEach((cliente) => {
      const option = document.createElement("option");

      // Usar los campos correctos de la API
      const clienteId = cliente.CLIENTE_ID || cliente.cliente_id;
      const primerNombre = cliente.PRIMER_NOMBRE || cliente.primer_nombre || "";
      const segundoNombre =
        cliente.SEGUNDO_NOMBRE || cliente.segundo_nombre || "";
      const primerApellido =
        cliente.PRIMER_APELLIDO || cliente.primer_apellido || "";
      const segundoApellido =
        cliente.SEGUNDO_APELLIDO || cliente.segundo_apellido || "";
      const cedula = cliente.NUMERO_CEDULA || cliente.numero_cedula || "";

      option.value = clienteId;

      // Crear nombre completo
      const nombreCompleto =
        `${primerNombre} ${segundoNombre} ${primerApellido} ${segundoApellido}`.trim();
      const textoOpcion = cedula
        ? `${nombreCompleto} - ${cedula}`
        : nombreCompleto;

      option.textContent = textoOpcion;
      selector.appendChild(option);
    });

    console.log(
      `✅ Selector de clientes poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  populateVehiculoSelector(vehiculos = []) {
    const selector = document.getElementById("vehiculoId");
    if (!selector) {
      console.error("❌ Selector vehiculoId no encontrado en el DOM");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar vehículo</option>';

    console.log(
      `📋 Poblando selector de vehículos con ${vehiculos.length} opciones`
    );

    if (vehiculos.length === 0) {
      const optionNoVehiculos = document.createElement("option");
      optionNoVehiculos.value = "";
      optionNoVehiculos.textContent = "No hay vehículos disponibles";
      optionNoVehiculos.disabled = true;
      selector.appendChild(optionNoVehiculos);
      return;
    }

    vehiculos.forEach((vehiculo) => {
      const option = document.createElement("option");

      // Usar los campos correctos de la API
      const vehiculoId = vehiculo.VEHICULO_ID || vehiculo.vehiculo_id;
      const placa = vehiculo.NUMERO_PLACA || vehiculo.numero_placa || "";
      const modelo = vehiculo.NOMBRE_MODELO || vehiculo.nombre_modelo || "";
      const marca = vehiculo.NOMBRE_MARCA || vehiculo.nombre_marca || "";
      const year = vehiculo.YEAR || vehiculo.year || "";

      option.value = vehiculoId;

      // Crear texto descriptivo del vehículo
      let textoVehiculo = placa;
      if (marca && modelo) {
        textoVehiculo += ` - ${marca} ${modelo}`;
      } else if (modelo) {
        textoVehiculo += ` - ${modelo}`;
      }
      if (year) {
        textoVehiculo += ` (${year})`;
      }

      option.textContent = textoVehiculo || `Vehículo ID: ${vehiculoId}`;
      selector.appendChild(option);
    });

    console.log(
      `✅ Selector de vehículos poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  clearVehiculoSelector() {
    const selector = document.getElementById("vehiculoId");
    if (selector) {
      selector.innerHTML = '<option value="">Seleccionar vehículo</option>';
      console.log("🔄 Selector de vehículos limpiado");
    } else {
      console.error("❌ Selector vehiculoId no encontrado para limpiar");
    }
  }

  populateSucursalSelector() {
    const selector = document.getElementById("sucursalId");
    if (!selector) {
      console.error("❌ Selector sucursalId no encontrado en el DOM");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar sucursal</option>';

    if (!Array.isArray(this.sucursales)) {
      console.error("❌ this.sucursales no es un array:", this.sucursales);
      return;
    }

    console.log(
      `📋 Poblando selector de sucursales con ${this.sucursales.length} opciones`
    );

    this.sucursales.forEach((sucursal) => {
      const option = document.createElement("option");

      // Usar los campos correctos de la API
      const sucursalId = sucursal.SUCURSAL_ID || sucursal.sucursal_id;
      const nombreSucursal =
        sucursal.NOMBRE_SUCURSAL || sucursal.nombre_sucursal || "";

      option.value = sucursalId;
      option.textContent = nombreSucursal;
      selector.appendChild(option);
    });

    console.log(
      `✅ Selector de sucursales poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  populateServiciosSelector() {
    const selectores = document.querySelectorAll(".servicio-select");

    if (selectores.length === 0) {
      console.error("❌ Selectores .servicio-select no encontrados en el DOM");
      return;
    }

    if (!Array.isArray(this.servicios)) {
      console.error("❌ this.servicios no es un array:", this.servicios);
      return;
    }

    console.log(
      `📋 Poblando ${selectores.length} selectores de servicios con ${this.servicios.length} opciones`
    );

    selectores.forEach((selector) => {
      const valorSeleccionado = selector.value; // Conservar selección actual
      selector.innerHTML = '<option value="">Seleccionar servicio</option>';

      this.servicios.forEach((servicio) => {
        const option = document.createElement("option");

        // Usar los campos correctos de la API
        const servicioId = servicio.ID_SERVICIO || servicio.servicio_id;
        const nombreServicio = servicio.NOMBRE || servicio.nombre || "";
        const precioServicio = servicio.PRECIO || servicio.precio || 0;

        option.value = servicioId;
        option.textContent = `${nombreServicio} - $${precioServicio}`;
        option.dataset.precio = precioServicio; // Guardar precio para autocompletar

        // Restaurar selección si existía
        if (servicioId == valorSeleccionado) {
          option.selected = true;
        }

        selector.appendChild(option);
      });
    });

    console.log(`✅ Selectores de servicios poblados`);
  }

  populateFilterSelectors() {
    // Filtro de estados
    const filterEstado = document.getElementById("filterEstado");
    if (filterEstado) {
      filterEstado.innerHTML = '<option value="">Todos los estados</option>';
      const estados = ["AGENDADA", "EN_PROGRESO", "COMPLETADA", "CANCELADA"];
      estados.forEach((estado) => {
        const option = document.createElement("option");
        option.value = estado;
        option.textContent = estado.replace("_", " ");
        filterEstado.appendChild(option);
      });
    }

    // Filtro de sucursales
    const filterSucursal = document.getElementById("filterSucursal");
    if (filterSucursal) {
      filterSucursal.innerHTML =
        '<option value="">Todas las sucursales</option>';
      this.sucursales.forEach((sucursal) => {
        const option = document.createElement("option");
        option.value = sucursal.NOMBRE_SUCURSAL;
        option.textContent = sucursal.NOMBRE_SUCURSAL;
        filterSucursal.appendChild(option);
      });
    }

    // Filtro de tipos
    const filterTipo = document.getElementById("filterTipoCita");
    if (filterTipo) {
      filterTipo.innerHTML = '<option value="">Todos los tipos</option>';
      const tipos = ["MANTENIMIENTO", "REPARACION", "DIAGNOSTICO"];
      tipos.forEach((tipo) => {
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        filterTipo.appendChild(option);
      });
    }
  }

  async loadCitas() {
    try {
      console.log("🔄 Cargando citas...");
      const citas = await this.apiCall("/api/citas");

      console.log("📋 Datos recibidos de la API:", citas);
      console.log("📋 Tipo de datos:", typeof citas);
      console.log("📋 Es array:", Array.isArray(citas));

      if (citas && citas.length > 0) {
        console.log("📋 Primera cita:", citas[0]);
        console.log("📋 Campos de la primera cita:", Object.keys(citas[0]));
      }

      this.citas = citas || [];
      this.filteredCitas = [...this.citas];
      this.updateTable();
      this.updatePagination();

      // Actualizar calendario si está visible
      if (this.vistaActual === "calendario") {
        this.renderCalendario();
      }

      console.log(`✅ ${this.citas.length} citas cargadas`);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      this.showToast("Error al cargar las citas", "error");
    }
  }

  async loadEstadisticas() {
    try {
      console.log("📊 Cargando estadísticas desde la API...");

      const response = await fetch(`${this.baseUrl}/api/citas/estadisticas`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Estadísticas recibidas:", data);

      if (data.success) {
        const stats = data.data.resumen;

        // Actualizar estadísticas en el DOM con valores seguros
        this.updateEstadistica("totalCitas", stats.total_citas || 0);
        this.updateEstadistica("citasPendientes", stats.citas_agendadas || 0);
        this.updateEstadistica(
          "citasCompletadas",
          stats.citas_completadas || 0
        );
        this.updateEstadistica("citasCanceladas", stats.citas_canceladas || 0);
        this.updateEstadistica("citasHoy", stats.citas_hoy || 0);

        // Estadísticas adicionales si existen elementos para ellas
        this.updateEstadistica("citasEnProgreso", stats.citas_en_progreso || 0);
        this.updateEstadistica("citasManana", stats.citas_manana || 0);
        this.updateEstadistica("citasEstaSemana", stats.citas_esta_semana || 0);

        console.log("✅ Estadísticas cargadas desde la API");
        console.log("📊 Stats procesadas:", {
          totalCitas: stats.total_citas,
          citasPendientes: stats.citas_agendadas,
          citasCompletadas: stats.citas_completadas,
          citasCanceladas: stats.citas_canceladas,
          citasHoy: stats.citas_hoy,
        });
      } else {
        throw new Error("Error en la respuesta de estadísticas");
      }
    } catch (error) {
      console.error("❌ Error cargando estadísticas:", error);

      // Fallback: calcular estadísticas desde los datos locales
      console.log(
        "🔄 Calculando estadísticas desde datos locales como fallback..."
      );
      this.calcularEstadisticasLocales();

      // Mostrar toast de advertencia
      this.showToast(
        "Error al cargar estadísticas del servidor. Usando datos locales.",
        "warning"
      );
    }
  }

  calcularEstadisticasLocales() {
    // Método de fallback para calcular estadísticas desde los datos locales
    const total = this.citas.length;
    const agendadas = this.citas.filter(
      (cita) => cita.ESTADO === "AGENDADA"
    ).length;
    const completadas = this.citas.filter(
      (cita) => cita.ESTADO === "COMPLETADA"
    ).length;
    const canceladas = this.citas.filter(
      (cita) => cita.ESTADO === "CANCELADA"
    ).length;
    const enProgreso = this.citas.filter(
      (cita) => cita.ESTADO === "EN_PROGRESO"
    ).length;

    const hoy = new Date().toISOString().split("T")[0];
    const citasHoy = this.citas.filter(
      (cita) => cita.FECHA_CITA && cita.FECHA_CITA.startsWith(hoy)
    ).length;

    // Actualizar estadísticas en el DOM
    this.updateEstadistica("totalCitas", total);
    this.updateEstadistica("citasPendientes", agendadas);
    this.updateEstadistica("citasCompletadas", completadas);
    this.updateEstadistica("citasCanceladas", canceladas);
    this.updateEstadistica("citasHoy", citasHoy);
    this.updateEstadistica("citasEnProgreso", enProgreso);

    console.log("✅ Estadísticas calculadas localmente");
  }

  updateEstadistica(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      // Asegurar que value es un número válido
      const numericValue =
        typeof value === "number" ? value : parseInt(value) || 0;
      element.textContent = numericValue.toLocaleString();
      console.log(`📊 Estadística actualizada: ${elementId} = ${numericValue}`);
    } else {
      console.log(`⚠️ Elemento ${elementId} no encontrado en el DOM`);
    }
  }

  filterCitas() {
    const searchTerm =
      document.getElementById("searchCita")?.value.toLowerCase() || "";
    const estadoFilter = document.getElementById("filterEstado")?.value || "";
    const sucursalFilter =
      document.getElementById("filterSucursal")?.value || "";
    const tipoFilter = document.getElementById("filterTipoCita")?.value || "";

    this.filteredCitas = this.citas.filter((cita) => {
      const cliente = (cita.NOMBRE_CLIENTE || "").toLowerCase();
      const placa = (cita.NUMERO_PLACA || "").toLowerCase();
      const estado = cita.ESTADO || "";
      const sucursal = cita.NOMBRE_SUCURSAL || "";
      const tipo = cita.TIPO_CITA || "";

      const matchSearch =
        !searchTerm ||
        cliente.includes(searchTerm) ||
        placa.includes(searchTerm);

      const matchEstado = !estadoFilter || estado === estadoFilter;
      const matchSucursal = !sucursalFilter || sucursal === sucursalFilter;
      const matchTipo = !tipoFilter || tipo === tipoFilter;

      return matchSearch && matchEstado && matchSucursal && matchTipo;
    });

    this.currentPage = 1;
    this.updateTable();
    this.updatePagination();
  }

  clearFilters() {
    document.getElementById("searchCita").value = "";
    document.getElementById("filterEstado").value = "";
    document.getElementById("filterSucursal").value = "";
    document.getElementById("filterTipoCita").value = "";

    this.filteredCitas = [...this.citas];
    this.currentPage = 1;
    this.updateTable();
    this.updatePagination();
  }

  updateTable() {
    console.log("🔄 Actualizando tabla...");
    console.log("📊 Citas filtradas:", this.filteredCitas.length);

    if (!this.tabla) {
      console.error("❌ Elemento tabla no encontrado");
      return;
    }

    this.tabla.innerHTML = "";

    if (this.filteredCitas.length === 0) {
      console.log("📊 No hay citas para mostrar");
      this.tabla.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-gray-500">
            <i class="fas fa-calendar text-4xl mb-4 opacity-50"></i>
            <p>No se encontraron citas</p>
          </td>
        </tr>
      `;
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const citasPage = this.filteredCitas.slice(startIndex, endIndex);

    console.log(
      `📊 Mostrando citas ${startIndex + 1} a ${Math.min(
        endIndex,
        this.filteredCitas.length
      )} de ${this.filteredCitas.length}`
    );

    citasPage.forEach((cita, index) => {
      console.log(`📊 Creando fila para cita ${index + 1}:`, cita);
      const row = this.createCitaRow(cita);
      this.tabla.appendChild(row);
    });

    this.updatePaginationInfo();
    console.log("✅ Tabla actualizada correctamente");
  }

  createCitaRow(cita) {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-colors";

    // Formatear fecha
    const fecha = cita.FECHA_CITA
      ? new Date(cita.FECHA_CITA).toLocaleString("es-ES")
      : "N/A";

    // Determinar color del estado
    const getEstadoColor = (estado) => {
      switch (estado) {
        case "AGENDADA":
          return "bg-blue-100 text-blue-800";
        case "EN_PROGRESO":
          return "bg-yellow-100 text-yellow-800";
        case "COMPLETADA":
          return "bg-green-100 text-green-800";
        case "CANCELADA":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    row.innerHTML = `
      <td class="px-6 py-4">
        <div class="text-sm text-gray-900">${fecha}</div>
      </td>
      <td class="px-6 py-4">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <i class="fas fa-user text-blue-600"></i>
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">${
              cita.NOMBRE_CLIENTE || "N/A"
            }</div>
            <div class="text-sm text-gray-500">ID: ${
              cita.CITA_ID || "N/A"
            }</div>
          </div>
        </div>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
          ${cita.NUMERO_PLACA || "N/A"}
        </span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm text-gray-900">${cita.TIPO_CITA || "N/A"}</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm text-gray-900">${
          cita.NOMBRE_SUCURSAL || "N/A"
        }</span>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex px-2 py-1 text-xs font-semibold ${getEstadoColor(
          cita.ESTADO
        )} rounded-full">
          ${(cita.ESTADO || "").replace("_", " ")}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end space-x-2">
          <button onclick="citasModule.cambiarEstadoCita(${cita.CITA_ID})" 
                  class="text-green-600 hover:text-green-800 font-medium" title="Cambiar Estado">
            <i class="fas fa-exchange-alt"></i>
          </button>
          <button onclick="citasModule.editCita(${cita.CITA_ID})" 
                  class="text-blue-600 hover:text-blue-800 font-medium" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button onclick="citasModule.deleteCita(${cita.CITA_ID})" 
                  class="text-red-600 hover:text-red-800 font-medium" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    return row;
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCitas.length / this.itemsPerPage);

    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    if (btnAnterior) {
      btnAnterior.disabled = this.currentPage <= 1;
      btnAnterior.classList.toggle("opacity-50", this.currentPage <= 1);
    }

    if (btnSiguiente) {
      btnSiguiente.disabled = this.currentPage >= this.totalPages;
      btnSiguiente.classList.toggle(
        "opacity-50",
        this.currentPage >= this.totalPages
      );
    }

    this.updatePaginationNumbers();
    this.updatePaginationInfo();
  }

  updatePaginationNumbers() {
    const container = document.getElementById("numeroPaginas");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 1; i <= this.totalPages; i++) {
      if (
        this.totalPages <= 7 ||
        i <= 3 ||
        i > this.totalPages - 3 ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = `px-3 py-1 text-sm border rounded-md ${
          i === this.currentPage
            ? "bg-blue-600 text-white border-blue-600"
            : "border-gray-300 hover:bg-gray-50"
        }`;
        button.addEventListener("click", () => this.goToPage(i));
        container.appendChild(button);
      } else if (i === 4 && this.currentPage > 5) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "px-2 text-gray-500";
        container.appendChild(dots);
      } else if (
        i === this.totalPages - 3 &&
        this.currentPage < this.totalPages - 4
      ) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "px-2 text-gray-500";
        container.appendChild(dots);
      }
    }
  }

  updatePaginationInfo() {
    const element = document.getElementById("paginaInfo");
    if (!element) return;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredCitas.length
    );
    const total = this.filteredCitas.length;

    element.textContent = `${startIndex}-${endIndex} de ${total}`;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateTable();
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateTable();
      this.updatePagination();
    }
  }

  goToPage(page) {
    this.currentPage = page;
    this.updateTable();
    this.updatePagination();
  }

  showCreateModal() {
    console.log("🔧 Abriendo modal para crear nueva cita");

    this.editMode = false;
    this.currentCitaId = null;

    const titulo = document.getElementById("tituloModal");
    if (titulo) {
      titulo.textContent = "Nueva Cita";
    }

    this.resetForm();

    // Re-poblar los selectores para asegurar que estén actualizados
    console.log("🔄 Re-poblando selectores en modal...");
    this.populateClienteSelector();
    this.populateSucursalSelector();
    this.populateServiciosSelector();

    // Limpiar el selector de vehículos
    this.clearVehiculoSelector();

    this.showModal();
  }

  async editCita(citaId) {
    try {
      this.editMode = true;
      this.currentCitaId = citaId;

      const titulo = document.getElementById("tituloModal");
      if (titulo) {
        titulo.textContent = "Editar Cita";
      }

      // Encontrar la cita en la lista local
      const cita = this.citas.find((c) => c.CITA_ID == citaId);
      if (!cita) {
        this.showToast("Cita no encontrada", "error");
        return;
      }

      // Re-poblar selectores
      this.populateClienteSelector();
      this.populateSucursalSelector();

      // Poblar formulario
      this.populateForm(cita);
      this.showModal();
    } catch (error) {
      console.error("❌ Error preparando edición:", error);
      this.showToast("Error al cargar los datos de la cita", "error");
    }
  }

  populateForm(cita) {
    // Llenar los campos del formulario
    document.getElementById("clienteId").value = cita.CLIENTE_ID || "";
    document.getElementById("sucursalId").value = cita.SUCURSAL_ID || "";
    document.getElementById("tipoCita").value = cita.TIPO_CITA || "";

    // Formatear fecha y hora por separado
    if (cita.FECHA_CITA) {
      const fecha = new Date(cita.FECHA_CITA);
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, "0");
      const day = String(fecha.getDate()).padStart(2, "0");
      const hours = String(fecha.getHours()).padStart(2, "0");
      const minutes = String(fecha.getMinutes()).padStart(2, "0");

      document.getElementById("fechaCita").value = `${year}-${month}-${day}`;
      document.getElementById("horaCita").value = `${hours}:${minutes}`;
    }

    // Cargar vehículos del cliente y seleccionar el vehículo actual
    if (cita.CLIENTE_ID) {
      this.loadVehiculosByCliente(cita.CLIENTE_ID).then(() => {
        if (cita.VEHICULO_ID) {
          document.getElementById("vehiculoId").value = cita.VEHICULO_ID;
        }
      });
    }
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
    }
    this.clearVehiculoSelector();
    this.resetServicios();
  }

  showModal() {
    if (this.modal) {
      this.modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
    this.resetForm();
    this.editMode = false;
    this.currentCitaId = null;
  }

  async handleSubmit(e) {
    e.preventDefault();

    try {
      const formData = this.getFormData();

      if (!this.validateForm(formData)) {
        return;
      }

      const url = this.editMode
        ? `/api/citas/${this.currentCitaId}`
        : "/api/citas";

      const method = this.editMode ? "PUT" : "POST";

      console.log(`${method} ${url}`, formData);

      const result = await this.apiCall(url, method, formData);

      if (result) {
        this.showToast(
          this.editMode
            ? "Cita actualizada exitosamente"
            : "Cita creada exitosamente",
          "success"
        );

        this.closeModal();
        await this.loadCitas();
        await this.loadEstadisticas();
      }
    } catch (error) {
      console.error("❌ Error guardando cita:", error);
      this.showToast("Error al guardar la cita", "error");
    }
  }

  getFormData() {
    const fechaCita = document.getElementById("fechaCita")?.value;
    const horaCita = document.getElementById("horaCita")?.value;

    let fechaCompleta = null;
    if (fechaCita && horaCita) {
      fechaCompleta = `${fechaCita} ${horaCita}:00`;
    } else if (fechaCita) {
      fechaCompleta = `${fechaCita} 09:00:00`; // Hora por defecto
    }

    // Obtener servicios seleccionados
    const servicios = this.getServiciosSeleccionados();

    return {
      cliente_id: document.getElementById("clienteId")?.value,
      vehiculo_id: document.getElementById("vehiculoId")?.value,
      sucursal_id: document.getElementById("sucursalId")?.value,
      fecha_cita: fechaCompleta,
      estado: "AGENDADA", // Estado por defecto para nuevas citas
      tipo_cita: document.getElementById("tipoCita")?.value || "MANTENIMIENTO",
      observaciones: document.getElementById("observaciones")?.value || "",
      servicios: servicios,
    };
  }

  validateForm(formData) {
    const requiredFields = [
      { field: "cliente_id", message: "Debe seleccionar un cliente" },
      { field: "vehiculo_id", message: "Debe seleccionar un vehículo" },
      { field: "sucursal_id", message: "Debe seleccionar una sucursal" },
      { field: "tipo_cita", message: "Debe seleccionar un tipo de cita" },
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field]) {
        this.showToast(message, "error");
        return false;
      }
    }

    // Validar que se haya seleccionado fecha
    const fechaCita = document.getElementById("fechaCita")?.value;
    const horaCita = document.getElementById("horaCita")?.value;

    if (!fechaCita) {
      this.showToast("Debe seleccionar una fecha para la cita", "error");
      return false;
    }

    if (!horaCita) {
      this.showToast("Debe seleccionar una hora para la cita", "error");
      return false;
    }

    // Validar fecha (no puede ser en el pasado)
    if (formData.fecha_cita) {
      const fechaCita = new Date(formData.fecha_cita);
      const ahora = new Date();
      if (fechaCita < ahora) {
        this.showToast(
          "La fecha de la cita no puede ser en el pasado",
          "error"
        );
        return false;
      }
    }

    // Validar que se haya seleccionado al menos un servicio
    if (!formData.servicios || formData.servicios.length === 0) {
      this.showToast("Debe seleccionar al menos un servicio", "error");
      return false;
    }

    // Validar que todos los servicios tengan precio
    for (const servicio of formData.servicios) {
      if (!servicio.precio || servicio.precio <= 0) {
        this.showToast(
          "Todos los servicios deben tener un precio válido",
          "error"
        );
        return false;
      }
    }

    return true;
  }

  async deleteCita(citaId) {
    const cita = this.citas.find((c) => c.CITA_ID == citaId);
    const cliente = cita ? cita.NOMBRE_CLIENTE : null;
    const clienteInfo = cliente ? ` (${cliente})` : "";

    if (
      !confirm(
        `¿Está seguro de que desea eliminar la cita${clienteInfo}?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await this.apiCall(`/api/citas/${citaId}`, "DELETE");

      this.showToast("Cita eliminada exitosamente", "success");
      await this.loadCitas();
      await this.loadEstadisticas();
    } catch (error) {
      console.error("❌ Error eliminando cita:", error);
      this.showToast("Error al eliminar la cita", "error");
    }
  }

  async cambiarEstadoCita(citaId) {
    const cita = this.citas.find((c) => c.CITA_ID == citaId);
    if (!cita) {
      this.showToast("Cita no encontrada", "error");
      return;
    }

    const estados = [
      { value: "AGENDADA", label: "Agendada", color: "text-blue-600" },
      { value: "EN_PROGRESO", label: "En Progreso", color: "text-yellow-600" },
      { value: "COMPLETADA", label: "Completada", color: "text-green-600" },
      { value: "CANCELADA", label: "Cancelada", color: "text-red-600" },
    ];

    const estadoActual = cita.ESTADO;
    const cliente = cita.NOMBRE_CLIENTE || "Sin nombre";

    // Crear opciones para el prompt
    let mensaje = `Cambiar estado de la cita de ${cliente}\n\nEstado actual: ${estadoActual}\n\nSeleccione el nuevo estado:\n\n`;
    estados.forEach((estado, index) => {
      mensaje += `${index + 1}. ${estado.label}\n`;
    });

    const seleccion = prompt(
      mensaje + "\nIngrese el número del estado deseado (1-4):"
    );

    if (!seleccion || seleccion.trim() === "") {
      return; // Usuario canceló
    }

    const indice = parseInt(seleccion) - 1;
    if (indice < 0 || indice >= estados.length) {
      this.showToast("Selección inválida", "error");
      return;
    }

    const nuevoEstado = estados[indice].value;

    if (nuevoEstado === estadoActual) {
      this.showToast(
        "El estado seleccionado es el mismo que el actual",
        "warning"
      );
      return;
    }

    try {
      const updateData = { estado: nuevoEstado };
      await this.apiCall(`/api/citas/${citaId}`, "PUT", updateData);

      this.showToast(
        `Estado cambiado a ${estados[indice].label} exitosamente`,
        "success"
      );
      await this.loadCitas();
      await this.loadEstadisticas();
    } catch (error) {
      console.error("❌ Error cambiando estado:", error);
      this.showToast("Error al cambiar el estado de la cita", "error");
    }
  }

  // Utility: API Call
  async apiCall(url, method = "GET", data = null) {
    try {
      const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

      console.log(`🌐 API Call: ${method} ${fullUrl}`);

      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data && (method === "POST" || method === "PUT")) {
        config.body = JSON.stringify(data);
        console.log(`📤 Request body:`, data);
      }

      const response = await fetch(fullUrl, config);

      console.log(
        `📡 Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
          console.log(`❌ Error response:`, errorData);
        } catch (e) {
          console.log(`❌ Non-JSON error response`);
        }
        throw new Error(errorMessage);
      }

      if (method === "DELETE") {
        return true;
      }

      const result = await response.json();
      console.log(`✅ Response data:`, result);
      return result;
    } catch (error) {
      console.error(`❌ API Error ${method} ${url}:`, error);
      throw error;
    }
  }

  // Gestión de vistas
  toggleVista() {
    if (this.vistaActual === "tabla") {
      this.mostrarVistaCalendario();
    } else {
      this.mostrarVistaTabla();
    }
  }

  mostrarVistaCalendario() {
    this.vistaActual = "calendario";

    if (this.vistaTabla) {
      this.vistaTabla.classList.add("hidden");
    }

    if (this.vistaCalendario) {
      this.vistaCalendario.classList.remove("hidden");
    }

    // Ocultar filtros excepto el de búsqueda general
    const filtrosSection = document.getElementById("filtrosSection");
    if (filtrosSection) {
      filtrosSection.classList.add("hidden");
    }

    // Actualizar botón
    const btnVistaCalendario = document.getElementById("btnVistaCalendario");
    if (btnVistaCalendario) {
      btnVistaCalendario.innerHTML =
        '<i class="fas fa-list mr-2"></i>Vista Tabla';
      btnVistaCalendario.classList.remove("bg-gray-100", "text-gray-700");
      btnVistaCalendario.classList.add("bg-blue-100", "text-blue-700");
    }

    this.renderCalendario();
  }

  mostrarVistaTabla() {
    this.vistaActual = "tabla";

    if (this.vistaCalendario) {
      this.vistaCalendario.classList.add("hidden");
    }

    if (this.vistaTabla) {
      this.vistaTabla.classList.remove("hidden");
    }

    // Mostrar filtros
    const filtrosSection = document.getElementById("filtrosSection");
    if (filtrosSection) {
      filtrosSection.classList.remove("hidden");
    }

    // Actualizar botón
    const btnVistaCalendario = document.getElementById("btnVistaCalendario");
    if (btnVistaCalendario) {
      btnVistaCalendario.innerHTML =
        '<i class="fas fa-calendar mr-2"></i>Vista Calendario';
      btnVistaCalendario.classList.remove("bg-blue-100", "text-blue-700");
      btnVistaCalendario.classList.add("bg-gray-100", "text-gray-700");
    }
  }

  // Navegación del calendario
  mesAnterior() {
    this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() - 1);
    this.renderCalendario();
  }

  mesSiguiente() {
    this.fechaCalendario.setMonth(this.fechaCalendario.getMonth() + 1);
    this.renderCalendario();
  }

  irAHoy() {
    this.fechaCalendario = new Date();
    this.renderCalendario();
  }

  renderCalendario() {
    const mesActual = document.getElementById("mesActual");
    const diasCalendario = document.getElementById("diasCalendario");

    if (!mesActual || !diasCalendario) {
      console.error("❌ Elementos del calendario no encontrados");
      return;
    }

    // Actualizar título del mes
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    mesActual.textContent = `${
      meses[this.fechaCalendario.getMonth()]
    } ${this.fechaCalendario.getFullYear()}`;

    // Limpiar días anteriores
    diasCalendario.innerHTML = "";

    // Calcular primer día del mes y número de días
    const primerDia = new Date(
      this.fechaCalendario.getFullYear(),
      this.fechaCalendario.getMonth(),
      1
    );
    const ultimoDia = new Date(
      this.fechaCalendario.getFullYear(),
      this.fechaCalendario.getMonth() + 1,
      0
    );
    const primerDiaSemana = primerDia.getDay(); // 0 = domingo
    const diasEnMes = ultimoDia.getDate();

    // Agregar días vacíos antes del primer día del mes
    for (let i = 0; i < primerDiaSemana; i++) {
      const diaVacio = document.createElement("div");
      diaVacio.className = "h-32 border border-gray-200";
      diasCalendario.appendChild(diaVacio);
    }

    // Agregar días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(
        this.fechaCalendario.getFullYear(),
        this.fechaCalendario.getMonth(),
        dia
      );
      const diaElement = this.crearDiaCalendario(dia, fechaDia);
      diasCalendario.appendChild(diaElement);
    }
  }

  crearDiaCalendario(dia, fecha) {
    const diaElement = document.createElement("div");
    diaElement.className = "h-32 border border-gray-200 p-2 overflow-y-auto";

    // Verificar si es hoy
    const hoy = new Date();
    const esHoy = fecha.toDateString() === hoy.toDateString();

    if (esHoy) {
      diaElement.classList.add("bg-blue-50", "border-blue-300");
    }

    // Número del día
    const numeroDia = document.createElement("div");
    numeroDia.className = `text-sm font-medium ${
      esHoy ? "text-blue-700" : "text-gray-900"
    } mb-1`;
    numeroDia.textContent = dia;
    diaElement.appendChild(numeroDia);

    // Buscar citas para este día
    const fechaStr = fecha.toISOString().split("T")[0];
    const citasDelDia = this.citas.filter((cita) => {
      if (!cita.FECHA_CITA) return false;
      const fechaCita = new Date(cita.FECHA_CITA).toISOString().split("T")[0];
      return fechaCita === fechaStr;
    });

    // Agregar citas del día
    citasDelDia.forEach((cita) => {
      const citaElement = this.crearElementoCitaCalendario(cita);
      diaElement.appendChild(citaElement);
    });

    return diaElement;
  }

  crearElementoCitaCalendario(cita) {
    const citaElement = document.createElement("div");
    citaElement.className =
      "text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80 transition-opacity";

    // Color según el estado
    const colores = {
      AGENDADA: "bg-blue-100 text-blue-800 border border-blue-200",
      EN_PROGRESO: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      COMPLETADA: "bg-green-100 text-green-800 border border-green-200",
      CANCELADA: "bg-red-100 text-red-800 border border-red-200",
    };

    citaElement.className += ` ${
      colores[cita.ESTADO] || "bg-gray-100 text-gray-800 border border-gray-200"
    }`;

    // Contenido de la cita
    const hora = cita.FECHA_CITA
      ? new Date(cita.FECHA_CITA).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    citaElement.innerHTML = `
      <div class="font-medium truncate">${hora}</div>
      <div class="truncate">${cita.NOMBRE_CLIENTE || "Sin cliente"}</div>
      <div class="truncate opacity-75">${cita.NUMERO_PLACA || ""}</div>
    `;

    // Event listener para mostrar detalles
    citaElement.addEventListener("click", () => this.mostrarDetalleCita(cita));

    return citaElement;
  }

  // Modal de detalles
  mostrarDetalleCita(cita) {
    if (!this.modalDetalle) {
      console.error("❌ Modal de detalle no encontrado");
      return;
    }

    const contenido = document.getElementById("contenidoDetalleCita");
    if (!contenido) {
      console.error("❌ Contenido del modal de detalle no encontrado");
      return;
    }

    // Formatear fecha y hora
    const fecha = cita.FECHA_CITA ? new Date(cita.FECHA_CITA) : null;
    const fechaFormateada = fecha
      ? fecha.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No especificada";

    const horaFormateada = fecha
      ? fecha.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "No especificada";

    // Color del estado
    const getEstadoColor = (estado) => {
      switch (estado) {
        case "AGENDADA":
          return "bg-blue-100 text-blue-800";
        case "EN_PROGRESO":
          return "bg-yellow-100 text-yellow-800";
        case "COMPLETADA":
          return "bg-green-100 text-green-800";
        case "CANCELADA":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    contenido.innerHTML = `
      <div class="space-y-6">
        <!-- Información principal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Cliente</h3>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-user text-blue-600"></i>
              </div>
              <div>
                <p class="font-medium text-gray-900">${
                  cita.NOMBRE_CLIENTE || "No especificado"
                }</p>
                <p class="text-sm text-gray-500">ID: ${cita.CITA_ID}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Estado</h3>
            <span class="inline-flex px-3 py-1 text-sm font-semibold ${getEstadoColor(
              cita.ESTADO
            )} rounded-full">
              ${(cita.ESTADO || "").replace("_", " ")}
            </span>
          </div>
        </div>

        <!-- Fecha y hora -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Fecha</h3>
            <p class="text-gray-900 capitalize">${fechaFormateada}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Hora</h3>
            <p class="text-gray-900">${horaFormateada}</p>
          </div>
        </div>

        <!-- Vehículo y tipo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Vehículo</h3>
            <div class="flex items-center">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <i class="fas fa-car text-gray-600"></i>
              </div>
              <div>
                <p class="font-medium text-gray-900">${
                  cita.NUMERO_PLACA || "No especificado"
                }</p>
                <p class="text-sm text-gray-500">${cita.NOMBRE_MODELO || ""}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Tipo de Cita</h3>
            <p class="text-gray-900">${cita.TIPO_CITA || "No especificado"}</p>
          </div>
        </div>

        <!-- Sucursal -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Sucursal</h3>
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <i class="fas fa-building text-green-600"></i>
            </div>
            <p class="text-gray-900">${
              cita.NOMBRE_SUCURSAL || "No especificada"
            }</p>
          </div>
        </div>

        <!-- Observaciones si existen -->
        ${
          cita.OBSERVACIONES
            ? `
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Observaciones</h3>
            <p class="text-gray-900 bg-gray-50 p-3 rounded-lg">${cita.OBSERVACIONES}</p>
          </div>
        `
            : ""
        }
      </div>
    `;

    this.modalDetalle.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  closeModalDetalle() {
    if (this.modalDetalle) {
      this.modalDetalle.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  // Utility: Toast Messages
  showToast(message, type = "info") {
    // Usar el toast manager global si está disponible
    if (window.toastManager) {
      window.toastManager.show(message, type);
      return;
    }

    // Fallback a alert si no hay toast manager
    if (type === "error") {
      alert("Error: " + message);
    } else if (type === "success") {
      alert("Éxito: " + message);
    } else if (type === "warning") {
      alert("Advertencia: " + message);
    } else {
      alert(message);
    }
  }

  // Métodos para manejo de servicios
  agregarServicio() {
    const serviciosContainer = document.getElementById("serviciosContainer");
    if (!serviciosContainer) return;

    // Crear nuevo div de servicio
    const nuevoServicio = document.createElement("div");
    nuevoServicio.className =
      "flex items-center space-x-4 p-4 border border-gray-200 rounded-lg";
    nuevoServicio.innerHTML = `
      <select class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent servicio-select">
        <option value="">Seleccionar servicio</option>
      </select>
      <input type="number" step="0.01" placeholder="Precio"
        class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent precio-servicio">
      <button type="button" class="text-red-500 hover:text-red-700 btn-eliminar-servicio">
        <i class="fas fa-trash"></i>
      </button>
    `;

    serviciosContainer.appendChild(nuevoServicio);

    // Poblar el nuevo selector con los servicios disponibles
    this.populateServiciosSelector();

    console.log("➕ Nuevo servicio agregado");
  }

  eliminarServicio(btnEliminar) {
    const servicioDiv = btnEliminar.closest(".flex");
    const serviciosContainer = document.getElementById("serviciosContainer");

    if (servicioDiv && serviciosContainer.children.length > 1) {
      servicioDiv.remove();
      console.log("➖ Servicio eliminado");
    } else {
      this.showToast("Debe mantener al menos un servicio", "warning");
    }
  }

  onServicioSelectChange(selectElement) {
    // Encontrar el precio correspondiente al servicio seleccionado
    const servicioId = selectElement.value;
    const precioInput =
      selectElement.parentElement.querySelector(".precio-servicio");

    if (servicioId && precioInput) {
      const servicioSeleccionado = this.servicios.find(
        (s) => (s.ID_SERVICIO || s.servicio_id) == servicioId
      );

      if (servicioSeleccionado) {
        const precio =
          servicioSeleccionado.PRECIO || servicioSeleccionado.precio || 0;
        precioInput.value = precio;
        console.log(
          `💰 Precio autocompletado: $${precio} para servicio ${servicioId}`
        );
      }
    }
  }

  // Obtener servicios seleccionados para envío al servidor
  getServiciosSeleccionados() {
    const servicios = [];
    const serviciosContainer = document.getElementById("serviciosContainer");

    if (serviciosContainer) {
      const serviciosDivs = serviciosContainer.querySelectorAll(".flex");

      serviciosDivs.forEach((div) => {
        const select = div.querySelector(".servicio-select");
        const precioInput = div.querySelector(".precio-servicio");

        if (select?.value && precioInput?.value) {
          servicios.push({
            id_servicio: select.value,
            precio: parseFloat(precioInput.value) || 0,
          });
        }
      });
    }

    return servicios;
  }

  // Resetear container de servicios a estado inicial
  resetServicios() {
    const serviciosContainer = document.getElementById("serviciosContainer");
    if (serviciosContainer) {
      // Mantener solo el primer servicio y limpiarlo
      const serviciosDivs = serviciosContainer.querySelectorAll(".flex");

      // Eliminar servicios adicionales
      for (let i = 1; i < serviciosDivs.length; i++) {
        serviciosDivs[i].remove();
      }

      // Limpiar el primer servicio
      if (serviciosDivs.length > 0) {
        const primerServicio = serviciosDivs[0];
        const select = primerServicio.querySelector(".servicio-select");
        const precioInput = primerServicio.querySelector(".precio-servicio");

        if (select) select.value = "";
        if (precioInput) precioInput.value = "";
      }

      console.log("🔄 Servicios reseteados a estado inicial");
    }
  }
}

// Crear instancia global
const citasModule = new CitasModule();
window.citasModule = citasModule;

console.log("✅ Módulo de citas cargado correctamente");
