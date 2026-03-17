const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({

user:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

brand:{
type:String,
default:"visa"
},

number:{
type:String,
required:true
},

last4:{
type:String,
required:true
},

cvv:{
type:String,
required:true
},

exp_month:{
type:String,
required:true
},

exp_year:{
type:String,
required:true
},

status:{
type:String,
enum:["inactive","active","blocked"],
default:"inactive"
}

},{timestamps:true});

module.exports = mongoose.model("Card",CardSchema);