import express from 'express';
import {createUser, deleteUser, updateUser, loginUser } from '../controllers/userController.js';



const userRouter = express.Router(); // Create a router(village) for user

userRouter.post("/login",loginUser);

userRouter.post("/",createUser);

userRouter.delete("/",deleteUser);      

userRouter.put("/", updateUser);

export default userRouter;