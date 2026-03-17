import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";

dotenv.config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: "tallerfoc1@gmail.com",
//         pass: process.env.GMAIL_APP_PASSWORD
//     },
// });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "tallerfoc1@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});



export function createUser(req,res){

    const data = req.body;

    const hashedPassword = bcrypt.hashSync(data.password,10);

    
    res.json({hashedPassword});

    const user = new User({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: data.role
    });

    user.save().then(()=>{
        res.json({
            message: "User created successfully"
        });
    })

    
    //     res.json({
    //         message: "User created successfully"
    //     });
    // })
}

export function loginUser(req,res){

    const email = req.body.email;
    const password = req.body.password;

    User.find({email: email}).then(
        (users)=>{
            if(users[0]==null){
                res.status(404).json({
                    message: "User not found"
                })
                
            }else{
                const user = users[0];

                const isPasswordCorrect = bcrypt.compareSync(password, user.password);//user dan ewapu password, usergr db eke password eka

                if(isPasswordCorrect){

                    const payload = {
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image
                    }

                    const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '150h'});//Data and scret key awasha nam expire time ekk danna puluwan,{expiresIn: '1h'}

                    res.json({
                        message: "Login successful",
                        token: token,
                        role: user.role
                    });
                }else{
                    res.status(401).json({
                        message: "Incorrect password"
                    });
                }
        }});
        
}

export function getUsers(req,res){

    User.find().then(
        (users)=>{
            res.json(users);
        }
    )
}


export function deleteUser(req,res){

    res.json({
        message: "User delete request received"
    });
}   

export function updateUser(req,res){

    res.json({
        message: "User update request received"
    });
}

export function isAdmin(req){

    if(req.user == null){

        return false;
    }
    if(req.user.role !== "admin"){

        return false;
    }
    
    return true;


}

export async function googleLogin(req,res){

    try{
        const response = await axios.get(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${req.body.token}`,
				},
			}
		);

        console.log(response.data);

        //check user already in website or not
        const users = await User.findOne({email: response.data.email});
        if(users == null){
            //create new user
            const newuser = new User({
                firstName: response.data.given_name,
                lastName: response.data.family_name || "GoogleUser",
                email: response.data.email,
                password: "google-login",//1234 
                image: response.data.picture
            }); 

            await newuser.save();

            const payload = {
                email: newuser.email,
                role: newuser.role,
                firstName: newuser.firstName,
                lastName: newuser.lastName,
                isEmailVerified: newuser.isEmailVerified,
                image: newuser.image
            };
                const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '150h'});//Data and scret key awasha nam expire time ekk danna puluwan,{expiresIn: '1h'}

                res.json({
                    message: "Login successful",
                    token: token,
                    role: newuser.role
                });
        }else{
            //generate token
            const payload = {
                email: users.email,
                role: users.role,
                firstName: users.firstName,
                lastName: users.lastName,
                isEmailVerified: users.isEmailVerified,
                image: users.image
            }
                const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '150h'});//Data and scret key awasha nam expire time ekk danna puluwan,{expiresIn: '1h'}
                res.json({
                    message: "Login successful",
                    token: token,
                    role: users.role
                });
        }

    }catch(error){
        res.status(500).json({
            message: "Google login failed",
            error: error.message
        });
    }

}

export async function validateOTPAndUpdatePassword(req,res){
    try {
        const email = req.body.email;
        const otp = req.body.otp;
        const newPassword = req.body.newPassword;

        const otpRecord = await Otp.findOne({email: email, otp: otp});

        if(otpRecord == null){
            res.status(400).json({
                message: "Invalid OTP"
            });
            return;
        }

        await Otp.deleteMany({email: email});

        const hashedPassword = bcrypt.hashSync(newPassword,10);
        await User.updateOne({email: email}, 
            {$set: {password: hashedPassword ,isEmailVerified: true}});
        
        res.json({
            message: "Password updated successfully"
        });




        
    } catch (error) {
        console.error("Error in validateOTPAndUpdatePassword:", error);
        res.status(500).json({
            message: "An error occurred while validating OTP and updating password"
        });
        
    }
}

export async function sendOTP(req,res){

    try {
        
    
    const email = req.params.email;

    const user = await User.findOne({email: email});

    if(user == null){
        res.status(404).json({
            message: "User not found"
        });
        return;
    }
    await Otp.deleteMany({email: email});

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    const otp  = new Otp({
        email: email,
        otp: otpCode
    });

    // Save OTP to user document
    await otp.save();



    // Send OTP via email
    const message = {
        from: "tallerfoc1@gmail.com",
        to:email,
        subject: "Your OTP Code",
        text: "Your OTP code is: " + otpCode
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error("Error sending OTP:", error);
            res.status(500).json({
                message: "Failed to send OTP"
            });
        } else {
            console.log("OTP sent successfully:", info.response);
            res.json({
                message: "OTP sent successfully"
            });
        }
    });
    } catch (error) {
        console.error("Error in sendOTP:", error);
        res.status(500).json({
            message: "An error occurred while sending OTP"
        });
        
    }


}



  