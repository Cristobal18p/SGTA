// Modulo de vehiculos - gestion completa de vehiculos del sistema

class VehiculosModule {
  constructor() {
    this.vehiculos = [];
    this.filteredVehiculos = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalPages = 0;

    // Referencias a elementos del DOM
    this.modal = null;
    this.form = null;
    this.tabla = null;

    // Estado del formulario
    this.editMode = false;
    this.currentVehiculoId = null;

    // Cache para selectores
    this.clientes = [];
    this.marcas = [];
    this.modelos = [];
    this.tiposCombustible = [];

    // Configuración de la API
    this.baseUrl = window.location.origin; // Usar la URL actual

    this.init();
  }

  async init() {
    console.log("Inicializando módulo de vehículos...");

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
    console.log("Location:", window.location.href);

    // Referencias a elementos del DOM
    this.modal = document.getElementById("modalVehiculo");
    this.form = document.getElementById("formVehiculo");
    this.tabla = document.getElementById("tablaVehiculos");

    console.log("Modal encontrado:", !!this.modal);
    console.log("Formulario encontrado:", !!this.form);
    console.log("Tabla encontrada:", !!this.tabla);

    // Configurar event listeners
    this.setupEventListeners();

    // Cargar datos iniciales
    this.loadInitialData();
  }

