// Envuelve un controller async: si la promesa rechaza (throw dentro
// de un async function), lo captura y se lo pasa a next(), que Express
// dirige automaticamente al error.middleware.js. Sin esto, tendrias
// que escribir try/catch en cada controller a mano.

function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = catchAsync;
