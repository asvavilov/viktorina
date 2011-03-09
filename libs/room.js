var mongoose = require('mongoose');
var Schema = mongoose.Schema;

RoomSchema = new Schema({
  'label': {type: String, index: true},
  'title': String
});
