import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'
export const userDataContext = createContext()
function UserContext({ children }) {
  const serverUrl = "https://voice-assistant-backend-i2n0.onrender.com"
  const [userData, setUserData] = useState(null)
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const handleCurrentUser = async () => {
    try {
      //const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
      const result = await axios.get(`${serverUrl}/api/auth/current`, { withCredentials: true })
      setUserData(result.data)
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return result.data; // { type, userInput, response }
    } catch (error) {
      console.error("AxiosError in getGeminiResponse:", error?.response?.data || error.message);
      return { response: "Assistant is unavailable. Try again later." };
    }
  };
  useEffect(() => {
    handleCurrentUser()
  }, [])
  const value = {
    serverUrl, userData, setUserData, backendImage, setBackendImage, frontendImage, setFrontendImage
    , selectedImage, setSelectedImage, getGeminiResponse, handleCurrentUser
  }
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )

}



export default UserContext
