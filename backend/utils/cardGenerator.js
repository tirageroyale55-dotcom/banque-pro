function generateCardNumber(){

let number = "4532";

for(let i=0;i<12;i++){

number += Math.floor(Math.random()*10);

}

return number.replace(/(.{4})/g,"$1 ").trim();

}

function generateCVV(){

return Math.floor(100 + Math.random()*900).toString();

}

function generateExpiry(){

const now = new Date();

return {
month:"08",
year:String(now.getFullYear()+4).slice(2)
};

}

module.exports={
generateCardNumber,
generateCVV,
generateExpiry
};