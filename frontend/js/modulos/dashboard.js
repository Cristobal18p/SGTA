// dashboard.js
// Inicialización y carga de estadísticas para el dashboard TecnoTaller

async function cargarEstadisticasDashboard() {
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('authToken');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch("/api/estadisticas", { headers });
    if (!response.ok) throw new Error("Error al obtener estadísticas");
    const data = await response.json();

    // Actualizar tarjetas
    document.getElementById("clientesCount").textContent =
      data.TOTAL_CLIENTES ?? "-";
    document.getElementById("citasCount").textContent = data.CITAS_HOY ?? "-";
    document.getElementById("vehiculosCount").textContent =
      data.TOTAL_VEHICULOS ?? "-";
    document.getElementById("facturasCount").textContent =
      data.FACTURAS_MES ?? "-";

    // Pendientes en citas
    const pendientesEl = document.getElementById("citasPendientes");
    if (pendientesEl) {
      pendientesEl.textContent = `${data.CITAS_PENDIENTES ?? 0} pendientes`;
    }

    // Badge de citas de hoy
    const citasHoyBadge = document.getElementById("citasHoyBadge");
    if (citasHoyBadge) {
      citasHoyBadge.textContent = `${data.CITAS_HOY ?? 0} citas`;
    }

    // Ingreso del mes en facturas
    const ingresoMesEl = document.getElementById("ingresoMes");
    if (ingresoMesEl) {
      ingresoMesEl.textContent = `$${(data.INGRESO_MES ?? 0).toLocaleString(
        "es-ES"
      )}`;
    }
  } catch (err) {
    console.error("Error cargando estadísticas:", err);
    // Mostrar indicadores de error en lugar de spinners
    ["clientesCount", "citasCount", "vehiculosCount", "facturasCount"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "-";
    });
    const pendientesEl = document.getElementById("citasPendientes");
    if (pendientesEl) pendientesEl.textContent = "Sin datos";
    const ingresoMesEl = document.getElementById("ingresoMes");
    if (ingresoMesEl) ingresoMesEl.textContent = "$0";
    const citasHoyBadge = document.getElementById("citasHoyBadge");
    if (citasHoyBadge) citasHoyBadge.textContent = "Sin datos";
  }
}

function updateDateTime() {
  const now = new Date();
  const timeElement = document.getElementById("currentTime");
  const dateElement = document.getElementById("currentDate");

  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}

function initializeDashboardFeatures() {
  // Actualizar fecha y hora
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Event listeners para acciones rápidas
  document.querySelectorAll(".group button").forEach((button) => {
    button.addEventListener("click", function () {
      const actionText = this.querySelector("h4")?.textContent || "Acción";

      if (window.toastManager) {
        window.toastManager.show(`Acción: ${actionText}`, "info");
      } else {
        alert(`Acción: ${actionText}`);
      }
    });
  });
}

// Inicialización principal
async function initDashboard() {
  console.log("🚀 Iniciando Dashboard TecnoTaller...");
  await (window.loadCommonComponents?.() ?? Promise.resolve());
  cargarEstadisticasDashboard();
  initializeDashboardFeatures();
  console.log("✅ Dashboard cargado correctamente");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}
