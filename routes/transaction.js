let express = require("express");
const Transaction = require("../models/Transaction");
const Book = require("../models/book");
const Account = require("../models/auth");
let router = express.Router();
// Checkout route to process the cart
router.post("/checkout", async (req, res) => {
  const { cartItems, userId } = req.body;

  try {
    let allTransactions = [];

    for (const item of cartItems) {
      // Update the Book to include this user in buyers
      let book = await Book.findByIdAndUpdate(
        item.bookId,
        { $addToSet: { buyers: userId }, $inc: { transactionCount: 1 } },
        { new: true }
      );

      // Create a new transaction
      const transaction = new Transaction({
        user: userId,
        book: item.bookId,
        amount: book.price,
        rating: 0,
      });
      await transaction.save();
      allTransactions.push(transaction._id); // Collect the transaction IDs
    }

    // Update the user's account with all transaction IDs in one go
    if (allTransactions.length > 0) {
      await Account.findByIdAndUpdate(userId, {
        $push: { transaction: { $each: allTransactions } },
      });
    }

    // Fetch all transactions with populated book data
    const populatedTransactions = await Transaction.find({
      _id: { $in: allTransactions },
    })
      .populate("book") // Populate the book field
      .exec();

    res.status(200).json(populatedTransactions);
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all-transactions", async (req, res) => {
  try {
    let transactions = await Transaction.find()
      .populate({ path: "user", select: "username" }) // Assuming the User model has a 'username' field
      .populate({ path: "book", select: "title price" }); // Assuming the Book model has 'title' and 'price' fields

    // Map over the transactions to format the response as needed
    const response = transactions.map((transaction) => ({
      transactionId: transaction._id, // Transaction ID
      username: transaction.user?.username, // Username from the populated user
      bookName: transaction.book.title, // Book name from the populated book
      price: transaction.amount, // Amount (price)
      date: transaction.date, // Date of transaction
    }));

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});
router.get("/:bookId", async (req, res) => {
  const bookId = req.params.bookId; // Get the bookId from the route parameters

  try {
    const transactions = await Transaction.find({ book: { $in: [bookId] } }) // Match transactions where the book is the specified bookId
      .populate({ path: "user", select: "username" }) // Populate usernames from the User model
      .populate({ path: "book", select: "title price" }); // Populate book details

    // Step 3: Format the response
    const response = {
      transactions: transactions.map((transaction) => ({
        transactionId: transaction._id,
        username: transaction.user?.username,
        bookName: transaction.book.title,
        price: transaction.amount,
        date: transaction.date,
      })),
    };

    // Return the book details and related transactions
    res.status(200).json(response);
  } catch (error) {
    console.error("Error retrieving book details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/get-info");

module.exports = router;
