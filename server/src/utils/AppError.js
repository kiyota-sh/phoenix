// Error "de negocio" que los servicios pueden lanzar a proposito
// (ej. "email ya registrado", "credenciales invalidas"), con un
// status HTTP asociado. Se distingue de un error inesperado (bug,
// caida de la DB) porque ESTE es un error que el backend entendio
// y sabe como comunicar.

class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
    this.isOperational = true; // marca: "esto no es un bug, es esperado"
  }
}

module.exports = AppError;
