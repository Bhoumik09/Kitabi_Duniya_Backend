let mongoose=require('mongoose');
const AuthorSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    bio: { type: String },
  });
  
let Author= mongoose.model('Author', AuthorSchema);
module.exports=Author;
  