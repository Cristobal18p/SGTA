document.addEventListener("DOMContentLoaded", async () => {
  try {
    console.log("🚀 Cargando datos de reportes...");

    // Mostrar indicador de carga
    mostrarIndicadorCarga(true);

    // Cargar métricas principales
    await cargarMetricasPrincipales();

    // Cargar gráficos
    await cargarGraficos();

    // Cargar análisis detallado
    await cargarAnalisisDetallado();

    console.log("✅ Datos de reportes cargados correctamente");
  } catch (error) {
    console.error("❌ Error al cargar los datos de reportes:", error);
    mostrarError(
      "Error al cargar los datos de reportes. Por favor, intenta nuevamente."
    );
  } finally {
    mostrarIndicadorCarga(false);
  }
});

// Función para mostrar/ocultar indicador de carga
function mostrarIndicadorCarga(mostrar) {
  const indicador = document.getElementById("indicadorCarga");
  if (indicador) {
    indicador.style.display = mostrar ? "block" : "none";
  }
}

// Función para mostrar errores
function mostrarError(mensaje) {
  const errorContainer = document.getElementById("errorContainer");
  if (errorContainer) {
    errorContainer.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline">${mensaje}</span>
            </div>
        `;
    errorContainer.style.display = "block";
  }
}

async function cargarMetricasPrincipales() {
  try {
    const [ingresos, servicios, clientes] = await Promise.all([
      fetch("/api/estadistica-reporte/ingresos-totales").then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch("/api/estadistica-reporte/servicios-realizados").then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch("/api/estadistica-reporte/cantidad-nuevos-clientes").then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      }),
    ]);

    // Actualizar métricas principales con animación
    animarContador("ingresosTotales", 0, ingresos.ingresos_totales || 0, "$");
    animarContador("serviciosRealizados", 0, servicios.total_servicios || 0);
    animarContador("nuevosClientes", 0, clientes.nuevos_clientes || 0);

    console.log("✅ Métricas principales cargadas");
  } catch (error) {
    console.error("❌ Error al cargar métricas principales:", error);
    throw error;
  }
}

// Función para animar contadores
function animarContador(elementId, inicio, fin, prefijo = "") {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  const duracion = 1000; // 1 segundo
  const incremento = (fin - inicio) / (duracion / 16); // 60 FPS
  let actual = inicio;

  const timer = setInterval(() => {
    actual += incremento;
    if (actual >= fin) {
      actual = fin;
      clearInterval(timer);
    }
    elemento.textContent = `${prefijo}${Math.floor(actual).toLocaleString()}`;
  }, 16);
}

async function cargarGraficos() {
  try {
    const [ingresosMensuales, serviciosMasSolicitados] = await Promise.all([
      fetch("/api/estadistica-reporte/ingresos-mensuales").then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch("/api/estadistica-reporte/servicios-mas-solicitados").then(
        (res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        }
      ),
    ]);

    // Gráfico de ingresos mensuales
    const ctxIngresos = document.getElementById("graficoIngresos");
    if (ctxIngresos && ingresosMensuales && Array.isArray(ingresosMensuales)) {
      new Chart(ctxIngresos.getContext("2d"), {
        type: "line",
        data: {
          labels: ingresosMensuales.map((item) => item.mes || "Sin mes"),
          datasets: [
            {
              label: "Ingresos",
              data: ingresosMensuales.map((item) => item.total_ingresos || 0),
              borderColor: "rgba(59, 130, 246, 1)",
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "$" + (value || 0).toLocaleString();
                },
              },
            },
          },
        },
      });
    }

    // Gráfico de servicios más solicitados
    const ctxServicios = document.getElementById("graficoServicios");
    if (
      ctxServicios &&
      serviciosMasSolicitados &&
      Array.isArray(serviciosMasSolicitados)
    ) {
      new Chart(ctxServicios.getContext("2d"), {
        type: "bar",
        data: {
          labels: serviciosMasSolicitados.map(
            (item) => item.nombre_servicio || "Sin nombre"
          ),
          datasets: [
            {
              label: "Cantidad",
              data: serviciosMasSolicitados.map((item) => item.cantidad || 0),
              backgroundColor: "rgba(34, 197, 94, 0.8)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    console.log("✅ Gráficos cargados");
  } catch (error) {
    console.error("❌ Error al cargar gráficos:", error);
    throw error;
  }
}

async function cargarAnalisisDetallado() {
  try {
    const [topClientes, rendimientoTecnicos, estadoInventario] =
      await Promise.all([
        fetch("/api/estadistica-reporte/clientes-top-10").then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        }),
        fetch("/api/estadistica-reporte/rendimiento-tecnico").then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        }),
        fetch("/api/estadistica-reporte/estado-inventario").then((res) => {
          if (!res.ok)
            throw new Error(`Error ${res.status}: ${res.statusText}`);
          return res.json();
        }),
      ]);

    // Top Clientes
    const topClientesContainer = document.getElementById("topClientes");
    if (topClientesContainer) {
      if (topClientes && Array.isArray(topClientes) && topClientes.length > 0) {
        topClientesContainer.innerHTML = topClientes
          .map(
            (cliente, index) => `
                    <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                        <div class="flex items-center">
                            <span class="text-sm text-gray-500 mr-2">#${
                              index + 1
                            }</span>
                            <span>${
                              cliente.nombre_completo || "Sin nombre"
                            }</span>
                        </div>
                        <span class="font-bold text-green-600">$${(
                          cliente.total_gastado || 0
                        ).toLocaleString()}</span>
                    </div>
                `
          )
          .join("");
      } else {
        topClientesContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-4">
                        No hay datos de clientes disponibles
                    </div>
                `;
      }
    }

    // Rendimiento por Técnico
    const rendimientoTecnicosContainer = document.getElementById(
      "rendimientoTecnicos"
    );
    if (rendimientoTecnicosContainer) {
      if (
        rendimientoTecnicos &&
        Array.isArray(rendimientoTecnicos) &&
        rendimientoTecnicos.length > 0
      ) {
        rendimientoTecnicosContainer.innerHTML = rendimientoTecnicos
          .map(
            (tecnico, index) => `
                    <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                        <div class="flex items-center">
                            <span class="text-sm text-gray-500 mr-2">#${
                              index + 1
                            }</span>
                            <span>${
                              tecnico.nombre_completo || "Sin nombre"
                            }</span>
                        </div>
                        <span class="font-bold text-blue-600">${
                          tecnico.servicios_realizados || 0
                        }</span>
                    </div>
                `
          )
          .join("");
      } else {
        rendimientoTecnicosContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-4">
                        No hay datos de técnicos disponibles
                    </div>
                `;
      }
    }

    // Estado del Inventario
    const estadoInventarioContainer =
      document.getElementById("estadoInventario");
    if (estadoInventarioContainer) {
      if (
        estadoInventario &&
        Array.isArray(estadoInventario) &&
        estadoInventario.length > 0
      ) {
        estadoInventarioContainer.innerHTML = estadoInventario
          .map((item) => {
            const cantidadActual = item.cantidad_actual || 0;
            const isLowStock = cantidadActual < 10;
            return `
                        <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                            <span class="text-sm">${
                              item.nombre_sucursal || "Sin sucursal"
                            } - ${item.nombre_producto || "Sin producto"}</span>
                            <span class="font-bold ${
                              isLowStock ? "text-red-600" : "text-green-600"
                            }">
                                ${cantidadActual}
                                ${isLowStock ? " ⚠️" : ""}
                            </span>
                        </div>
                    `;
          })
          .join("");
      } else {
        estadoInventarioContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-4">
                        No hay datos de inventario disponibles
                    </div>
                `;
      }
    }

    console.log("✅ Análisis detallado cargado");
  } catch (error) {
    console.error("❌ Error al cargar análisis detallado:", error);
    throw error;
  }
}

// Función para refrescar todos los datos
async function refrescarDatos() {
  try {
    mostrarIndicadorCarga(true);
    await cargarMetricasPrincipales();
    await cargarGraficos();
    await cargarAnalisisDetallado();
    console.log("✅ Datos refrescados correctamente");
  } catch (error) {
    console.error("❌ Error al refrescar datos:", error);
    mostrarError("Error al refrescar los datos.");
  } finally {
    mostrarIndicadorCarga(false);
  }
}

// Exponer función para uso global
window.refrescarDatos = refrescarDatos;
