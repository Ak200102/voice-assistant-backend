import uploadCloudinary from "../config/cloudinary.js"
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
        return res.status(400).json({ message: "Getcurrentuser error" })
    }
}


export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage;
    if (req.files && req.files.length > 0) {
      assistantImage = await uploadCloudinary(req.files[0].path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const askToAssistant = async (req, res) =>{
  try {
    const command = req.body.command
    const user = await User.findById(req.userId)
    user.history.push(command)
    user.save()
    const userName = user.name
    const assistantName = user.assistantName
    const result = await geminiResponse(command,assistantName,userName)

    const jsonMatch = result.match(/{[\s\S]*}/);

if (!jsonMatch) {
  // Gemini returned plain text, not JSON
  return res.json({
    type: "general",
    userInput: command,
    response: result
  });
}

const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type

    switch(type){
      case 'get_date' :
        return res.json({
          type,
          userInput:gemResult.userInput,
          response:`Current date is ${moment().format("YYYY-MM-DD")}`
        });
        case 'get_time' :
          return res.json({
          type,
          userInput:gemResult.userInput,
          response:`Current time is ${moment().format("hh:mm A")}`
        });
        case 'get_day' :
          return res.json({
          type,
          userInput:gemResult.userInput,
          response:`Today is ${moment().format("dddd")}`
        });
        case 'get_month' :
          return res.json({
          type,
          userInput:gemResult.userInput,
          response:`This is ${moment().format("MMMM")}`
        });
        case 'google_search':
        case 'youtube_search':
        case 'youtube_play':
        case 'general':
        case 'calculator_open':  
        case 'instagram_open':
        case 'facebook_open':
        case 'weather_show':
          return res.json({
            type,
            userInput:gemResult.userInput,
            response:gemResult.response
          });
          default:
            return res.status(400).json({response:"I didn't understand that command."})
        
    }
  } catch (error) {
    return res.status(400).json({response:"ask assistance error."})
  }
}