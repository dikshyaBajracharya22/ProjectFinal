const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const OrderSchema=mongoose.Schema({
 product:{
     type:ObjectId,
     ref:"product"
 },
 boughtby:{
     type:ObjectId,
     ref:"users"
 },

 date:{
     type:Date,
     
 },

 isdelivered:{
     type:Boolean,
     default:false
 }


});

const Order=mongoose.model("orders",OrderSchema);
module.exports=Order;
