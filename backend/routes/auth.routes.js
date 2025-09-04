import express from "express"
import { googleLogin, Login, logOut, signUp, getCurrentUser } from "../controllers/auth.controllers.js"
import isAuth from "../middlewares/isAuth.js";

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",Login)
authRouter.get("/logout",logOut)
authRouter.post("/googlelogin",googleLogin)
authRouter.get("/current", isAuth, getCurrentUser);
authRouter.get("/test", (req, res) => {
  res.json({ message: "Auth routes working fine!" });
});


export default authRouter