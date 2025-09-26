import React, { useContext, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import axios from 'axios'
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

function Customize2() {
    const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext)
    const [assistantName, setAssistantName] = useState(userData?.assistantName || "")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleUpdateAssistant = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("assistantName", assistantName);

            if (backendImage) {
                formData.append("assistantImage", backendImage);
            } else if (selectedImage) {
                formData.append("imageUrl", selectedImage);
            }

            // ✅ Use cookies for auth instead of localStorage token
            const result = await axios.post(
                `${serverUrl}/api/user/update`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            console.log("Update success:", result.data);
            setUserData(result.data);
            navigate("/");
        } catch (error) {
            console.error("Update failed:", error.response?.data || error.message);
            alert("Update failed: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#111] text-white">
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 flex items-center gap-2 text-lg">
                <MdKeyboardBackspace /> Back
            </button>

            <h1 className="text-2xl font-bold mb-6">Customize Your Assistant</h1>
            <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                placeholder="Enter Assistant Name"
                className="px-4 py-2 rounded-lg text-black mb-4"
            />

            <button
                onClick={handleUpdateAssistant}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg disabled:opacity-50"
            >
                {loading ? "Updating..." : "Save Changes"}
            </button>
        </div>
    )
}

export default Customize2
