if (process.env.USE_MOCK_DB === "true") {
  module.exports = require("./mockDb.js");
} else {
  const oracledb = require("oracledb");

  //Conexion a la base de datos (credenciales desde variables de entorno)
  const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
    
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60,
    stmtCacheSize: 30,
  };


  async function initialize() {
    try {
      await oracledb.createPool(dbConfig);
      console.log('Conexión a Oracle establecida');
    } catch (err) {
      console.error('Error al conectar a Oracle:', err);
      process.exit(1);
    }
  }


  async function simpleExecute(statement, binds = [], opts = {}) {
    let conn;
    opts.outFormat = oracledb.OUT_FORMAT_OBJECT;
    opts.autoCommit = opts.autoCommit !== undefined ? opts.autoCommit : true; // Forzar autocommit por defecto

    try {
      conn = await oracledb.getConnection();
      const result = await conn.execute(statement, binds, opts);
      return result;
    } catch (err) {
      console.error('Error en simpleExecute:', err);
      throw err;
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error('Error al cerrar conexión:', err);
        }
      }
    }
  }

  module.exports = {
    initialize,
    simpleExecute
  };
}