import express from 'express';
import {createUser, deleteUser, updateUser, loginUser,googleLogin,sendOTP,validateOTPAndUpdatePassword,getUser, getAllUsers,updateUserStatus } from '../controllers/userController.js';



const userRouter = express.Router(); // Create a router(village) for user

userRouter.post("/",createUser);

userRouter.post("/login",loginUser);

userRouter.get("/", getUser);

userRouter.delete("/",deleteUser);      

userRouter.put("/", updateUser);

userRouter.post("/google-login", googleLogin);

userRouter.get("/send-otp/:email", sendOTP);

userRouter.post("/validate-otp", validateOTPAndUpdatePassword);

userRouter.get("/all",getAllUsers)

userRouter.put("/toggle-block/:email", updateUserStatus)

export default userRouter;