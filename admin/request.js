const express=require('express');
const router=express.Router();
const Admin=require('../models/admin');
const bcrypt=require('bcrypt');
const { json } = require('express');
const Product=require('../models/product');
const {generatetoken,verifyadmin,maxAge}=require('../middleware/adminauthmiddleware');
const {imagestore}=require('../middleware/imageuploadmiddleware');
const Order = require('../models/orders');
const User = require('../models/user');
const {Comment}=require('../models/comments');
const res = require('express/lib/response');
const moment=require('moment');

router.get("/",verifyadmin,(req,res)=>{
   res.redirect("/admin/dashboard");
});
router.get("/dashboard",verifyadmin,async (req,res)=>{
    const revc=await Comment.find().count();
    const usersc=await User.find().count();
    const productsc=await Product.find().count();
    const ordersc=await Order.find().count();
    const products=await Product.find().limit(5);
    const users=await User.find().limit(5);
    res.render("dashboard",{revc,usersc,productsc,ordersc,products,users});
});

router.get("/customers",(req,res)=>{
//   User.find().then(result=>{
//       res.render("customers",{customers:result});
//   })
var page=req.query.page||1;
    var perPage=9;
    User.find().skip((perPage*page)-perPage).limit(perPage).then(result=>{
        User.find().count().then((count)=>{
            res.render("customers",{customers:result,moment:moment,current:page,pages:Math.ceil(count/perPage)});})
            .catch(err=>console.log(err))
        })

});
router.get("/error",(req,res)=>{
    res.render("error");
})

router.get("/login",(req,res)=>{
    res.render("adminlogin");
});

router.get("/register",(req,res)=>{
    res.send("Register Admin");
});

router.post("/register",(req,res)=>{

    let error=[];

    const {email,password}=req.body;
    Admin.findOne({email}).then(
     (admin)=>{
         if(admin)
         {
             error.push({
                 "email":"The email is already registered",
                 "password":""
             });
         }

         if(password.length<8)
         {
            error.push({
                email:"",
                password:"The password is too short"
            });
         }


         if(error.length>0)
         {
             res.json({error});
         }
         else
         {
             const newAdmin=Admin(req.body);
             bcrypt.hash(password,10).then((result)=>{

                newAdmin.password=result;

                newAdmin.save().then((result1)=>{

                    res.status(200).json({admin:newAdmin});


                })



             })
         }



     }
    );

});

 router.get("/orders",verifyadmin,(req,res)=>{
 var page=req.query.page||1;
 var perPage=9;
  Order.find().populate("product").populate("boughtby").skip((perPage*page)-perPage).limit(perPage).then(result=>{
    Order.find().count().then((count)=>{
        res.render("admin_orders",{order:result,moment:moment,current:page,pages:Math.ceil(count/perPage)});})
        .catch(err=>console.log(err))
    })

 });
router.post("/login",(req,res)=>{
  

    let error=[];

    const {email,password}=req.body;
    Admin.findOne({email}).then((admin)=>{

            console.log(admin);
            if(!admin)
            {
                error.push({
                    email:"Not Registered Email",
                    password:""
                });

                res.status(400).json({error});
            }


            bcrypt.compare(password,admin.password).then(
                (result)=>{
                        if(!result)
                        {
                            error.push({
                                email:"",
                                password:"Invalid Credentials"
                            });

                            res.status(400).json({error}); 
                        }
                        else
                        {

                            const token=generatetoken(admin._id);

                            console.log(token);

                            res.cookie("x_access_token_admin",token,{
                                httpOnly:true,
                                maxAge:maxAge*1000
                            });

                            res.status(200).json({admin:admin});
                        }



                }
            )
      
    }).catch(err=>console.log(err));
   
});


router.get("/products",(req,res)=>{
    var page=req.query.page||1;
    var perPage=9;
    Product.find().skip((perPage*page)-perPage).limit(perPage).then(result=>{
        Product.find().count().then((count)=>{
            res.render("admin_products",{products:result,moment:moment,current:page,pages:Math.ceil(count/perPage)});})
            .catch(err=>console.log(err))
        })


});

