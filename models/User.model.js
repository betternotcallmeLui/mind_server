const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "El correo es requerido."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "El nombre de usuario es requerido."],
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerido."],
    },
    name: {
      type: String,
      required: [true, "El nombre es requerido."],
    },
    savedPosts: [{ type: String }],
    submittedPosts: [{ type: String }],
    isVerified: {
      type: Boolean,
      required: true
    },
    resetVerified: {
      type: Boolean,
      required: false
    }
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
module.exports = User;
