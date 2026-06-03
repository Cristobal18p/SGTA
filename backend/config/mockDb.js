const bcrypt = require("bcrypt");

// Seeded in-memory data tables
const db = {
  ROL: [
    { ROL_ID: 1, NOMBRE_ROL: 'ADMINISTRADOR', ESTADO: 'ACTIVO' },
    { ROL_ID: 2, NOMBRE_ROL: 'RECEPCIONISTA', ESTADO: 'ACTIVO' },
    { ROL_ID: 3, NOMBRE_ROL: 'TECNICO', ESTADO: 'ACTIVO' }
  ],
  NACIONALIDADES: [
    { NACIONALIDAD_ID: 1, NOMBRE_NACIONALIDAD: 'Panameña' },
    { NACIONALIDAD_ID: 2, NOMBRE_NACIONALIDAD: 'Extranjera' }
  ],
  TIPOS_CLIENTES: [
    { TIPO_CLIENTE_ID: 1, DESCRIPCION_TIPO: 'Natural', ESTADO: 'ACTIVO' },
    { TIPO_CLIENTE_ID: 2, DESCRIPCION_TIPO: 'Jurídico', ESTADO: 'ACTIVO' }
  ],
  PROVINCIAS: [
    { PROVINCIA_ID: 1, NOMBRE_PROVINCIA: 'Panamá' },
    { PROVINCIA_ID: 2, NOMBRE_PROVINCIA: 'Panamá Oeste' }
  ],
  DISTRITOS: [
    { DISTRITO_ID: 1, PROVINCIA_ID: 1, NOMBRE_DISTRITO: 'Panamá' }
  ],
  CORREGIMIENTOS: [
    { CORREGIMIENTO_ID: 1, DISTRITO_ID: 1, NOMBRE_CORREGIMIENTO: 'Bella Vista' }
  ],
  DIRECCIONES: [
    { DIRECCION_ID: 1, DETALLE_DIRECCION: 'Calle 50, Edificio F&F Towers, Piso 15', CORREGIMIENTO_ID: 1 }
  ],
  METODOS_PAGOS: [
    { METODO_PAGO_ID: 1, NOMBRE_METODO: 'Efectivo', ESTADO: 'ACTIVO' },
    { METODO_PAGO_ID: 2, NOMBRE_METODO: 'Tarjeta de Crédito/Débito', ESTADO: 'ACTIVO' },
    { METODO_PAGO_ID: 3, NOMBRE_METODO: 'Yappy', ESTADO: 'ACTIVO' }
  ],
  USUARIOS: [
    { USUARIO_ID: 1, NOMBRE_USUARIO: 'admin', EMAIL_USUARIO: 'admin@tecnotaller.com', CLAVE_HASH: bcrypt.hashSync('admin123', 10), ROL_ID: 1, ESTADO: 'ACTIVO' }
  ],
  PERSONAL: [
    { PERSONAL_ID: 1, USUARIO_ID: 1, PRIMER_NOMBRE: 'Admin', PRIMER_APELLIDO: 'Taller', NUMERO_CEDULA: '8-888-8888', TELEFONO: '6666-6666', EMAIL: 'admin@tecnotaller.com', NACIONALIDAD_ID: 1, ESTADO: 'ACTIVO' },
    { PERSONAL_ID: 2, USUARIO_ID: null, PRIMER_NOMBRE: 'Carlos', PRIMER_APELLIDO: 'Mecánico', NUMERO_CEDULA: '8-777-7777', TELEFONO: '6555-5555', EMAIL: 'carlos@tecnotaller.com', NACIONALIDAD_ID: 1, ESTADO: 'ACTIVO' }
  ],
  CLIENTES: [
    { CLIENTE_ID: 1, PRIMER_NOMBRE: 'Juan', PRIMER_APELLIDO: 'Pérez', NUMERO_CEDULA: '8-123-4567', TELEFONO: '6123-4567', EMAIL: 'juan.perez@email.com', SEXO: 'M', TIPO_CLIENTE_ID: 1, DIRECCION_ID: 1, NACIONALIDAD_ID: 1, ESTADO: 'ACTIVO', FECHA_REGISTRO: '2026-05-01', OBSERVACIONES: 'Cliente frecuente' },
    { CLIENTE_ID: 2, PRIMER_NOMBRE: 'María', PRIMER_APELLIDO: 'Gómez', NUMERO_CEDULA: '9-987-6543', TELEFONO: '6987-6543', EMAIL: 'maria.gomez@email.com', SEXO: 'F', TIPO_CLIENTE_ID: 1, DIRECCION_ID: 1, NACIONALIDAD_ID: 1, ESTADO: 'ACTIVO', FECHA_REGISTRO: '2026-05-10', OBSERVACIONES: 'Pago puntual' }
  ],
  MARCAS_VEHICULOS: [
    { MARCA_ID: 1, NOMBRE_MARCA: 'Toyota', ESTADO: 'ACTIVO' },
    { MARCA_ID: 2, NOMBRE_MARCA: 'Honda', ESTADO: 'ACTIVO' }
  ],
  MODELOS_VEHICULOS: [
    { MODELO_ID: 1, MARCA_ID: 1, NOMBRE_MODELO: 'Corolla', ESTADO: 'ACTIVO' },
    { MODELO_ID: 2, MARCA_ID: 2, NOMBRE_MODELO: 'Civic', ESTADO: 'ACTIVO' }
  ],
  TIPOS_COMBUSTIBLE: [
    { TIPO_COMBUSTIBLE_ID: 1, NOMBRE_COMBUSTIBLE: 'Gasolina 95', ESTADO: 'ACTIVO' },
    { TIPO_COMBUSTIBLE_ID: 2, NOMBRE_COMBUSTIBLE: 'Gasolina 91', ESTADO: 'ACTIVO' },
    { TIPO_COMBUSTIBLE_ID: 3, NOMBRE_COMBUSTIBLE: 'Diésel', ESTADO: 'ACTIVO' }
  ],
  VEHICULOS: [
    { VEHICULO_ID: 1, CLIENTE_ID: 1, MARCA_ID: 1, MODELO_ID: 1, ANIO: 2020, PLACA: 'RI-1234', COLOR: 'Gris', TIPO_COMBUSTIBLE_ID: 1, TRANSMISION: 'Automática', KILOMETRAJE: 45000, ESTADO: 'ACTIVO', FECHA_REGISTRO: '2026-05-01' },
    { VEHICULO_ID: 2, CLIENTE_ID: 2, MARCA_ID: 2, MODELO_ID: 2, ANIO: 2019, PLACA: 'AB-5678', COLOR: 'Azul', TIPO_COMBUSTIBLE_ID: 1, TRANSMISION: 'Manual', KILOMETRAJE: 60000, ESTADO: 'ACTIVO', FECHA_REGISTRO: '2026-05-10' }
  ],
  SERVICIOS: [
    { SERVICIO_ID: 1, NOMBRE_SERVICIO: 'Cambio de Aceite y Filtro', DESCRIPCION: 'Cambio de aceite de motor y filtro de aceite', PRECIO: 45.00, ESTADO: 'ACTIVO' },
    { SERVICIO_ID: 2, NOMBRE_SERVICIO: 'Alineación y Balanceo', DESCRIPCION: 'Alineación de 4 ruedas y balanceo de llantas', PRECIO: 30.00, ESTADO: 'ACTIVO' },
    { SERVICIO_ID: 3, NOMBRE_SERVICIO: 'Diagnóstico Computarizado', DESCRIPCION: 'Escaneo de códigos de error con computadora', PRECIO: 25.00, ESTADO: 'ACTIVO' }
  ],
  PRODUCTOS: [
    { PRODUCTO_ID: 1, NOMBRE_PRODUCTO: 'Filtro de Aceite Toyota', DESCRIPCION: 'Filtro original para Corolla', PRECIO_VENTA: 12.00, STOCK: 50, ESTADO: 'ACTIVO' },
    { PRODUCTO_ID: 2, NOMBRE_PRODUCTO: 'Aceite Sintético 5W-30', DESCRIPCION: 'Aceite de motor sintético (1 galón)', PRECIO_VENTA: 35.00, STOCK: 100, ESTADO: 'ACTIVO' }
  ],
  PROVEEDORES: [
    { PROVEEDOR_ID: 1, NOMBRE_PROVEEDOR: 'Autopartes El Millón', CONTACTO: 'Juan Pérez', TELEFONO: '333-3333', EMAIL: 'contacto@autopartes.com', DIRECCION: 'Vía España', ESTADO: 'ACTIVO' }
  ],
  CITAS: [
    { CITA_ID: 1, CLIENTE_ID: 1, VEHICULO_ID: 1, FECHA_CITA: '2026-06-03', HORA_CITA: '10:00', MOTIVO: 'Mantenimiento preventivo', ESTADO: 'PENDIENTE', FECHA_REGISTRO: '2026-06-02', SUCURSAL_ID: 1, TIPO_CITA: 'Mantenimiento' },
    { CITA_ID: 2, CLIENTE_ID: 2, VEHICULO_ID: 2, FECHA_CITA: '2026-06-03', HORA_CITA: '14:30', MOTIVO: 'Ruido en la suspensión delantera', ESTADO: 'EN PROCESO', FECHA_REGISTRO: '2026-06-02', SUCURSAL_ID: 1, TIPO_CITA: 'Mantenimiento' }
  ],
  FACTURAS: [
    { FACTURA_ID: 1, CITA_ID: 1, CLIENTE_ID: 1, METODO_PAGO_ID: 1, SUBTOTAL: 45.00, ITBMS: 3.15, TOTAL_FACTURA: 48.15, ESTADO: 'PAGADA', FECHA_EMISION: '2026-06-03' }
  ],
  CONFIGURACION: [
    { CONFIGURACION_ID: 1, NOMBRE_EMPRESA: 'TecnoTaller S.A.', RUC: '8-12345-1-12', TELEFONO: '222-2222', DIRECCION: 'Via España, Ciudad de Panama', EMAIL: 'info@tecnotaller.com', ITBMS_PORCENTAJE: 7.0 }
  ],
  SUCURSALES: [
    { SUCURSAL_ID: 1, NOMBRE_SUCURSAL: 'Sucursal Central', TELEFONO: '222-1111', EMAIL: 'sucursal1@tecnotaller.com', DIRECCION_ID: 1, ESTADO: 'ACTIVO' }
  ],
  INVENTARIO_SUCURSAL: [
    { INVENTARIO_ID: 1, SUCURSAL_ID: 1, PRODUCTO_ID: 1, CANTIDAD: 50, ESTADO: 'ACTIVO' }
  ],
  DETALLES_CITAS: [],
  DETALLES_FACTURAS: [],
  ASIGNACIONES_TECNICOS: [],
  HISTORIAL_TECNICO: []
};

