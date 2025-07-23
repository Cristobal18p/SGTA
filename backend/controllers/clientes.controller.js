const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// Función opcional para generar cédula temporal si no se proporciona
function generarCedulaTemporal() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `TEMP-${random}`;
}

// OBTENER UN CLIENTE POR ID (GET) - CON DATOS COMPLETOS DE DIRECCIÓN
const obtenerClientePorId = async (req, res) => {
  const { cliente_id } = req.params;
  const sql = `
    SELECT 
      c.cliente_id,
      c.primer_nombre,
      c.segundo_nombre,
      c.primer_apellido,
      c.segundo_apellido,
      c.numero_cedula,
      c.telefono,
      c.email,
      c.sexo,
      c.tipo_cliente_id,
      tp.descripcion_tipo,
      c.direccion_id,
      c.nacionalidad_id,
      n.nombre_nacionalidad,
      c.estado,
      c.observaciones,
      TO_CHAR(c.fecha_registro, 'YYYY-MM-DD') AS fecha_registro,
      -- Datos completos de dirección
      d.detalle_direccion,
      d.corregimiento_id,
      cor.nombre_corregimiento,
      cor.distrito_id,
      dis.nombre_distrito,
      dis.provincia_id,
      prov.nombre_provincia
    FROM clientes c
    LEFT JOIN nacionalidades n ON c.nacionalidad_id = n.nacionalidad_id
    LEFT JOIN tipos_clientes tp ON c.tipo_cliente_id = tp.tipo_cliente_id
    LEFT JOIN direcciones d ON c.direccion_id = d.direccion_id
    LEFT JOIN corregimientos cor ON d.corregimiento_id = cor.corregimiento_id
    LEFT JOIN distritos dis ON cor.distrito_id = dis.distrito_id
    LEFT JOIN provincias prov ON dis.provincia_id = prov.provincia_id
    WHERE c.cliente_id = :cliente_id
  `;
  try {
    const result = await simpleExecute(sql, { cliente_id });
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Normalizar los nombres de campos de Oracle con datos completos de dirección
    const clienteNormalizado = {
      cliente_id: result.rows[0].CLIENTE_ID,
      primer_nombre: result.rows[0].PRIMER_NOMBRE,
      segundo_nombre: result.rows[0].SEGUNDO_NOMBRE,
      primer_apellido: result.rows[0].PRIMER_APELLIDO,
      segundo_apellido: result.rows[0].SEGUNDO_APELLIDO,
      numero_cedula: result.rows[0].NUMERO_CEDULA,
      telefono: result.rows[0].TELEFONO,
      email: result.rows[0].EMAIL,
      sexo: result.rows[0].SEXO,
      tipo_cliente_id: result.rows[0].TIPO_CLIENTE_ID,
      descripcion_tipo: result.rows[0].DESCRIPCION_TIPO,
      direccion_id: result.rows[0].DIRECCION_ID,
      nacionalidad_id: result.rows[0].NACIONALIDAD_ID,
      nombre_nacionalidad: result.rows[0].NOMBRE_NACIONALIDAD,
      estado: result.rows[0].ESTADO,
      observaciones: result.rows[0].OBSERVACIONES,
      fecha_registro: result.rows[0].FECHA_REGISTRO,

      // Datos completos de dirección
      detalle_direccion: result.rows[0].DETALLE_DIRECCION,
      corregimiento_id: result.rows[0].CORREGIMIENTO_ID,
      corregimiento_nombre: result.rows[0].NOMBRE_CORREGIMIENTO,
      distrito_id: result.rows[0].DISTRITO_ID,
      distrito_nombre: result.rows[0].NOMBRE_DISTRITO,
      provincia_id: result.rows[0].PROVINCIA_ID,
      provincia_nombre: result.rows[0].NOMBRE_PROVINCIA,
    };

    console.log("📍 Cliente con datos completos de dirección:", {
      cliente_id: clienteNormalizado.cliente_id,
      direccion_completa: {
        provincia: clienteNormalizado.provincia_nombre,
        distrito: clienteNormalizado.distrito_nombre,
        corregimiento: clienteNormalizado.corregimiento_nombre,
        detalle: clienteNormalizado.detalle_direccion,
      },
    });

    res.status(200).json({ success: true, data: clienteNormalizado });
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    res
      .status(500)
      .json({ error: "Error al obtener cliente", details: error.message });
  }
};

