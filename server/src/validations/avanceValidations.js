const AppError = require("../utils/AppError");
function validateFecha(cadenaFecha) {
  if (!cadenaFecha) {
    throw new AppError("fecha es requerida", 400);
  }

  const regexSoloFecha = /^\d{4}-\d{2}-\d{2}$/;
  const regexFechaHora = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

  if (
    !regexSoloFecha.test(cadenaFecha) &&
    !regexFechaHora.test(cadenaFecha) 
  ) {
    throw new AppError(
      "fecha no tiene el formato correcto (YYYY-MM-DD) o (YYYY-MM-DDTHH:mm:ss.sssZ)",
      400,
    );
  }

  const fecha = new Date(cadenaFecha);
  const timestamp = fecha.getTime();

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    throw new AppError("fecha no es valida", 400);
  }
  return fecha.toISOString().slice(0, 19).replace("T", " ");
}

module.exports = {
  validateFecha
};
