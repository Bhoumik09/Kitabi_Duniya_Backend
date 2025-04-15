const mongoose = require("mongoose");
const Book = require("./models/book");
require("dotenv").config();
const mongoURL = process.env.MONGO_URL;
// const mongoURL = 'mongodb://127.0.0.1:27017/ebooks';
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURL, connectionParams);
    // await Book.collection.dropIndex("buyers_1")
    console.log("Connection made successfully");
  } catch (error) {
    console.error("Connection error:", error);
  }
};

module.exports = connectToMongo;
