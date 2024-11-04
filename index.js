const express = require("express");
const mongoconnect = require("./db.js");
mongoconnect();
const session = require("express-session");
const cors = require("cors");
server = express();
let cartRoute = require("./routes/cart.js");
let transactionRoute = require("./routes/transaction.js");
const Book = require("./models/book.js");
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests only from this origin
  credentials: true, // Allow cookies to be sent with requests
};

// Example Node.js/Express code
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
server.use(cors(corsOptions));
server.use(express.json());

server.use("/auth", require("./routes/auth"));
server.use("/categories", require("./routes/category"));
server.use("/books", require("./routes/book"));
server.use("/cart", cartRoute);
server.use("/transaction", transactionRoute);

server.get("/", (req, res) => {
  res.send("Hello World ");
});
server.listen(5000, async () => {
  console.log("SERVER is Listening on http://localhost:5000");
});
