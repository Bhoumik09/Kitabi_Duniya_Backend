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
  origin: ["https://kitabi-duniya-backend.vercel.app",'https://kitabi-world-tq1p.vercel.app'], // List allowed origins
  credentials: true, // Allow cookies or authorization headers with requests
};
server.use(cors(corsOptions));


// Example Node.js/Express code


server.use(express.json());

server.use("/auth", require("./routes/auth"));
server.use("/books", require("./routes/book"));
server.use("/cart", cartRoute);
server.use("/transaction", transactionRoute);

server.get("/", (req, res) => {
  res.send("Hello World ");
});
server.listen(5000, async () => {
  console.log("SERVER is Listening on http://localhost:5000");
});