// Known primary key mappings
const primaryKeys = {
  CLIENTES: 'CLIENTE_ID',
  USUARIOS: 'USUARIO_ID',
  VEHICULOS: 'VEHICULO_ID',
  MARCAS_VEHICULOS: 'MARCA_ID',
  MODELOS_VEHICULOS: 'MODELO_ID',
  CITAS: 'CITA_ID',
  FACTURAS: 'FACTURA_ID',
  PERSONAL: 'PERSONAL_ID',
  ROL: 'ROL_ID',
  SUCURSALES: 'SUCURSAL_ID',
  SERVICIOS: 'SERVICIO_ID',
  PRODUCTOS: 'PRODUCTO_ID',
  PROVEEDORES: 'PROVEEDOR_ID',
  TIPOS_CLIENTES: 'TIPO_CLIENTE_ID',
  TIPOS_COMBUSTIBLE: 'TIPO_COMBUSTIBLE_ID',
  DIRECCIONES: 'DIRECCION_ID',
  NACIONALIDADES: 'NACIONALIDAD_ID',
  PAISES: 'PAIS_ID',
  PROVINCIAS: 'PROVINCIA_ID',
  DISTRITOS: 'DISTRITO_ID',
  CORREGIMIENTOS: 'CORREGIMIENTO_ID',
  METODOS_PAGOS: 'METODO_PAGO_ID',
  INVENTARIO_SUCURSAL: 'INVENTARIO_ID',
  DETALLES_CITAS: 'DETALLE_CITA_ID',
  DETALLES_FACTURAS: 'DETALLE_FACTURA_ID',
  ASIGNACIONES_TECNICOS: 'ASIGNACION_ID',
  HISTORIAL_TECNICO: 'HISTORIAL_ID'
};

