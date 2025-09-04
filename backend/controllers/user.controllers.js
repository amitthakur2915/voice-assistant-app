import uploadOnCloudinary from "../config/cloudinary.js"
import geminiResponse from "../gemini.js"
import User from "../models/user.model.js"
import moment from "moment"
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    const user = await User.findById(userId).select("-password")
    if (!user) {
      return res.status(400).json({ message: "user not found" })
    }

    return res.status(200).json(user)
  } catch (error) {
    return res.status(400).json({ message: "get current user error" })
  }
}

export const updateAssistant = async (req, res) => {
  try {
    console.log("UserId:", req.userId);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("🔥 Update Assistant Error:", error);
    return res.status(400).json({
      message: "updateAssistantError user error",
      error: error.message,
    });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== "string") {
      return res.status(400).json({ response: "Invalid command." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ response: "User not found." });
    }

    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    const gemResult = await geminiResponse(command, assistantName, userName);

    if (!gemResult || typeof gemResult !== "object" || !gemResult.type || !gemResult.response) {
      return res.json({
        type: "general",
        userInput: command,
        response: "I'm sorry, I couldn't understand. Please try again.",
      });
    }

    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });

      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });

      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });

      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `This month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res.json({
          type: "general",
          userInput: command,
          response: "I didn't understand that command.",
        });
    }
  } catch (error) {
    console.error("askToAssistant error:", error.message);
    return res.status(500).json({
      response: "Assistant is unavailable. Try again later.",
    });
  }
};
