let mongoose=require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
    
  },
  rating: { type: Number, default: 0 },
  date: {
    type: Date,
    default: Date.now,
  },
  amount:{
    type:Number,
    default:0
  }
});

let Transaction= mongoose.model("Transaction", TransactionSchema);
module.exports=Transaction;

  