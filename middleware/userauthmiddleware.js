const jwt=require('jsonwebtoken');
const doenv=require('dotenv');
const User = require('../models/user');
doenv.config();
const {usersecret}=process.env;
const maxAge=7*24*60*60;
const express=require('express');
const app=express();
const generatetoken=(userid)=>{
      
    return jwt.sign({userid},usersecret,{
        expiresIn:maxAge
    });
}


const verifytoken=(req,res,next)=>{
    
    const token=req.cookies.x_access_token;

       
    if(token)
    {
        jwt.verify(token,usersecret,(err,decodedtoken)=>{

            if(err){
                res.redirect("/account");
            }
            
          
            User.findOne({_id:decodedtoken.userid}).then((user)=>{
                console.log(user);
                   req.body.user=user;
                   next();

            })
   
   
       })
    }
    else{
      
        res.redirect("/account");
      


    }

    

    
}

const checkuser=(req,res,next)=>{
    const token=req.cookies.x_access_token;
    console.log("Checking"+token);
    if(token){
 
        jwt.verify(token,usersecret,(err,decodedtoken)=>{
            if(err)
            {
                res.locals.curruser=null;
                next();
            }
            else
            {
 
             User.findById({_id:decodedtoken.userid}).then(user=>{
                 res.locals.curruser=user;
                 next();
             })
 
            }
        });
 
 
    }
    else{
 
     res.locals.curruser=null;
     next();
 
    }
 
 }
 



module.exports={generatetoken,verifytoken,maxAge,checkuser}