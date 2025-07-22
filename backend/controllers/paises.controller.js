const oracledb = require("oracledb");
const { simpleExecute } = require("../config/CR7.js");

// OBTENER TODOS LOS PAÍSES (GET)
const obtenerPaises = async (req, res) => {
  const sql = `SELECT * FROM PAISES ORDER BY pais_id`;

  try {
    const result = await simpleExecute(sql);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener países:", error);
    res
      .status(500)
      .json({ error: "Error al obtener países", details: error.message });
  }
};

// CREAR PAÍS (POST)
const crearPais = async (req, res) => {
  if (!req.body.nombre_pais) {
    return res.status(400).json({
      error: "Campo obligatorio faltante",
      requerido: "nombre_pais",
    });
  }

  const sql = `
    INSERT INTO PAISES (
      pais_id, nombre_pais
    ) VALUES (
      paises_seq.NEXTVAL, :nombre_pais
    ) RETURNING pais_id INTO :pais_id
  `;

  const binds = {
    nombre_pais: req.body.nombre_pais,
    pais_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
  };

  try {
    const result = await simpleExecute(sql, binds);
    res.status(201).json({
      pais_id: result.outBinds.pais_id[0],
      message: "País creado exitosamente",
    });
  } catch (error) {
    console.error("Error Oracle:", error);
    res
      .status(500)
      .json({ error: "Error al crear país", details: error.message });
  }
};

// ACTUALIZAR PAÍS (PUT)
const actualizarPais = async (req, res) => {
  const { pais_id } = req.params;

  if (!req.body.nombre_pais) {
    return res
      .status(400)
      .json({
        error: "Debes proporcionar el campo nombre_pais para actualizar.",
      });
  }

  const sql = `
    UPDATE PAISES
    SET nombre_pais = :nombre_pais
    WHERE pais_id = :pais_id
  `;

  const binds = {
    pais_id,
    nombre_pais: req.body.nombre_pais,
  };

  try {
    const resultado = await simpleExecute(sql, binds);

    if (resultado.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "País no encontrado con el ID proporcionado." });
    }

    res.json({ message: "País actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar país:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el país", details: error.message });
  }
};

// ELIMINAR PAÍS (DELETE)
const eliminarPais = async (req, res) => {
  const { pais_id } = req.params;
  const sql = `DELETE FROM PAISES WHERE pais_id = :pais_id`;

  try {
    await simpleExecute(sql, { pais_id });
    res.json({ message: "País eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar país:", error);
    res
      .status(500)
      .json({ error: "Error al eliminar el país", details: error.message });
  }
};

module.exports = {
  obtenerPaises,
  crearPais,
  actualizarPais,
  eliminarPais,
};