// APIS PARA FRONTEND - MODULO CLIENTES (CON PAGINACIÓN)
const mostrarModuloCliente = async (req, res) => {
  // Parámetros de paginación
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const busqueda = req.query.busqueda || "";
  const tipoCliente = req.query.tipoCliente || "";
  const estado = req.query.estado || "";

  // Construir WHERE dinámico
  let whereClause = "";
  let binds = {
    offset: offset,
    limit_offset: offset + limit,
  };

  const condiciones = [];

  if (busqueda) {
    condiciones.push(`(
      UPPER(C.PRIMER_NOMBRE) LIKE UPPER(:busqueda) OR
      UPPER(C.SEGUNDO_NOMBRE) LIKE UPPER(:busqueda) OR
      UPPER(C.PRIMER_APELLIDO) LIKE UPPER(:busqueda) OR
      UPPER(C.SEGUNDO_APELLIDO) LIKE UPPER(:busqueda) OR
      UPPER(C.NUMERO_CEDULA) LIKE UPPER(:busqueda) OR
      UPPER(C.EMAIL) LIKE UPPER(:busqueda) OR
      UPPER(C.TELEFONO) LIKE UPPER(:busqueda)
    )`);
    binds.busqueda = `%${busqueda}%`;
  }

  if (tipoCliente) {
    condiciones.push(`TP.DESCRIPCION_TIPO = :tipoCliente`);
    binds.tipoCliente = tipoCliente;
  }

  // Solo mostrar clientes ACTIVO o INACTIVO
  // Si estado es vacío, null, undefined o 'TODOS', mostrar ambos
  if (estado && estado !== "" && estado !== "TODOS") {
    condiciones.push(`C.ESTADO = :estado`);
    binds.estado = estado;
  } else {
    condiciones.push(`C.ESTADO IN ('ACTIVO', 'INACTIVO')`);
  }

  if (condiciones.length > 0) {
    whereClause = `WHERE ${condiciones.join(" AND ")}`;
  }

  // Query principal con paginación - CON DATOS DE DIRECCIÓN
  const sql = `
    SELECT * FROM (
      SELECT 
        C.CLIENTE_ID,
        C.PRIMER_NOMBRE,
        C.SEGUNDO_NOMBRE,
        C.PRIMER_APELLIDO,
        C.SEGUNDO_APELLIDO,
        C.NUMERO_CEDULA,
        C.TELEFONO,
        C.EMAIL,
        C.TIPO_CLIENTE_ID,
        TP.DESCRIPCION_TIPO AS TIPO_CLIENTE_NOMBRE,
        C.ESTADO,
        TO_CHAR(C.FECHA_REGISTRO, 'YYYY-MM-DD') AS FECHA_REGISTRO,
        -- Agregar datos básicos de dirección para referencia
        C.DIRECCION_ID,
        D.DETALLE_DIRECCION,
        PROV.NOMBRE_PROVINCIA,
        DIS.NOMBRE_DISTRITO,
        COR.NOMBRE_CORREGIMIENTO,
        ROW_NUMBER() OVER (ORDER BY C.PRIMER_APELLIDO, C.PRIMER_NOMBRE) AS rn
      FROM CLIENTES C
      LEFT JOIN NACIONALIDADES N ON C.NACIONALIDAD_ID = N.NACIONALIDAD_ID
      LEFT JOIN TIPOS_CLIENTES TP ON C.TIPO_CLIENTE_ID = TP.TIPO_CLIENTE_ID
      LEFT JOIN DIRECCIONES D ON C.DIRECCION_ID = D.DIRECCION_ID
      LEFT JOIN CORREGIMIENTOS COR ON D.CORREGIMIENTO_ID = COR.CORREGIMIENTO_ID
      LEFT JOIN DISTRITOS DIS ON COR.DISTRITO_ID = DIS.DISTRITO_ID
      LEFT JOIN PROVINCIAS PROV ON DIS.PROVINCIA_ID = PROV.PROVINCIA_ID
      ${whereClause}
    )
    WHERE rn > :offset AND rn <= :limit_offset
  `;

  // Query para contar total de registros - usando los mismos binds pero sin offset/limit
  const countBinds = { ...binds };
  delete countBinds.offset;
  delete countBinds.limit_offset;

  const countSql = `
    SELECT COUNT(*) as total
    FROM CLIENTES C
    LEFT JOIN NACIONALIDADES N ON C.NACIONALIDAD_ID = N.NACIONALIDAD_ID
    LEFT JOIN TIPOS_CLIENTES TP ON C.TIPO_CLIENTE_ID = TP.TIPO_CLIENTE_ID
    LEFT JOIN DIRECCIONES D ON C.DIRECCION_ID = D.DIRECCION_ID
    LEFT JOIN CORREGIMIENTOS COR ON D.CORREGIMIENTO_ID = COR.CORREGIMIENTO_ID
    LEFT JOIN DISTRITOS DIS ON COR.DISTRITO_ID = DIS.DISTRITO_ID
    LEFT JOIN PROVINCIAS PROV ON DIS.PROVINCIA_ID = PROV.PROVINCIA_ID
    ${whereClause}
  `;

  try {
    const [result, countResult] = await Promise.all([
      simpleExecute(sql, binds),
      simpleExecute(countSql, countBinds),
    ]);

    const totalRecords = countResult.rows[0].TOTAL;
    const totalPages = Math.ceil(totalRecords / limit);

    // Normalizar los nombres de campos de Oracle (mayúsculas) a camelCase para el frontend
    const datosNormalizados = result.rows.map((row) => ({
      cliente_id: row.CLIENTE_ID,
      primer_nombre: row.PRIMER_NOMBRE,
      segundo_nombre: row.SEGUNDO_NOMBRE,
      primer_apellido: row.PRIMER_APELLIDO,
      segundo_apellido: row.SEGUNDO_APELLIDO,
      numero_cedula: row.NUMERO_CEDULA,
      telefono: row.TELEFONO,
      email: row.EMAIL,
      tipo_cliente_id: row.TIPO_CLIENTE_ID,
      tipo_cliente_nombre: row.TIPO_CLIENTE_NOMBRE,
      estado: row.ESTADO,
      fecha_registro: row.FECHA_REGISTRO,
      // Datos de dirección para mostrar en la tabla
      direccion_id: row.DIRECCION_ID,
      detalle_direccion: row.DETALLE_DIRECCION,
      provincia_nombre: row.NOMBRE_PROVINCIA,
      distrito_nombre: row.NOMBRE_DISTRITO,
      corregimiento_nombre: row.NOMBRE_CORREGIMIENTO,
      // Dirección completa para mostrar
      direccion_completa: [
        row.NOMBRE_PROVINCIA,
        row.NOMBRE_DISTRITO,
        row.NOMBRE_CORREGIMIENTO,
        row.DETALLE_DIRECCION,
      ]
        .filter(Boolean)
        .join(", "),
    }));

    // DEBUG: Ver los datos que se envían
    /*console.log("Datos enviados al frontend:", {
      dataLength: datosNormalizados.length,
      firstRow: datosNormalizados[0],
      totalRecords,
    });*/

    res.status(200).json({
      success: true,
      data: datosNormalizados,
      pagination: {
        currentPage: page,
        totalPages,
        total: totalRecords,
        from: offset + 1,
        to: Math.min(offset + limit, totalRecords),
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error al cargar clientes del módulo:", error);
    res
      .status(500)
      .json({ error: "Error al cargar clientes", details: error.message });
  }
};

// CREAR CLIENTE (POST) - CORRECTO
const crearCliente = async (req, res) => {
  // Validar campos obligatorios
  const requeridos = [
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
  const faltantes = requeridos.filter(
    (campo) =>
      !req.body[campo] ||
      (typeof req.body[campo] === "string" && req.body[campo].trim() === "")
  );
  if (faltantes.length > 0) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes o vacíos",
      requeridos: faltantes,
    });
  }

  // Validar sexo
  const sexo = req.body.sexo;
  if (sexo !== "F" && sexo !== "M") {
    return res.status(400).json({
      error: "El campo 'sexo' solo puede ser 'F' o 'M'",
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res
      .status(400)
      .json({ error: "El email no tiene un formato válido" });
  }

  // Validar longitud de campos
  if (
    req.body.primer_nombre.length > 50 ||
    req.body.primer_apellido.length > 50
  ) {
    return res.status(400).json({
      error: "Nombre o apellido excede la longitud máxima de 50 caracteres",
    });
  }
  if (req.body.segundo_nombre && req.body.segundo_nombre.length > 50) {
    return res.status(400).json({
      error: "Segundo nombre excede la longitud máxima de 50 caracteres",
    });
  }
  if (req.body.segundo_apellido && req.body.segundo_apellido.length > 50) {
    return res.status(400).json({
      error: "Segundo apellido excede la longitud máxima de 50 caracteres",
    });
  }
  if (req.body.telefono.length > 20) {
    return res
      .status(400)
      .json({ error: "Teléfono excede la longitud máxima de 20 caracteres" });
  }
  if (req.body.email.length > 100) {
    return res
      .status(400)
      .json({ error: "Email excede la longitud máxima de 100 caracteres" });
  }
  if (req.body.numero_cedula.length > 20) {
    return res.status(400).json({
      error: "Número de cédula excede la longitud máxima de 20 caracteres",
    });
  }

  // Validar unicidad de numero_cedula y email
  const cedulaSql = `SELECT COUNT(*) AS TOTAL FROM CLIENTES WHERE numero_cedula = :numero_cedula`;
  const emailSql = `SELECT COUNT(*) AS TOTAL FROM CLIENTES WHERE email = :email`;
  const [cedulaResult, emailResult] = await Promise.all([
    simpleExecute(cedulaSql, { numero_cedula: req.body.numero_cedula }),
    simpleExecute(emailSql, { email: req.body.email }),
  ]);
  if (cedulaResult.rows[0].TOTAL > 0) {
    return res
      .status(400)
      .json({ error: "El número de cédula ya está registrado" });
  }
  if (emailResult.rows[0].TOTAL > 0) {
    return res.status(400).json({ error: "El email ya está registrado" });
  }

  // Estado por defecto
  const estado = req.body.estado || "ACTIVO";
  const observaciones = req.body.observaciones || "";

  // SQL con fecha_registro y estado por defecto
  const sql = `
    INSERT INTO CLIENTES (
      cliente_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      numero_cedula, telefono, email, sexo, tipo_cliente_id,
      direccion_id, nacionalidad_id, estado, fecha_registro, observaciones
    ) VALUES (
      clientes_seq.NEXTVAL, :primer_nombre, :segundo_nombre, :primer_apellido, :segundo_apellido,
      :numero_cedula, :telefono, :email, :sexo, :tipo_cliente_id,
      :direccion_id, :nacionalidad_id, :estado, SYSDATE, :observaciones
    )
    RETURNING cliente_id INTO :cliente_id
  `;

  const binds = {
    primer_nombre: req.body.primer_nombre,
    segundo_nombre: req.body.segundo_nombre || null,
    primer_apellido: req.body.primer_apellido,
    segundo_apellido: req.body.segundo_apellido || null,
    numero_cedula: req.body.numero_cedula,
    telefono: req.body.telefono,
    email: req.body.email,
    sexo: req.body.sexo,
    tipo_cliente_id: req.body.tipo_cliente_id,
    direccion_id: req.body.direccion_id,
    nacionalidad_id: req.body.nacionalidad_id,
    estado: estado,
    observaciones: observaciones,
    cliente_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      success: true,
      cliente_id: result.outBinds.cliente_id[0],
      numero_cedula: req.body.numero_cedula,
      message: "Cliente creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear cliente", details: error.message });
  }
};

// ACTUALIZAR CLIENTE (PUT)
const actualizarCliente = async (req, res) => {
  const { cliente_id } = req.params;

  // Debug: Mostrar qué se recibió
  console.log("📥 Datos recibidos para actualizar cliente:", {
    cliente_id,
    body: req.body,
    keys: Object.keys(req.body),
  });

  // 1. Verificar si hay datos para actualizar
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  // 2. Preparar los campos y los valores para la consulta
  const binds = { cliente_id }; // Empezamos con el ID para el WHERE
  const setClauses = []; // Array para guardar las partes del SET (ej: "primer_nombre = :primer_nombre")

  // Solo permitimos actualizar datos editables (alineado con frontend)
  const camposPermitidos = [
    "primer_nombre", // ✅ Editable en frontend
    "segundo_nombre", // ✅ Editable en frontend
    "primer_apellido", // ✅ Editable en frontend
    "segundo_apellido", // ✅ Editable en frontend
    "telefono", // ✅ Editable en frontend
    "email", // ✅ Editable en frontend
    "observaciones", // ✅ Editable en frontend (siempre incluido)
    "estado", // ✅ Solo para operaciones específicas (cambiar estado)
  ];

  // Campos que NO deben editarse (solo informativos para logs)
  const camposNoEditables = [
    "numero_cedula", // ❌ Deshabilitado en frontend
    "sexo", // ❌ Deshabilitado en frontend
    "tipo_cliente_id", // ❌ Deshabilitado en frontend
    "nacionalidad_id", // ❌ Deshabilitado en frontend
  ];

  // Log de campos no permitidos si se intentan enviar
  const camposNoPermitidos = Object.keys(req.body).filter((campo) =>
    camposNoEditables.includes(campo)
  );

  if (camposNoPermitidos.length > 0) {
    console.log(
      "⚠️ Campos no editables enviados (se ignorarán):",
      camposNoPermitidos
    );
  }

  // 3. Iterar sobre los campos permitidos para construir la consulta dinámicamente
  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`); // Añade "campo = :campo" a la lista
      binds[campo] = req.body[campo]; // Añade el valor a los binds
    }
  });

  // Si después de filtrar no queda nada
  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Ningún campo válido para actualizar fue proporcionado.",
      received_fields: Object.keys(req.body),
      allowed_fields: camposPermitidos,
      note: "Los campos no editables como numero_cedula, sexo, tipo_cliente_id y nacionalidad_id no pueden modificarse.",
    });
  }

  // Validaciones específicas para campos que se están actualizando
  if (req.body.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
      return res.status(400).json({
        error: "El email no tiene un formato válido",
      });
    }
  }

  if (req.body.estado !== undefined) {
    const estadosValidos = ["ACTIVO", "INACTIVO"];
    if (!estadosValidos.includes(req.body.estado)) {
      return res.status(400).json({
        error: "El estado debe ser 'ACTIVO' o 'INACTIVO'",
      });
    }
  }

  // Validar longitud de campos de texto
  const camposTexto = [
    "primer_nombre",
    "segundo_nombre",
    "primer_apellido",
    "segundo_apellido",
  ];
  for (const campo of camposTexto) {
    if (
      req.body[campo] !== undefined &&
      req.body[campo] &&
      req.body[campo].length > 50
    ) {
      return res.status(400).json({
        error: `${campo} excede la longitud máxima de 50 caracteres`,
      });
    }
  }

  if (
    req.body.telefono !== undefined &&
    req.body.telefono &&
    req.body.telefono.length > 20
  ) {
    return res.status(400).json({
      error: "Teléfono excede la longitud máxima de 20 caracteres",
    });
  }

  if (
    req.body.email !== undefined &&
    req.body.email &&
    req.body.email.length > 100
  ) {
    return res.status(400).json({
      error: "Email excede la longitud máxima de 100 caracteres",
    });
  }

  console.log(
    "📝 Campos a actualizar:",
    Object.keys(binds).filter((k) => k !== "cliente_id")
  );

  // Validar unicidad de email si se está actualizando
  if (req.body.email !== undefined && req.body.email) {
    const emailExisteSql = `
      SELECT COUNT(*) AS TOTAL 
      FROM CLIENTES 
      WHERE email = :email AND cliente_id != :cliente_id
    `;
    try {
      const emailResult = await simpleExecute(emailExisteSql, {
        email: req.body.email,
        cliente_id,
      });

      if (emailResult.rows[0].TOTAL > 0) {
        return res.status(400).json({
          error: "El email ya está registrado por otro cliente",
        });
      }
    } catch (validationError) {
      console.error("Error en validación de email:", validationError);
      return res.status(500).json({
        error: "Error en validación de datos",
        details: validationError.message,
      });
    }
  }

  // 4. Construir la consulta SQL final
  const sql = `
    UPDATE CLIENTES
    SET ${setClauses.join(", ")} 
    WHERE cliente_id = :cliente_id
  `;

  // 5. Ejecutar la consulta
  try {
    const resultado = await simpleExecute(sql, binds);

    // Opcional pero recomendado: verificar si se actualizó algo
    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Cliente no encontrado con el ID proporcionado." });
    }

    const camposActualizados = Object.keys(binds).filter(
      (k) => k !== "cliente_id"
    );
    console.log(
      `✅ Cliente ${cliente_id} actualizado exitosamente. Campos modificados:`,
      camposActualizados
    );

    res.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      updated_fields: camposActualizados,
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({
      error: "Error al actualizar el cliente",
      details: error.message,
    });
  }
};

// ELIMINAR CLIENTE (BORRADO LÓGICO)
const eliminarCliente = async (req, res) => {
  const { cliente_id } = req.params;
  // Cambia el estado a 'ELIMINADO' en vez de borrar físicamente
  const sql = `UPDATE CLIENTES SET estado = 'ELIMINADO' WHERE cliente_id = :cliente_id`;

  try {
    const resultado = await simpleExecute(sql, { cliente_id });
    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Cliente no encontrado con el ID proporcionado." });
    }
    res.json({
      success: true,
      message: "Cliente eliminado (borrado lógico) exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el cliente", details: error.message });
  }
};

module.exports = {
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  mostrarModuloCliente,
  obtenerClientePorId,
};
