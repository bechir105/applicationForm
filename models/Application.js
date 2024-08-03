const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stepId: { type: Number, required: true },
  data: { type: Map, of: String, required: true },
  completed: { type: Boolean, default: false },
});

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
