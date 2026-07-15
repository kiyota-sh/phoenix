const debug = require("debug");
const logNombre = debug("app:validations:proyecto:nombre");
const logFecha = debug("app:validations:proyecto:fecha");

const AppError = require("../utils/AppError");

function validateNombre(nombre) {
  if (!nombre) {
    logNombre(`Validation nombre, Nombre es null`);
    throw new AppError("nombre es requerido", 400);
  }
  const nombreNormalizado = nombre.trim();

  if (nombreNormalizado.length < 2) {
    logNombre(`Validation nombre, Nombre tiene menos de 2 caracteres`);
    throw new AppError("Nombre debe tener por lo menos 2 caracteres", 400);
  }
  if (nombreNormalizado.length > 200) {
    logNombre(`Validation nombre, Nombre muy largo`);
    throw new AppError("Nombre muy largo, maximo 200 caracteres", 400);
  }
  return nombreNormalizado;
};

function validateFechaInicio(cadenaFecha) {
    logFecha(`Validation fecha, value: ${cadenaFecha}`);
  if (!cadenaFecha) {
    logFecha(`Validation fecha, Fecha es null`);
    throw new AppError("fecha es requerida", 400);
  }

  const regexSoloFecha = /^\d{4}-\d{2}-\d{2}$/;
  const regexFechaHora = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  const regexFecha = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  if (
    !regexSoloFecha.test(cadenaFecha) &&
    !regexFechaHora.test(cadenaFecha) &&
    !regexFecha.test(cadenaFecha)
  ){logFecha(`Validation fecha, Fecha no tiene el formato correcto`);
    throw new AppError(
      "fecha no tiene el formato correcto (YYYY-MM-DD) o (YYYY-MM-DDTHH:mm:ss.sssZ)",
      400,
    );
  }

  const fecha = new Date(cadenaFecha);
  const timestamp = fecha.getTime();

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    logFecha(`Validation fecha, Fecha no es valida`);
    throw new AppError("fecha no es valida", 400);
  }
  return fecha.toISOString().slice(0, 19).replace("T", " ");
};
function validateFechaObjetivo(cadenaFecha) {
    logFecha(`Validation fecha, value: ${cadenaFecha}`);
  if (!cadenaFecha) {
    logFecha(`Validation fecha, Fecha es null`);
    throw new AppError("fecha es requerida", 400);
  }

  const regexSoloFecha = /^\d{4}-\d{2}-\d{2}$/;
  const regexFechaHora = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;

  const regexFecha = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[0-2])\/\d{4}$/;
  if (
    !regexSoloFecha.test(cadenaFecha) &&
    !regexFechaHora.test(cadenaFecha) &&
    !regexFecha.test(cadenaFecha)
  ){logFecha(`Validation fecha, Fecha no tiene el formato correcto`);
    throw new AppError(
      "fecha no tiene el formato correcto (YYYY-MM-DD) o (YYYY-MM-DDTHH:mm:ss.sssZ)",
      400,
    );
  }

  const fecha = new Date(cadenaFecha);
  const timestamp = fecha.getTime();

  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    logFecha(`Validation fecha, Fecha no es valida`);
    throw new AppError("fecha no es valida", 400);
  }
    
  return fecha.toISOString().slice(0, 19).replace("T", " ");
};

function validatePrioridad(prioridad) {

  if (!["baja", "media", "alta"].includes(prioridad)) {
    throw new AppError("prioridad no valida, debe ser 'baja', 'media' o 'alta'", 400);
  }
    
};


//Cambia el estado del proyetco
function validarEstadoDestino(estado) {
  if (!["abandonado", "finalizado"].includes(estado)) {
    throw new AppError("Transicion de estado invalida", 400);
  }
}

function validarTransicionAAbandonado(proyecto) {
  
  if (proyecto.estado === "abandonado") {
    throw new AppError("El proyecto ya esta en ese estado", 400);
  }

  if (proyecto.estado !== "activo") {
    throw new AppError("Transicion de estado invalida", 400);
  }
}

function validarMotivoAbandono(motivoAbandonoId) {

  if (!motivoAbandonoId) {
    throw new AppError(
      "motivoAbandonoId es requerido para abandonar un proyecto",
      400,
    );
  }
}

function validarTransicionAFinalizado(proyecto) {
  if (proyecto.estado === "finalizado") {
    throw new AppError("El proyecto ya esta en ese estado", 400);
  }
}

module.exports = {
    validateNombre,
    validateFechaInicio,
    validateFechaObjetivo,
    validatePrioridad,
    validarEstadoDestino,
    validarTransicionAAbandonado,
    validarMotivoAbandono,
    validarTransicionAFinalizado,
};