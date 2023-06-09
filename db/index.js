const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_DATABASE;

mongoose
  .connect(MONGO_URI)
  .then((x) => {
    const dbName = x.connections[0].name;
    console.log(`Conectado a la base de datos: "${dbName}"`);
  })
  .catch((err) => {
    console.error("Error al conectarse a la base de datos: ", err);
  });
