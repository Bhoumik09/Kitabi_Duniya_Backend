const mongoose = require("mongoose");
const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  is_admin: {
    type: Boolean,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      unique:true,
      default:[]
      // required: true,
    },
  ],
  transaction:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    default:[]
    // required: true,
  }]
});

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