router.get("/products/:productid",verifyadmin,async (req,res)=>{

    const _id=req.params.productid;
  
            try{
                const result=await Product.findOne({_id});
                const count1=await Comment.find({product:_id,rate:1}).count();
                const count2=await Comment.find({product:_id,rate:2}).count();
                const count3=await Comment.find({product:_id,rate:3}).count();
                const count4=await Comment.find({product:_id,rate:4}).count();
                const count5=await Comment.find({product:_id,rate:5}).count();
                const count=await Comment.find({product:_id}).count();
                console.log(result);
    
                res.render("admin_product_detail",{product:result,count1,count2,count3,count4,count5,count});
            }
            catch(e)
            {
                res.send(e);
            }
           


  



});

router.get("/add-products",verifyadmin,(req,res)=>{
    

      res.render("addproduct");
});

router.post("/add-products",verifyadmin,imagestore.single('image'),(req,res)=>{

    const productname=req.body.productname;
    const price=req.body.price;
    const description=req.body.description;
    const rate=req.body.rate;
    const image=req.file.filename;
    console.log(image);
    const product=Product({
        productname,description,image,rate,price
        
    });

    product.save().then(
        (result)=>{
            res.status(200).redirect("products");
        }

    ).catch(
        err=>res.status(400).json({error:err})
    );
       
        

});

router.get("/update-product/:productId",verifyadmin,(req,res)=>{
  
   const pid=req.params.productId;
   Product.findById({_id:pid}).then(result=>{
       res.render("editproduct",{product:result})
 
   });

});

router.put("/update-product/:productId",verifyadmin,(req,res)=>{
 
    const pid=req.params.productId;
    const productname=req.body.productname;
    const price=req.body.price;
  
    const description=req.body.description;

    console.log(productname);

    Product.findByIdAndUpdate(pid,
    {
        productname,    
        price,
        description
    }
    ).then(
        (product)=>{
            
            if(product)
            {
                console.log("Success");
                res.status(200).json({"message":"Success"});
            }
            else{
                console.log("No Success");
                res.status(400).json({"message":"No Success"});
            }
        }
    );


});


router.delete("/delete-product/:productId",verifyadmin,(req,res)=>{

    const productId=req.params.productId;

    Product.findByIdAndDelete(productId,(err,doc)=>{
         if(err)
         {
            res.status(400).json({"error":err});
            console.log(err)
             
             
         }
        
         Order.find().deleteMany({product:productId}).then((result)=>{
             if(err){
                res.status(400).json({"error":err});
                console.log(err)
             }

            Comment.find().deleteMany({product:productId}).then(
                 (result1)=>{
                    res.status(200).redirect("/admin/products");
                 }
             )
             
         })
       

    })

});


router.put("/editorders/:orderid",verifyadmin,(req,res)=>{
 
    const id=req.params.orderid;
    Order.findByIdAndUpdate(id,{
        isdelivered:req.body.isdelivered
    }).then(
        (result)=>{
            
            if(result)
            {
                res.status(200).json({message:true});

            }
            else
            {
                res.status(200).json({message:false});
            }
            
        }
        
    ).catch(err=>console.log(err))
});

router.put("/editcustomer/:userid",verifyadmin,(req,res)=>{
  const id=req.params.userid;
  console.log(id);
  const {name,email}=req.body;
  User.findByIdAndUpdate(id,{
      name,
      email
  }).then((result)=>{
      if(result){
          console.log(result);
          res.status(200).json({"message":"Success"});
      }
      else
      {
          console.log("here");
          res.status(400).json({"error":"error"});
      }
  }).catch(err=>console.log(err))
});

router.get("/reviews",verifyadmin,(req,res)=>{
    var page=req.query.page||1;
    var perPage=10;
Comment.find().populate("product").populate("writtenby").skip((perPage*page)-perPage).limit(perPage).then(result=>{
    Comment.find().count().then((count)=>{
            res.render("admin_reviews",{reviews:result,moment:moment,current:page,pages:Math.ceil(count/perPage)});})
            .catch(err=>console.log(err))
        })
// Comment.find().populate("product").populate("writtenby").then((result)=>{
//     res.render("admin_reviews",{reviews:result});
// })
});


router.get("/logout",(req,res)=>{
    res.cookie("x_access_token_admin",'',{maxAge:1});
    res.redirect("/admin");
});

module.exports=router;