const bcrypt = require("bcrypt");
const { Usuario } = require("../models");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 10;
const PASSWORD_MIN_LENGTH = 8;

async function obtenerPerfil(usuarioId) {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) throw new AppError("Usuario no encontrado", 404);
  return usuario.toSafeJSON();
}

async function actualizarPerfil(usuarioId, { nombre }) {
  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  // email NO es editable  — si viene
  // en el body, se ignora en vez de fallar, es mas amigable para el cliente.
  if (nombre !== undefined) {
    usuario.nombre = nombre;
  }

  await usuario.save();
  return usuario.toSafeJSON();
}

async function cambiarPassword(usuarioId, { passwordActual, passwordNueva }) {
  if (!passwordActual || !passwordNueva) {
    throw new AppError("passwordActual y passwordNueva son requeridos", 400);
  }

  const usuario = await Usuario.findByPk(usuarioId);
  if (!usuario) throw new AppError("Usuario no encontrado", 404);

  const coincide = await bcrypt.compare(passwordActual, usuario.passwordHash);
  if (!coincide) {
    throw new AppError("Contrasena actual incorrecta", 401);
  }

  if (passwordNueva.length < PASSWORD_MIN_LENGTH) {
    throw new AppError(
      `passwordNueva debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
      400,
    );
  }

  // Se compara contra el hash guardado, no contra el string plano recibido,
  // por la misma razon que el login nunca guarda ni compara texto plano.
  const esIgualALaActual = await bcrypt.compare(
    passwordNueva,
    usuario.passwordHash,
  );
  if (esIgualALaActual) {
    throw new AppError(
      "La nueva contrasena no puede ser igual a la actual",
      400,
    );
  }

  usuario.passwordHash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);
  await usuario.save();

  // No se devuelve nada del usuario aca — el endpoint solo confirma exito

}

module.exports = { obtenerPerfil, actualizarPerfil, cambiarPassword };
