import React, { useState, useContext } from 'react';
import bg from "../assets/authBg.png";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext.jsx';
import axios from 'axios';
import google from "../assets/google.png";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../utils/Firebase';

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const { serverUrl, setUserData, handleCurrentUser } = useContext(userDataContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
        if (!passwordRegex.test(password)) {
            setError("Password must include 1 lowercase, 1 uppercase, 1 number, and 1 special character.");
            return;
        }

        setLoading(true);
        try {
            let result = await axios.post(
                `${serverUrl}/api/auth/signin`,
                { email, password },
                { withCredentials: true }
            );
            setUserData(result.data);

            handleCurrentUser();
            navigate("/");
        } catch (error) {
            console.log(error);
            setUserData(null);
            setError(error.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

 
const googleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setError("");

    try {
        const response = await signInWithPopup(auth, provider);
        const user = response.user;

        const result = await axios.post(
            `${serverUrl}/api/auth/googlelogin`,
            {
                name: user.displayName,
                email: user.email
            },
            { withCredentials: true }
        );

        if (result.data.success) {
            setUserData(result.data.user);
            navigate("/");
        } else {
            setError(result.data.message || "Google login failed!");
        }
    } catch (error) {
        console.error("Google Login Error:", error);
        setError(error.response?.data?.message || "Google login failed!");
        setUserData(null);
    } finally {
        setIsGoogleLoading(false);
    }
};

    return (
        <div
            className='w-full h-[100vh] bg-cover flex justify-center items-center'
            style={{ backgroundImage: `url(${bg})` }}
        >
            <form
                className='w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col 
                items-center justify-center gap-[20px] px-[20px]'
                onSubmit={handleSignIn}
            >
                <h1 className='text-white text-[30px] font-semibold'>
                    Sign In to <span className='text-blue-400'>Virtual Assistant</span>
                </h1>

                <div
                    className='w-[90%] h-[50px] rounded-full flex items-center justify-center gap-[10px] py-[20px] cursor-pointer border-2 border-white'
                    onClick={googleLogin}
                >
                    <span className='text-white text-[18px]'>
                        Continue with Google
                    </span>
                    <img src={google} alt="Google" className='w-[20px]' />
                </div>

                <div className='w-[100%] h-[20px] flex items-center justify-center gap-[10px] text-white'>
                    <div className='w-[40%] h-[1px] bg-white'></div>
                    OR
                    <div className='w-[40%] h-[1px] bg-white'></div>
                </div>

                <input
                    type="email"
                    placeholder='Enter your Email'
                    className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] relative'>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder='Enter your Password'
                        className='w-full h-full outline-none bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px]'
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {showPassword ? (
                        <IoEyeOff
                            className='absolute top-[18px] right-[20px] text-white h-[25px] w-[25px] cursor-pointer'
                            onClick={() => setShowPassword(false)}
                        />
                    ) : (
                        <IoEye
                            className='absolute top-[18px] right-[20px] text-white h-[25px] w-[25px] cursor-pointer'
                            onClick={() => setShowPassword(true)}
                        />
                    )}
                </div>

                {error.length > 0 && (
                    <p className='text-red-500 text-[17px]'>*{error}</p>
                )}

                <button
                    className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px]'
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Sign In"}
                </button>

                <p
                    className='text-[white] text-[18px] cursor-pointer'
                    onClick={() => navigate('/signup')}
                >
                    Want to create a new account? <span className='text-blue-400'>Sign Up</span>
                </p>
            </form>
        </div>
    );
}

export default SignIn;
