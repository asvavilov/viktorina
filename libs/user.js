var mongoose = require('mongoose');
var Schema = mongoose.Schema;

UserSchema = new Schema({
  'nickname': {type: String, index: true},
  'email': String,
  'first_name': {type: String, set: function(v){return v.capitalize()}},
  'last_name': String,
  'age': Number,
  'created_at': Date,
  'updated_at': Date,
  'identity': {type: String, index: true},
  'provider': String
});


UserSchema.method({
  full_name: function(fn){
    return this.first_name + ' ' + this.last_name;
  }
});

UserSchema.pre('save', function(next, done){
  var cur_date = new Date();
  if (this.isNew) {
    this.created_at = cur_date;
  }
  this.updated_at = cur_date;
  next();
});

UserSchema.static({
  findNative: function(){
    return this.find({provider: ''});
  }
});
