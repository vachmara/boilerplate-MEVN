const mongoose = require("mongoose");
const Token = mongoose.model(
  "Token",
  new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 300,
      },
  })
);

module.exports = Token;