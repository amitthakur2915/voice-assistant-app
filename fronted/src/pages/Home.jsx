import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios, { all } from "axios";
import alltime from "../assets/alltime.gif";
import answer from "../assets/answer.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [ham, setHam] = useState(false);

  const isSpeakingRef = useRef(false);
  const isRecognizingRef = useRef(false);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.log(error);
      setUserData(null);
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && recognitionRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current.start();
        console.log("🎙️ Recognition started");
      } catch (error) {
        if (error.name !== "InvalidStateError") console.error("Start error:", error);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) utterance.voice = hindiVoice;

    isSpeakingRef.current = true;

    utterance.onstart = () => {
      recognitionRef.current?.stop();
      isRecognizingRef.current = false;
      setListening(false);
    };

    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => startRecognition(), 300); 
    };

    synth.cancel();
    synth.speak(utterance);
  };

const handleCommand = (data) => {
  if (!data || typeof data !== "object") {
    console.error("❌ Invalid data received:", data);
    return;
  }

  const { type, userInput, response } = data;

  if (response) {
    speak(response);
    setAiText(response);
  }

  switch (type) {
    case "google-search":
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
      break;
    case "calculator-open":
      window.open(`https://www.google.com/search?q=calculator`, "_blank");
      break;
    case "instagram-open":
      window.open(`https://www.instagram.com/`, "_blank");
      break;
    case "facebook-open":
      window.open(`https://www.facebook.com/`, "_blank");
      break;
    case "weather-show":
      window.open(`https://www.google.com/search?q=weather`, "_blank");
      break;
    case "youtube-search":
    case "youtube-play":
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
      break;
    default:
      console.log("🤖 General response:", response);
  }
};

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;

    let isMounted = true;

    const initRecognition = () => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("🎧 Listening...");
        } catch (e) {
          if (e.name !== "InvalidStateError") console.error(e);
        }
      }
    };

    const startTimeout = setTimeout(initRecognition, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
      console.log("🎤 Recognition active");
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        console.log("⚠️ Recognition ended → restarting...");
        setTimeout(initRecognition, 500);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error === "no-speech" || event.error === "network") {
        console.log("🔄 Auto-restarting recognition after error");
        setTimeout(initRecognition, 500);
      }
    };

recognition.onresult = (e) => {
  const transcript = e.results[e.results.length - 1][0].transcript.trim();
  console.log("User said:", transcript);

  (async () => {
    try {
      if (userData && transcript.toLowerCase().includes(userData.assistantName?.toLowerCase())) {
        setAiText("");
        setUserText(transcript);

        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);

        if (data && typeof data === "object") {
          handleCommand(data);
          setAiText(data.response);
        } else {
          console.warn("⚠️ Gemini returned empty/invalid:", data);
        }

        setUserText("");
      }
    } catch (err) {
      console.error("Gemini error:", err);
    }
  })();
};

    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      const greeting = new SpeechSynthesisUtterance(`Hello ${userData?.name}, what can I help you with?`);
      greeting.lang = 'hi-IN';
      const hindiVoice = voices.find(v => v.lang === 'hi-IN');
      if (hindiVoice) greeting.voice = hindiVoice;
      window.speechSynthesis.speak(greeting);
    }, 700);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, [userData, getGeminiResponse, serverUrl]);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
      
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
        <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>
        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
          {userData?.history?.map((his, index) => (
            <div key={index} className='text-gray-200 text-[18px] w-full h-[30px]'>{his}</div>
          ))}
        </div>
      </div>

      <button className='min-w-[150px] h-[60px] absolute hidden lg:block top-[20px] right-[20px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]' onClick={handleLogOut}>Log Out</button>
        <button className='min-w-[160px] lg:min-w-[220px] px-5 lg:px-8 h-[60px] absolute hidden lg:block top-[100px] 
        right-[20px] text-black font-semibold bg-white rounded-full cursor-pointer text-[19px]'
        onClick={() => navigate("/customize")}>  Customize your Assistant</button>


      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
        <img src={userData?.assistantImage || "/default.jpg"} alt="Assistant" className='h-full object-cover' />
      </div>

      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText ? <img src={alltime} alt="User" className='w-[200px]'  /> : <img src={answer} alt="AI" className='w-[200px]' />}
      <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText || aiText || null}</h1>
    </div>
  );
}

export default Home;











