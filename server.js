const express=require('express');
const app=express();
const mongoo=require('mongoose');
const dotenv=require('dotenv');
const cookieParser = require('cookie-parser');
const { checkuser } = require('./middleware/userauthmiddleware');
dotenv.config();
const {MONGO_URI}=process.env;

app.use(express.static('public'));
app.set("view engine","ejs");

app.use(express.json());
app.use(cookieParser());
const methodOverride=require('method-override');
app.use(methodOverride('_method'))

app.use("/",require('./users/request'));  

app.use("/admin",require('./admin/request'));


  




 

mongoo.connect(MONGO_URI).then((res)=>{
    app.listen(3000,()=>{
        console.log("Connected and Port Started")
           
    });
});
      
