
const debug = require('debug');
const log = debug("app:validations");
const logEmail = debug("app:validations:auth:email");
const logNombre = debug("app:validations:auth:nombre");
const AppError = require('../utils/AppError');

const messageGenerico = "El email o contraseña no existen"

exports.validateEmail = (email,type)=>{
    logEmail(`Validation Email, value: ${email}`);
    const proveedoresPublicos = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com'
    ];
  let message = "";
    
  
    if (!email) {
        logEmail(`Validation Email, Email es null`);
        message = type === "REGISTRO" ? "Email es requerido" : messageGenerico;    
        throw new AppError(message, 400);
    }
    const emailNormalizado = email.toLowerCase().trim();
    const regexEstructura = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEstructura.test(emailNormalizado)) {
      logEmail(`Validation Email, Email no tiene la estructura esperado`);
      message = type === "REGISTRO" ? "Error el email no cumple con el formato esperado" : messageGenerico;    
      throw new AppError(
        message,
        400,
      );
    } 
    const dominio = emailNormalizado.toLowerCase().split("@")[1];

    const proveedorValidado = proveedoresPublicos.includes(dominio); 

    if (!proveedorValidado) {
      logEmail(`Validation Email, Email no esta entre los proveedores esperados`);
      message = type === "REGISTRO" ? "Email no esta entre los proveedores disponibles gmail, hotmail, outlook, yahoo" : messageGenerico;    
      throw new AppError(message, 400);
    }

    return emailNormalizado;

}

exports.validateNombre= (nombre,type)=>{ 
  logNombre(`Validate nombre, value: ${nombre}`);
  if (!nombre) {
    logNombre(`Validation nombre, Nombre es null`);
    throw new AppError('Nombre es requerido', 400);
  }
  
  const nombreNormalizado = nombre.trim();


  if (nombreNormalizado.length < 2) { 
    logNombre(`Validation nombre, Nombre es muy corto`);
    throw new AppError('Nombre debe tener por lo menos 2 caracteres', 400);
  
  }
  if (nombreNormalizado.length > 50) {
    logNombre(`Validation nombre, Nombre es muy largo`);
    throw new AppError('Nombre muy largo, maximo 50 caracteres', 400);
  }
  const regex = /^[\p{L}]+(\s[\p{L}]+)*$/u;
  
  if (!regex.test(nombreNormalizado)) {
  logNombre(`Validation nombre, Nombre contiene caracteres`);
    throw new AppError('Nombre solo puede contener letras y espacios', 400);
  }

  return nombreNormalizado;
}


exports.validatePassword = (password,type) => { 
  logNombre(`Validate password, value: ${password}`);
  if (!password) { 
        logEmail(`Validation Password, Password es null`);
        message =
          type === "REGISTRO" ? "Contraseña es requerido" : messageGenerico;
        throw new AppError(message, 400);
  }
  if (password.length < 8) {
    logEmail(`Validation Password, Password debe contener minimi 8 caracteres`);
    message = type === "REGISTRO" ? "Contraseña debe tener minimo 8 caracteres" : messageGenerico;
    throw new AppError(message, 400);
  }
  return password;
}