const mongoose=require('mongoose');

const AdminSchema=mongoose.Schema({
    
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        require:true
    }
});
const Admin=mongoose.model("admin",AdminSchema);

module.exports=Admin;