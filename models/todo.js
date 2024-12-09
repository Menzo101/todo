const mongoose = require("mongoose");

const todoschema = new mongoose.Schema(
  {
    todo: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timeStamp: true }
);


module.exports = mongoose.model("Task", todoschema);