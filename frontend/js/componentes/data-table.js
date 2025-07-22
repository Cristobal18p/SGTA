// Componente reutilizable para tablas de datos
class DataTableComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.options = {
      columns: [],
      data: [],
      pagination: true,
      pageSize: 10,
      searchable: true,
      sortable: true,
      actions: [],
      emptyMessage: "No hay datos disponibles",
      loadingMessage: "Cargando...",
      ...options,
    };

    this.currentPage = 1;
    this.totalPages = 0;
    this.totalItems = 0;
    this.sortColumn = null;
    this.sortDirection = "asc";
    this.filters = {};
    this.loading = false;

    this.callbacks = {
      onDataChange: [],
      onRowClick: [],
      onPageChange: [],
      onSort: [],
      onFilter: [],
    };

    this.init();
  }

  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Contenedor con ID ${this.containerId} no encontrado`);
      return;
    }
    this.render();
  }

  render() {
    this.container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                ${this.renderHeader()}
                ${this.renderFilters()}
                ${this.renderTable()}
                ${this.options.pagination ? this.renderPagination() : ""}
            </div>
        `;
    this.attachEventListeners();
  }

  renderHeader() {
    return `
            <div class="p-6 border-b border-gray-200">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-900">${
                      this.options.title || "Datos"
                    }</h3>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm text-gray-500">Total: ${
                          this.totalItems
                        } registros</span>
                        ${
                          this.options.exportable
                            ? `
                            <button class="text-gray-400 hover:text-gray-600" title="Exportar">
                                <i class="fas fa-download"></i>
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `;
  }

  renderFilters() {
    if (!this.options.searchable && !this.options.filters) return "";

    return `
            <div class="p-4 border-b border-gray-200 bg-gray-50">
                <div class="flex flex-wrap gap-4">
                    ${
                      this.options.searchable
                        ? `
                        <div class="flex-1 min-w-64">
                            <div class="relative">
                                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input type="text" 
                                       id="${this.containerId}-search" 
                                       class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                       placeholder="Buscar...">
                            </div>
                        </div>
                    `
                        : ""
                    }
                    ${this.options.filters ? this.renderCustomFilters() : ""}
                </div>
            </div>
        `;
  }

  renderCustomFilters() {
    return this.options.filters
      .map(
        (filter) => `
            <div class="min-w-48">
                <select id="${this.containerId}-filter-${filter.key}" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">${filter.placeholder || "Todos"}</option>
                    ${filter.options
                      .map(
                        (opt) => `
                        <option value="${opt.value}">${opt.label}</option>
                    `
                      )
                      .join("")}
                </select>
            </div>
        `
      )
      .join("");
  }

  renderTable() {
    return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            ${this.options.columns
                              .map(
                                (col) => `
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                  col.sortable !== false &&
                                  this.options.sortable
                                    ? "cursor-pointer hover:bg-gray-100"
                                    : ""
                                }"
                                    ${
                                      col.sortable !== false &&
                                      this.options.sortable
                                        ? `data-sort="${col.key}"`
                                        : ""
                                    }>
                                    <div class="flex items-center">
                                        ${col.label}
                                        ${
                                          col.sortable !== false &&
                                          this.options.sortable
                                            ? `
                                            <span class="ml-1 text-gray-400">
                                                <i class="fas fa-sort text-xs"></i>
                                            </span>
                                        `
                                            : ""
                                        }
                                    </div>
                                </th>
                            `
                              )
                              .join("")}
                            ${
                              this.options.actions.length > 0
                                ? `
                                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            `
                                : ""
                            }
                        </tr>
                    </thead>
                    <tbody id="${
                      this.containerId
                    }-tbody" class="bg-white divide-y divide-gray-200">
                        ${this.renderTableBody()}
                    </tbody>
                </table>
            </div>
        `;
  }

  renderTableBody() {
    if (this.loading) {
      return `
                <tr>
                    <td colspan="${
                      this.options.columns.length +
                      (this.options.actions.length > 0 ? 1 : 0)
                    }" 
                        class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                            <p>${this.options.loadingMessage}</p>
                        </div>
                    </td>
                </tr>
            `;
    }

    if (!this.options.data || this.options.data.length === 0) {
      return `
                <tr>
                    <td colspan="${
                      this.options.columns.length +
                      (this.options.actions.length > 0 ? 1 : 0)
                    }" 
                        class="px-6 py-8 text-center text-gray-500">
                        <div class="flex flex-col items-center">
                            <i class="fas fa-folder-open text-4xl mb-4 text-gray-300"></i>
                            <p class="text-lg font-medium mb-2">${
                              this.options.emptyMessage
                            }</p>
                        </div>
                    </td>
                </tr>
            `;
    }

    return this.options.data
      .map(
        (row, index) => `
            <tr class="hover:bg-gray-50 transition-colors ${
              this.options.clickable ? "cursor-pointer" : ""
            }" 
                data-row-index="${index}">
                ${this.options.columns
                  .map(
                    (col) => `
                    <td class="px-6 py-4 whitespace-nowrap ${
                      col.className || ""
                    }">
                        ${this.renderCell(row, col)}
                    </td>
                `
                  )
                  .join("")}
                ${
                  this.options.actions.length > 0
                    ? `
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                            ${this.options.actions
                              .map(
                                (action) => `
                                <button class="text-${
                                  action.color || "blue"
                                }-600 hover:text-${
                                  action.color || "blue"
                                }-800 p-1 rounded transition-colors" 
                                        data-action="${action.key}" 
                                        data-row-index="${index}"
                                        title="${
                                          action.tooltip || action.label
                                        }">
                                    <i class="${action.icon}"></i>
                                </button>
                            `
                              )
                              .join("")}
                        </div>
                    </td>
                `
                    : ""
                }
            </tr>
        `
      )
      .join("");
  }

  renderCell(row, column) {
    const value = this.getNestedValue(row, column.key);

    if (column.render) {
      return column.render(value, row);
    }

    if (column.type === "date" && value) {
      return new Date(value).toLocaleDateString("es-ES");
    }

    if (column.type === "currency" && value) {
      return new Intl.NumberFormat("es-PA", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }

    if (column.type === "badge" && value) {
      const badgeConfig = column.badgeConfig || {};
      const style = badgeConfig[value] || "bg-gray-100 text-gray-800";
      return `<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${style}">${value}</span>`;
    }

    return value || "";
  }

  renderPagination() {
    if (this.totalPages <= 1) return "";

    return `
            <div class="bg-white px-6 py-3 border-t border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-700">
                        Mostrando ${
                          (this.currentPage - 1) * this.options.pageSize + 1
                        }-${Math.min(
      this.currentPage * this.options.pageSize,
      this.totalItems
    )} de ${this.totalItems} resultados
                    </div>
                    <div class="flex items-center space-x-2">
                        <button id="${this.containerId}-prev" 
                                class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 ${
                                  this.currentPage === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }" 
                                ${this.currentPage === 1 ? "disabled" : ""}>
                            Anterior
                        </button>
                        <div id="${
                          this.containerId
                        }-pages" class="flex items-center space-x-1">
                            ${this.generatePageNumbers()}
                        </div>
                        <button id="${this.containerId}-next" 
                                class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 ${
                                  this.currentPage === this.totalPages
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }" 
                                ${
                                  this.currentPage === this.totalPages
                                    ? "disabled"
                                    : ""
                                }>
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        `;
  }

  generatePageNumbers() {
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
                }" data-page="${i}">
                    ${i}
                </button>
            `;
    }

    return html;
  }

  attachEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById(`${this.containerId}-search`);
    if (searchInput) {
      searchInput.addEventListener("input", (e) =>
        this.handleSearch(e.target.value)
      );
    }

    // Filtros
    if (this.options.filters) {
      this.options.filters.forEach((filter) => {
        const filterSelect = document.getElementById(
          `${this.containerId}-filter-${filter.key}`
        );
        if (filterSelect) {
          filterSelect.addEventListener("change", (e) =>
            this.handleFilter(filter.key, e.target.value)
          );
        }
      });
    }

    // Ordenamiento
    const sortHeaders = this.container.querySelectorAll("[data-sort]");
    sortHeaders.forEach((header) => {
      header.addEventListener("click", () =>
        this.handleSort(header.dataset.sort)
      );
    });

    // Paginación
    const prevBtn = document.getElementById(`${this.containerId}-prev`);
    const nextBtn = document.getElementById(`${this.containerId}-next`);

    if (prevBtn) {
      prevBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage - 1)
      );
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage + 1)
      );
    }

    // Números de página
    const pageButtons = this.container.querySelectorAll("[data-page]");
    pageButtons.forEach((btn) => {
      btn.addEventListener("click", () =>
        this.goToPage(parseInt(btn.dataset.page))
      );
    });

    // Acciones
    const actionButtons = this.container.querySelectorAll("[data-action]");
    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const rowIndex = parseInt(btn.dataset.rowIndex);
        const rowData = this.options.data[rowIndex];
        this.handleAction(action, rowData, rowIndex);
      });
    });

    // Click en fila
    if (this.options.clickable) {
      const rows = this.container.querySelectorAll("[data-row-index]");
      rows.forEach((row) => {
        row.addEventListener("click", () => {
          const rowIndex = parseInt(row.dataset.rowIndex);
          const rowData = this.options.data[rowIndex];
          this.callbacks.onRowClick.forEach((callback) =>
            callback(rowData, rowIndex)
          );
        });
      });
    }
  }

  // Métodos públicos
  setData(data, pagination = null) {
    this.options.data = data;

    if (pagination) {
      this.currentPage = pagination.currentPage || 1;
      this.totalPages = pagination.totalPages || 1;
      this.totalItems = pagination.total || 0;
    } else {
      this.totalItems = data.length;
      this.totalPages = Math.ceil(this.totalItems / this.options.pageSize);
    }

    this.updateTableBody();
    this.updatePagination();
    this.callbacks.onDataChange.forEach((callback) => callback(data));
  }

  updateTableBody() {
    const tbody = document.getElementById(`${this.containerId}-tbody`);
    if (tbody) {
      tbody.innerHTML = this.renderTableBody();
      this.attachActionListeners();
    }
  }

  updatePagination() {
    if (!this.options.pagination) return;

    const paginationContainer = this.container.querySelector(
      ".border-t.border-gray-200"
    );
    if (paginationContainer) {
      paginationContainer.outerHTML = this.renderPagination();
      this.attachPaginationListeners();
    }
  }

  attachActionListeners() {
    const actionButtons = this.container.querySelectorAll("[data-action]");
    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const rowIndex = parseInt(btn.dataset.rowIndex);
        const rowData = this.options.data[rowIndex];
        this.handleAction(action, rowData, rowIndex);
      });
    });
  }

  attachPaginationListeners() {
    const prevBtn = document.getElementById(`${this.containerId}-prev`);
    const nextBtn = document.getElementById(`${this.containerId}-next`);
    const pageButtons = this.container.querySelectorAll("[data-page]");

    if (prevBtn) {
      prevBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage - 1)
      );
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () =>
        this.goToPage(this.currentPage + 1)
      );
    }

    pageButtons.forEach((btn) => {
      btn.addEventListener("click", () =>
        this.goToPage(parseInt(btn.dataset.page))
      );
    });
  }

  setLoading(loading) {
    this.loading = loading;
    this.updateTableBody();
  }

  // Event handlers
  handleSearch(value) {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.callbacks.onFilter.forEach((callback) => callback("search", value));
    }, 300);
  }

  handleFilter(key, value) {
    this.filters[key] = value;
    this.callbacks.onFilter.forEach((callback) => callback(key, value));
  }

  handleSort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }

    this.callbacks.onSort.forEach((callback) =>
      callback(column, this.sortDirection)
    );
  }

  handleAction(action, rowData, rowIndex) {
    const actionConfig = this.options.actions.find((a) => a.key === action);
    if (actionConfig && actionConfig.handler) {
      actionConfig.handler(rowData, rowIndex);
    }
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.callbacks.onPageChange.forEach((callback) => callback(page));
  }

  // Callbacks
  onDataChange(callback) {
    this.callbacks.onDataChange.push(callback);
    return this;
  }

  onRowClick(callback) {
    this.callbacks.onRowClick.push(callback);
    return this;
  }

  onPageChange(callback) {
    this.callbacks.onPageChange.push(callback);
    return this;
  }

  onSort(callback) {
    this.callbacks.onSort.push(callback);
    return this;
  }

  onFilter(callback) {
    this.callbacks.onFilter.push(callback);
    return this;
  }

  // Utilidades
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}

// Exportar para uso global
window.DataTableComponent = DataTableComponent;
