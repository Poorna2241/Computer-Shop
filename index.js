import express from 'express'; 
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MongoURI;

mongoose.connect(mongoURI).then(()=>{
    console.log("Connected to MongoDB Cluster0");
})

const app = express();

app.use(cors());

app.use(express.json());

app.use(
    (req,res,next)=>{

        const authorizationHeader = req.header("Authorization");

        if(authorizationHeader != null){

            const token = authorizationHeader.replace("Bearer ","");

            console.log(token);

            //decryption method
            jwt.verify(token,process.env.JWT_SECRET,//token and security key that we used for encryption and verify karala iwara unma karnna one de
                (error,content)=>{
                    if(content == null){
                        console.log("Invalid token");

                        res.json({
                            message: "Invalid token"
                        });

                    


                    }else{
                        console.log("Token verified");
                        // console.log(content);
                        req.user = content;//apu content eka req.user athule dala yawanwa
                        next();
                    }
                }
            );

        }else{
            next();
        }

    
    });

app.use("/api/users", userRouter);

app.use("/api/products", productRouter);


app.get("/",(req,res)=>{
    // console.log(req.body);
    // console.log("Get request received");
    // res.json({
    //     message: "Hello "+req.body.name +" get request received"
    // }); 
    
    Student.find().then(
        (students)=>{
            res.json(students);
        }
    )
})

app.post("/",(req,res)=>{
    // console.log("Post request received");
    // res.json({
    //     message: "Hello "+req.body.name+" post request received"
    // });
    // console.log(req.body);

    //read the data inside req.body
    //Create a new studen tin student collection

    const student = new Student(req.body);
    student.save().then(() =>{
        res.json({
            message: "Student data saved successfully"
        }); 
    })
})

app.delete("/",(req,res)=>{
    console.log("Delete request received");
    res.json({
        message: "Hello "+req.body.name+" delete request received"
    });
})

app.put("/",(req,res)=>{
    console.log("Put request received");
    res.json({
        message: "Hello "+req.body.name+" put request received"
    });
}) 

app.listen(3000,() => {
    console.log("Server started on port 3000");
})

// function start(){
//     console.log("Server is starting...");
// }

// app.listen(3000, start);