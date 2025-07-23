# 🔧 TecnoTaller - Sistema de Gestión de Taller Automotriz

<div align="center">

![TecnoTaller](https://img.shields.io/badge/TecnoTaller-v1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Sistema integral para la gestión completa de talleres automotrices**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [API](#-api) • [Contribuir](#-contribuir)

</div>

---

## 📋 Descripción

**TecnoTaller** es un sistema web completo diseñado para la gestión integral de talleres automotrices. Permite administrar clientes, vehículos, citas, servicios, inventario y facturación de manera eficiente y profesional.

### 🎯 Objetivo

Digitalizar y optimizar todos los procesos de un taller automotriz, desde la recepción del cliente hasta la entrega del vehículo reparado, mejorando la eficiencia operativa y la experiencia del cliente.

## ✨ Características

### 👥 Gestión de Clientes
- ✅ Registro completo de información personal
- ✅ Historial de servicios por cliente
- ✅ Gestión de múltiples vehículos por cliente
- ✅ Sistema de búsqueda avanzada

### 🚗 Gestión de Vehículos
- ✅ Registro detallado (marca, modelo, año, placa)
- ✅ Historial de mantenimientos y reparaciones
- ✅ Vinculación automática con propietarios
- ✅ Control de estado del vehículo

### 📅 Sistema de Citas
- ✅ Calendario interactivo
- ✅ Vista por tabla y calendario
- ✅ Estados de cita (Agendada, En progreso, Completada, Cancelada)
- ✅ Asignación de servicios múltiples
- ✅ Filtros avanzados por estado, sucursal y tipo

### 🔧 Gestión de Servicios
- ✅ Catálogo completo de servicios
- ✅ Precios dinámicos
- ✅ Múltiples servicios por cita
- ✅ Categorización por tipo

### 🏢 Multi-sucursal
- ✅ Gestión de múltiples ubicaciones
- ✅ Control de inventario por sucursal
- ✅ Reportes consolidados

### 📊 Reportes y Estadísticas
- ✅ Dashboard con métricas en tiempo real
- ✅ Estadísticas de citas por estado
- ✅ Reportes de facturación
- ✅ Análisis de rendimiento

### 💰 Sistema de Facturación
- ✅ Generación automática de facturas
- ✅ Control de métodos de pago
- ✅ Historial de transacciones
- ✅ Estados de factura

## 🏗️ Arquitectura del Sistema

```
TecnoTaller/
├── 🖥️ Backend (Node.js + Express)
│   ├── 🗃️ Base de datos (Oracle)
│   ├── 🔌 API RESTful
│   └── 🔐 Autenticación JWT
├── 🌐 Frontend (HTML5 + CSS3 + JavaScript)
│   ├── 📱 Diseño responsivo
│   ├── ⚡ SPA (Single Page Application)
│   └── 🎨 UI/UX moderno
└── 📁 Base de Datos
    ├── 📋 Scripts SQL
    ├── 💾 Backups automáticos
    └── 📈 Datos de prueba
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** (v14.0.0 o superior)
- **Oracle Database** (12c o superior)
- **Git**

### 1. Clonar el repositorio

```bash
git clone https://github.com/Cristobal18p/PROYECTO.git
cd PROYECTO
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

### 3. Configurar la Base de Datos

1. Instalar Oracle Database
2. Ejecutar los scripts SQL en `Database/`
3. Configurar las credenciales en `backend/config/CR7.js`

```javascript
// backend/config/CR7.js
module.exports = {
  user: 'tu_usuario',
  password: 'tu_password',
  connectString: 'localhost:1521/XE'
};
```

### 4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 5. Acceder al sistema

Abrir en el navegador: `http://localhost:3000`

## 📖 Uso

### Dashboard Principal
- **Estadísticas en tiempo real**: Citas del día, completadas, pendientes
- **Acceso rápido**: Crear nueva cita, ver calendario
- **Métricas visuales**: Gráficos de rendimiento

### Gestión de Citas
1. **Crear cita**: Cliente → Vehículo → Servicios → Fecha/Hora
2. **Vista calendario**: Navegación mensual con citas visuales
3. **Cambio de estado**: Workflow completo de estados
4. **Filtros**: Por estado, sucursal, cliente, fecha

### Módulos Principales
- **👥 Clientes**: CRUD completo con validaciones
- **🚗 Vehículos**: Gestión vinculada a clientes
- **📅 Citas**: Sistema completo de agendamiento
- **💰 Facturas**: Facturación automática
- **📊 Reportes**: Analytics y métricas

## 🔌 API

### Endpoints Principales

#### Clientes
```http
GET    /api/clientes          # Listar clientes
POST   /api/clientes          # Crear cliente
GET    /api/clientes/:id      # Obtener cliente
PUT    /api/clientes/:id      # Actualizar cliente
DELETE /api/clientes/:id      # Eliminar cliente
```

#### Citas
```http
GET    /api/citas             # Listar citas
POST   /api/citas             # Crear cita
PUT    /api/citas/:id         # Actualizar cita
DELETE /api/citas/:id         # Eliminar cita
GET    /api/citas/estadisticas # Estadísticas
```

#### Vehículos
```http
GET    /api/vehiculos         # Listar vehículos
POST   /api/vehiculos         # Crear vehículo
PUT    /api/vehiculos/:id     # Actualizar vehículo
DELETE /api/vehiculos/:id     # Eliminar vehículo
```

### Respuesta de ejemplo

```json
{
  "success": true,
  "data": {
    "cita_id": 1,
    "cliente_nombre": "Juan Pérez",
    "vehiculo_placa": "ABC123",
    "fecha_cita": "2025-07-23T09:00:00",
    "estado": "AGENDADA",
    "servicios": [
      {
        "servicio_id": 1,
        "nombre": "Cambio de aceite",
        "precio": 25.00
      }
    ]
  },
  "message": "Cita creada exitosamente"
}
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web
- **Oracle Database**: Base de datos empresarial
- **JWT**: Autenticación y autorización
- **bcrypt**: Encriptación de contraseñas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos y responsivos
- **JavaScript ES6+**: Lógica del cliente
- **Fetch API**: Comunicación con la API
- **Tailwind CSS**: Framework de estilos

### Herramientas
- **Git**: Control de versiones
- **nodemon**: Desarrollo en tiempo real
- **Postman**: Testing de API
- **Oracle SQL Developer**: Gestión de BD

## 📁 Estructura del Proyecto

```
PROYECTO/
├── 📂 backend/
│   ├── 📄 app.js                 # Punto de entrada
│   ├── 📄 server.js              # Configuración del servidor
│   ├── 📂 config/
│   │   └── 📄 CR7.js             # Configuración de BD
│   ├── 📂 controllers/           # Lógica de negocio
│   ├── 📂 routes/                # Rutas de la API
│   ├── 📂 middleware/            # Middlewares personalizados
│   └── 📄 package.json           # Dependencias
├── 📂 frontend/
│   ├── 📂 sistema/               # Páginas principales
│   ├── 📂 js/
│   │   ├── 📂 modulos/           # Módulos JavaScript
│   │   └── 📂 componentes/       # Componentes reutilizables
│   ├── 📂 css/                   # Estilos personalizados
│   └── 📄 config.js              # Configuración del frontend
├── 📂 Database/                  # Scripts y datos SQL
├── 📂 backup/                    # Respaldos de la BD
└── 📄 README.md                  # Documentación
```

## 🤝 Contribuir

### ¿Cómo contribuir?

1. **Fork** el proyecto
2. **Crear** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abrir** un Pull Request

### Estándares de código

- **ESLint**: Para JavaScript
- **Prettier**: Formateo automático
- **Comentarios**: Documentar funciones complejas
- **Commits**: Mensajes descriptivos en español

### Reportar bugs

Usar el sistema de **Issues** de GitHub con:
- Descripción detallada del problema
- Pasos para reproducir
- Capturas de pantalla si aplica
- Entorno donde ocurre

## 📝 Licencia

Este proyecto está bajo la licencia **MIT**. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Cristobal18p
- **Tipo**: Proyecto individual
- **Estado**: En desarrollo activo

## 📞 Contacto

- **GitHub**: [@Cristobal18p](https://github.com/Cristobal18p)
- **Proyecto**: [TecnoTaller](https://github.com/Cristobal18p/PROYECTO)

---

<div align="center">

**⭐ Si te gusta este proyecto, no olvides darle una estrella ⭐**

[![GitHub stars](https://img.shields.io/github/stars/Cristobal18p/PROYECTO?style=social)](https://github.com/Cristobal18p/PROYECTO/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Cristobal18p/PROYECTO?style=social)](https://github.com/Cristobal18p/PROYECTO/network)

**Desarrollado con ❤️ para optimizar la gestión de talleres automotrices**

</div>