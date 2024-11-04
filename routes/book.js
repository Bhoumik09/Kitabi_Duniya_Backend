require("dotenv").config();
const express = require("express");
const router = express.Router();

const { body, param, validationResult } = require("express-validator");
const fetchadmin = require("../middleware/fetchadmin");
const Book = require("../models/book");
const Author = require("../models/Author");
const Tags = require("../models/Tags");
const Publisher = require("../models/publisher");
const Language = require("../models/language");
const Account = require("../models/auth");
const Transaction = require("../models/Transaction");

// Rotue1 :Add Book : POST "/book/". Admin Login Require
router.post("/add-book", async (req, res) => {
  const {
    title,
    authors,
    price,
    genre,
    publisher,
    pages,
    thumbnail,
    rating,
    description,
    language,
    tags,
    book_link,
  } = req.body;

  try {
    // Check if a book with the same title already exists
    let existingBook = await Book.findOne({ title });
    if (existingBook) {
      return res
        .status(400)
        .json({ success, error: "Sorry, this book title already exists" });
    }

    // Find or create authors
    const authorIds = await Promise.all(
      authors.map(async (authorName) => {
        let author = await Author.findOne({ name: authorName });
        if (!author) {
          author = await Author.create({ name: authorName });
        }
        return author._id;
      })
    );

    // Find or create tags
    const tagIds = await Promise.all(
      tags.map(async (tagName) => {
        let tag = await Tags.findOne({ name: tagName });
        if (!tag) {
          tag = await Tags.create({ name: tagName });
        }
        return tag._id;
      })
    );

    // Find or create publisher
    let publisherDoc = await Publisher.findOne({ name: publisher });
    if (!publisherDoc) {
      publisherDoc = await Publisher.create({ name: publisher });
    }

    // Find or create language
    let languageDoc = await Language.findOne({ name: language.toLowerCase() });

    if (!languageDoc) {
      languageDoc = await Language.create({
        name: language,
        code: language.toLowerCase().slice(0, 2),
      });
    }

    // Create new book with all the referenced IDs
    const book = await Book.create({
      title,
      authors: authorIds,
      price,
      book_link,
      genre,
      publisher: publisherDoc._id,
      pages,
      thumbnail,
      rating,
      description,
      language: languageDoc._id,
      tags: tagIds,
    });

    success = true;
    res.status(200).json({ success, book });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error occurred");
  }
});

router.put("/update-book/:bookId", async (req, res) => {
  const {
    title,
    authors,
    price,
    genre,
    publisher,
    pages,
    thumbnail,
    rating,
    description,
    language,
    tags,
    book_link,
  } = req.body;

  try {
    // Check if a book with the same title already exists
    let existingBookID = req.params.bookId;

    // Find or create authors
    const authorIds = await Promise.all(
      authors.map(async (authorName) => {
        let author = await Author.findOne({ name: authorName });
        if (!author) {
          author = await Author.create({ name: authorName });
        }
        return author._id;
      })
    );

    // Find or create tags
    const tagIds = await Promise.all(
      tags.map(async (tagName) => {
        let tag = await Tags.findOne({ name: tagName });
        if (!tag) {
          tag = await Tags.create({ name: tagName });
        }
        return tag._id;
      })
    );

    // Find or create publisher
    let publisherDoc = await Publisher.findOne({ name: publisher });
    if (!publisherDoc) {
      publisherDoc = await Publisher.create({ name: publisher });
    }

    // Find or create language
    let languageDoc = await Language.findOne({ name: language });
    if (!languageDoc) {
      languageDoc = await Language.create({
        name: language,
        code: language.toLowerCase().slice(0, 2),
      });
    }

    // Update the book with all the referenced IDs

    const book = await Book.findByIdAndUpdate(existingBookID, {
      title: title,
      authors: authorIds,
      price: price,
      book_link: book_link,
      genre: genre,
      publisher: publisherDoc._id,

      pages: pages,

      thumbnail: thumbnail,

      rating: rating,
      description: description,
      language: languageDoc._id,
      tags: tagIds,
    });

    success = true;

    res.status(200).json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error occurred");
  }
});
// Import necessary modules

// GET /api/books - Flexible search across multiple fields
// Import necessary modules

// GET /api/books - Flexible search across multiple fields
// Import necessary modules

