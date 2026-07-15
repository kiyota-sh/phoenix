const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const {
  validateEmail,
  validateNombre,
  validatePassword,
} = require("../validations/authValidations");


const registro = catchAsync(async (req, res) => {
  const type = "REGISTRO";
  const { nombre, email, password } = req.body;

  const nombreNormalizado = validateNombre(nombre, type);
  const emailNormalizado = validateEmail(email, type);
  const passwordNormalizado = validatePassword(password,type);

  if (!password) {
    throw new AppError('nombre, email y password son requeridos', 400);
  }


  const resultado = await authService.registrar({
    nombre: nombreNormalizado,
    email: emailNormalizado,
    password: passwordNormalizado,
  });
  return success(res, {
    status: 201,
    message: 'Usuario registrado correctamente',
    data: resultado,
  });
});

const login = catchAsync(async (req, res) => {
  const type = "LOGIN";
  const { email, password } = req.body;
  const emailNormalizado = validateEmail(email, type);
  const passwordNormalizado = validatePassword(password,type);


  const resultado = await authService.login({
    email: emailNormalizado,
    password: passwordNormalizado,
  });
  return success(res, { message: 'Login exitoso', data: resultado });
});

// Con JWT "puro" (sin blacklist en DB), el logout es responsabilidad
// del cliente: borra el token guardado. Este endpoint existe para que
// el frontend tenga algo que llamar, pero no invalida el token del
// lado del servidor. Si mas adelante necesitas invalidacion real
// (ej. "cerrar sesion en todos los dispositivos"), se agrega una
// tabla de tokens revocados - por ahora, fuera de alcance de la v1.
const logout = catchAsync(async (req, res) => {
  return success(res, { message: 'Sesion cerrada' });
});

module.exports = { registro, login, logout };
