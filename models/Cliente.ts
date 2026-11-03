import mongoose from "mongoose";

const ClienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },

  telefono: {
    type: String,
  },

  correo: {
    type: String,
  },

  ciudad: {
    type: String,
  },

  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

const Cliente =
  mongoose.models.Cliente ||
  mongoose.model("Cliente", ClienteSchema);

export default Cliente;