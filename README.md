# TecnoTaller - Sistema de Gestión de Taller Automotriz

<div align="center">

![TecnoTaller](https://img.shields.io/badge/TecnoTaller-v1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

**Sistema integral para la gestión completa de talleres automotrices**

[Características](#caracteristicas) • [Instalación](#instalacion) • [Uso](#uso) • [API](#api)

</div>

---

## Descripción

**TecnoTaller**es un sistema web completo diseñado para la gestión integral de talleres automotrices. Permite administrar clientes, vehículos, citas, servicios, inventario y facturación de manera eficiente y profesional.

### Objetivo

Digitalizar y optimizar todos los procesos de un taller automotriz, desde la recepción del cliente hasta la entrega del vehículo reparado, mejorando la eficiencia operativa y la experiencia del cliente.

## Características

### Gestión de Clientes
- Registro completo de información personal
- Historial de servicios por cliente
- Gestión de múltiples vehículos por cliente
- Sistema de búsqueda avanzada

### Gestión de Vehículos
- Registro detallado (marca, modelo, año, placa)
- Historial de mantenimientos y reparaciones
- Vinculación automática con propietarios
- Control de estado del vehículo

### Sistema de Citas
- Calendario interactivo
- Vista por tabla y calendario
- Estados de cita (Agendada, En progreso, Completada, Cancelada)
- Asignación de servicios múltiples
- Filtros avanzados por estado, sucursal y tipo

### Gestión de Servicios
- Catálogo completo de servicios
- Precios dinámicos
- Múltiples servicios por cita
- Categorización por tipo

### Multi-sucursal
- Gestión de múltiples ubicaciones
- Control de inventario por sucursal
- Reportes consolidados

### Reportes y Estadísticas
- Dashboard con métricas en tiempo real
- Estadísticas de citas por estado
- Reportes de facturación
- Análisis de rendimiento

### Sistema de Facturación
- Generación automática de facturas
- Control de métodos de pago
- Historial de transacciones
- Estados de factura

## Arquitectura del Sistema

```
TecnoTaller/
├── Backend (Node.js + Express)
│   ├── Base de datos (Oracle)
│   ├── API RESTful
│   └── Autenticación JWT
├── Frontend (HTML5 + CSS3 + JavaScript)
│   ├── Diseño responsivo
│   ├── SPA (Single Page Application)
│   └── UI/UX moderno
└── Base de Datos
    ├── Scripts SQL
    ├── Backups automáticos
    └── Datos de prueba
```

## Instalación y Configuración

### Prerrequisitos

- **Node.js** (v18.0.0 o superior recomendado)
- **Git**
- **Oracle Database** (Opcional, solo si deseas conectarlo a una base de datos real. Por defecto, el sistema se ejecuta usando una base de datos en memoria para facilitar las pruebas locales).

---

### Modo Rápido (Desarrollo / Base de datos en memoria)
Este proyecto cuenta con una **Base de Datos en Memoria (Mock DB)** integrada. Permite levantar todo el sistema (login, clientes, citas, reportes, facturación, etc.) de forma instantánea sin necesidad de instalar o configurar Oracle.

#### 1. Clonar el repositorio y entrar al proyecto
```bash
git clone https://github.com/Cristobal18p/SGTA.git
cd SGTA
```

#### 2. Instalar dependencias e iniciar el servidor (desde la raíz)
```bash
# Instala las dependencias del backend automáticamente
npm run install-all

# Inicia el proyecto en modo desarrollo
npm run dev
```

#### 3. Acceder al sistema
Abre en tu navegador: **[http://localhost:3000](http://localhost:3000)**

* **Credenciales de prueba por defecto:**
  * **Usuario / Email:** `admin@tecnotaller.com` (o el usuario `admin`)
  * **Contraseña:** `admin123`

---

### Modo Producción / Base de Datos Real (Oracle)
Si deseas conectar el sistema a tu base de datos Oracle:

1. **Configurar esquema**: Ejecuta los scripts SQL contenidos en la carpeta `Database/` en tu servidor Oracle.
2. **Crear archivo de entorno**: Copia el archivo de ejemplo en el backend:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **Configurar credenciales**: Edita el archivo `backend/.env` estableciendo `USE_MOCK_DB=false` e ingresando tus credenciales de conexión Oracle:
   ```env
   USE_MOCK_DB=false
   DB_USER=tu_usuario_oracle
   DB_PASSWORD=tu_contraseña_oracle
   DB_CONNECTION_STRING=localhost:1521/ORCLPDB
   JWT_SECRET=tu_jwt_secret_seguro
   ```
4. **Ejecutar el servidor**:
   ```bash
   # En la raíz del proyecto
   npm start
   ```

## Uso

### Dashboard Principal
- **Estadísticas en tiempo real**: Citas del día, completadas, pendientes
- **Acceso rápido**: Crear nueva cita, ver calendario
- **Métricas visuales**: Gráficos de rendimiento

### Gestión de Citas
1. **Crear cita**: Cliente → Vehículo → Servicios → Fecha/Hora
2. **Vista calendario**: Navegación mensual con citas visuales
3. **Cambio de estado**: Workflow completo de estados
4. **Filtros** : Por estado, sucursal, cliente, fecha

### Módulos Principales
- **Clientes**: CRUD completo con validaciones
- **Vehículos**: Gestión vinculada a clientes
- **Citas**: Sistema completo de agendamiento
- **Facturas**: Facturación automática
- **Reportes**: Analytics y métricas

## API

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

## Tecnologías Utilizadas

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

## Estructura del Proyecto

```
PROYECTO/
├── backend/
│   ├── app.js                 # Punto de entrada
│   ├── server.js              # Configuración del servidor
│   ├── config/
│   │   └── CR7.js             # Configuración de BD
│   ├── controllers/           # Lógica de negocio
│   ├── routes/                # Rutas de la API
│   ├── middleware/            # Middlewares personalizados
│   └── package.json           # Dependencias
├── frontend/
│   ├── sistema/               # Páginas principales
│   ├── js/
│   │   ├── modulos/           # Módulos JavaScript
│   │   └── componentes/       # Componentes reutilizables
│   ├── css/                   # Estilos personalizados
│   └── config.js              # Configuración del frontend
├── Database/                  # Scripts y datos SQL
├── backup/                    # Respaldos de la BD
└── README.md                  # Documentación
```

## Licencia

Este proyecto está bajo la licencia **MIT**. Ver `LICENSE` para más detalles.

## Contacto

- **GitHub**: [@Cristobal18p](https://github.com/Cristobal18p)
- **Proyecto**: [TecnoTaller (SGTA)](https://github.com/Cristobal18p/SGTA)

---

<div align="center">

**Desarrollado para optimizar la gestión de talleres automotrices**

</div>
