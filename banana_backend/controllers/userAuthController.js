import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

export const signup = async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log("Signup request received", req.body);
  try {
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      userName,
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: { id: user._id, userName: user.userName, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const Profile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const saveOrUpdateScore = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newScore = req.body.score;

    user.score = newScore;

    if (newScore > user.highScore) {
      user.highScore = newScore;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Score saved/updated successfully",
      score: user.score,
      highScore: user.highScore,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getTopScores = async (req, res) => {
  try {
    const topScores = await UserModel.find()
      .sort({ highScore: -1 })
      .limit(10)
      .select("userName highScore");
    res.status(200).json(topScores);
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
    res.status(500).json({ message: "Error retrieving leaderboard", error });
  }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting account' });
    }
};