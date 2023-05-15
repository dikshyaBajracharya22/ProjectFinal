const mongoose=require('mongoose');
const {CommentSchema}=require('../models/comments');

const ProductSchema=mongoose.Schema({

    productname:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },

    rate:{
        type:Number,
        default:1
    }
    ,
    price:{
        type:Number
    },
    comments:[
        CommentSchema
    ]


});

const Product=mongoose.model("product",ProductSchema);

module.exports=Product;