// Helper function to duplicate all keys in uppercase and lowercase for maximum flexibility
function duplicateKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k.toUpperCase()] = v;
    result[k.toLowerCase()] = v;
  }
  return result;
}

// Function to resolve joins dynamically so the frontend and controllers get fully formed objects
function enrichRow(table, row) {
  const enriched = { ...row };

  if (table === 'CLIENTES') {
    const tp = db.TIPOS_CLIENTES.find(t => t.TIPO_CLIENTE_ID === row.TIPO_CLIENTE_ID);
    enriched.TIPO_CLIENTE_NOMBRE = tp ? tp.DESCRIPCION_TIPO : 'Natural';
    enriched.DESCRIPCION_TIPO = tp ? tp.DESCRIPCION_TIPO : 'Natural';

    const nac = db.NACIONALIDADES.find(n => n.NACIONALIDAD_ID === row.NACIONAILIDAD_ID || n.NACIONALIDAD_ID === row.NACIONALIDAD_ID);
    enriched.NOMBRE_NACIONALIDAD = nac ? nac.NOMBRE_NACIONALIDAD : 'Panameña';

    const dir = db.DIRECCIONES.find(d => d.DIRECCION_ID === row.DIRECCION_ID);
    if (dir) {
      enriched.DETALLE_DIRECCION = dir.DETALLE_DIRECCION;
      enriched.CORREGIMIENTO_ID = dir.CORREGIMIENTO_ID;

      const cor = db.CORREGIMIENTOS.find(c => c.CORREGIMIENTO_ID === dir.CORREGIMIENTO_ID);
      if (cor) {
        enriched.NOMBRE_CORREGIMIENTO = cor.NOMBRE_CORREGIMIENTO;
        enriched.DISTRITO_ID = cor.DISTRITO_ID;

        const dis = db.DISTRITOS.find(d => d.DISTRITO_ID === cor.DISTRITO_ID);
        if (dis) {
          enriched.NOMBRE_DISTRITO = dis.NOMBRE_DISTRITO;
          enriched.PROVINCIA_ID = dis.PROVINCIA_ID;

          const prov = db.PROVINCIAS.find(p => p.PROVINCIA_ID === dis.PROVINCIA_ID);
          if (prov) {
            enriched.NOMBRE_PROVINCIA = prov.NOMBRE_PROVINCIA;
          }
        }
      }
    }
  }

  if (table === 'VEHICULOS') {
    const m = db.MARCAS_VEHICULOS.find(x => x.MARCA_ID === row.MARCA_ID);
    enriched.NOMBRE_MARCA = m ? m.NOMBRE_MARCA : '';

    const mod = db.MODELOS_VEHICULOS.find(x => x.MODELO_ID === row.MODELO_ID);
    enriched.NOMBRE_MODELO = mod ? mod.NOMBRE_MODELO : '';

    const comb = db.TIPOS_COMBUSTIBLE.find(x => x.TIPO_COMBUSTIBLE_ID === row.TIPO_COMBUSTIBLE_ID);
    enriched.NOMBRE_COMBUSTIBLE = comb ? comb.NOMBRE_COMBUSTIBLE : '';

    const cl = db.CLIENTES.find(x => x.CLIENTE_ID === row.CLIENTE_ID);
    enriched.CLIENTE_NOMBRE = cl ? `${cl.PRIMER_NOMBRE} ${cl.PRIMER_APELLIDO}` : '';
    enriched.NUMERO_PLACA = row.PLACA || '';
  }

  if (table === 'USUARIOS') {
    const r = db.ROL.find(x => x.ROL_ID === row.ROL_ID);
    enriched.ROL_NOMBRE = r ? r.NOMBRE_ROL : '';
    enriched.ROL_NAME = r ? r.NOMBRE_ROL : '';

    const p = db.PERSONAL.find(x => x.USUARIO_ID === row.USUARIO_ID);
    if (p) {
      enriched.PERSONAL_ID = p.PERSONAL_ID;
      enriched.PRIMER_NOMBRE = p.PRIMER_NOMBRE;
      enriched.SEGUNDO_NOMBRE = p.SEGUNDO_NOMBRE;
      enriched.PRIMER_APELLIDO = p.PRIMER_APELLIDO;
      enriched.SEGUNDO_APELLIDO = p.SEGUNDO_APELLIDO;
      enriched.NUMERO_CEDULA = p.NUMERO_CEDULA;
      enriched.TELEFONO = p.TELEFONO;
      enriched.EMAIL = p.EMAIL;
      enriched.EMAIL_PERSONAL = p.EMAIL;
      enriched.NACIONALIDAD_ID = p.NACIONALIDAD_ID;
      
      const nac = db.NACIONALIDADES.find(n => n.NACIONALIDAD_ID === p.NACIONALIDAD_ID);
      enriched.NOMBRE_NACIONALIDAD = nac ? nac.NOMBRE_NACIONALIDAD : '';
    }
  }

  if (table === 'PERSONAL') {
    const nac = db.NACIONALIDADES.find(n => n.NACIONALIDAD_ID === row.NACIONALIDAD_ID);
    enriched.NOMBRE_NACIONALIDAD = nac ? nac.NOMBRE_NACIONALIDAD : '';
  }

  if (table === 'CITAS') {
    const cl = db.CLIENTES.find(x => x.CLIENTE_ID === row.CLIENTE_ID);
    enriched.CLIENTE_NOMBRE = cl ? `${cl.PRIMER_NOMBRE} ${cl.PRIMER_APELLIDO}` : 'Cliente';
    enriched.NOMBRE_CLIENTE = cl ? `${cl.PRIMER_NOMBRE} ${cl.PRIMER_APELLIDO}` : 'Cliente';
    enriched.CLIENTE_DOCUMENTO = cl ? cl.NUMERO_CEDULA : '';

    const v = db.VEHICULOS.find(x => x.VEHICULO_ID === row.VEHICULO_ID);
    if (v) {
      enriched.VEHICULO_PLACA = v.PLACA;
      enriched.NUMERO_PLACA = v.PLACA;
      enriched.COLOR = v.COLOR;
      
      const m = db.MARCAS_VEHICULOS.find(x => x.MARCA_ID === v.MARCA_ID);
      enriched.VEHICULO_MARCA = m ? m.NOMBRE_MARCA : '';
      enriched.NOMBRE_MARCA = m ? m.NOMBRE_MARCA : '';

      const mod = db.MODELOS_VEHICULOS.find(x => x.MODELO_ID === v.MODELO_ID);
      enriched.VEHICULO_MODELO = mod ? mod.NOMBRE_MODELO : '';
      enriched.NOMBRE_MODELO = mod ? mod.NOMBRE_MODELO : '';
    }

    const s = db.SUCURSALES.find(x => x.SUCURSAL_ID === row.SUCURSAL_ID);
    enriched.NOMBRE_SUCURSAL = s ? s.NOMBRE_SUCURSAL : 'Sucursal Central';
  }

  if (table === 'FACTURAS') {
    const cl = db.CLIENTES.find(x => x.CLIENTE_ID === row.CLIENTE_ID);
    enriched.CLIENTE_NOMBRE = cl ? `${cl.PRIMER_NOMBRE} ${cl.PRIMER_APELLIDO}` : '';
    enriched.NOMBRE_CLIENTE = cl ? `${cl.PRIMER_NOMBRE} ${cl.PRIMER_APELLIDO}` : '';
    
    const mp = db.METODOS_PAGOS.find(x => x.METODO_PAGO_ID === row.METODO_PAGO_ID);
    enriched.METODO_PAGO_NOMBRE = mp ? mp.NOMBRE_METODO : '';
  }

  if (table === 'MODELOS_VEHICULOS') {
    const m = db.MARCAS_VEHICULOS.find(x => x.MARCA_ID === row.MARCA_ID);
    enriched.MARCA_NOMBRE = m ? m.NOMBRE_MARCA : '';
  }

  return enriched;
}

