import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    const prompt = `You are a virtual assistant named ${assistantName} created by ${userName}. 
You are not Google. You will now behave like a voice-enabled assistant.

Your task is to understand the user's natural language input and respond with a JSON object like this:

{
  "type": "general" | "google-search" | "youtube-search" | "youtube-play" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show",
  "userInput": "<original user input>" {only remove your name from userinput if exists. If the user wants Google or YouTube search, only put the search query},
  "response": "<a short spoken response to read out loud to the user>"
}

Instructions:
- "type": determine the intent of the user.
- "userInput": original sentence the user spoke.
- "response": short, voice-friendly reply.
- If user asks "who created you", respond with ${userName}.
- Only respond with the JSON object, nothing else.

Type meanings:
- "general": if it's a factual or informational question.
- "google-search": if user wants to search something on Google.
- "youtube-search": if user wants to search something on YouTube.
- "youtube-play": if user wants to directly play a video or song.
- "calculator-open": if user wants to open a calculator.
- "instagram-open": if user wants to open instagram.
- "facebook-open": if user wants to open facebook.
- "weather-show": if user wants to know weather.
- "get-time": if user asks for current time.
- "get-date": if user asks for today's date.
- "get-day": if user asks what day it is.
- "get-month": if user asks for the current month.

Important:
- Use ${userName} agar koi puche tume kisne banaya.
- Only respond with the JSON object, nothing else.

Now your userInput: ${command}`;

    const result = await axios.post(
      apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    let rawText = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";


    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    if (!rawText) {
      console.error("Gemini returned empty response");
      return {
        type: "general",
        userInput: command,
        response: "I'm sorry, I couldn't understand. Please try again."
      };
    }


    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse Gemini response:", rawText);
      parsed = {
        type: "general",
        userInput: command,
        response: "I'm sorry, I couldn't understand. Please try again."
      };
    }

    return parsed;

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return {
      type: "general",
      userInput: command,
      response: "Assistant is unavailable. Try again later."
    };
  }
};

export default geminiResponse;

