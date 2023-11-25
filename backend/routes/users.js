const router = require("express").Router();
const { User } = require("../models/user");
const sendOTP = require("../helpers/sendOTP");
const Joi = require("joi");
const otpGenerator = require("otp-generator");
const isAuthenticated = require("../middlewares/AuthMiddleware");
const jwt = require("jsonwebtoken"); 
const otpStorage = new Map();
const JWT_SECRET_KEY = "YOUR_PRIVATE_KEY";
const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, JWT_SECRET_KEY, {
    expiresIn: "7d", // Token expiration time, adjust as needed
  });
};
router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }
    // Check if the mobile number is already registered
    let user = await User.findOne({ mobileNumber: req.body.mobileNumber });
    if (user) {
      return res.status(400).send({ message: "User already registered with this mobile number" });
    }
    // Generate OTP and save it
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    sendOTP(req.body.mobileNumber, otp);
    otpStorage.set(req.body.mobileNumber, otp);
    // Create a new user
    user = new User({
      username: req.body.username,
      mobileNumber: req.body.mobileNumber,
    });

    // Save the new user
    await user.save();

    // Generate a JWT token upon successful registration
    const token = jwt.sign({ userId: user._id }, JWT_SECRET_KEY, { expiresIn: '7d' });

    res.status(200).send({ message: "User registered successfully. Please verify with OTP.", token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/user-mobile-number", isAuthenticated, async (req, res) => {
  try {
    // Get the user's mobile number from the JWT token
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    // Find the user by their user ID
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    // Send the user's mobile number as the response
    res.status(200).json({ mobileNumber: user.mobileNumber });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!otpStorage.has(mobileNumber)) {
      return res.status(400).send({ message: "Mobile number not found or OTP has expired." });
    }
    const storedOTP = otpStorage.get(mobileNumber);
    if (otp === storedOTP) {
      // Generate a JWT token for the user
      const user = await User.findOne({ mobileNumber: mobileNumber });
      const token = generateToken(user);
      // Provide the JWT token in the response
      res.status(200).send({ message: "OTP verified successfully.", token: token });
      // Remove the OTP from storage
      otpStorage.delete(mobileNumber);
    } else {
      res.status(400).send({ message: "Invalid OTP." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});
const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string().required().label("Username"),
    mobileNumber: Joi.string().required().label("Mobile Number"),
  });
  return schema.validate(data);
};


module.exports = router;