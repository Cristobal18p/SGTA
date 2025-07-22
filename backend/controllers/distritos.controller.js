const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS DISTRITOS (GET)
const obtenerDistritos = async (req, res) => {
  let sql = `SELECT * FROM DISTRITOS`;
  const binds = {};

  // Filtrar por provincia si se proporciona el parámetro
  if (req.query.provincia_id) {
    sql += ` WHERE provincia_id = :provincia_id`;
    binds.provincia_id = req.query.provincia_id;
  }

  sql += ` ORDER BY distrito_id`;

  try {
    const result = await simpleExecute(sql, binds);

    // Normalizar los nombres de campos de Oracle (MAYÚSCULAS) a minúsculas
    const distritosNormalizados = result.rows.map((distrito) => ({
      distrito_id: distrito.DISTRITO_ID,
      nombre_distrito: distrito.NOMBRE_DISTRITO,
      provincia_id: distrito.PROVINCIA_ID,
    }));

    res.status(200).json({ success: true, data: distritosNormalizados });
  } catch (error) {
    console.error("Error al obtener distritos:", error);
    res
      .status(500)
      .json({ error: "Error al obtener distritos", details: error.message });
  }
};

// CREAR DISTRITO (POST)
const crearDistrito = async (req, res) => {
  if (!req.body.nombre_distrito || !req.body.provincia_id) {
    return res.status(400).json({
      error: "Campos obligatorios faltantes",
      requeridos: ["nombre_distrito", "provincia_id"],
    });
  }

  const sql = `
    INSERT INTO DISTRITOS (
      distrito_id, provincia_id, nombre_distrito
    ) VALUES (
      distritos_seq.NEXTVAL, :provincia_id, :nombre_distrito
    ) RETURNING distrito_id INTO :distrito_id
  `;

  const binds = {
    provincia_id: req.body.provincia_id,
    nombre_distrito: req.body.nombre_distrito,
    distrito_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      distrito_id: result.outBinds.distrito_id[0],
      message: "Distrito creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear distrito", details: error.message });
  }
};

// ACTUALIZAR DISTRITO (PUT)
const actualizarDistrito = async (req, res) => {
  const { distrito_id } = req.params;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ error: "Debes proporcionar al menos un campo para actualizar." });
  }

  const binds = { distrito_id };
  const setClauses = [];

  const camposPermitidos = ["provincia_id", "nombre_distrito"];

  camposPermitidos.forEach((campo) => {
    if (req.body[campo] !== undefined) {
      setClauses.push(`${campo} = :${campo}`);
      binds[campo] = req.body[campo];
    }
  });

  if (setClauses.length === 0) {
    return res.status(400).json({
      error: "Ningún campo válido para actualizar fue proporcionado.",
    });
  }

  const sql = `
    UPDATE DISTRITOS
    SET ${setClauses.join(", ")}
    WHERE distrito_id = :distrito_id
  `;

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Distrito no encontrado con el ID proporcionado." });
    }

    res.json({ message: "Distrito actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar distrito:", error);
    res.status(500).json({
      error: "Error al actualizar el distrito",
      details: error.message,
    });
  }
};

// ELIMINAR DISTRITO (DELETE)
const eliminarDistrito = async (req, res) => {
  const { distrito_id } = req.params;
  const sql = `DELETE FROM DISTRITOS WHERE distrito_id = :distrito_id`;

  try {
    await simpleExecute(sql, { distrito_id });
    res.json({ message: "Distrito eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar distrito:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el distrito", details: error.message });
  }
};

module.exports = {
  obtenerDistritos,
  crearDistrito,
  actualizarDistrito,
  eliminarDistrito,
};