  setupEventListeners() {
    // Botón nuevo vehículo
    const btnNuevo = document.getElementById("btnNuevoVehiculo");
    if (btnNuevo) {
      btnNuevo.addEventListener("click", () => this.showCreateModal());
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
      console.log("Event listener de submit agregado al formulario");
    } else {
      console.error("Formulario no encontrado para agregar event listener");
    }

    // Búsqueda y filtros
    const searchInput = document.getElementById("searchVehiculo");
    if (searchInput) {
      searchInput.addEventListener("input", () => this.filterVehiculos());
    }

    const filterMarca = document.getElementById("filterMarca");
    if (filterMarca) {
      filterMarca.addEventListener("change", () => this.filterVehiculos());
    }

    const filterCombustible = document.getElementById("filterCombustible");
    if (filterCombustible) {
      filterCombustible.addEventListener("change", () =>
        this.filterVehiculos()
      );
    }

    const filterAnio = document.getElementById("filterAnio");
    if (filterAnio) {
      filterAnio.addEventListener("change", () => this.filterVehiculos());
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

    // Selector de marca - cargar modelos
    this.setupMarcaEventListener();

    // Cerrar modal con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal?.classList.contains("hidden")) {
        this.closeModal();
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
  }

  async loadInitialData() {
    try {
      console.log("Cargando datos iniciales...");

      // Verificar que el servidor esté disponible
      await this.checkServerHealth();

      // Cargar datos en paralelo
      await Promise.all([
        this.loadVehiculos(),
        this.loadEstadisticas(),
        this.loadSelectorsData(),
      ]);

      console.log("Datos iniciales cargados correctamente");
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      this.showToast(
        "Error al cargar los datos iniciales. Verifique que el servidor esté corriendo.",
        "error"
      );
    }
  }

  async checkServerHealth() {
    try {
      console.log("Verificando estado del servidor...");
      const response = await fetch(`${this.baseUrl}/api/vehiculos/total`);
      if (response.ok) {
        console.log("Servidor respondiendo correctamente");
      } else {
        throw new Error(`Servidor respondió con estado: ${response.status}`);
      }
    } catch (error) {
      console.error("Error de conectividad del servidor:", error);
      throw new Error(
        "No se puede conectar al servidor. Verifique que esté corriendo en el puerto 3000."
      );
    }
  }

  async loadSelectorsData() {
    try {
      console.log("Cargando datos para selectores...");

      // Cargar datos para los selectores de forma secuencial para mejor debugging
      console.log("Cargando clientes...");
      try {
        const clientesResponse = await this.apiCall("/api/clientes/modulo");
        console.log("Respuesta de clientes:", clientesResponse);

        // El backend retorna: { success: true, data: [...], pagination: {...} }
        if (
          clientesResponse &&
          clientesResponse.success &&
          Array.isArray(clientesResponse.data)
        ) {
          this.clientes = clientesResponse.data;
        } else if (Array.isArray(clientesResponse)) {
          // Fallback: si es un array directamente
          this.clientes = clientesResponse;
        } else if (
          clientesResponse &&
          Array.isArray(clientesResponse.clientes)
        ) {
          // Fallback: si está en propiedad 'clientes'
          this.clientes = clientesResponse.clientes;
        } else {
          console.warn(
            " Estructura de respuesta inesperada:",
            clientesResponse
          );
          this.clientes = [];
        }

        console.log(` ${this.clientes.length} clientes cargados`);
        console.log("Primer cliente de ejemplo:", this.clientes[0]);
        console.log(
          " Tipo de this.clientes:",
          typeof this.clientes,
          Array.isArray(this.clientes)
        );
      } catch (error) {
        console.error("Error cargando clientes:", error);
        this.clientes = [];
      }

      console.log("Cargando marcas...");
      try {
        this.marcas = (await this.apiCall("/api/marcas_vehiculos")) || [];
        console.log(` ${this.marcas.length} marcas cargadas`);
        console.log("Respuesta de marcas:", this.marcas);
      } catch (error) {
        console.error("Error cargando marcas:", error);
        this.marcas = [];
      }

      console.log("Cargando tipos de combustible...");
      try {
        this.tiposCombustible =
          (await this.apiCall("/api/tipos_combustible")) || [];
        console.log(
          ` ${this.tiposCombustible.length} tipos de combustible cargados`
        );
      } catch (error) {
        console.error("Error cargando tipos de combustible:", error);
        this.tiposCombustible = [];
      }

      // Poblar selectores con los datos disponibles
      this.populateClienteSelector();
      this.populateMarcaSelector();
      this.populateTipoCombustibleSelector();
      this.populateFilterSelectors();

      console.log("Datos de selectores procesados");
    } catch (error) {
      console.error("Error general cargando datos de selectores:", error);
    }
  }

  async loadModelosByMarca(marcaId) {
    console.log("loadModelosByMarca llamado con marcaId:", marcaId);

    const modeloSelector = document.getElementById("modeloId");

    if (!marcaId) {
      console.log("marcaId está vacío, limpiando selector");
      this.clearModeloSelector();
      return;
    }

    if (!modeloSelector) {
      console.error("Selector modeloId no encontrado");
      return;
    }

    try {
      console.log(` Cargando modelos para marca ID: ${marcaId}`);

      // Mostrar estado de carga
      modeloSelector.innerHTML =
        '<option value="">Cargando modelos...</option>';

      const modelos = await this.apiCall("/api/modelos_vehiculos");
      console.log("Respuesta completa de modelos:", modelos);
      console.log("Tipo de respuesta:", typeof modelos);
      console.log("Es array:", Array.isArray(modelos));

      if (modelos && modelos.length > 0) {
        console.log("Primer modelo:", modelos[0]);
        console.log("Campos del primer modelo:", Object.keys(modelos[0]));
      }

      // Filtrar modelos por marca (asumiendo que el modelo tiene marca_id)
      this.modelos = modelos
        ? modelos.filter((modelo) => {
            const modeloMarcaId = modelo.MARCA_ID || modelo.marca_id;
            console.log(
              ` Comparando modelo ${
                modelo.NOMBRE_MODELO || modelo.nombre_modelo
              }: marcaId=${modeloMarcaId} vs seleccionada=${marcaId}`
            );
            return modeloMarcaId == marcaId;
          })
        : [];

      console.log(
        ` ${this.modelos.length} modelos encontrados para la marca ${marcaId}`
      );
      console.log("Modelos filtrados:", this.modelos);

      this.populateModeloSelector();
    } catch (error) {
      console.error("Error cargando modelos:", error);
      modeloSelector.innerHTML =
        '<option value="">Error cargando modelos</option>';
    }
  }

  populateClienteSelector() {
    const selector = document.getElementById("clienteId");
    if (!selector) {
      console.error("Selector clienteId no encontrado en el DOM");
      return;
    }

    console.log("Poblando selector de clientes...");
    console.log("Estado de this.clientes:", this.clientes);
    console.log("Longitud de clientes:", this.clientes?.length);

    selector.innerHTML = '<option value="">Seleccionar cliente</option>';

    // Validar que this.clientes sea un array
    if (!Array.isArray(this.clientes)) {
      console.error("this.clientes no es un array:", this.clientes);
      return;
    }

    if (this.clientes.length === 0) {
      console.error("No hay clientes disponibles para poblar el selector");
      return;
    }

    console.log(
      ` Poblando selector de clientes con ${this.clientes.length} opciones`
    );

    this.clientes.forEach((cliente, index) => {
      const option = document.createElement("option");
      // Usar los campos normalizados que retorna el backend (camelCase)
      const clienteId = cliente.cliente_id || cliente.CLIENTE_ID;
      option.value = clienteId;
      option.textContent = `${
        cliente.primer_nombre || cliente.PRIMER_NOMBRE || ""
      } ${cliente.primer_apellido || cliente.PRIMER_APELLIDO || ""} - ${
        cliente.numero_cedula || cliente.NUMERO_CEDULA || ""
      }`.trim();
      selector.appendChild(option);

      console.log(
        ` Cliente ${index + 1}: ID=${clienteId}, Texto=${option.textContent}`
      );
    });

    console.log(
      ` Selector de clientes poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  populateMarcaSelector() {
    const selector = document.getElementById("marcaId");
    if (!selector) {
      console.error("Selector marcaId no encontrado en el DOM");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar marca</option>';

    if (!Array.isArray(this.marcas)) {
      console.error("this.marcas no es un array:", this.marcas);
      return;
    }

    console.log(
      ` Poblando selector de marcas con ${this.marcas.length} opciones`
    );
    console.log("Datos de marcas:", this.marcas);

    this.marcas.forEach((marca, index) => {
      const option = document.createElement("option");
      option.value = marca.MARCA_ID || marca.marca_id;
      option.textContent = marca.NOMBRE_MARCA || marca.nombre_marca || "";
      selector.appendChild(option);

      console.log(
        ` Marca ${index + 1}: ID=${option.value}, Nombre=${
          option.textContent
        }`
      );
    });

    console.log(
      ` Selector de marcas poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  populateModeloSelector() {
    const selector = document.getElementById("modeloId");
    if (!selector) {
      console.error("Selector modeloId no encontrado en el DOM");
      return;
    }

    console.log("Poblando selector de modelos con:", this.modelos);

    if (!Array.isArray(this.modelos)) {
      console.error("this.modelos no es un array:", this.modelos);
      selector.innerHTML =
        '<option value="">Error en datos de modelos</option>';
      return;
    }

    if (this.modelos.length === 0) {
      selector.innerHTML =
        '<option value="">No hay modelos disponibles para esta marca</option>';
      console.log("No hay modelos disponibles para la marca seleccionada");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar modelo</option>';

    console.log(
      ` Poblando selector de modelos con ${this.modelos.length} opciones`
    );

    this.modelos.forEach((modelo, index) => {
      const option = document.createElement("option");
      const modeloId = modelo.MODELO_ID || modelo.modelo_id;
      const nombreModelo = modelo.NOMBRE_MODELO || modelo.nombre_modelo;

      console.log(
        ` Modelo ${index + 1}: ID=${modeloId}, Nombre=${nombreModelo}`
      );

      option.value = modeloId;
      option.textContent = nombreModelo || "";
      selector.appendChild(option);
    });

    console.log(
      ` Selector de modelos poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  clearModeloSelector() {
    const selector = document.getElementById("modeloId");
    if (selector) {
      selector.innerHTML =
        '<option value="">Primero seleccione una marca</option>';
      console.log("Selector de modelos limpiado");
    } else {
      console.error("Selector modeloId no encontrado para limpiar");
    }
  }

  populateTipoCombustibleSelector() {
    const selector = document.getElementById("tipoCombustibleId");
    if (!selector) {
      console.error("Selector tipoCombustibleId no encontrado en el DOM");
      return;
    }

    selector.innerHTML = '<option value="">Seleccionar combustible</option>';

    if (!Array.isArray(this.tiposCombustible)) {
      console.error(
        " this.tiposCombustible no es un array:",
        this.tiposCombustible
      );
      return;
    }

    console.log(
      ` Poblando selector de combustibles con ${this.tiposCombustible.length} opciones`
    );

    this.tiposCombustible.forEach((tipo) => {
      const option = document.createElement("option");
      option.value = tipo.TIPO_COMBUSTIBLE_ID;
      option.textContent =
        tipo.DESCRIPCION_COMBUSTIBLE || tipo.NOMBRE_COMBUSTIBLE || "";
      selector.appendChild(option);
    });

    console.log(
      ` Selector de combustibles poblado con ${
        selector.options.length - 1
      } opciones`
    );
  }

  populateFilterSelectors() {
    // Filtro de marcas
    const filterMarca = document.getElementById("filterMarca");
    if (filterMarca) {
      filterMarca.innerHTML = '<option value="">Todas las marcas</option>';
      this.marcas.forEach((marca) => {
        const option = document.createElement("option");
        option.value = marca.NOMBRE_MARCA;
        option.textContent = marca.NOMBRE_MARCA;
        filterMarca.appendChild(option);
      });
    }

    // Filtro de combustibles
    const filterCombustible = document.getElementById("filterCombustible");
    if (filterCombustible) {
      filterCombustible.innerHTML = '<option value="">Todos los tipos</option>';
      this.tiposCombustible.forEach((tipo) => {
        const option = document.createElement("option");
        option.value =
          tipo.DESCRIPCION_COMBUSTIBLE || tipo.NOMBRE_COMBUSTIBLE || "";
        option.textContent =
          tipo.DESCRIPCION_COMBUSTIBLE || tipo.NOMBRE_COMBUSTIBLE || "";
        filterCombustible.appendChild(option);
      });
    }

    // Filtro de años (generar rango de años)
    const filterAnio = document.getElementById("filterAnio");
    if (filterAnio) {
      filterAnio.innerHTML = '<option value="">Todos los años</option>';
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 1950; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        filterAnio.appendChild(option);
      }
    }
  }

  async loadVehiculos() {
    try {
      console.log("Cargando vehículos...");
      const vehiculos = await this.apiCall("/api/vehiculos");

      console.log("Datos recibidos de la API:", vehiculos);
      console.log("Tipo de datos:", typeof vehiculos);
      console.log("Es array:", Array.isArray(vehiculos));

      if (vehiculos && vehiculos.length > 0) {
        console.log("Primer vehículo:", vehiculos[0]);
        console.log(
          " Campos del primer vehículo:",
          Object.keys(vehiculos[0])
        );
      }

      // Filtrar los vehículos que no estén eliminados
      this.vehiculos = vehiculos
        ? vehiculos.filter(
            (v) =>
              v.estado_vehiculo !== "ELIMINADO" &&
              v.ESTADO_VEHICULO !== "ELIMINADO"
          )
        : [];
      this.filteredVehiculos = [...this.vehiculos];
      this.updateTable();
      this.updatePagination();

      console.log(` ${this.vehiculos.length} vehículos cargados`);
    } catch (error) {
      console.error("Error cargando vehículos:", error);
      this.showToast("Error al cargar los vehículos", "error");
    }
  }

  async loadEstadisticas() {
    try {
      console.log("Cargando estadísticas...");

      const [total, enServicio, proximoMant, marcaPopular] = await Promise.all([
        this.apiCall("/api/vehiculos/total"),
        this.apiCall("/api/vehiculos/en-servicio"),
        this.apiCall("/api/vehiculos/proximo-mantenimiento"),
        this.apiCall("/api/vehiculos/marca-popular"),
      ]);

      // Actualizar estadísticas en el DOM
      this.updateEstadistica("totalVehiculos", total?.TOTAL || 0);
      this.updateEstadistica("vehiculosServicio", enServicio?.EN_SERVICIO || 0);
      this.updateEstadistica(
        "proximoMantenimiento",
        proximoMant?.PROXIMOS_MANTENIMIENTOS || 0
      );

      const marcaElement = document.getElementById("marcaPopular");
      if (marcaElement && marcaPopular) {
        marcaElement.textContent = marcaPopular.marca_mas_popular || "-";
      }

      console.log("Estadísticas cargadas");
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  }

  updateEstadistica(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value.toLocaleString();
    }
  }

  filterVehiculos() {
    const searchTerm =
      document.getElementById("searchVehiculo")?.value.toLowerCase() || "";
    const marcaFilter = document.getElementById("filterMarca")?.value || "";
    const combustibleFilter =
      document.getElementById("filterCombustible")?.value || "";
    const anioFilter = document.getElementById("filterAnio")?.value || "";

    this.filteredVehiculos = this.vehiculos.filter((vehiculo) => {
      // Normalizar nombres de campos para la búsqueda (usar los mismos campos que en createVehiculoRow)
      const placa = (
        vehiculo.NUMERO_PLACA ||
        vehiculo.numero_placa ||
        ""
      ).toLowerCase();
      const propietario = (
        vehiculo.PROPIETARIO ||
        vehiculo.propietario ||
        vehiculo.NOMBRE_CLIENTE ||
        vehiculo.nombre_cliente ||
        ""
      ).toLowerCase();
      const marca = (
        vehiculo.NOMBRE_MARCA ||
        vehiculo.nombre_marca ||
        ""
      ).toLowerCase();
      const modelo = (
        vehiculo.NOMBRE_MODELO ||
        vehiculo.nombre_modelo ||
        ""
      ).toLowerCase();
      // Usar el mismo orden de prioridad que en createVehiculoRow
      const combustible =
        vehiculo.DESCRIPCION_COMBUSTIBLE ||
        vehiculo.NOMBRE_COMBUSTIBLE ||
        vehiculo.nombre_combustible ||
        "";
      const anio = vehiculo.ANIO_FABRICACION || vehiculo.anio_fabricacion;

      const matchSearch =
        !searchTerm ||
        placa.includes(searchTerm) ||
        propietario.includes(searchTerm) ||
        marca.includes(searchTerm) ||
        modelo.includes(searchTerm);

      const matchMarca =
        !marcaFilter || marca.includes(marcaFilter.toLowerCase());
      const matchCombustible =
        !combustibleFilter || combustible === combustibleFilter;
      const matchAnio = !anioFilter || anio == anioFilter;

      return matchSearch && matchMarca && matchCombustible && matchAnio;
    });

    this.currentPage = 1;
    this.updateTable();
    this.updatePagination();
  }

  clearFilters() {
    document.getElementById("searchVehiculo").value = "";
    document.getElementById("filterMarca").value = "";
    document.getElementById("filterCombustible").value = "";
    document.getElementById("filterAnio").value = "";

    this.filteredVehiculos = [...this.vehiculos];
    this.currentPage = 1;
    this.updateTable();
    this.updatePagination();
  }

  updateTable() {
    console.log("Actualizando tabla...");
    console.log("Vehículos filtrados:", this.filteredVehiculos.length);
    console.log("Elemento tabla:", this.tabla);

    if (!this.tabla) {
      console.error("Elemento tabla no encontrado");
      return;
    }

    this.tabla.innerHTML = "";

    if (this.filteredVehiculos.length === 0) {
      console.log("No hay vehículos para mostrar");
      this.tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-car text-4xl mb-4 opacity-50"></i>
                        <p>No se encontraron vehículos</p>
                    </td>
                </tr>
            `;
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const vehiculosPage = this.filteredVehiculos.slice(startIndex, endIndex);

    console.log(
      ` Mostrando vehículos ${startIndex + 1} a ${Math.min(
        endIndex,
        this.filteredVehiculos.length
      )} de ${this.filteredVehiculos.length}`
    );
    console.log("Vehículos de la página:", vehiculosPage);

    vehiculosPage.forEach((vehiculo, index) => {
      console.log(` Creando fila para vehículo ${index + 1}:`, vehiculo);
      const row = this.createVehiculoRow(vehiculo);
      this.tabla.appendChild(row);
    });

    this.updatePaginationInfo();
    console.log("Tabla actualizada correctamente");
  }

  createVehiculoRow(vehiculo) {
    const row = document.createElement("tr");
    row.className = "hover:bg-gray-50 transition-colors";

    // Normalizar nombres de campos (la API puede devolver nombres en mayúsculas o minúsculas)
    const vehiculoData = {
      id: vehiculo.VEHICULO_ID || vehiculo.vehiculo_id,
      placa: vehiculo.NUMERO_PLACA || vehiculo.numero_placa,
      propietario:
        vehiculo.PROPIETARIO ||
        vehiculo.propietario ||
        vehiculo.NOMBRE_CLIENTE ||
        vehiculo.nombre_cliente,
      marca: vehiculo.NOMBRE_MARCA || vehiculo.nombre_marca,
      modelo: vehiculo.NOMBRE_MODELO || vehiculo.nombre_modelo,
      anio: vehiculo.ANIO_FABRICACION || vehiculo.anio_fabricacion,
      combustible:
        vehiculo.DESCRIPCION_COMBUSTIBLE ||
        vehiculo.NOMBRE_COMBUSTIBLE ||
        vehiculo.nombre_combustible,
      kilometraje: vehiculo.KILOMETRAJE || vehiculo.kilometraje,
    };

    // Debug para propietarios undefined
    if (!vehiculoData.propietario) {
      console.log("Propietario undefined para vehículo:", vehiculo);
      console.log("Campos disponibles:", Object.keys(vehiculo));
    }

    row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-car text-blue-600"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-gray-900">${
                          vehiculoData.marca && vehiculoData.modelo
                            ? `${vehiculoData.marca} ${vehiculoData.modelo}`
                            : vehiculoData.modelo || vehiculoData.marca || "N/A"
                        }</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                    ${vehiculoData.placa || "N/A"}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${
                  vehiculoData.propietario || "N/A"
                }</div>
            </td>
            <td class="px-6 py-4">
                <span class="text-sm text-gray-900">${
                  vehiculoData.anio || "N/A"
                }</span>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                    ${vehiculoData.combustible || "N/A"}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="text-sm text-gray-900">${
                  vehiculoData.kilometraje
                    ? Number(vehiculoData.kilometraje).toLocaleString() + " km"
                    : "N/A"
                }</span>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="vehiculosModule.editVehiculo(${
                      vehiculoData.id
                    })" 
                            class="text-blue-600 hover:text-blue-800 font-medium" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="vehiculosModule.deleteVehiculo(${
                      vehiculoData.id
                    })" 
                            class="text-red-600 hover:text-red-800 font-medium" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

    return row;
  }

  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredVehiculos.length / this.itemsPerPage
    );

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
      this.filteredVehiculos.length
    );
    const total = this.filteredVehiculos.length;

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
    console.log("Abriendo modal para crear nuevo vehículo");

    this.editMode = false;
    this.currentVehiculoId = null;

    const titulo = document.getElementById("tituloModal");
    if (titulo) {
      titulo.textContent = "Nuevo Vehículo";
    }

    this.resetForm();

    // Re-poblar los selectores para asegurar que estén actualizados
    console.log("Re-poblando selectores en modal...");
    console.log("Datos disponibles para selectores:");
    console.log("- Clientes:", this.clientes.length);
    console.log("- Marcas:", this.marcas.length);
    console.log("- Tipos combustible:", this.tiposCombustible.length);

    this.populateClienteSelector();
    this.populateMarcaSelector();
    this.populateTipoCombustibleSelector();

    // Limpiar el selector de modelos y agregar mensaje informativo
    const modeloSelector = document.getElementById("modeloId");
    if (modeloSelector) {
      modeloSelector.innerHTML =
        '<option value="">Primero seleccione una marca</option>';
    }

    // Asegurar que el event listener de marca esté configurado
    this.setupMarcaEventListener();

    this.showModal();
  }

  setupMarcaEventListener() {
    console.log("Configurando event listener para selector de marca...");

    const marcaSelect = document.getElementById("marcaId");
    if (!marcaSelect) {
      console.error("Selector marcaId no encontrado");
      return;
    }

    console.log(
      " Selector de marca encontrado, opciones disponibles:",
      marcaSelect.options.length
    );

    // Remover event listeners existentes para evitar duplicados
    if (this.marcaChangeHandler) {
      marcaSelect.removeEventListener("change", this.marcaChangeHandler);
    }

    // Crear el handler como una función de flecha para mantener el contexto
    this.marcaChangeHandler = (e) => {
      console.log("Marca seleccionada:", e.target.value);
      console.log(
        " Opciones del selector de marca:",
        e.target.options.length
      );
      this.loadModelosByMarca(e.target.value);
    };

    // Agregar el event listener
    marcaSelect.addEventListener("change", this.marcaChangeHandler);

    console.log("Event listener de marca configurado");
  }

  async editVehiculo(vehiculoId) {
    try {
      this.editMode = true;
      this.currentVehiculoId = vehiculoId;

      const titulo = document.getElementById("tituloModal");
      if (titulo) {
        titulo.textContent = "Editar Vehículo";
      }

      // Encontrar el vehículo en la lista local
      const vehiculo = this.vehiculos.find(
        (v) => (v.VEHICULO_ID || v.vehiculo_id) == vehiculoId
      );
      if (!vehiculo) {
        this.showToast("Vehículo no encontrado", "error");
        return;
      }

      console.log("Editando vehículo:", vehiculo);

      // Re-poblar selectores antes de llenar el formulario
      console.log("Re-poblando selectores para edición...");
      console.log("Estado de datos antes de re-poblar:");
      console.log("- this.clientes.length:", this.clientes.length);
      console.log("- this.marcas.length:", this.marcas.length);
      console.log(
        "   - this.tiposCombustible.length:",
        this.tiposCombustible.length
      );

      this.populateClienteSelector();
      this.populateMarcaSelector();
      this.populateTipoCombustibleSelector();

      // Esperar un poco para que se pueblen los selectores
      setTimeout(() => {
        this.populateForm(vehiculo);
      }, 100);
      // Asegurar que el event listener de marca esté configurado
      this.setupMarcaEventListener();
      this.showModal();
    } catch (error) {
      console.error("Error preparando edición:", error);
      this.showToast("Error al cargar los datos del vehículo", "error");
    }
  }

  populateForm(vehiculo) {
    console.log("=== INICIANDO POBLACIÓN DEL FORMULARIO ===");
    console.log("Vehículo recibido:", vehiculo);

    // Debug específico para campos de cliente
    console.log("=== INFORMACIÓN DEL CLIENTE ===");
    console.log("CLIENTE_ID:", vehiculo.CLIENTE_ID);
    console.log("cliente_id:", vehiculo.cliente_id);
    console.log("NOMBRE_CLIENTE:", vehiculo.NOMBRE_CLIENTE);
    console.log("nombre_cliente:", vehiculo.nombre_cliente);
    console.log("PROPIETARIO:", vehiculo.PROPIETARIO);
    console.log("propietario:", vehiculo.propietario);

    // Listar todos los elementos de formulario para debugging
    console.log("Elementos de formulario disponibles:");
    const formElements = document.querySelectorAll(
      "#formVehiculo input, #formVehiculo select, #formVehiculo textarea"
    );
    formElements.forEach((element, index) => {
      console.log(
        `   ${index + 1}. ID: "${element.id}", Name: "${
          element.name
        }", Type: "${element.type}"`
      );
    });

    // Llenar los campos del formulario
    const numeroPlacaField = document.getElementById("numeroPlaca");
    const colorField = document.getElementById("color");
    const anioFabricacionField = document.getElementById("anioFabricacion");
    const kilometrajeField = document.getElementById("kilometraje");
    const numeroMotorField = document.getElementById("numeroMotor");
    const numeroChasisField = document.getElementById("numeroChasis");

    console.log("Verificando existencia de elementos DOM:");
    console.log("numeroPlaca:", !!numeroPlacaField, numeroPlacaField?.id);
    console.log("color:", !!colorField, colorField?.id);
    console.log(
      "   anioFabricacion:",
      !!anioFabricacionField,
      anioFabricacionField?.id
    );
    console.log("kilometraje:", !!kilometrajeField, kilometrajeField?.id);
    console.log("numeroMotor:", !!numeroMotorField, numeroMotorField?.id);
    console.log("numeroChasis:", !!numeroChasisField, numeroChasisField?.id);

    // También buscar con nombres alternativos
    if (!kilometrajeField) {
      console.log("Buscando campo kilometraje con nombres alternativos:");
      const altKm1 = document.getElementById("kilometrajeActual");
      const altKm2 = document.getElementById("km");
      const altKm3 = document.getElementById("kilometraje_actual");
      console.log("kilometrajeActual:", !!altKm1);
      console.log("km:", !!altKm2);
      console.log("kilometraje_actual:", !!altKm3);
    }

    if (!numeroMotorField) {
      console.log("Buscando campo numeroMotor con nombres alternativos:");
      const altMotor1 = document.getElementById("numero_motor");
      const altMotor2 = document.getElementById("motor");
      console.log("numero_motor:", !!altMotor1);
      console.log("motor:", !!altMotor2);
    }

    if (!numeroChasisField) {
      console.log("Buscando campo numeroChasis con nombres alternativos:");
      const altChasis1 = document.getElementById("numero_chasis");
      const altChasis2 = document.getElementById("chasis");
      console.log("numero_chasis:", !!altChasis1);
      console.log("chasis:", !!altChasis2);
    }

    if (numeroPlacaField) {
      numeroPlacaField.value =
        vehiculo.NUMERO_PLACA || vehiculo.numero_placa || "";
      console.log("Número de placa establecido:", numeroPlacaField.value);
    } else {
      console.error("Campo numeroPlaca no encontrado");
    }
    if (colorField) {
      colorField.value = vehiculo.COLOR || vehiculo.color || "";
      console.log("Color establecido:", colorField.value);
    } else {
      console.error("Campo color no encontrado");
    }
    if (anioFabricacionField) {
      anioFabricacionField.value =
        vehiculo.ANIO_FABRICACION || vehiculo.anio_fabricacion || "";
      console.log(
        " Año fabricación establecido:",
        anioFabricacionField.value
      );
    } else {
      console.error("Campo anioFabricacion no encontrado");
    }
    // Función auxiliar para encontrar campos con nombres alternativos
    const findField = (primaryId, alternativeIds = []) => {
      let field = document.getElementById(primaryId);
      if (field) return field;

      for (const altId of alternativeIds) {
        field = document.getElementById(altId);
        if (field) {
          console.log(
            ` Campo encontrado con ID alternativo: ${altId} (buscando: ${primaryId})`
          );
          return field;
        }
      }
      return null;
    };

    // Buscar campos con nombres alternativos
    const kilometrajeFieldFinal = findField("kilometraje", [
      "kilometrajeActual",
      "km",
      "kilometraje_actual",
    ]);
    const numeroMotorFieldFinal = findField("numeroMotor", [
      "numero_motor",
      "motor",
    ]);
    const numeroChasisFieldFinal = findField("numeroChasis", [
      "numero_chasis",
      "chasis",
    ]);

    if (kilometrajeFieldFinal) {
      const km = vehiculo.KILOMETRAJE || vehiculo.kilometraje || "";
      kilometrajeFieldFinal.value = km;
      console.log(
        " Kilometraje establecido:",
        km,
        "en campo:",
        kilometrajeFieldFinal.id
      );
    } else {
      console.error(
        " Campo kilometraje no encontrado en DOM con ningún nombre"
      );
    }
    if (numeroMotorFieldFinal) {
      const motor = vehiculo.NUMERO_MOTOR || vehiculo.numero_motor || "";
      numeroMotorFieldFinal.value = motor;
      console.log(
        " Número motor establecido:",
        motor,
        "en campo:",
        numeroMotorFieldFinal.id
      );
    } else {
      console.error(
        " Campo numeroMotor no encontrado en DOM con ningún nombre"
      );
    }
    if (numeroChasisFieldFinal) {
      const chasis = vehiculo.NUMERO_CHASIS || vehiculo.numero_chasis || "";
      numeroChasisFieldFinal.value = chasis;
      console.log(
        " Número chasis establecido:",
        chasis,
        "en campo:",
        numeroChasisFieldFinal.id
      );
    } else {
      console.error(
        " Campo numeroChasis no encontrado en DOM con ningún nombre"
      );
    }

    console.log("Valores de campos específicos:");
    console.log(
      "   Número Motor:",
      vehiculo.NUMERO_MOTOR || vehiculo.numero_motor
    );
    console.log(
      "   Número Chasis:",
      vehiculo.NUMERO_CHASIS || vehiculo.numero_chasis
    );
    console.log(
      "   Kilometraje:",
      vehiculo.KILOMETRAJE || vehiculo.kilometraje
    );
    console.log("Elementos DOM encontrados:");
    console.log("numeroMotor field:", !!numeroMotorField);
    console.log("numeroChasis field:", !!numeroChasisField);
    console.log("kilometraje field:", !!kilometrajeField);

    // Establecer selectores después de que estén poblados
    // Usar los nombres exactos que devuelve el backend
    const clienteId = vehiculo.CLIENTE_ID || vehiculo.cliente_id;
    const tipoCombustibleId =
      vehiculo.TIPO_COMBUSTIBLE_ID || vehiculo.tipo_combustible_id;
    const marcaId = vehiculo.MARCA_ID || vehiculo.marca_id;
    const modeloId = vehiculo.MODELO_ID || vehiculo.modelo_id;

    console.log("IDs a establecer:");
    console.log("Cliente ID:", clienteId);
    console.log("Marca ID:", marcaId);
    console.log("Modelo ID:", modeloId);
    console.log("Tipo Combustible ID:", tipoCombustibleId);

    // Usar setTimeout para asegurar que los selectores estén poblados
    setTimeout(() => {
      console.log("=== ESTABLECIENDO SELECTORES ===");

      // Para modo edición, mostrar el cliente como texto no editable
      if (this.editMode) {
        this.setClienteReadOnly(clienteId, vehiculo);
      } else {
        // En modo creación, usar el selector normal
        const clienteSelector = document.getElementById("clienteId");
        if (clienteSelector && clienteId) {
          this.setClienteValue(clienteSelector, clienteId);
        }
      }

      // Establecer el tipo de combustible seleccionado
      if (tipoCombustibleId) {
        document.getElementById("tipoCombustibleId").value = tipoCombustibleId;
        console.log("Tipo combustible seleccionado:", tipoCombustibleId);
      }

      // Para marca y modelo, necesitamos cargar la marca primero y luego el modelo
      if (marcaId) {
        document.getElementById("marcaId").value = marcaId;
        console.log("Marca seleccionada:", marcaId);
        // Cargar modelos de esa marca y luego seleccionar el modelo
        this.loadModelosByMarca(marcaId).then(() => {
          if (modeloId) {
            document.getElementById("modeloId").value = modeloId;
            console.log("Modelo seleccionado:", modeloId);
          }
        });
      }
    }, 200); // Aumentado el timeout a 200ms

    console.log("Formulario de edición poblado correctamente");
  }

  setClienteReadOnly(clienteId, vehiculo) {
    console.log("=== ESTABLECIENDO CLIENTE COMO SOLO LECTURA ===");

    const clienteSelector = document.getElementById("clienteId");
    if (!clienteSelector) {
      console.error("Selector clienteId no encontrado");
      return;
    }

    // Obtener información del cliente desde los datos del vehículo
    let clienteNombre = "";

    // Intentar obtener el nombre del cliente desde el vehículo
    if (vehiculo.NOMBRE_CLIENTE || vehiculo.nombre_cliente) {
      clienteNombre = vehiculo.NOMBRE_CLIENTE || vehiculo.nombre_cliente;
    } else if (vehiculo.PROPIETARIO || vehiculo.propietario) {
      clienteNombre = vehiculo.PROPIETARIO || vehiculo.propietario;
    } else {
      // Si no está en el vehículo, buscar en la lista de clientes
      const cliente = this.clientes.find(
        (c) => (c.cliente_id || c.CLIENTE_ID) == clienteId
      );

      if (cliente) {
        const primerNombre =
          cliente.primer_nombre || cliente.PRIMER_NOMBRE || "";
        const primerApellido =
          cliente.primer_apellido || cliente.PRIMER_APELLIDO || "";
        const cedula = cliente.numero_cedula || cliente.NUMERO_CEDULA || "";
        clienteNombre = `${primerNombre} ${primerApellido} - ${cedula}`.trim();
      } else {
        clienteNombre = "Cliente no encontrado";
      }
    }

    console.log("Nombre del cliente a mostrar:", clienteNombre);

    // Convertir el selector en un campo de solo lectura
    clienteSelector.style.display = "none";

    // Crear un campo de texto de solo lectura
    let readOnlyField = document.getElementById("clienteReadOnly");
    if (!readOnlyField) {
      readOnlyField = document.createElement("input");
      readOnlyField.id = "clienteReadOnly";
      readOnlyField.type = "text";
      readOnlyField.className = clienteSelector.className;
      readOnlyField.style.backgroundColor = "#f3f4f6";
      readOnlyField.style.cursor = "not-allowed";
      readOnlyField.readOnly = true;

      // Insertar después del selector original
      clienteSelector.parentNode.insertBefore(
        readOnlyField,
        clienteSelector.nextSibling
      );
    }

    readOnlyField.value = clienteNombre;

    // También crear un campo oculto para mantener el ID del cliente
    let hiddenField = document.getElementById("clienteIdHidden");
    if (!hiddenField) {
      hiddenField = document.createElement("input");
      hiddenField.id = "clienteIdHidden";
      hiddenField.type = "hidden";
      hiddenField.name = "cliente_id";
      clienteSelector.parentNode.appendChild(hiddenField);
    }

    hiddenField.value = clienteId;

    console.log("Cliente establecido como solo lectura:", clienteNombre);
    console.log("Cliente ID guardado en campo oculto:", clienteId);
  }

  setClienteValue(clienteSelector, clienteId) {
    console.log("=== ESTABLECIENDO VALOR DEL CLIENTE ===");
    console.log(
      "   Cliente ID a establecer:",
      clienteId,
      "Tipo:",
      typeof clienteId
    );
    console.log(
      "   Total de opciones en selector:",
      clienteSelector.options.length
    );

    // Mostrar todas las opciones disponibles para debugging
    console.log("Opciones disponibles:");
    for (let i = 0; i < clienteSelector.options.length; i++) {
      const option = clienteSelector.options[i];
      console.log(
        `      ${i}: value="${
          option.value
        }" (tipo: ${typeof option.value}) text="${option.text}"`
      );
    }

    // Intentar establecer el valor directamente primero
    const clienteIdStr = String(clienteId);
    clienteSelector.value = clienteIdStr;
    console.log("Intentando valor como string:", clienteIdStr);
    console.log("Valor después de asignación:", clienteSelector.value);

    // Verificar si se estableció correctamente
    if (
      clienteSelector.value === clienteIdStr ||
      clienteSelector.value == clienteId
    ) {
      console.log(
        " Cliente establecido correctamente con valor:",
        clienteSelector.value
      );
      return;
    }

    // Si no funcionó, buscar manualmente
    console.log(
      " Valor no establecido automáticamente, buscando manualmente..."
    );
    let encontrado = false;

    for (let i = 0; i < clienteSelector.options.length; i++) {
      const option = clienteSelector.options[i];

      // Comparar tanto como string como número
      if (
        option.value == clienteId ||
        option.value === String(clienteId) ||
        String(option.value) === String(clienteId) ||
        Number(option.value) === Number(clienteId)
      ) {
        clienteSelector.selectedIndex = i;
        console.log("Cliente encontrado y establecido:");
        console.log(`   Índice: ${i}`);
        console.log(`   Valor: "${option.value}"`);
        console.log(`   Texto: "${option.text}"`);
        console.log(`   Nuevo selectedIndex: ${clienteSelector.selectedIndex}`);
        console.log(`   Nuevo value: ${clienteSelector.value}`);
        encontrado = true;
        break;
      }
    }

    if (!encontrado) {
      console.error("No se pudo encontrar el cliente en las opciones:");
      console.error(
        `   Cliente ID buscado: "${clienteId}" (tipo: ${typeof clienteId})`
      );
      console.error(
        "   Valores disponibles:",
        Array.from(clienteSelector.options).map(
          (opt) => `"${opt.value}" (${typeof opt.value})`
        )
      );
    }
  }

  resetForm() {
    if (this.form) {
      this.form.reset();
    }
    this.clearModeloSelector();

    // Limpiar campos adicionales de solo lectura si existen
    const readOnlyField = document.getElementById("clienteReadOnly");
    const hiddenField = document.getElementById("clienteIdHidden");
    const clienteSelector = document.getElementById("clienteId");

    if (readOnlyField) {
      readOnlyField.remove();
    }

    if (hiddenField) {
      hiddenField.remove();
    }

    // Mostrar el selector original si estaba oculto
    if (clienteSelector) {
      clienteSelector.style.display = "";
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
    this.currentVehiculoId = null;
  }

  async handleSubmit(e) {
    e.preventDefault();

    console.log("=== INICIANDO ENVÍO DEL FORMULARIO ===");
    console.log("Modo edición:", this.editMode);
    console.log("ID del vehículo actual:", this.currentVehiculoId);

    try {
      console.log("Obteniendo datos del formulario...");
      const formData = this.getFormData();
      console.log("Datos obtenidos:", formData);

      console.log("Validando formulario...");
      if (!this.validateForm(formData)) {
        console.log("Validación falló, deteniendo envío");
        return;
      }
      console.log("Validación exitosa");

      const url = this.editMode
        ? `/api/vehiculos/${this.currentVehiculoId}`
        : "/api/vehiculos";

      const method = this.editMode ? "PUT" : "POST";

      console.log(` Enviando solicitud: ${method} ${url}`);
      console.log("Datos a enviar:", formData);

      const result = await this.apiCall(url, method, formData);
      console.log("Respuesta recibida:", result);

      if (result) {
        const mensaje = this.editMode
          ? "Vehículo actualizado exitosamente"
          : "Vehículo creado exitosamente";

        console.log("Operación exitosa, mostrando toast:", mensaje);
        this.showToast(mensaje, "success");

        console.log("Cerrando modal y recargando datos...");
        this.closeModal();
        await this.loadVehiculos();
        await this.loadEstadisticas();
        console.log("Proceso completado exitosamente");
      } else {
        console.log("No se recibió resultado de la API");
        this.showToast("No se recibió confirmación del servidor", "error");
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      console.error("Stack trace:", error.stack);
      this.showToast(`Error al guardar el vehículo: ${error.message}`, "error");
    }
  }

  getFormData() {
    // Función auxiliar para encontrar campos con nombres alternativos
    const getFieldValue = (primaryId, alternativeIds = []) => {
      let field = document.getElementById(primaryId);
      if (field) return field.value?.trim();

      for (const altId of alternativeIds) {
        field = document.getElementById(altId);
        if (field) {
          console.log(
            ` Obteniendo valor de campo alternativo: ${altId} (buscando: ${primaryId})`
          );
          return field.value?.trim();
        }
      }
      return "";
    };

    // En modo edición, usar el campo oculto para el cliente_id
    let clienteId;
    if (this.editMode) {
      const hiddenField = document.getElementById("clienteIdHidden");
      clienteId = hiddenField
        ? hiddenField.value
        : document.getElementById("clienteId")?.value;
      console.log(
        " Modo edición - Cliente ID desde campo oculto:",
        clienteId
      );
    } else {
      clienteId = document.getElementById("clienteId")?.value;
      console.log("Modo creación - Cliente ID desde selector:", clienteId);
    }

    const formData = {
      numero_placa: document.getElementById("numeroPlaca")?.value.trim(),
      cliente_id: clienteId,
      modelo_id: document.getElementById("modeloId")?.value,
      tipo_combustible_id: document.getElementById("tipoCombustibleId")?.value,
      color: document.getElementById("color")?.value.trim(),
      anio_fabricacion: document.getElementById("anioFabricacion")?.value,
      kilometraje: getFieldValue("kilometraje", [
        "kilometrajeActual",
        "km",
        "kilometraje_actual",
      ]),
      numero_motor: getFieldValue("numeroMotor", ["numero_motor", "motor"]),
      numero_chasis: getFieldValue("numeroChasis", ["numero_chasis", "chasis"]),
    };

    console.log("Datos del formulario obtenidos:", formData);
    return formData;
  }

  validateForm(formData) {
    const requiredFields = [
      { field: "numero_placa", message: "El número de placa es obligatorio" },
      { field: "cliente_id", message: "Debe seleccionar un cliente" },
      { field: "modelo_id", message: "Debe seleccionar un modelo" },
      {
        field: "tipo_combustible_id",
        message: "Debe seleccionar un tipo de combustible",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field]) {
        this.showToast(message, "error");
        return false;
      }
    }

    // Validar formato de placa (ejemplo básico)
    if (
      formData.numero_placa &&
      !/^[A-Z0-9\-]+$/i.test(formData.numero_placa)
    ) {
      this.showToast("El formato de la placa no es válido", "error");
      return false;
    }

    // Validar año
    if (formData.anio_fabricacion) {
      const anio = parseInt(formData.anio_fabricacion);
      const currentYear = new Date().getFullYear();
      if (anio < 1950 || anio > currentYear + 1) {
        this.showToast(
          `El año debe estar entre 1950 y ${currentYear + 1}`,
          "error"
        );
        return false;
      }
    }

    // Validar kilometraje
    if (
      formData.kilometraje &&
      (isNaN(formData.kilometraje) || formData.kilometraje < 0)
    ) {
      this.showToast("El kilometraje debe ser un número positivo", "error");
      return false;
    }

    return true;
  }

  async deleteVehiculo(vehiculoId) {
    console.log("=== INICIANDO ELIMINACIÓN DE VEHÍCULO ===");
    console.log("ID del vehículo a eliminar:", vehiculoId);

    // Encontrar el vehículo para mostrar información en la confirmación
    const vehiculo = this.vehiculos.find(
      (v) => (v.VEHICULO_ID || v.vehiculo_id) == vehiculoId
    );

    console.log("Vehículo encontrado:", vehiculo);

    const placa = vehiculo
      ? vehiculo.NUMERO_PLACA || vehiculo.numero_placa
      : null;
    const marca = vehiculo
      ? vehiculo.NOMBRE_MARCA || vehiculo.nombre_marca
      : "";
    const modelo = vehiculo
      ? vehiculo.NOMBRE_MODELO || vehiculo.nombre_modelo
      : "";

    const vehiculoInfo =
      marca && modelo ? `${marca} ${modelo}` : "este vehículo";
    const placaInfo = placa ? ` (${placa})` : "";

    console.log("Información del vehículo:", { vehiculoInfo, placaInfo });

    // Mostrar confirmación personalizada en pantalla
    console.log("Mostrando modal de confirmación...");
    this.showConfirmModal({
      titulo: "Confirmar Eliminación",
      mensaje: `¿Está seguro de que desea eliminar ${vehiculoInfo}${placaInfo}?`,
      textoConfirmar: "Eliminar",
      textoCancelar: "Cancelar",
      onConfirm: async () => {
        console.log("Confirmación recibida, enviando al backend...");
        try {
          console.log(
            " URL de eliminación:",
            `/api/vehiculos/${vehiculoId}/eliminar`
          );

          // Usar el endpoint PUT para cambiar el estado a eliminado
          const result = await this.apiCall(
            `/api/vehiculos/${vehiculoId}/eliminar`,
            "PUT"
          );

          console.log("Respuesta del backend:", result);

          // Mostrar notificación de éxito
          this.showToast("Vehículo eliminado exitosamente", "success");

          // Recargar datos
          console.log("Recargando datos...");
          await this.loadVehiculos();
          await this.loadEstadisticas();
          console.log("Eliminación completada exitosamente");
        } catch (error) {
          console.error("Error eliminando vehículo:", error);
          this.showToast(
            `Error al eliminar el vehículo: ${error.message}`,
            "error"
          );
        }
      },
    });
  }

  // Modal de confirmación personalizada
  showConfirmModal({
    titulo,
    mensaje,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    onConfirm,
  }) {
    // Agregar estilos CSS si no existen
    if (!document.getElementById("confirmModalStyles")) {
      const styles = document.createElement("style");
      styles.id = "confirmModalStyles";
      styles.textContent = `
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(styles);
    }

    // Crear el modal si no existe
    let modal = document.getElementById("confirmModalVehiculo");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "confirmModalVehiculo";
      modal.className =
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden";
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fadeIn mx-4">
          <h2 class="text-xl font-bold mb-4 modal-title text-gray-800"></h2>
          <div class="mb-6 modal-message text-gray-600"></div>
          <div class="flex justify-end space-x-2">
            <button id="btnCancelarConfirmVehiculo" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">${textoCancelar}</button>
            <button id="btnConfirmarVehiculo" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">${textoConfirmar}</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Configurar contenido
    modal.querySelector(".modal-title").textContent = titulo;
    modal.querySelector(".modal-message").innerHTML = mensaje;
    modal.querySelector("#btnCancelarConfirmVehiculo").textContent =
      textoCancelar;
    modal.querySelector("#btnConfirmarVehiculo").textContent = textoConfirmar;

    // Mostrar modal
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    // Configurar botones
    const btnCancelar = modal.querySelector("#btnCancelarConfirmVehiculo");
    const btnConfirmar = modal.querySelector("#btnConfirmarVehiculo");

    // Función para cerrar modal
    const cerrarModal = () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    };

    // Event listeners
    btnCancelar.onclick = cerrarModal;
    btnConfirmar.onclick = async () => {
      cerrarModal();
      if (typeof onConfirm === "function") {
        await onConfirm();
      }
    };

    // Cerrar con ESC
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        cerrarModal();
        document.removeEventListener("keydown", handleKeydown);
      }
    };
    document.addEventListener("keydown", handleKeydown);

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
      if (e.target === modal) {
        cerrarModal();
      }
    };
  }

  // Utility: API Call
  async apiCall(url, method = "GET", data = null) {
    try {
      // Construir URL completa
      const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

      console.log(` API Call: ${method} ${fullUrl}`);

      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data && (method === "POST" || method === "PUT")) {
        config.body = JSON.stringify(data);
        console.log(` Request body:`, data);
      }

      const response = await fetch(fullUrl, config);

      console.log(
        ` Response status: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData?.error || errorData?.message || errorMessage;
          console.log(` Error response:`, errorData);
        } catch (e) {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
          console.log(` Non-JSON error response`);
        }
        throw new Error(errorMessage);
      }

      if (method === "DELETE") {
        return true;
      }

      const result = await response.json();
      console.log(` Response data:`, result);
      return result;
    } catch (error) {
      console.error(` API Error ${method} ${url}:`, error);
      throw error;
    }
  }

  // Utility: Toast Messages
  showToast(message, type = "info") {
    console.log(` Mostrando toast: "${message}" tipo: ${type}`);

    // Usar el toast manager global si está disponible
    if (window.toastManager) {
      console.log("Usando toast manager global");
      window.toastManager.show(message, type);
      return;
    }

    console.log("Toast manager no disponible, usando alert fallback");

    // Fallback a alert si no hay toast manager
    // Para mensajes largos, usar confirm en lugar de alert para mejor legibilidad
    if (type === "error" && message.length > 100) {
      const title = "Error al eliminar vehículo";
      const confirmed = confirm(
        `${title}\n\n${message}\n\nPresione OK para continuar.`
      );
      return;
    }

    if (type === "error") {
      alert("Error: " + message);
    } else if (type === "success") {
      alert("Éxito: " + message);
    } else {
      alert(message);
    }

    console.log("Toast mostrado exitosamente");
  }
}

// Crear instancia global
const vehiculosModule = new VehiculosModule();
window.vehiculosModule = vehiculosModule;

console.log("Módulo de vehículos cargado correctamente");
