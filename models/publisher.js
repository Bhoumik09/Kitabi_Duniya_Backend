const mongoose = require("mongoose");
const PublisherSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: { type: String },
    website: { type: String }
  });
  
const Publisher = mongoose.model('Publisher', PublisherSchema);
module.exports=Publisher;
 