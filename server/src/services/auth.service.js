const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

function generarToken(usuario) {
    return jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function registrar({ nombre, email, password }) {
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    throw new AppError('Ya existe una cuenta con ese email', 400);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const usuario = await Usuario.create({ nombre, email, passwordHash });

  const token = generarToken(usuario);
  return { usuario: usuario.toSafeJSON(), token };
}

async function login({ email, password }) {
  const usuario = await Usuario.findOne({ where: { email } });

  
  if (!usuario) {
    throw new AppError('Credenciales invalidas', 401);
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw new AppError('Credenciales invalidas', 401);
  }

  const token = generarToken(usuario);
  return { usuario: usuario.toSafeJSON(), token };
}

module.exports = { registrar, login };
