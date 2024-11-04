const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    minlength: 1,
    maxlength: 200,
  },
  description: { 
    type: String, 
    required: true, 
    minlength: 10,
    maxlength: 2000,
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  genre: { 
    type: String, 
    required: true,
    enum: [
      'Fiction', 
      'Non-Fiction', 
      'Science Fiction', 
      'Fantasy', 
      'Biography', 
      'Mystery', 
      'Thriller', 
      'Romance', 
      'Historical Fiction', 
      'Horror', 
      'Young Adult', 
      'Children’s', 
      'Self-Help', 
      'Cookbooks', 
      'Graphic Novels', 
      'Poetry', 
      'Travel', 
      'Memoir', 
      'Science', 
      'Psychology'
    ],
  },
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Tag",
  }],
  thumbnail: { 
    type: String, 
    required: true,
  },
  book_link: {
    type: String,
    required: true,
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publisher",
    required: true,
  },
  rating: { 
    type: Number, 
    min: 0, 
    max: 5, 
    default: 0,
    
  },
  ratingsCount: { // New field to count ratings
    type: Number,
    default: 0,
  },
  totalRatings: { // New field to accumulate ratings
    type: Number,
    default: 0,
  },
  authors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Author", 
    default:[]
  }],
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language",
    required: true,
  },
  pages: { 
    type: Number, 
    min: 1,
    required: true,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },
  transactionCount: {
    type:Number,
    min:0,
    default:0
  },
  buyers: [{ // New field to track users who bought this book
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account", // Adjust as needed
    default:[]
  }],
});

// Create indexes for optimized querying
BookSchema.index({ title: 1, genre: 1 });

// Forcefully overwrite the existing model if it exists


const Book = mongoose.model("Book", BookSchema);

module.exports = Book;
