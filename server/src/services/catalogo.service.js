const { MotivoAbandono } = require("../models");

async function listarMotivosAbandono() {
  return MotivoAbandono.findAll({ order: [["id", "ASC"]] });
}

module.exports = { listarMotivosAbandono };
