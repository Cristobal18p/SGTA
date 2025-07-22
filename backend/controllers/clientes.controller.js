const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// Función opcional para generar cédula temporal si no se proporciona
function generarCedulaTemporal() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return `TEMP-${random}`;
}

// OBTENER UN CLIENTE POR ID (GET)
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
      c.direccion_id,
      c.nacionalidad_id,
      n.nombre_nacionalidad,
      c.estado,
      TO_CHAR(c.fecha_registro, 'YYYY-MM-DD') AS fecha_registro
    FROM clientes c
    LEFT JOIN nacionalidades n ON c.nacionalidad_id = n.nacionalidad_id
    WHERE c.cliente_id = :cliente_id
  `;
  try {
    const result = await simpleExecute(sql, { cliente_id });
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    // Normalizar los nombres de campos de Oracle
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
      direccion_id: result.rows[0].DIRECCION_ID,
      nacionalidad_id: result.rows[0].NACIONALIDAD_ID,
      nombre_nacionalidad: result.rows[0].NOMBRE_NACIONALIDAD,
      estado: result.rows[0].ESTADO,
      fecha_registro: result.rows[0].FECHA_REGISTRO,
    };

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

  if (estado) {
    condiciones.push(`C.ESTADO = :estado`);
    binds.estado = estado;
  }

  if (condiciones.length > 0) {
    whereClause = `WHERE ${condiciones.join(" AND ")}`;
  }

  // Query principal con paginación
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
        ROW_NUMBER() OVER (ORDER BY C.PRIMER_APELLIDO, C.PRIMER_NOMBRE) AS rn
      FROM CLIENTES C
      LEFT JOIN NACIONALIDADES N ON C.NACIONALIDAD_ID = N.NACIONALIDAD_ID
      LEFT JOIN TIPOS_CLIENTES TP ON C.TIPO_CLIENTE_ID = TP.TIPO_CLIENTE_ID
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

  // 1. Verificar si hay datos para actualizar
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  // 2. Preparar los campos y los valores para la consulta
  const binds = { cliente_id }; // Empezamos con el ID para el WHERE
  const setClauses = []; // Array para guardar las partes del SET (ej: "primer_nombre = :primer_nombre")

  // Solo permitimos actualizar datos editables, no cédula, sexo ni nacionalidad
  const camposPermitidos = [
    "primer_nombre",
    "segundo_nombre",
    "primer_apellido",
    "segundo_apellido",
    "telefono",
    "email",
    "tipo_cliente_id",
  ];

  // 3. Iterar sobre los campos permitidos para construir la consulta dinámicamente
  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`); // Añade "campo = :campo" a la lista
      binds[campo] = req.body[campo]; // Añade el valor a los binds
    }
  });

  // Si después de filtrar no queda nada (aunque ya lo validamos al inicio)
  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Ningún campo válido para actualizar fue proporcionado.",
    });
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

    res.json({ message: "Cliente actualizado exitosamente" });
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
    res.json({ message: "Cliente eliminado (borrado lógico) exitosamente" });
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
