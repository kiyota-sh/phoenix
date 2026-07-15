const { Categoria } = require("../models");
const AppError = require("../utils/AppError");
const { UniqueConstraintError } = require("sequelize");

// Traduce la excepcion de Sequelize/Postgres (UNIQUE uq_categorias_usuario_nombre)
// a un 400 con mensaje de negocio, en vez de dejar que explote como 500.
function manejarErrorDuplicado(err) {
  if (err instanceof UniqueConstraintError) {
    throw new AppError("Ya existe una categoria con ese nombre", 400);
  }
  throw err;
}

async function buscarCategoriaDelUsuario(usuarioId, categoriaId) {
  const categoria = await Categoria.findOne({
    where: { id: categoriaId, usuarioId },
  });
  if (!categoria) {
    throw new AppError("Categoria no encontrada", 404); // mismo criterio: 404, no 403
  }
  return categoria;
}

async function listar(usuarioId) {
  return Categoria.findAll({
    where: { usuarioId },
    order: [["nombre", "ASC"]],
  });
}

async function crear(usuarioId, { nombre }) {
  if (!nombre) throw new AppError("nombre es requerido", 400);

  try {
    return await Categoria.create({ usuarioId, nombre });
  } catch (err) {
    manejarErrorDuplicado(err);
  }
}

async function actualizar(usuarioId, categoriaId, { nombre }) {
  const categoria = await buscarCategoriaDelUsuario(usuarioId, categoriaId);
  if (!nombre) throw new AppError("nombre es requerido", 400);

  categoria.nombre = nombre;
  try {
    await categoria.save();
  } catch (err) {
    manejarErrorDuplicado(err);
  }
  return categoria;
}

async function eliminar(usuarioId, categoriaId) {
  const categoria = await buscarCategoriaDelUsuario(usuarioId, categoriaId);
  // Al borrar, los proyectos que la usaban quedan con categoriaId = null
  // — eso lo resuelve solo el ON DELETE SET NULL del schema, no hace
  await categoria.destroy();
}

module.exports = { listar, crear, actualizar, eliminar };
