const express=require("express");

const router=express.Router();

const User=require('../models/user');


const bcrypt=require('bcrypt');
const { json } = require("express");
const e = require("express");
const Product=require("../models/product");
const Order=require("../models/orders");
const {Comment}=require("../models/comments")

const jwt=require("jsonwebtoken");
const {spawn} = require('child_process');

const {generatetoken,verifytoken,maxAge, checkuser}=require("../middleware/userauthmiddleware");
const py=require("../")

router.get("*",checkuser);

const moment=require('moment');


router.get("/",(req,res)=>{
    res.render('index');
});
router.get("/account",(req,res)=>{

    res.render('account');
});




router.post("/register",(req,res)=>{
    let error=[];
  const {name,email,password}=req.body;
  User.findOne({email}).then(
   (user)=>{

    
    if(user)
    {

        error.push({
            "email":"EMail already registered",
            "password":""
        });

    }

    if(password.length<6)
    {
        error.push({
            "email":"",
            "password":"Password must be less than 6 characters"
        });
    }

    if(error.length>0)
    {
        res.status(400).json({error:error});
    }
    else
    {
        const newUser=User(req.body);
        bcrypt.hash(
            password,10
        ).then(result=>{
            console.log(result);
            newUser.password=result;
            console.log(result);
            newUser.save().then((result1)=>{

                res.status(200).json({user:newUser});
            })
        }).catch(err=>console.log(err))
       
    }

   }

  ).catch(err=>console.log(err))
});


router.post("/login",async (req,res)=>{
   
    const {email,password}=req.body;
    console.log(email,password);
    let error=[];
    

    User.findOne({email}).then((user)=>{
      if(user==null){

        error.push({
            "email":"Email not registered",
            "password":""
        });

        res.status(400).json({error});

           
      }

     console.log(user.password);

    
     
    
      

      bcrypt.compare(password,user.password).then((result)=>{
             console.log(result);
             if(!result)
             {
               error.push({"email":"",
                           "password":"Password did not match"});
             }
             if(error.length>0)
             {
                 console.log(error);
                 res.status(400).json({error});
             }
             else
             {

                const token=generatetoken(user._id);

                res.cookie("x_access_token",token,{
                    httpOnly:true,
                    maxAge:maxAge*10000
                });

                 res.status(200).json({"user":user});
             }

      }).catch(err=>console.log("1 $err"));
    

    }).catch(err=>console.log("2: $err"));

});

router.get("/confirm",verifytoken,(req,res)=>{
    res.render("thanks");
})

router.get("/products",(req,res)=>{
    Product.find().then((product)=>{
        res.render("product",{products:product});
    }).catch(err=>console.log(err))
    })
   

router.get("/products/:productid",verifytoken,(req,res)=>{

    const _id=req.params.productid;
    Product.findOne({_id}).then(
        (product)=>{
            if(product==null)
            {

            }
            else{

                Comment.find({product:_id}).populate("writtenby").then((reviews)=>{
                    res.render("productdetail",{product:product,review:reviews});
                })
            }
           
            
        }
    )
    
   
   
})

router.post("/buy-product/:productid",verifytoken,(req,res)=>{

       const _id=req.params.productid;
   
       Product.findOne({_id}).then(
           (product)=>{
                  const order=Order(
                      {
                          product:product._id,
                          boughtby:req.body.user._id,
                        date:Date.now()
                      }
                  );

                  order.save().then(result=>{
                      res.json({order:result});
                  }).catch(err=>console.log(err));
             

                    
          
              


           }
       );
        });

router.get("/orders",verifytoken,async (req,res)=>{
    var page=req.query.page||1;
    var perPage=9;
   
    Order.find({boughtby:req.body.user._id}).populate("product").populate("boughtby").skip((perPage*page)-perPage).limit(perPage).then(result=>{
        Order.find({boughtby:req.body.user._id}).count().then((count)=>{
            res.render("orders",{order:result,moment:moment,current:page,pages:Math.ceil(count/perPage)});}).catch(err=>console.log(err))
        })
       
});


// router.get("/write-comment/:productid",verifytoken,(req,res)=>{
   
//      const id=req.params.productidx;
//      res.render("review",{id});
// });
router.put("/write-comment/:productId",verifytoken,(req,res)=>{
    const _id=req.params.productId;
 
    console.log(_id);
    Order.findOne({product:_id,boughtby:req.body.user._id}).then(

        (order)=>{
             if(order)
             {
                var comment=req.body.review;
                const python=spawn('python',['./classifier.py',comment]);
                var dataToSend;
                python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
                dataToSend = data.toString();
                console.log(dataToSend);
          });
          python.on('close', (code) => {
            console.log(`child process close all stdio with code ${code}`);
            // send data to browser
           var rate=dataToSend;
           const cmt=Comment({
               review:comment,
               rate:Number(rate),
               writtenby:req.body.user._id,
               product:_id
            });






          

           cmt.save().then((result)=>{

            Product.findByIdAndUpdate(_id,{
                $push:{comments:cmt}
            }).then(async (result1)=> {

                        
                 var val=await calculaterate(_id);

                    console.log(val);

                    if(val)
                    {
                       res.status(200).json({"success":"success",rate:rate,review:comment});
                    }
                    else{
                        res.status(400).json({"error":"error"});
                    }
               
               
               
            }).catch(err=>console.log(err))

             

           }).catch(e=>console.log("comment save error"));
       
          
            
                    }
                );
            

             }
             else{
                 res.redirect('/buy-product');
             }

        }
    ).catch(err=>console.log(err));

});


const calculaterate=async (_id)=>{

    return new Promise((resolve,reject)=>{
        Product.findOne({_id}).then(
            (product)=>{
    
                var rate=0;
                product.comments.forEach(comment => {
    
                    rate+=comment.rate;
                    
                });
    
                const av_rate=rate/(product.comments.length);
                console.log(av_rate);
    
                Product.findByIdAndUpdate(_id,{
    
                    rate:av_rate
                },(err,doc)=>{
                    if(err)
                    {
                        resolve(false);
                    }
                    
                        resolve(true);
                    
                   
                });
    

    })
    
            


        }

    )
}


router.get("/thanks",verifytoken,(req,res)=>{
    const rate=req.query.rate;
    const review=req.query.review;
    res.render("sentiment_analysis_page",{rate:rate,review:review});
});
router.get("/logout",(req,res)=>{
 
    res.cookie('x_access_token','',{maxAge:1});
 
    res.redirect("/");

})


module.exports=router;