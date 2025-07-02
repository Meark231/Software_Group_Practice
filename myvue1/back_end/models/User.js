let mongoose = require('mongoose');
let usersSchema = require('../schemas/user');
module.exports = mongoose.model('User',usersSchema);