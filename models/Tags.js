const mongoose = require("mongoose");
const TagSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
  });
  
let Tags= mongoose.model('Tag', TagSchema);
module.exports=Tags;
  