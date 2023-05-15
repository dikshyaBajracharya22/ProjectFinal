const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;

const CommentSchema=mongoose.Schema({
     review:{
         type:String,
         require:true
     },
     rate:{
         type:Number,
         require:true
     },
     writtenby:{
         type:ObjectId,
         ref:"users"
     },
     product:{
         type:ObjectId,
         ref:"product"
     }
    


});


const Comment=mongoose.model("comment",CommentSchema);
module.exports={CommentSchema,Comment};