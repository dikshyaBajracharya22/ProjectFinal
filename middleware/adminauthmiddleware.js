const jwt=require('jsonwebtoken');
const doenv=require('dotenv');
const Admin = require('../models/admin');
doenv.config();
const {adminsecret}=process.env;
const maxAge=7*24*60*60;
const generatetoken=(_id)=>{
      
    return jwt.sign({_id},adminsecret,{
        expiresIn:maxAge
    });
}


const verifyadmin=(req,res,next)=>{
    
    const token=req.cookies.x_access_token_admin;
       
    if(token)
    {
        jwt.verify(token,adminsecret,(err,decodedtoken)=>{

            if(err){
                res.redirect("/admin/login");
            }

            Admin.findOne({_id:decodedtoken}).then((admin)=>{
                   req.body.admin=admin;
                   next();

            })
   
   
       })
    }
    else{
      
        res.redirect("/admin/login");


    }

    

    
}

const checkadmin=(req,res,next)=>{
    const token=req.cookies.x_access_token_admin;
    if(token)
    {
        jwt.verify(token,adminsecret,(err,decodedtoken)=>{
             if(err)
             {
                 res.locals.curradmin=null;
                 next();
             }
             
             Admin.findOne({_id:decodedtoken}).then((admin)=>{
                 res.locals.curradmin=admin;
                 next();
             })
        })
    }
    else{
        res.locals.curradmin=null;
        next();
    }
}

module.exports={generatetoken,verifyadmin,maxAge,checkadmin}