async function initialize() {
  console.log('⚡ [Mock DB] Usando Base de Datos en Memoria para pruebas.');
  console.log('⚡ [Mock DB] Credenciales por defecto: admin@tecnotaller.com / admin123');
  return true;
}

async function simpleExecute(statement, binds = {}, opts = {}) {
  const sqlClean = statement.replace(/\s+/g, ' ').trim().toUpperCase();
  console.log(`[Mock DB] Query: ${sqlClean.substring(0, 120)}${sqlClean.length > 120 ? '...' : ''}`);
  if (Object.keys(binds).length > 0) {
    console.log(`[Mock DB] Binds:`, binds);
  }

  // 1. Check for dashboard stats query (which aggregates from multiple tables using subqueries or DUAL)
  if (sqlClean.includes('FROM DUAL') && sqlClean.includes('CLIENTES') && sqlClean.includes('CITAS')) {
    const today = new Date().toISOString().split('T')[0];
    const totalClientes = db.CLIENTES.filter(c => c.ESTADO !== 'ELIMINADO').length;
    const citasHoy = db.CITAS.filter(c => c.FECHA_CITA === today && c.ESTADO !== 'ELIMINADO').length;
    const citasPendientes = db.CITAS.filter(c => c.ESTADO === 'PENDIENTE' || c.ESTADO === 'AGENDADA').length;
    const totalVehiculos = db.VEHICULOS.filter(v => v.ESTADO !== 'ELIMINADO').length;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const facturasMes = db.FACTURAS.filter(f => {
      const d = new Date(f.FECHA_EMISION || f.FECHA_REGISTRO || today);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear && f.ESTADO !== 'ELIMINADO';
    });
    
    const totalFacturasMes = facturasMes.length;
    const ingresoMes = facturasMes.reduce((sum, f) => sum + (f.TOTAL_FACTURA || f.TOTAL || 0), 0);

    const statsRow = {
      TOTAL_CLIENTES: totalClientes,
      CITAS_HOY: citasHoy,
      CITAS_PENDIENTES: citasPendientes,
      TOTAL_VEHICULOS: totalVehiculos,
      FACTURAS_MES: totalFacturasMes,
      INGRESO_MES: ingresoMes
    };

    return {
      rows: [duplicateKeys(statsRow)]
    };
  }

  // 2. SELECT Query Execution
  if (sqlClean.startsWith('SELECT')) {
    const fromMatch = sqlClean.match(/FROM\s+([A-Z_0-9]+)/);
    if (!fromMatch) {
      if (sqlClean.includes('FROM DUAL')) {
        return { rows: [duplicateKeys({ 1: 1 })] };
      }
      return { rows: [] };
    }

    const tableName = fromMatch[1];
    let tableData = db[tableName];
    if (!tableData) {
      console.warn(`[Mock DB] Tabla ${tableName} no encontrada en mock. Retornando vacío.`);
      return { rows: [] };
    }

    let filtered = [...tableData];
    
    // Filter out logically deleted records if not explicitly looking for deleted ones
    if (filtered.length > 0 && filtered[0].ESTADO !== undefined) {
      if (!sqlClean.includes('ELIMINADO') && !sqlClean.includes('ESTADO = :')) {
        filtered = filtered.filter(row => row.ESTADO !== 'ELIMINADO');
      }
    }

    // Filter by bind variables
    for (const [key, val] of Object.entries(binds)) {
      if (key === 'offset' || key === 'limit_offset') continue;
      
      if (key === 'busqueda') {
        const searchVal = String(val).replace(/%/g, '').toUpperCase();
        if (searchVal) {
          filtered = filtered.filter(row => {
            return Object.values(row).some(fieldVal => {
              return String(fieldVal).toUpperCase().includes(searchVal);
            });
          });
        }
        continue;
      }

      // Special login check
      if (tableName === 'USUARIOS' && key === 'usuario') {
        const userVal = String(val).toLowerCase();
        filtered = filtered.filter(row => {
          return String(row.EMAIL_USUARIO).toLowerCase() === userVal || 
                 String(row.NOMBRE_USUARIO).toLowerCase() === userVal;
        });
        continue;
      }

      // Filter by column match
      const upperKey = key.toUpperCase();
      filtered = filtered.filter(row => {
        const rowKey = Object.keys(row).find(k => k.toUpperCase() === upperKey);
        if (rowKey) {
          const rowVal = row[rowKey];
          if (Array.isArray(val)) {
            return val.includes(rowVal);
          }
          return String(rowVal).toLowerCase() === String(val).toLowerCase();
        }
        return true;
      });
    }

    // Resolve Joins (Enrich)
    let enriched = filtered.map(row => enrichRow(tableName, row));

    // Handle SQL COUNT
    if (sqlClean.includes('COUNT(')) {
      const totalCount = enriched.length;
      const countAliasMatch = sqlClean.match(/COUNT\([^)]*\)\s+(?:AS\s+)?([A-Z_0-9]+)/i);
      const aliasName = countAliasMatch ? countAliasMatch[1].toUpperCase() : 'TOTAL';
      return {
        rows: [duplicateKeys({
          [aliasName]: totalCount,
          TOTAL: totalCount
        })]
      };
    }

    // Handle Pagination Slicing
    if (binds.offset !== undefined && binds.limit_offset !== undefined) {
      const offset = Number(binds.offset);
      const limitOffset = Number(binds.limit_offset);
      enriched = enriched.slice(offset, limitOffset);
    } else if (binds.offset !== undefined) {
      const offset = Number(binds.offset);
      enriched = enriched.slice(offset);
    }

    // Duplicate keys to both uppercase and lowercase to support both styles in javascript
    const finalRows = enriched.map(row => duplicateKeys(row));
    return { rows: finalRows };
  }

  // 3. INSERT Query Execution
  if (sqlClean.startsWith('INSERT')) {
    const insertMatch = sqlClean.match(/INSERT\s+INTO\s+([A-Z_0-9]+)/);
    if (!insertMatch) {
      throw new Error(`[Mock DB] Error al parsear consulta INSERT: ${statement}`);
    }

    const tableName = insertMatch[1];
    let tableData = db[tableName];
    if (!tableData) {
      db[tableName] = [];
      tableData = db[tableName];
    }

    const primaryKey = primaryKeys[tableName] || `${tableName.replace(/S$/, '')}_ID`;

    let nextId = 1;
    if (tableData.length > 0) {
      const ids = tableData.map(r => Number(r[primaryKey]) || 0);
      nextId = Math.max(...ids) + 1;
    }

    const newRow = {};
    newRow[primaryKey] = nextId;

    const outBinds = {};
    for (const [key, val] of Object.entries(binds)) {
      const upperKey = key.toUpperCase();
      if (upperKey === primaryKey) {
        if (val && typeof val === 'object' && val.dir !== undefined) {
          outBinds[key] = [nextId];
        }
        continue;
      }

      if (val && typeof val === 'object' && val.dir !== undefined) {
        if (val.dir === 2) { // BIND_OUT
          outBinds[key] = [nextId];
        }
        continue;
      }

      newRow[upperKey] = val;
    }

    const today = new Date().toISOString().split('T')[0];
    if (newRow.FECHA_REGISTRO === undefined && Object.keys(tableData[0] || { FECHA_REGISTRO: 1 }).includes('FECHA_REGISTRO')) {
      newRow.FECHA_REGISTRO = today;
    }
    if (newRow.FECHA_EMISION === undefined && Object.keys(tableData[0] || { FECHA_EMISION: 1 }).includes('FECHA_EMISION')) {
      newRow.FECHA_EMISION = today;
    }

    tableData.push(newRow);
    console.log(`[Mock DB] Fila insertada en ${tableName}:`, newRow);

    return {
      rowsAffected: 1,
      outBinds: outBinds
    };
  }

  // 4. UPDATE Query Execution
  if (sqlClean.startsWith('UPDATE')) {
    const updateMatch = sqlClean.match(/UPDATE\s+([A-Z_0-9]+)/);
    if (!updateMatch) {
      throw new Error(`[Mock DB] Error al parsear consulta UPDATE: ${statement}`);
    }

    const tableName = updateMatch[1];
    const tableData = db[tableName];
    if (!tableData) {
      return { rowsAffected: 0 };
    }

    const primaryKey = primaryKeys[tableName] || `${tableName.replace(/S$/, '')}_ID`;
    const pkBindKey = Object.keys(binds).find(k => k.toUpperCase() === primaryKey || k.toLowerCase() === 'id' || k.toLowerCase() === `${tableName.replace(/S$/, '').toLowerCase()}_id`);

    if (!pkBindKey) {
      console.warn(`[Mock DB] No se encontró clave primaria en binds para UPDATE:`, binds);
      return { rowsAffected: 0 };
    }

    const pkVal = Number(binds[pkBindKey]);
    const rowIndex = tableData.findIndex(row => Number(row[primaryKey]) === pkVal);

    if (rowIndex === -1) {
      return { rowsAffected: 0 };
    }

    const rowToUpdate = tableData[rowIndex];
    for (const [key, val] of Object.entries(binds)) {
      if (key === pkBindKey) continue;
      if (val && typeof val === 'object' && val.dir !== undefined) continue;

      const upperKey = key.toUpperCase();
      rowToUpdate[upperKey] = val;
    }

    console.log(`[Mock DB] Fila actualizada en ${tableName} para ID ${pkVal}:`, rowToUpdate);
    return { rowsAffected: 1 };
  }

  // 5. DELETE Query Execution
  if (sqlClean.startsWith('DELETE')) {
    const deleteMatch = sqlClean.match(/DELETE\s+(?:FROM\s+)?([A-Z_0-9]+)/);
    if (!deleteMatch) {
      throw new Error(`[Mock DB] Error al parsear consulta DELETE: ${statement}`);
    }

    const tableName = deleteMatch[1];
    const tableData = db[tableName];
    if (!tableData) {
      return { rowsAffected: 0 };
    }

    const primaryKey = primaryKeys[tableName] || `${tableName.replace(/S$/, '')}_ID`;
    const pkBindKey = Object.keys(binds).find(k => k.toUpperCase() === primaryKey || k.toLowerCase() === 'id' || k.toLowerCase() === `${tableName.replace(/S$/, '').toLowerCase()}_id`);

    if (!pkBindKey) {
      return { rowsAffected: 0 };
    }

    const pkVal = Number(binds[pkBindKey]);
    const rowIndex = tableData.findIndex(row => Number(row[primaryKey]) === pkVal);

    if (rowIndex === -1) {
      return { rowsAffected: 0 };
    }

    tableData.splice(rowIndex, 1);
    console.log(`[Mock DB] Fila eliminada en ${tableName} para ID ${pkVal}`);
    return { rowsAffected: 1 };
  }

  return { rows: [], rowsAffected: 0 };
}

module.exports = {
  initialize,
  simpleExecute,
  db
};
