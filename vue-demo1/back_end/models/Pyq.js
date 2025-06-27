let mongoose = require("mongoose");
let pyqSchema = require("../schemas/Pyq");

module.exports = mongoose.model("Pyq", pyqSchema);
