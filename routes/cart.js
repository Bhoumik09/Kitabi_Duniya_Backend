const express = require("express");
const Account = require("../models/auth");
const Book = require("../models/book");
const router = express.Router();
router.post("/add-to-cart", async (req, res) => {
  let { userId, bookId } = req.body;
  try {
    let user = await Account.findById(userId);
    let book = await Book.findById(bookId);
    user.cart.push(book);

    await user.save();
    return res.status(200).json("Added");
  } catch (e) {
    res.json("Error in adding to cart");
  }
});
router.post("/delete-from-cart", async (req, res) => {
  let { userId, bookId } = req.body;
  try {
    let user = await Account.findById(userId);

    user.cart = user.cart.filter((book) => book._id != bookId);

    await user.save();
    return res.status(200).json("Deleted");
  } catch (e) {
    res.status(404).json("Error in deleting from cart");
  }
});
router.post("/sync-cart", async (req, res) => {
  const { userId, cartItems } = req.body;

  if (!userId || !Array.isArray(cartItems)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    // Update or create the cart for the user
    await Cart.updateOne({ userId }, { items: cartItems }, { upsert: true });
    res.status(200).json({ message: "Cart synced successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to sync cart" });
  }
});
router.post("/get-cart-items", async (req, res) => {
  const { cartItems } = req.body; // Expecting an array of cart items with bookId
  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "No cart items provided" });
  }

  try {
    // Extracting book IDs from cartItems
    const bookIds = cartItems.map((item) => item.bookId);
    // Fetching books from the database using the IDs
    const books = await Book.find({ _id: { $in: bookIds } }).populate(
      "publisher"
    );

    // Returning the found books
    return res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
