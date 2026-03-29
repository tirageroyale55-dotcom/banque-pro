const router = require("express").Router();
const Card = require("../models/Card");
const User = require("../models/User");
const auth = require("../middleware/auth.middleware");

router.get("/client/card", auth, async (req,res)=>{

try{

const user = await User.findById(req.user.id);

const card = await Card.findOne({user:user._id});

if(!card){
return res.status(404).json({message:"Carte introuvable"});
}

res.json({

brand:card.brand,
number:card.number,
last4:card.last4,
holder:user.prenom + " " + user.nom,
exp_month:card.exp_month,
exp_year:card.exp_year,
cvv:card.cvv,

status: card.status

});

}catch(e){

res.status(500).json({error:e.message});

}

});

module.exports = router;