require("dotenv").config();
const express = require("express");
const router = express.Router();
const Account = require("../models/auth");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser = require("../middleware/fetchuser");
const fetchadmin = require("../middleware/fetchadmin");

// Rotue1 : Create a user using : POST "/auth/createuser". Doesn't require Auth
router.post(
  "/signup-user",
  [
    body("username", "Enter valid username").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password", "Enter valid password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    //if error return bad request
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    try {
      const { username, email, password, is_admin = false } = req.body;

      const existingUsername = await Account.findOne({ username });
      
      if (existingUsername) {
        return res
          .status(400)
          .json({ error: "Sorry, this username already exists" });
      }

      const existingEmail = await Account.findOne({ email });

      if (existingEmail) {
        return res
          .status(400)
          .json({ error: "Sorry, this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await Account.create({
        username,
        email,
        password: hashedPassword,
        is_admin,
      });

      const jwtKey = is_admin ? "merncourseadmin" : "merncourse";

      const data = { user: { id: user.id } };
      const authtoken = jwt.sign(data, jwtKey, { expiresIn: "1h" });

      res.status(200).json({ success: true, authtoken });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error occurred" });
    }
  }
);

// auth.js

const JWT_SECRET = "your_jwt_secret_key"; // Replace with an environment variable

// Route: Register a new user
router.post("/signup", async (req, res) => {
  const { username, email, password, is_admin = false } = req.body;

  try {
    const existingUser = await Account.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Account.create({
      username,
      email,
      password: hashedPassword,
      is_admin,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route: Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Account.findOne({ email })
      .populate({
        path: "transaction",
        populate: {
          path: "book", // Populate the 'book' field inside each transaction
          model: "Book", // Specify the model if necessary
        },
      })
      .populate("cart");

    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res
      .status(200)
      .json({
        token,
        user: {
          username: user.username,
          email: user.email,
          is_admin: user.is_admin,
          id: user._id,
        },
        cart: user.cart,
        transaction: user.transaction,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/verify-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // Verify token

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await Account.findById(decoded.id, "-password"); // Exclude password from response
    if (!user) return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({
        token,
        user: {
          username: user.username,
          email: user.email,
          is_admin: user.is_admin,
          id: decoded.id,
        },
      });
  } catch (error) {
    res.status(201).json({ message: "Invalid or expired token" });
  }
});
// Middleware: Protect routes
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized access" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is invalid" });
    req.user = user;
    next();
  });
};

module.exports = { router, authenticateToken };

router.get("/session-user", (req, res) => {
  if (req.session.token) {
    try {
      const decoded = jwt.verify(req.session.token, "your_jwt_secret");
      res.json({ loggedIn: true, user: decoded });
    } catch {
      res.json({ loggedIn: false });
    }
  } else {
    res.json({ loggedIn: false });
  }
});

// Route 3 : Getlogged in user details using id : get  "/auth/getuser. "
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    // console.log(userId)
    const user = await Account.findById(userId);
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error.");
  }
});

// Route 4 : Update the user information using: PATCH  "/auth /updateuser. "
router.patch(
  "/updateuser",
  [body("username", "Enter valid username").isLength({ min: 3 })],
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { username } = req.body;
      const userId = req.user.id;
      const user = await Account.findByIdAndUpdate(
        userId,
        { username },
        { new: true }
      );
      success = true;
      res.status(200).json({ success, user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error.");
    }
  }
);

//Route5: update Passowrd in user details using : patch "/auth/updatepassword"

router.patch(
  "/updatepassword",
  [
    body("oldpassword", "Enter your current password").notEmpty(),
    body(
      "newpassword",
      "Enter a new password with minimum 5 characters"
    ).isLength({ min: 5 }),
  ],
  fetchuser,
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { oldpassword, newpassword } = req.body;
      const userId = req.user.id;

      // Fetch the user from the database
      const user = await Account.findById(userId);

      // Check if the provided old password matches the user's current password
      const isMatch = await bcrypt.compare(oldpassword, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success, errors: [{ msg: "Invalid current password" }] });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newpassword, salt);

      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      success = true;
      res.json({ success, msg: "Password updated successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 6 : Getlogged in user details using  : POST  "/auth/getadmin. "
router.post("/getadmin", fetchadmin, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Account.findById(userId);
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error.");
  }
});
// Route5: Get all users from the database
router.get("/getallusers", async (req, res) => {
  try {
    const users = await Account.find({}, { password: 0 }); // Excluding password from the response

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error occurred" });
  }
});

module.exports = router;
