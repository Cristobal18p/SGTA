// ============================================
// MÓDULO DE FACTURAS - TecnoTaller
// Gestión completa de facturas del sistema
// ============================================

class FacturasModule {
  constructor() {
    this.facturas = [];
    this.filteredFacturas = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 0;

    // Referencias a elementos del DOM
    this.modal = null;
    this.form = null;
    this.tabla = null;

    // Estado del formulario
    this.editMode = false;
    this.currentFacturaId = null;
    this.detallesFactura = []; // Array para almacenar detalles temporales

    // Cache para selectores
    this.clientes = [];
    this.citas = [];
    this.metodosPago = [];
    this.productos = [];
    this.servicios = [];

    // Configuración de la API
    this.baseUrl = window.location.origin;

    // Inyectar estilos CSS personalizados
    this.injectCustomStyles();

    this.init();
  }

  injectCustomStyles() {
    const styles = `
      <style>
        .autocomplete-item.active {
          background-color: #EBF8FF !important;
          border-left: 3px solid #3B82F6;
        }
        
        .estado-menu {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .quick-filter-btn:hover {
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .loading-spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
    `;

    if (!document.querySelector("#facturas-custom-styles")) {
      const styleElement = document.createElement("div");
      styleElement.id = "facturas-custom-styles";
      styleElement.innerHTML = styles;
      document.head.appendChild(styleElement);
    }
  }

  async init() {
    console.log("📄 Inicializando módulo de facturas...");

    // Esperar a que el DOM esté listo
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    console.log("🔧 Configurando elementos del DOM...");
    console.log("🌐 URL base:", this.baseUrl);

    // Referencias a elementos del DOM
    this.modal = document.getElementById("modalFactura");
    this.form = document.getElementById("formFactura");
    this.tabla = document.getElementById("tablaFacturas");

    console.log("🔧 Modal encontrado:", !!this.modal);
    console.log("🔧 Formulario encontrado:", !!this.form);
    console.log("🔧 Tabla encontrada:", !!this.tabla);

    // Configurar event listeners
    this.setupEventListeners();

    // Cargar datos iniciales
    this.loadInitialData();
  }