// GET /api/books - Flexible search across multiple fields
// GET /api/books - Flexible search across multiple fields
// Assuming `Transaction` and `Account` models are already imported.
// Import necessary modules

// Route to get rating details by transaction ID
router.get("/transactions/:transactionId/rating", async (req, res) => {
  try {
    const transactionId = req.params.transactionId;

    // Fetch the transaction with the specified ID
    const transaction = await Transaction.findById(transactionId).populate(
      "book"
    );

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Calculate the book's average rating and total rating count
    const { book } = transaction;
    const averageRating = book.totalRatings / book.ratingsCount || 0;

    res.json({
      userRating: transaction.rating,
      averageRating,
      ratingsCount: book.ratingsCount,
    });
  } catch (error) {
    console.error("Error fetching rating data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching rating data" });
  }
});

module.exports = router;

router.post("/rate-book/:transactionId", async (req, res) => {
  const { rating } = req.body; // Expecting the new rating in the request body
  const transactionId = req.params.transactionId;

  // Validate rating range
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 0 and 5." });
  }

  try {
    // Locate the transaction by ID

    const transaction = await Transaction.findById(transactionId).populate(
      "book"
    );

    // Ensure transaction exists
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Update the rating for this transaction
    const book = await Book.findById(transaction.book._id);
    let oldRating = transaction.rating;

    if (oldRating === 0) book.ratingsCount = book.ratingsCount + 1;
    transaction.rating = rating;
    await transaction.save();

    // Update the book's overall rating and rating count

    // If it's the user's first rating or they updated an existing rating
    const newUserRating = transaction.rating || 0;

    book.totalRatings += newUserRating - oldRating;
    if (book.totalRatings < 0) book.totalRatings = newUserRating;

    // Ensure there's at least one rating count
    book.rating = (book.totalRatings / book.ratingsCount).toFixed(2); // Calculate average

    await book.save();

    res
      .status(200)
      .json({
        success: true,
        averageRating: book.rating,
        transactionRating: rating,
        count: book.ratingsCount,
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error occurred");
  }
});

router.get("/", async (req, res) => {
  try {
    const { search, category, rating, language } = req.query; // Extract search text and other filters
    let query = {}; // Initialize the query object

    // Build a case-insensitive regex for search
    if (search) {
      const regex = new RegExp(search, "i");
      query = {
        ...query,
        $or: [
          { title: regex }, // Search in title
          { genre: regex }, // Search in genre
          { description: regex }, // Search in description
        ],
      };
    }

    // Add additional filters if provided
    if (category) {
      const categoryNames = category.split(","); // Assuming comma-separated categories
      const categories = await Category.find({ name: { $in: categoryNames } });
      const categoryIds = categories.map((category) => category._id);
      query.category = { $in: categoryIds }; // Filter books by category
    }

    if (rating) {
      const ratingValues = rating.split(",").map(Number);
      query.rating = { $in: ratingValues }; // Filter books by rating
    }

    if (language) {
      query.language = language; // Filter books by language
    }

    // Find books matching the query
    const books = await Book.find(query)
      .populate("authors")
      .populate("language")
      .populate("tags")
      .populate("publisher")
      .exec();
    // console.log(books)
    // Filter books further if necessary
    const filteredBooks = books.filter((book) => {
      return (
        (search
          ? book.title.match(new RegExp(search, "i")) ||
            book.genre.match(new RegExp(search, "i")) ||
            book.description.match(new RegExp(search, "i"))
          : true) &&
        (category
          ? book.category.some((catId) =>
              categoryIds.includes(catId.toString())
            )
          : true) &&
        (rating ? ratingValues.includes(book.rating) : true) &&
        (language ? book.language.toString() === language : true)
      );
    });

    res.json(filteredBooks); // Send the matching books as JSON
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "An error occurred while fetching books." });
  }
});

// Rotue2 : Fetch all  Book : GET "/books/". Admin Login Require
router.get("/get-book/:bookId", async (req, res) => {
  const bookId = req.params.bookId;

  try {
    const book = await Book.findById(bookId).populate([
      "tags",
      "language",
      "authors",
      "publisher",
    ]);
    if (!book) {
      return res.status(400).send("Book not found");
    }

    res.status(200).send(book);
  } catch (e) {
    console.log(e.message);
  }
});

module.exports = router;
