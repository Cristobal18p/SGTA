const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODO EL PERSONAL (GET)
const obtenerPersonal = async (req, res) => {
  const sql = `SELECT * FROM PERSONAL ORDER BY personal_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener personal:", error);
    res
      .status(500)
      .json({ error: "Error al obtener personal", details: error.message });
  }
};

// CREAR PERSONAL (POST)
const crearPersonal = async (req, res) => {
  if (
    !req.body.primer_nombre ||
    !req.body.primer_apellido ||
    !req.body.numero_cedula
  ) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["primer_nombre", "primer_apellido", "numero_cedula"],
    });
  }

  const sql = `
    INSERT INTO PERSONAL (
      personal_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      numero_cedula, telefono, email, sexo, direccion_id, usuario_id, fecha_contratacion
    ) VALUES (
      personal_seq.NEXTVAL, :primer_nombre, :segundo_nombre, :primer_apellido, :segundo_apellido,
      :numero_cedula, :telefono, :email, :sexo, :direccion_id, :usuario_id, SYSDATE
    ) RETURNING personal_id INTO :personal_id
  `;

  const binds = {
    primer_nombre: req.body.primer_nombre,
    segundo_nombre: req.body.segundo_nombre || null,
    primer_apellido: req.body.primer_apellido,
    segundo_apellido: req.body.segundo_apellido || null,
    numero_cedula: req.body.numero_cedula,
    telefono: req.body.telefono,
    email: req.body.email,
    sexo: req.body.sexo || null,
    direccion_id: req.body.direccion_id,
    usuario_id: req.body.usuario_id,
    personal_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      personal_id: result.outBinds.personal_id[0],
      message: "Personal creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear personal", details: error.message });
  }
};

// ACTUALIZAR PERSONAL (PUT)
const actualizarPersonal = async (req, res) => {
  const { personal_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { personal_id };
  const setClauses = [];

  const camposPermitidos = [
    "primer_nombre",
    "segundo_nombre",
    "primer_apellido",
    "segundo_apellido",
    "numero_cedula",
    "telefono",
    "email",
    "sexo",
    "direccion_id",
    "usuario_id",
  ];

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`);
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res
      .status(400)
      .json({
        error: "Ningún campo válido para actualizar fue proporcionado.",
      });
  }

  const sql = `
    UPDATE PERSONAL
    SET ${setClauses.join(", ")}
    WHERE personal_id = :personal_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Personal no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Personal actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar personal:", error);
    res
      .status(500)
      .json({
        error: "Error al actualizar el personal",
        details: error.message,
      });
  }
};

// ELIMINAR PERSONAL (DELETE)
const eliminarPersonal = async (req, res) => {
  const { personal_id } = req.params;
  const sql = `DELETE FROM PERSONAL WHERE personal_id = :personal_id`;

  try {
    await simpleExecute(sql, { personal_id });
    res.json({ message: "Personal eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar personal:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el personal", details: error.message });
  }
};

module.exports = {
  obtenerPersonal,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal,
};