  setupEventListeners() {
    console.log("🔧 Configurando event listeners...");

    // Botón nueva factura
    const btnNueva = document.getElementById("btnNuevaFactura");
    if (btnNueva) {
      btnNueva.addEventListener("click", () => this.showCreateModal());
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

    // Formulario: submit
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
      console.log("✅ Event listener de submit agregado al formulario");
    } else {
      console.error("❌ Formulario no encontrado para agregar event listener");
    }

    // Botón exportar (si existe)
    const btnExportar = document.querySelector('[title="Exportar"]');
    if (btnExportar) {
      btnExportar.addEventListener("click", () => this.exportarFacturas());
    }

    // Búsqueda y filtros
    const searchInput = document.getElementById("searchFactura");
    if (searchInput) {
      // Usar un debounce para evitar muchas consultas
      let searchTimeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.filterFacturas(), 300);
      });

      // Agregar funcionalidad de autocompletado
      this.setupAutoComplete(searchInput);
    }

    const filterEstado = document.getElementById("filterEstado");
    if (filterEstado) {
      filterEstado.addEventListener("change", () => this.filterFacturas());
    }

    const filterMetodoPago = document.getElementById("filterMetodoPago");
    if (filterMetodoPago) {
      filterMetodoPago.addEventListener("change", () => this.filterFacturas());
    }

    const filterFecha = document.getElementById("filterFecha");
    if (filterFecha) {
      filterFecha.addEventListener("change", () => this.filterFacturas());
    }

    const btnLimpiar = document.getElementById("btnLimpiarFiltros");
    if (btnLimpiar) {
      btnLimpiar.addEventListener("click", () => this.clearFilters());
    }

    // Botón agregar detalle
    const btnAgregarDetalle = document.getElementById("btnAgregarDetalle");
    if (btnAgregarDetalle) {
      btnAgregarDetalle.addEventListener("click", () => this.agregarDetalle());
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

    // Configurar filtros de fecha avanzados
    this.setupAdvancedFilters();

    console.log("✅ Event listeners configurados");
  }

  setupAdvancedFilters() {
    // Agregar botones de rango de fechas rápido
    const filterFecha = document.getElementById("filterFecha");
    if (filterFecha && filterFecha.parentElement) {
      const quickFiltersDiv = document.createElement("div");
      quickFiltersDiv.className = "mt-2 flex flex-wrap gap-1";
      quickFiltersDiv.innerHTML = `
        <button type="button" class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded quick-filter-btn" data-days="0">Hoy</button>
        <button type="button" class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded quick-filter-btn" data-days="7">7 días</button>
        <button type="button" class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded quick-filter-btn" data-days="30">30 días</button>
        <button type="button" class="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded quick-filter-btn" data-days="90">90 días</button>
        <button type="button" class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded" onclick="facturasModule.clearDateFilter()">Limpiar</button>
      `;

      filterFecha.parentElement.appendChild(quickFiltersDiv);

      // Event listeners para filtros rápidos
      quickFiltersDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("quick-filter-btn")) {
          const days = parseInt(e.target.getAttribute("data-days"));
          this.applyQuickDateFilter(days);

          // Resaltar botón activo
          quickFiltersDiv
            .querySelectorAll(".quick-filter-btn")
            .forEach((btn) => {
              btn.classList.remove("bg-blue-500", "text-white");
              btn.classList.add("bg-blue-100", "text-blue-700");
            });
          e.target.classList.remove("bg-blue-100", "text-blue-700");
          e.target.classList.add("bg-blue-500", "text-white");
        }
      });
    }

    // Mejorar el selector de método de pago
    const filterMetodoPago = document.getElementById("filterMetodoPago");
    if (filterMetodoPago) {
      filterMetodoPago.addEventListener("change", () => {
        console.log(
          "🔍 Filtro de método de pago cambiado:",
          filterMetodoPago.value
        );
        this.filterFacturas();
      });
    }
  }

  clearDateFilter() {
    const filterFecha = document.getElementById("filterFecha");
    if (filterFecha) {
      filterFecha.value = "";

      // Remover resaltado de botones
      const quickFiltersDiv = filterFecha.parentElement.querySelector(".mt-2");
      if (quickFiltersDiv) {
        quickFiltersDiv.querySelectorAll(".quick-filter-btn").forEach((btn) => {
          btn.classList.remove("bg-blue-500", "text-white");
          btn.classList.add("bg-blue-100", "text-blue-700");
        });
      }

      this.filterFacturas();
    }
  }

  applyQuickDateFilter(days) {
    const filterFecha = document.getElementById("filterFecha");
    if (!filterFecha) return;

    const today = new Date();
    if (days === 0) {
      // Solo hoy
      filterFecha.value = today.toISOString().split("T")[0];
    } else {
      // Últimos X días - usar fecha de inicio
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - days);
      filterFecha.value = startDate.toISOString().split("T")[0];
    }

    // Aplicar filtro
    this.filterFacturas();
  }

  async loadInitialData() {
    try {
      console.log("📊 Cargando datos iniciales...");

      // Cargar datos básicos
      await Promise.all([
        this.loadFacturas(),
        this.loadEstadisticas(),
        this.loadSelectorsData(),
      ]);

      console.log("✅ Datos iniciales cargados correctamente");
    } catch (error) {
      console.error("❌ Error cargando datos iniciales:", error);
      this.showToast(
        "Error al cargar los datos iniciales. Verifique que el servidor esté corriendo.",
        "error"
      );
    }
  }

  async loadFacturas() {
    try {
      console.log("🔄 Cargando facturas...");

      // Mostrar indicador de carga
      this.showLoadingIndicator();

      // Construir parámetros de la URL
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
      });

      // Agregar filtros activos
      const searchTerm =
        document.getElementById("searchFactura")?.value?.trim() || "";
      const filterEstado = document.getElementById("filterEstado")?.value || "";
      const filterMetodoPago =
        document.getElementById("filterMetodoPago")?.value || "";
      const filterFecha = document.getElementById("filterFecha")?.value || "";

      console.log("🔍 Filtros aplicados:", {
        busqueda: searchTerm,
        estado: filterEstado,
        metodoPago: filterMetodoPago,
        fecha: filterFecha,
      });

      if (searchTerm) params.append("busqueda", searchTerm);
      if (filterEstado) params.append("estado", filterEstado);
      if (filterMetodoPago) params.append("metodoPago", filterMetodoPago);
      if (filterFecha) {
        params.append("fechaInicio", filterFecha);
        params.append("fechaFin", filterFecha);
      }

      const url = `${this.baseUrl}/api/facturas?${params.toString()}`;
      console.log("📡 URL de facturas:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Respuesta de facturas:", data);

      if (data.success) {
        this.facturas = data.data.map((factura) => ({
          id: factura.factura_id,
          numero: factura.numero_factura,
          cliente: factura.nombre_cliente,
          cedula: factura.numero_cedula,
          fecha: new Date(factura.fecha_emision).toLocaleDateString(),
          total: factura.total_factura,
          metodoPago: factura.metodo_pago,
          estado: factura.estado,
          estadoFactura: factura.estado_factura,
          observaciones: factura.observaciones,
          cita_id: factura.cita_id,
          subtotal: factura.subtotal,
          descuento: factura.descuento,
          impuestos: factura.impuestos,
        }));

        this.filteredFacturas = [...this.facturas];

        // Actualizar información de paginación del servidor
        if (data.pagination) {
          this.currentPage = data.pagination.currentPage;
          this.totalPages = data.pagination.totalPages;
          this.totalRecords = data.pagination.total;
        }

        this.updateTable();
        this.updatePagination();

        console.log(
          `✅ ${this.facturas.length} facturas cargadas de ${
            this.totalRecords || 0
          } total`
        );
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      console.error("❌ Error cargando facturas:", error);
      this.showToast("Error al cargar las facturas", "error");
    } finally {
      // Ocultar indicador de carga
      this.hideLoadingIndicator();
    }
  }

  showLoadingIndicator() {
    if (this.tabla) {
      this.tabla.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            <div class="loading-spinner"></div>
            Cargando facturas...
          </td>
        </tr>
      `;
    }
  }

  hideLoadingIndicator() {
    // La tabla se actualizará con los datos reales en updateTable()
  }

  async loadEstadisticas() {
    try {
      console.log("📊 Cargando estadísticas...");

      // Verificar que los elementos HTML estén presentes
      this.verificarElementosEstadisticas();

      // Mostrar indicadores de carga
      this.mostrarCargaEstadisticas();

      const response = await fetch(`${this.baseUrl}/api/facturas/estadisticas`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Estadísticas recibidas:", data);

      if (data.success) {
        const stats = data.data.resumen;

        this.updateEstadistica("totalFacturas", stats.total_facturas);
        this.updateEstadistica("ingresosMes", stats.monto_pagado);
        this.updateEstadistica("facturasPendientes", stats.facturas_pendientes);
        this.updateEstadistica("montoPorCobrar", stats.monto_pendiente);

        console.log("✅ Estadísticas cargadas correctamente");
        console.log("📊 Stats procesadas:", {
          totalFacturas: stats.total_facturas,
          ingresosMes: stats.monto_pagado,
          facturasPendientes: stats.facturas_pendientes,
          montoPorCobrar: stats.monto_pendiente,
        });
      } else {
        throw new Error("Error en la respuesta de estadísticas");
      }
    } catch (error) {
      console.error("❌ Error cargando estadísticas:", error);
      // Datos por defecto en caso de error
      this.updateEstadistica("totalFacturas", 0);
      this.updateEstadistica("ingresosMes", 0);
      this.updateEstadistica("facturasPendientes", 0);
      this.updateEstadistica("montoPorCobrar", 0);

      // Mostrar toast de error
      this.showToast(
        "Error al cargar estadísticas. Verificar conexión con servidor.",
        "error"
      );
    }
  }

  mostrarCargaEstadisticas() {
    const elementosRequeridos = [
      "totalFacturas",
      "ingresosMes",
      "facturasPendientes",
      "montoPorCobrar",
    ];

    elementosRequeridos.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML =
          '<i class="fas fa-spinner fa-spin text-blue-500"></i>';
      }
    });
  }

  verificarElementosEstadisticas() {
    const elementosRequeridos = [
      "totalFacturas",
      "ingresosMes",
      "facturasPendientes",
      "montoPorCobrar",
    ];

    console.log("🔍 Verificando elementos de estadísticas en el DOM...");

    elementosRequeridos.forEach((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        console.log(`✅ Elemento '${elementId}' encontrado`);
      } else {
        console.error(`❌ Elemento '${elementId}' NO encontrado en el DOM`);
      }
    });
  }

  async loadSelectorsData() {
    try {
      console.log("📋 Cargando datos para selectores...");

      // Cargar métodos de pago desde su API específica
      await this.loadMetodosPago();

      const response = await fetch(
        `${this.baseUrl}/api/facturas/datos-formulario`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📋 Datos de formulario recibidos:", data);

      if (data.success) {
        // Mapear clientes con validación
        this.clientes = Array.isArray(data.data?.clientes)
          ? data.data.clientes.map((cliente) => ({
              id: cliente.cliente_id,
              nombre: cliente.nombre_completo,
              cedula: cliente.numero_cedula,
              telefono: cliente.telefono,
              email: cliente.email,
            }))
          : [];

        // Mapear citas con validación
        this.citas = Array.isArray(data.data?.citas)
          ? data.data.citas.map((cita) => ({
              id: cita.cita_id,
              numero: cita.numero_cita,
              cliente: cita.nombre_cliente,
              fecha: cita.fecha_cita,
              estado: cita.estado,
            }))
          : [];

        // Mapear productos con validación
        this.productos = Array.isArray(data.data?.productos)
          ? data.data.productos.map((producto) => ({
              id: producto.producto_id,
              nombre: producto.nombre_producto,
              precio: producto.precio_venta,
              stock: producto.stock_sucursal,
            }))
          : [];

        // Mapear servicios con validación
        this.servicios = Array.isArray(data.data?.servicios)
          ? data.data.servicios.map((servicio) => ({
              id: servicio.servicio_id,
              nombre: servicio.nombre_servicio,
              precio: servicio.precio_servicio,
            }))
          : [];

        // Poblar selectores
        this.populateSelectors();

        console.log("✅ Datos de selectores procesados:", {
          clientes: this.clientes.length,
          citas: this.citas.length,
          productos: this.productos.length,
          servicios: this.servicios.length,
        });
      } else {
        throw new Error("Error en la respuesta de datos de formulario");
      }
    } catch (error) {
      console.error("❌ Error general cargando datos de selectores:", error);
      console.error("❌ Detalles del error:", error.message);
      console.error("❌ Stack trace:", error.stack);

      // Inicializar selectores vacíos en caso de error
      this.clientes = [];
      this.citas = [];
      this.productos = [];
      this.servicios = [];

      // Mostrar toast informativo
      this.showToast(
        "Error al cargar datos de formulario. Algunos selectores pueden estar vacíos.",
        "warning"
      );
    }

    // Cargar configuraciones adicionales del sistema
    await this.loadSystemConfigurations();
  }

  async loadMetodosPago() {
    try {
      console.log("💳 Cargando métodos de pago desde la API...");

      const response = await fetch(`${this.baseUrl}/api/metodos_pagos`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("💳 Métodos de pago recibidos:", data);

      if (data.success) {
        // Mapear métodos de pago
        this.metodosPago = data.data.map((metodo) => ({
          id: metodo.metodo_pago_id,
          descripcion: metodo.descripcion_metodo,
        }));

        console.log("✅ Métodos de pago cargados:", this.metodosPago);
      } else {
        throw new Error("Error en la respuesta de métodos de pago");
      }
    } catch (error) {
      console.error("❌ Error cargando métodos de pago:", error);
      // Fallback con métodos por defecto
      this.metodosPago = [
        { id: 1, descripcion: "Efectivo" },
        { id: 2, descripcion: "Tarjeta de Crédito" },
        { id: 3, descripcion: "Transferencia" },
      ];
      console.log("⚠️ Usando métodos de pago por defecto");
    }
  }

  async loadSystemConfigurations() {
    try {
      console.log("⚙️ Cargando configuraciones del sistema...");

      const response = await fetch(
        `${this.baseUrl}/api/configuracion/ESTADOS_FACTURA`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("⚙️ Configuraciones de estados recibidas:", data);

        if (data.success && data.data.length > 0) {
          // Actualizar selector de filtro de estado
          this.updateEstadoFilter(data.data);
        }
      }
    } catch (error) {
      console.log(
        "⚠️ Configuraciones del sistema no disponibles, usando valores por defecto"
      );
    }
  }

  updateEstadoFilter(estadosConfig) {
    const filterEstado = document.getElementById("filterEstado");
    if (filterEstado) {
      // Mantener la opción "Todos los estados"
      const currentValue = filterEstado.value;
      filterEstado.innerHTML = '<option value="">Todos los estados</option>';

      estadosConfig.forEach((config) => {
        const option = document.createElement("option");
        option.value = config.clave;
        option.textContent = config.valor;
        filterEstado.appendChild(option);
      });

      // Restaurar valor seleccionado si existía
      if (currentValue) {
        filterEstado.value = currentValue;
      }
    }
  }

  populateSelectors() {
    console.log("🔧 Poblando selectores...");

    // Poblar selector de clientes
    const clienteSelect = document.getElementById("clienteId");
    if (clienteSelect) {
      clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
      this.clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = `${cliente.nombre} - ${cliente.cedula}`;
        clienteSelect.appendChild(option);
      });
    }

    // Poblar selector de citas
    const citaSelect = document.getElementById("citaId");
    if (citaSelect) {
      citaSelect.innerHTML =
        '<option value="">Seleccionar cita (opcional)</option>';
      this.citas.forEach((cita) => {
        const option = document.createElement("option");
        option.value = cita.id;
        option.textContent = `${cita.numero} - ${cita.cliente} (${cita.fecha})`;
        citaSelect.appendChild(option);
      });
    }

    // Poblar selector de métodos de pago
    const metodoPagoSelect = document.getElementById("metodoPagoId");
    if (metodoPagoSelect) {
      metodoPagoSelect.innerHTML =
        '<option value="">Seleccionar método</option>';
      this.metodosPago.forEach((metodo) => {
        const option = document.createElement("option");
        option.value = metodo.id;
        option.textContent = metodo.descripcion;
        metodoPagoSelect.appendChild(option);
      });
    }

    // Poblar selector de filtro por método de pago
    const filterMetodoPago = document.getElementById("filterMetodoPago");
    if (filterMetodoPago) {
      filterMetodoPago.innerHTML =
        '<option value="">Todos los métodos</option>';
      this.metodosPago.forEach((metodo) => {
        const option = document.createElement("option");
        option.value = metodo.descripcion;
        option.textContent = metodo.descripcion;
        filterMetodoPago.appendChild(option);
      });
    }

    console.log("✅ Selectores poblados correctamente");
  }

  updateEstadistica(elementId, value) {
    const element = document.getElementById(elementId);
    console.log(`📊 Actualizando estadística: ${elementId} = ${value}`);

    if (element) {
      if (elementId.includes("ingresos") || elementId.includes("monto")) {
        const formattedValue = `$${value.toLocaleString()}`;
        element.textContent = formattedValue;
        console.log(`✅ Elemento ${elementId} actualizado: ${formattedValue}`);
      } else {
        const formattedValue = value.toLocaleString();
        element.textContent = formattedValue;
        console.log(`✅ Elemento ${elementId} actualizado: ${formattedValue}`);
      }
    } else {
      console.error(
        `❌ Elemento con ID '${elementId}' no encontrado en el DOM`
      );
    }
  }

  updateTable() {
    console.log("🔄 Actualizando tabla...");

    if (!this.tabla) {
      console.error("❌ Elemento tabla no encontrado");
      return;
    }

    this.tabla.innerHTML = "";

    if (this.facturas.length === 0) {
      console.log("📊 No hay facturas para mostrar");
      this.tabla.innerHTML = `
        <tr>
          <td colspan="8" class="px-6 py-8 text-center text-gray-500">
            <i class="fas fa-file-invoice text-4xl mb-4 opacity-50"></i>
            <p>No se encontraron facturas</p>
          </td>
        </tr>
      `;
      return;
    }

    // Mostrar todas las facturas recibidas del servidor (ya paginadas)
    this.facturas.forEach((factura) => {
      const row = this.createFacturaRow(factura);
      this.tabla.appendChild(row);
    });

    console.log("✅ Tabla actualizada correctamente");
  }

  createFacturaRow(factura) {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-colors";

    row.innerHTML = `
      <td class="px-6 py-4">
        <span class="text-sm font-medium text-gray-900">${
          factura.numero || "N/A"
        }</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm text-gray-900">${factura.cliente || "N/A"}</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm text-gray-900">${factura.fecha || "N/A"}</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm font-medium text-gray-900">$${
          factura.total?.toLocaleString() || "0"
        }</span>
      </td>
      <td class="px-6 py-4">
        <span class="text-sm text-gray-900">${
          factura.metodoPago || "N/A"
        }</span>
      </td>
      <td class="px-6 py-4">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getEstadoClasses(
          factura.estado
        )}">
          ${factura.estado || "N/A"}
        </span>
      </td>
      <td class="px-6 py-4 text-right">
        <div class="flex items-center justify-end space-x-2">
          <button onclick="facturasModule.viewFactura(${factura.id})" 
                  class="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50" title="Ver Detalles">
            <i class="fas fa-eye mr-1"></i>
            Ver
          </button>
          <button onclick="facturasModule.generarPDFFactura(${factura.id})" 
                  class="text-green-600 hover:text-green-800 font-medium px-2 py-1 rounded hover:bg-green-50" title="Generar PDF">
            <i class="fas fa-file-pdf mr-1"></i>
            PDF
          </button>
          <div class="relative">
            <button onclick="facturasModule.toggleEstadoMenu(${factura.id})" 
                    class="text-orange-600 hover:text-orange-800 font-medium px-2 py-1 rounded hover:bg-orange-50" title="Cambiar Estado">
              <i class="fas fa-cog mr-1"></i>
              Estado
            </button>
            <div id="estadoMenu-${
              factura.id
            }" class="hidden absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 estado-menu">
              <button onclick="facturasModule.cambiarEstadoFactura(${
                factura.id
              }, 'PENDIENTE')" 
                      class="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">
                <i class="fas fa-clock mr-2"></i>Pendiente
              </button>
              <button onclick="facturasModule.cambiarEstadoFactura(${
                factura.id
              }, 'PAGADA')" 
                      class="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                <i class="fas fa-check mr-2"></i>Pagada
              </button>
              <button onclick="facturasModule.cambiarEstadoFactura(${
                factura.id
              }, 'CANCELADA')" 
                      class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                <i class="fas fa-times mr-2"></i>Cancelada
              </button>
              <button onclick="facturasModule.cambiarEstadoFactura(${
                factura.id
              }, 'VENCIDA')" 
                      class="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                <i class="fas fa-exclamation-triangle mr-2"></i>Vencida
              </button>
            </div>
          </div>
        </div>
      </td>
    `;

    return row;
  }

  getEstadoClasses(estado) {
    switch (estado) {
      case "PAGADA":
        return "bg-green-100 text-green-800";
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELADA":
        return "bg-red-100 text-red-800";
      case "VENCIDA":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  updatePagination() {
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

    this.updatePaginationInfo();
  }

  updatePaginationInfo() {
    const element = document.getElementById("paginaInfo");
    if (!element) return;

    if (this.totalRecords) {
      // Usar información del servidor
      const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endIndex = Math.min(
        this.currentPage * this.itemsPerPage,
        this.totalRecords
      );
      element.textContent = `${startIndex}-${endIndex} de ${this.totalRecords}`;
    } else {
      // Fallback a información local
      const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
      const endIndex = Math.min(
        this.currentPage * this.itemsPerPage,
        this.filteredFacturas.length
      );
      const total = this.filteredFacturas.length;
      element.textContent = `${startIndex}-${endIndex} de ${total}`;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadFacturas(); // Cargar nueva página desde el servidor
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadFacturas(); // Cargar nueva página desde el servidor
    }
  }

  filterFacturas() {
    console.log("🔍 Aplicando filtros y recargando datos del servidor...");

    // Los filtros ahora se aplicarán en el servidor mediante loadFacturas()
    this.currentPage = 1; // Reiniciar a la primera página
    this.loadFacturas(); // Recargar con los filtros aplicados
  }

  clearFilters() {
    console.log("🧹 Limpiando filtros...");

    // Limpiar todos los campos de filtro
    const searchInput = document.getElementById("searchFactura");
    const filterEstado = document.getElementById("filterEstado");
    const filterMetodoPago = document.getElementById("filterMetodoPago");
    const filterFecha = document.getElementById("filterFecha");

    if (searchInput) searchInput.value = "";
    if (filterEstado) filterEstado.value = "";
    if (filterMetodoPago) filterMetodoPago.value = "";
    if (filterFecha) filterFecha.value = "";

    // Reiniciar paginación y recargar datos
    this.currentPage = 1;
    this.loadFacturas();
  }

  showCreateModal() {
    console.log("🔧 Abriendo modal para crear nueva factura");

    this.editMode = false;
    this.currentFacturaId = null;

    const titulo = document.getElementById("tituloModal");
    if (titulo) {
      titulo.textContent = "Nueva Factura";
    }

    this.resetForm();
    this.generateFacturaNumber();
    this.setCurrentDate();
    this.showModal();
  }

  generateFacturaNumber() {
    const numero = `FAC-${Date.now()}`;
    const numeroFacturaInput = document.getElementById("numeroFactura");
    if (numeroFacturaInput) {
      numeroFacturaInput.value = numero;
    }
    console.log("📋 Número de factura generado:", numero);
  }

  setCurrentDate() {
    const fechaInput = document.getElementById("fechaEmision");
    if (fechaInput) {
      const today = new Date().toISOString().split("T")[0];
      fechaInput.value = today;
    }
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
    this.currentFacturaId = null;
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
    }

    // Limpiar tabla de detalles
    const detallesBody = document.getElementById("detallesFactura");
    if (detallesBody) {
      detallesBody.innerHTML = "";
    }

    // Resetear totales
    document.getElementById("subtotal").value = "0.00";
    document.getElementById("descuento").value = "0";
    document.getElementById("impuestos").value = "7";
    document.getElementById("totalFactura").textContent = "$0.00";

    // Array para almacenar detalles
    this.detallesFactura = [];
  }

  async handleSubmit(e) {
    e.preventDefault();

    console.log("🚀 === INICIANDO ENVÍO DE FACTURA ===");

    try {
      const formData = this.getFormData();
      console.log("📋 Datos de la factura:", formData);

      // Validar que hay al menos un detalle
      if (!formData.detalles || formData.detalles.length === 0) {
        throw new Error("Debe agregar al menos un detalle a la factura");
      }

      // Deshabilitar botón de envío
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
      }

      const response = await fetch(`${this.baseUrl}/api/facturas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("✅ Respuesta del servidor:", result);

      if (result.success) {
        this.showToast("Factura creada correctamente", "success");
        this.closeModal();
        await this.loadFacturas(); // Recargar lista
        await this.loadEstadisticas(); // Actualizar estadísticas
      } else {
        throw new Error(
          result.error || "Error desconocido al crear la factura"
        );
      }
    } catch (error) {
      console.error("❌ Error en handleSubmit:", error);
      this.showToast(`Error al procesar la factura: ${error.message}`, "error");
    } finally {
      // Rehabilitar botón de envío
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fas fa-file-invoice mr-2"></i>Generar Factura';
      }
    }
  }

  getFormData() {
    // Datos básicos de la factura
    const numeroFactura = document.getElementById("numeroFactura")?.value;
    const fechaEmision = document.getElementById("fechaEmision")?.value;
    const clienteId = document.getElementById("clienteId")?.value;
    const citaId = document.getElementById("citaId")?.value;
    const metodoPagoId = document.getElementById("metodoPagoId")?.value;

    // Totales
    const subtotal =
      parseFloat(document.getElementById("subtotal")?.value) || 0;
    const descuentoPorcentaje =
      parseFloat(document.getElementById("descuento")?.value) || 0;
    const impuestosPorcentaje =
      parseFloat(document.getElementById("impuestos")?.value) || 0;

    // Calcular valores finales
    const descuentoMonto = (subtotal * descuentoPorcentaje) / 100;
    const subtotalConDescuento = subtotal - descuentoMonto;
    const impuestosMonto = (subtotalConDescuento * impuestosPorcentaje) / 100;
    const totalFactura = subtotalConDescuento + impuestosMonto;

    // Obtener detalles de la tabla
    const detalles = [];
    const detallesBody = document.getElementById("detallesFactura");

    if (detallesBody) {
      const filasDetalles = detallesBody.querySelectorAll("tr");

      filasDetalles.forEach((fila) => {
        const tipoItem = fila.querySelector(".tipo-item")?.value;
        const itemSelect = fila.querySelector(".item-select");
        const itemId = itemSelect?.value;
        const descripcion =
          itemSelect?.options[itemSelect.selectedIndex]?.textContent || "";
        const cantidad =
          parseFloat(fila.querySelector(".cantidad")?.value) || 0;
        const precioUnitario =
          parseFloat(fila.querySelector(".precio-unitario")?.value) || 0;
        const totalLinea =
          parseFloat(fila.querySelector(".total-linea")?.value) || 0;

        if (tipoItem && itemId && cantidad > 0) {
          detalles.push({
            tipo_item: tipoItem,
            item_id: parseInt(itemId),
            descripcion_item: descripcion.split(" (")[0], // Remover info adicional como stock
            cantidad: cantidad,
            precio_unitario: precioUnitario,
            total_linea: totalLinea,
          });
        }
      });
    }

    // Validaciones
    if (!numeroFactura) throw new Error("Número de factura es requerido");
    if (!fechaEmision) throw new Error("Fecha de emisión es requerida");
    if (!clienteId) throw new Error("Cliente es requerido");
    if (!metodoPagoId) throw new Error("Método de pago es requerido");
    if (detalles.length === 0)
      throw new Error("Debe agregar al menos un detalle");

    return {
      numero_factura: numeroFactura,
      fecha_emision: fechaEmision,
      cliente_id: parseInt(clienteId),
      cita_id: citaId ? parseInt(citaId) : null,
      metodo_pago_id: parseInt(metodoPagoId),
      subtotal: subtotal,
      descuento: descuentoMonto,
      impuestos: impuestosMonto,
      total_factura: totalFactura,
      detalles: detalles,
      observaciones: null, // Se puede agregar un campo de observaciones si es necesario
    };
  }

  agregarDetalle() {
    console.log("➕ Agregando detalle a la factura");

    // Crear una fila nueva para el detalle
    const detallesBody = document.getElementById("detallesFactura");
    if (!detallesBody) return;

    const detalleId = Date.now(); // ID único temporal
    const fila = document.createElement("tr");
    fila.setAttribute("data-detalle-id", detalleId);

    fila.innerHTML = `
      <td class="px-4 py-2">
        <select class="w-full px-2 py-1 border border-gray-300 rounded tipo-item" required>
          <option value="">Seleccionar</option>
          <option value="PRODUCTO">Producto</option>
          <option value="SERVICIO">Servicio</option>
        </select>
      </td>
      <td class="px-4 py-2">
        <select class="w-full px-2 py-1 border border-gray-300 rounded item-select" disabled required>
          <option value="">Seleccionar tipo primero</option>
        </select>
      </td>
      <td class="px-4 py-2">
        <input type="number" class="w-full px-2 py-1 border border-gray-300 rounded cantidad" 
               min="1" value="1" required>
      </td>
      <td class="px-4 py-2">
        <input type="number" class="w-full px-2 py-1 border border-gray-300 rounded precio-unitario" 
               step="0.01" min="0" readonly>
      </td>
      <td class="px-4 py-2">
        <input type="number" class="w-full px-2 py-1 border border-gray-300 rounded total-linea" 
               step="0.01" readonly>
      </td>
      <td class="px-4 py-2 text-center">
        <button type="button" class="text-red-600 hover:text-red-800 btn-eliminar-detalle" 
                onclick="facturasModule.eliminarDetalle(${detalleId})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    detallesBody.appendChild(fila);

    // Agregar event listeners a la nueva fila
    this.setupDetalleEventListeners(fila);
  }

  setupDetalleEventListeners(fila) {
    const tipoSelect = fila.querySelector(".tipo-item");
    const itemSelect = fila.querySelector(".item-select");
    const cantidadInput = fila.querySelector(".cantidad");
    const precioInput = fila.querySelector(".precio-unitario");
    const totalInput = fila.querySelector(".total-linea");

    // Cambio de tipo de item
    tipoSelect.addEventListener("change", () => {
      this.onTipoItemChange(tipoSelect, itemSelect, precioInput);
    });

    // Cambio de item seleccionado
    itemSelect.addEventListener("change", () => {
      this.onItemChange(itemSelect, precioInput);
      this.calcularTotalLinea(cantidadInput, precioInput, totalInput);
    });

    // Cambio de cantidad
    cantidadInput.addEventListener("input", () => {
      this.calcularTotalLinea(cantidadInput, precioInput, totalInput);
    });

    // Cambio en descuento e impuestos
    const descuentoInput = document.getElementById("descuento");
    const impuestosInput = document.getElementById("impuestos");

    if (descuentoInput) {
      descuentoInput.addEventListener("input", () => this.calcularTotales());
    }

    if (impuestosInput) {
      impuestosInput.addEventListener("input", () => this.calcularTotales());
    }
  }

  onTipoItemChange(tipoSelect, itemSelect, precioInput) {
    const tipo = tipoSelect.value;
    itemSelect.innerHTML = '<option value="">Seleccionar...</option>';
    itemSelect.disabled = !tipo;
    precioInput.value = "";

    if (tipo === "PRODUCTO") {
      this.productos.forEach((producto) => {
        const option = document.createElement("option");
        option.value = producto.id;
        option.setAttribute("data-precio", producto.precio);
        option.setAttribute("data-stock", producto.stock);
        option.textContent = `${producto.nombre} (Stock: ${producto.stock})`;
        itemSelect.appendChild(option);
      });
    } else if (tipo === "SERVICIO") {
      this.servicios.forEach((servicio) => {
        const option = document.createElement("option");
        option.value = servicio.id;
        option.setAttribute("data-precio", servicio.precio);
        option.textContent = servicio.nombre;
        itemSelect.appendChild(option);
      });
    }
  }

  onItemChange(itemSelect, precioInput) {
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    if (selectedOption && selectedOption.value) {
      const precio = selectedOption.getAttribute("data-precio") || 0;
      precioInput.value = parseFloat(precio).toFixed(2);
    } else {
      precioInput.value = "";
    }
  }

  calcularTotalLinea(cantidadInput, precioInput, totalInput) {
    const cantidad = parseFloat(cantidadInput.value) || 0;
    const precio = parseFloat(precioInput.value) || 0;
    const total = cantidad * precio;

    totalInput.value = total.toFixed(2);
    this.calcularTotales();
  }

  calcularTotales() {
    const detallesBody = document.getElementById("detallesFactura");
    if (!detallesBody) return;

    let subtotal = 0;
    const filasDetalles = detallesBody.querySelectorAll("tr");

    filasDetalles.forEach((fila) => {
      const totalLinea =
        parseFloat(fila.querySelector(".total-linea").value) || 0;
      subtotal += totalLinea;
    });

    const descuentoPorcentaje =
      parseFloat(document.getElementById("descuento").value) || 0;
    const impuestosPorcentaje =
      parseFloat(document.getElementById("impuestos").value) || 0;

    const descuentoMonto = (subtotal * descuentoPorcentaje) / 100;
    const subtotalConDescuento = subtotal - descuentoMonto;
    const impuestosMonto = (subtotalConDescuento * impuestosPorcentaje) / 100;
    const totalFinal = subtotalConDescuento + impuestosMonto;

    // Actualizar campos
    document.getElementById("subtotal").value = subtotal.toFixed(2);
    document.getElementById(
      "totalFactura"
    ).textContent = `$${totalFinal.toFixed(2)}`;

    console.log(
      `💰 Totales calculados: Subtotal: $${subtotal.toFixed(
        2
      )}, Total: $${totalFinal.toFixed(2)}`
    );
  }

  eliminarDetalle(detalleId) {
    console.log("🗑️ Eliminando detalle:", detalleId);

    const fila = document.querySelector(`tr[data-detalle-id="${detalleId}"]`);
    if (fila) {
      fila.remove();
      this.calcularTotales();
    }
  }

  async viewFactura(facturaId) {
    console.log("👁️ Viendo factura:", facturaId);

    try {
      const response = await fetch(`${this.baseUrl}/api/facturas/${facturaId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📄 Datos de la factura:", data);
      console.log(
        "📊 Estructura de data.data:",
        JSON.stringify(data.data, null, 2)
      );

      if (data.success) {
        this.showFacturaDetails(data.data);
      } else {
        throw new Error(
          data.error || "Error al obtener los datos de la factura"
        );
      }
    } catch (error) {
      console.error("❌ Error al ver factura:", error);
      this.showToast(`Error al cargar los detalles: ${error.message}`, "error");
    }
  }

  showFacturaDetails(facturaData) {
    console.log("👁️ Mostrando detalles de factura:", facturaData);

    // Determinar la estructura correcta de los datos
    let factura, detalles;

    if (facturaData.factura && facturaData.detalles) {
      // Estructura: { factura: {...}, detalles: [...] }
      factura = facturaData.factura;
      detalles = facturaData.detalles;
    } else if (Array.isArray(facturaData)) {
      // Es un array, probablemente la primera posición es la factura
      factura = facturaData[0];
      detalles = facturaData.slice(1);
    } else if (facturaData.numero_factura || facturaData.factura_id) {
      // Los datos están directamente en el objeto principal
      factura = facturaData;
      detalles = facturaData.detalles || [];
    } else {
      console.error("❌ Estructura de datos no reconocida:", facturaData);
      this.showToast(
        "Error: estructura de datos de factura no válida",
        "error"
      );
      return;
    }

    // Extraer datos con fallbacks
    const numeroFactura =
      factura.numero_factura ||
      factura.numeroFactura ||
      factura.numero ||
      "N/A";
    const nombreCliente =
      factura.nombre_cliente ||
      factura.nombreCliente ||
      factura.cliente ||
      "N/A";
    const numeroCedula =
      factura.numero_cedula || factura.numeroCedula || factura.cedula || "N/A";
    const telefono = factura.telefono || "N/A";
    const email = factura.email || "N/A";
    const fechaEmision =
      factura.fecha_emision || factura.fechaEmision || factura.fecha || "N/A";
    const estado = factura.estado || factura.estadoFactura || "N/A";
    const metodoPago = factura.metodo_pago || factura.metodoPago || "N/A";
    const totalFactura =
      factura.total_factura || factura.totalFactura || factura.total || 0;

    // Crear modal de vista (implementación básica)
    const modalContent = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold">Factura ${numeroFactura}</h2>
              <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                      class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="font-semibold mb-2">Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${nombreCliente}</p>
                <p><strong>Cédula:</strong> ${numeroCedula}</p>
                <p><strong>Teléfono:</strong> ${telefono}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>
              
              <div>
                <h3 class="font-semibold mb-2">Información de la Factura</h3>
                <p><strong>Fecha:</strong> ${fechaEmision}</p>
                <p><strong>Estado:</strong> ${estado}</p>
                <p><strong>Método de Pago:</strong> ${metodoPago}</p>
                <p><strong>Total:</strong> $${parseFloat(
                  totalFactura
                ).toLocaleString()}</p>
              </div>
            </div>
            
            <div class="mb-6">
              <h3 class="font-semibold mb-4">Detalles</h3>
              <div class="overflow-x-auto">
                <table class="w-full border border-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left">Tipo</th>
                      <th class="px-4 py-2 text-left">Descripción</th>
                      <th class="px-4 py-2 text-left">Cantidad</th>
                      <th class="px-4 py-2 text-left">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${
                      detalles && detalles.length > 0
                        ? detalles
                            .map((detalle) => {
                              const descripcion =
                                detalle.descripcion_item ||
                                detalle.descripcion ||
                                "N/A";
                              const tipoItem =
                                detalle.tipo_item || detalle.tipo || "N/A";
                              const cantidad = detalle.cantidad || 0;
                              const totalLinea =
                                detalle.total_linea || detalle.total || 0;

                              return `
                          <tr>
                            <td class="px-4 py-2">${tipoItem}</td>
                            <td class="px-4 py-2">${descripcion}</td>
                            <td class="px-4 py-2">${cantidad}</td>
                            <td class="px-4 py-2">$${parseFloat(
                              totalLinea
                            ).toLocaleString()}</td>
                          </tr>
                        `;
                            })
                            .join("")
                        : '<tr><td colspan="4" class="px-4 py-2 text-center text-gray-500">No hay detalles disponibles</td></tr>'
                    }
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="flex justify-end space-x-4">
              <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                      class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Agregar modal al DOM
    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = modalContent;
    document.body.appendChild(modalDiv);
  }

  async generarPDFFactura(facturaId) {
    console.log("📄 Generando PDF de factura:", facturaId);

    let originalText = null;

    try {
      // Mostrar loading en el botón
      const btnPDF = document.querySelector(
        `button[onclick*="generarPDFFactura(${facturaId})"]`
      );
      if (btnPDF) {
        originalText = btnPDF.innerHTML;
        btnPDF.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>PDF...';
        btnPDF.disabled = true;
      }

      // Obtener datos de la factura
      const response = await fetch(`${this.baseUrl}/api/facturas/${facturaId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📄 Datos de la factura para PDF:", data);
      console.log(
        "📊 Estructura de data.data:",
        JSON.stringify(data.data, null, 2)
      );

      if (data.success) {
        await this.generarPDFFacturaCompleta(data.data);
      } else {
        throw new Error(
          data.error || "Error al obtener los datos de la factura"
        );
      }
    } catch (error) {
      console.error("❌ Error generando PDF de factura:", error);
      this.showToast(`Error al generar PDF: ${error.message}`, "error");
    } finally {
      // Restaurar botón
      const btnPDF = document.querySelector(
        `button[onclick*="generarPDFFactura(${facturaId})"]`
      );
      if (btnPDF && originalText) {
        btnPDF.innerHTML = originalText;
        btnPDF.disabled = false;
      }
    }
  }

  async generarPDFFacturaCompleta(facturaData) {
    console.log("🖨️ Generando PDF completo de la factura");
    console.log("📊 Datos recibidos para PDF:", facturaData);

    // Verificar si jsPDF está disponible
    if (typeof window.jsPDF === "undefined") {
      console.error("❌ jsPDF no está disponible");
      this.showToast("Error: Librería jsPDF no disponible", "error");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Determinar la estructura correcta de los datos
    let factura, detalles;

    if (facturaData.factura && facturaData.detalles) {
      // Estructura: { factura: {...}, detalles: [...] }
      factura = facturaData.factura;
      detalles = facturaData.detalles;
    } else if (Array.isArray(facturaData)) {
      // Es un array, probablemente la primera posición es la factura
      factura = facturaData[0];
      detalles = facturaData.slice(1); // O podría ser facturaData[0].detalles
    } else if (facturaData.numero_factura || facturaData.factura_id) {
      // Los datos están directamente en el objeto principal
      factura = facturaData;
      detalles = facturaData.detalles || [];
    } else {
      console.error("❌ Estructura de datos no reconocida:", facturaData);
      throw new Error("Estructura de datos de factura no válida");
    }

    console.log("📋 Factura procesada:", factura);
    console.log("📋 Detalles procesados:", detalles);

    // Configuración del documento
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Encabezado de la empresa
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TecnoTaller", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestión Automotriz", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 8;
    doc.text(
      "Tel: (507) 123-4567 | Email: info@tecnotaller.com",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 20;

    // Título de la factura
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const numeroFactura =
      factura.numero_factura ||
      factura.numeroFactura ||
      factura.numero ||
      "N/A";
    doc.text(`FACTURA ${numeroFactura}`, pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 20;

    // Información de la factura en dos columnas
    const leftCol = 20;
    const rightCol = pageWidth / 2 + 10;

    // Columna izquierda - Datos del cliente
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", leftCol, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    const nombreCliente =
      factura.nombre_cliente ||
      factura.nombreCliente ||
      factura.cliente ||
      "N/A";
    const numeroCedula =
      factura.numero_cedula || factura.numeroCedula || factura.cedula || "N/A";
    const telefono = factura.telefono || "N/A";
    const email = factura.email || "N/A";

    doc.text(`Nombre: ${nombreCliente}`, leftCol, yPosition);
    yPosition += 6;
    doc.text(`Cédula: ${numeroCedula}`, leftCol, yPosition);
    yPosition += 6;
    if (telefono !== "N/A") {
      doc.text(`Teléfono: ${telefono}`, leftCol, yPosition);
      yPosition += 6;
    }
    if (email !== "N/A") {
      doc.text(`Email: ${email}`, leftCol, yPosition);
    }

    // Columna derecha - Datos de la factura
    yPosition = 68; // Resetear posición para la segunda columna

    doc.setFont("helvetica", "bold");
    doc.text("DATOS DE LA FACTURA", rightCol, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    const fechaEmision =
      factura.fecha_emision || factura.fechaEmision || factura.fecha || "N/A";
    const estado = factura.estado || factura.estadoFactura || "N/A";
    const metodoPago = factura.metodo_pago || factura.metodoPago || "N/A";
    const numeroCita =
      factura.numero_cita || factura.numeroCita || factura.cita_id || null;

    doc.text(
      `Fecha: ${new Date(fechaEmision).toLocaleDateString()}`,
      rightCol,
      yPosition
    );
    yPosition += 6;
    doc.text(`Estado: ${estado}`, rightCol, yPosition);
    yPosition += 6;
    doc.text(`Método de Pago: ${metodoPago}`, rightCol, yPosition);
    yPosition += 6;
    if (numeroCita) {
      doc.text(`Cita: ${numeroCita}`, rightCol, yPosition);
    }

    yPosition = 110; // Posición fija para la tabla

    // Línea separadora
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Tabla de detalles
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA FACTURA", leftCol, yPosition);
    yPosition += 10;

    // Cabeceras de la tabla
    const headers = ["Descripción", "Tipo", "Cant.", "P. Unit.", "Total"];
    const colWidths = [70, 30, 20, 25, 25];
    let xPosition = leftCol;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    // Línea bajo las cabeceras
    yPosition += 3;
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    // Datos de los detalles
    doc.setFont("helvetica", "normal");

    if (detalles && detalles.length > 0) {
      detalles.forEach((detalle) => {
        // Verificar si necesitamos nueva página
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        xPosition = leftCol;
        const descripcion =
          detalle.descripcion_item || detalle.descripcion || "N/A";
        const tipoItem = detalle.tipo_item || detalle.tipo || "N/A";
        const cantidad = detalle.cantidad || 0;
        const precioUnitario = detalle.precio_unitario || detalle.precio || 0;
        const totalLinea = detalle.total_linea || detalle.total || 0;

        const rowData = [
          descripcion.substring(0, 30), // Truncar descripción larga
          tipoItem,
          cantidad.toString(),
          `$${parseFloat(precioUnitario).toFixed(2)}`,
          `$${parseFloat(totalLinea).toFixed(2)}`,
        ];

        rowData.forEach((data, index) => {
          doc.text(data, xPosition, yPosition);
          xPosition += colWidths[index];
        });

        yPosition += 7;
      });
    } else {
      doc.text("No hay detalles disponibles", leftCol, yPosition);
      yPosition += 10;
    }

    yPosition += 10;

    // Totales
    const totalsX = pageWidth - 80;

    doc.line(totalsX, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;

    doc.setFont("helvetica", "normal");
    const subtotal = factura.subtotal || factura.subtotalFactura || 0;
    const descuento = factura.descuento || factura.descuentoFactura || 0;
    const impuestos = factura.impuestos || factura.impuestosFactura || 0;
    const totalFactura =
      factura.total_factura || factura.totalFactura || factura.total || 0;

    doc.text(`Subtotal:`, totalsX, yPosition);
    doc.text(`$${parseFloat(subtotal).toFixed(2)}`, totalsX + 40, yPosition);
    yPosition += 6;

    if (parseFloat(descuento) > 0) {
      doc.text(`Descuento:`, totalsX, yPosition);
      doc.text(
        `-$${parseFloat(descuento).toFixed(2)}`,
        totalsX + 40,
        yPosition
      );
      yPosition += 6;
    }

    doc.text(`Impuestos:`, totalsX, yPosition);
    doc.text(`$${parseFloat(impuestos).toFixed(2)}`, totalsX + 40, yPosition);
    yPosition += 6;

    doc.line(totalsX, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`TOTAL:`, totalsX, yPosition);
    doc.text(
      `$${parseFloat(totalFactura).toFixed(2)}`,
      totalsX + 40,
      yPosition
    );

    // Pie de página
    yPosition = pageHeight - 30;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Gracias por su preferencia - TecnoTaller",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 5;
    doc.text(
      `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Descargar el PDF
    const fileName = `factura-${numeroFactura}-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);

    console.log("✅ PDF de factura generado:", fileName);
    this.showToast("PDF de factura generado correctamente", "success");
  }

  async deleteFactura(facturaId) {
    console.log("🗑️ Eliminando factura:", facturaId);

    if (
      !confirm(
        "¿Está seguro de que desea eliminar esta factura? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      // Nota: El backend podría tener una ruta DELETE, por ahora actualizamos estado
      const response = await fetch(
        `${this.baseUrl}/api/facturas/${facturaId}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: "ANULADA" }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        this.showToast("Factura anulada correctamente", "success");
        await this.loadFacturas(); // Recargar lista
        await this.loadEstadisticas(); // Actualizar estadísticas
      } else {
        throw new Error(result.error || "Error al anular la factura");
      }
    } catch (error) {
      console.error("❌ Error al eliminar factura:", error);
      this.showToast(`Error al anular la factura: ${error.message}`, "error");
    }
  }

  // Función para mostrar/ocultar el menú de estado
  toggleEstadoMenu(facturaId) {
    console.log(`🔧 Toggle menú de estado para factura ${facturaId}`);

    // Cerrar otros menús abiertos
    document.querySelectorAll(".estado-menu:not(.hidden)").forEach((menu) => {
      if (!menu.id.includes(facturaId.toString())) {
        menu.classList.add("hidden");
      }
    });

    const menu = document.getElementById(`estadoMenu-${facturaId}`);
    if (menu) {
      menu.classList.toggle("hidden");

      // Cerrar menú al hacer clic fuera
      if (!menu.classList.contains("hidden")) {
        setTimeout(() => {
          const closeMenu = (e) => {
            if (
              !menu.contains(e.target) &&
              !e.target.closest(
                `button[onclick*="toggleEstadoMenu(${facturaId})"]`
              )
            ) {
              menu.classList.add("hidden");
              document.removeEventListener("click", closeMenu);
            }
          };
          document.addEventListener("click", closeMenu);
        }, 100);
      }
    }
  }

  // Función para cambiar el estado de una factura
  async cambiarEstadoFactura(facturaId, nuevoEstado) {
    console.log(`🔄 Cambiando estado de factura ${facturaId} a ${nuevoEstado}`);

    // Ocultar el menú inmediatamente
    const menu = document.getElementById(`estadoMenu-${facturaId}`);
    if (menu) {
      menu.classList.add("hidden");
    }

    // Confirmar el cambio para estados críticos
    if (nuevoEstado === "CANCELADA" || nuevoEstado === "VENCIDA") {
      const confirmMessage =
        nuevoEstado === "CANCELADA"
          ? "¿Está seguro de que desea cancelar esta factura?"
          : "¿Está seguro de que desea marcar esta factura como vencida?";

      if (!confirm(confirmMessage)) {
        return;
      }
    }

    try {
      // Mostrar indicador de carga en el botón
      const estadoButton = document.querySelector(
        `button[onclick*="toggleEstadoMenu(${facturaId})"]`
      );
      if (estadoButton) {
        const originalText = estadoButton.innerHTML;
        estadoButton.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-1"></i>...';
        estadoButton.disabled = true;
      }

      const response = await fetch(
        `${this.baseUrl}/api/facturas/${facturaId}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        this.showToast(
          `Estado cambiado a ${nuevoEstado} correctamente`,
          "success"
        );

        // Recargar datos para reflejar el cambio
        await this.loadFacturas();
        await this.loadEstadisticas();

        console.log(
          `✅ Estado de factura ${facturaId} cambiado a ${nuevoEstado}`
        );
      } else {
        throw new Error(result.error || "Error al cambiar el estado");
      }
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error);
      this.showToast(`Error al cambiar estado: ${error.message}`, "error");

      // Restaurar botón en caso de error
      const estadoButton = document.querySelector(
        `button[onclick*="toggleEstadoMenu(${facturaId})"]`
      );
      if (estadoButton) {
        estadoButton.innerHTML = '<i class="fas fa-cog mr-1"></i>Estado';
        estadoButton.disabled = false;
      }
    }
  }

  async exportarFacturas() {
    console.log("📊 Exportando facturas...");

    try {
      // Mostrar menú de opciones de exportación
      const exportMenu = document.createElement("div");
      exportMenu.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      exportMenu.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Exportar Facturas</h3>
          <div class="space-y-3">
            <button onclick="facturasModule.exportToCSV(); this.closest('.fixed').remove()" 
                    class="w-full bg-green-100 hover:bg-green-200 text-green-700 p-3 rounded-lg font-medium">
              <i class="fas fa-file-csv mr-2"></i>
              Exportar a CSV
            </button>
            <button onclick="facturasModule.exportToExcel(); this.closest('.fixed').remove()" 
                    class="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-lg font-medium">
              <i class="fas fa-file-excel mr-2"></i>
              Exportar a Excel
            </button>
            <button onclick="facturasModule.exportToPDF(); this.closest('.fixed').remove()" 
                    class="w-full bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-lg font-medium">
              <i class="fas fa-file-pdf mr-2"></i>
              Exportar a PDF
            </button>
          </div>
          <button onclick="this.closest('.fixed').remove()" 
                  class="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg">
            Cancelar
          </button>
        </div>
      `;

      document.body.appendChild(exportMenu);
    } catch (error) {
      console.error("❌ Error al mostrar opciones de exportación:", error);
      this.showToast("Error al mostrar opciones de exportación", "error");
    }
  }

  async exportToCSV() {
    try {
      console.log("📄 Exportando facturas a CSV...");

      // Obtener todas las facturas sin paginación
      const response = await fetch(`${this.baseUrl}/api/facturas?limit=1000`);
      const data = await response.json();

      if (!data.success) {
        throw new Error("Error al obtener datos para exportación");
      }

      // Preparar datos CSV
      const csvHeaders = [
        "Número",
        "Cliente",
        "Fecha",
        "Total",
        "Método Pago",
        "Estado",
      ];
      const csvData = data.data.map((factura) => [
        factura.numero_factura,
        factura.nombre_cliente,
        new Date(factura.fecha_emision).toLocaleDateString(),
        factura.total_factura,
        factura.metodo_pago,
        factura.estado,
      ]);

      // Crear contenido CSV
      const csvContent = [
        csvHeaders.join(","),
        ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      // Descargar archivo
      this.downloadFile(csvContent, "facturas.csv", "text/csv");
      this.showToast("Facturas exportadas a CSV", "success");
    } catch (error) {
      console.error("❌ Error exportando CSV:", error);
      this.showToast("Error al exportar CSV", "error");
    }
  }

  async exportToExcel() {
    try {
      console.log("📊 Exportando facturas a Excel...");

      // Para Excel necesitaríamos una librería como SheetJS
      // Por ahora, exportar como CSV con extensión xlsx
      await this.exportToCSV();
      this.showToast(
        "Funcionalidad Excel en desarrollo. Archivo CSV descargado.",
        "info"
      );
    } catch (error) {
      console.error("❌ Error exportando Excel:", error);
      this.showToast("Error al exportar Excel", "error");
    }
  }

  async exportToPDF() {
    try {
      console.log("📄 Exportando facturas a PDF...");

      // Reutilizar la funcionalidad del reporte de ventas
      await this.generarReporteVentas();
    } catch (error) {
      console.error("❌ Error exportando PDF:", error);
      this.showToast("Error al exportar PDF", "error");
    }
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  setupAutoComplete(searchInput) {
    console.log("🔍 Configurando autocompletado para búsqueda");

    let autocompleteContainer = null;

    searchInput.addEventListener("focus", () => {
      if (searchInput.value.length >= 2) {
        this.showAutoCompleteResults(searchInput, searchInput.value);
      }
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      if (query.length >= 2) {
        this.showAutoCompleteResults(searchInput, query);
      } else {
        this.hideAutoCompleteResults();
      }
    });

    // Cerrar autocomplete al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".autocomplete-container")) {
        this.hideAutoCompleteResults();
      }
    });

    // Navegación con teclado
    searchInput.addEventListener("keydown", (e) => {
      const container = document.querySelector(".autocomplete-results");
      if (!container) return;

      const items = container.querySelectorAll(".autocomplete-item");
      const activeItem = container.querySelector(".autocomplete-item.active");
      let newActiveIndex = -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (activeItem) {
          const currentIndex = Array.from(items).indexOf(activeItem);
          newActiveIndex = Math.min(currentIndex + 1, items.length - 1);
        } else {
          newActiveIndex = 0;
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (activeItem) {
          const currentIndex = Array.from(items).indexOf(activeItem);
          newActiveIndex = Math.max(currentIndex - 1, 0);
        } else {
          newActiveIndex = items.length - 1;
        }
      } else if (e.key === "Enter" && activeItem) {
        e.preventDefault();
        activeItem.click();
      } else if (e.key === "Escape") {
        this.hideAutoCompleteResults();
      }

      // Actualizar item activo
      if (newActiveIndex >= 0) {
        items.forEach((item) => item.classList.remove("active"));
        items[newActiveIndex].classList.add("active");
      }
    });
  }

  async showAutoCompleteResults(input, query) {
    try {
      // Buscar en facturas existentes
      const suggestions = this.facturas
        .filter(
          (factura) =>
            factura.numero.toLowerCase().includes(query.toLowerCase()) ||
            factura.cliente.toLowerCase().includes(query.toLowerCase()) ||
            factura.cedula.includes(query)
        )
        .slice(0, 5) // Limitar a 5 resultados
        .map((factura) => ({
          type: "factura",
          text: `${factura.numero} - ${factura.cliente}`,
          value: factura.numero,
          subtitle: `Total: $${factura.total.toLocaleString()}`,
        }));

      // También buscar en clientes para sugerir
      const clienteSuggestions = this.clientes
        .filter(
          (cliente) =>
            cliente.nombre.toLowerCase().includes(query.toLowerCase()) ||
            cliente.cedula.includes(query)
        )
        .slice(0, 3)
        .map((cliente) => ({
          type: "cliente",
          text: cliente.nombre,
          value: cliente.cedula,
          subtitle: `Cédula: ${cliente.cedula}`,
        }));

      const allSuggestions = [...suggestions, ...clienteSuggestions];

      if (allSuggestions.length > 0) {
        this.renderAutoCompleteResults(input, allSuggestions);
      } else {
        this.hideAutoCompleteResults();
      }
    } catch (error) {
      console.error("❌ Error en autocompletado:", error);
    }
  }

  renderAutoCompleteResults(input, suggestions) {
    this.hideAutoCompleteResults(); // Limpiar resultados anteriores

    const container = document.createElement("div");
    container.className =
      "autocomplete-results absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto";

    suggestions.forEach((suggestion) => {
      const item = document.createElement("div");
      item.className =
        "autocomplete-item px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100";

      item.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">${suggestion.text}</div>
            <div class="text-sm text-gray-500">${suggestion.subtitle}</div>
          </div>
          <div class="text-xs text-gray-400 capitalize">${suggestion.type}</div>
        </div>
      `;

      item.addEventListener("click", () => {
        input.value = suggestion.value;
        this.hideAutoCompleteResults();
        this.filterFacturas();
      });

      container.appendChild(item);
    });

    // Posicionar el contenedor
    const inputContainer = input.parentElement;
    inputContainer.style.position = "relative";
    inputContainer.appendChild(container);
  }

  hideAutoCompleteResults() {
    const existingResults = document.querySelector(".autocomplete-results");
    if (existingResults) {
      existingResults.remove();
    }
  }

  // Utility: Toast Messages
  showToast(message, type = "info") {
    console.log(`🔔 Mostrando toast: "${message}" tipo: ${type}`);

    // Usar el toast manager global si está disponible
    if (window.toastManager) {
      console.log("   Usando toast manager global");
      window.toastManager.show(message, type);
      return;
    }

    console.log("   Toast manager no disponible, usando alert fallback");

    if (type === "error") {
      alert("Error: " + message);
    } else if (type === "success") {
      alert("Éxito: " + message);
    } else {
      alert(message);
    }

    console.log("   Toast mostrado exitosamente");
  }

  // Función de prueba para las estadísticas (solo para desarrollo)
  async testEstadisticas() {
    console.log("🧪 === PROBANDO CARGA DE ESTADÍSTICAS ===");
    try {
      await this.loadEstadisticas();
      console.log("✅ Prueba de estadísticas completada");
    } catch (error) {
      console.error("❌ Error en prueba de estadísticas:", error);
    }
  }

  // Función de prueba para filtros (solo para desarrollo)
  async testFiltros() {
    console.log("🧪 === PROBANDO FILTROS ===");

    try {
      // Probar filtro por estado
      console.log("🔍 Probando filtro por estado...");
      document.getElementById("filterEstado").value = "PENDIENTE";
      await this.filterFacturas();

      // Probar filtro por método de pago
      console.log("🔍 Probando filtro por método de pago...");
      document.getElementById("filterMetodoPago").value = "EFECTIVO";
      await this.filterFacturas();

      // Probar filtro por fecha
      console.log("🔍 Probando filtro por fecha...");
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("filterFecha").value = today;
      await this.filterFacturas();

      // Limpiar filtros
      console.log("🧹 Limpiando filtros...");
      this.clearFilters();

      console.log("✅ Prueba de filtros completada");
    } catch (error) {
      console.error("❌ Error en prueba de filtros:", error);
    }
  }

  // Función de prueba para debugging de estructura de datos
  async testFacturaStructure(facturaId = 1) {
    console.log("🧪 === PROBANDO ESTRUCTURA DE DATOS DE FACTURA ===");
    console.log(`🔍 Probando con facturaId: ${facturaId}`);

    try {
      const response = await fetch(`${this.baseUrl}/api/facturas/${facturaId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📊 Respuesta completa del servidor:", data);
      console.log("📊 Tipo de data.data:", typeof data.data);
      console.log("📊 Es array data.data:", Array.isArray(data.data));

      if (data.success && data.data) {
        console.log("📊 Estructura detallada de data.data:");
        console.log(JSON.stringify(data.data, null, 2));

        // Analizar posibles estructuras
        if (data.data.factura) {
          console.log(
            "✅ Estructura detectada: { factura: {...}, detalles: [...] }"
          );
          console.log("📋 Factura:", data.data.factura);
          console.log("📋 Detalles:", data.data.detalles);
        } else if (Array.isArray(data.data)) {
          console.log("✅ Estructura detectada: Array");
          console.log("📋 Primer elemento (factura):", data.data[0]);
          console.log("📋 Resto (detalles):", data.data.slice(1));
        } else if (data.data.numero_factura || data.data.factura_id) {
          console.log("✅ Estructura detectada: Objeto directo");
          console.log("📋 Datos directos:", data.data);
          console.log("📋 Detalles anidados:", data.data.detalles);
        } else {
          console.log("❓ Estructura no reconocida");
        }
      }

      console.log("✅ Prueba de estructura completada");
      return data;
    } catch (error) {
      console.error("❌ Error en prueba de estructura:", error);
      return null;
    }
  }
}

// Crear instancia global
const facturasModule = new FacturasModule();
window.facturasModule = facturasModule;

// Función global de inicialización
window.initFacturas = async function () {
  console.log("🚀 Iniciando módulo de facturas desde función global");
  // La inicialización ya se hace en el constructor
  return facturasModule;
};

console.log("✅ Módulo de facturas cargado correctamente");
