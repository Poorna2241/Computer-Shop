import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
                res.json({
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

                    const token = jwt.sign(payload,"securityKey96$2025");//Data and scret key awasha nam expire time ekk danna puluwan,{expiresIn: '1h'}

                    res.json({
                        message: "Login successful",
                        token: token
                    });
                }else{
                    res.status(401).json({
                        message: "Incorrect password"
                    });
                }
        }});
        
}

// export function getUsers(req,res){

//     User.find().then(
//         (users)=>{
//             res.json(users);
//         }
//     )
// }

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