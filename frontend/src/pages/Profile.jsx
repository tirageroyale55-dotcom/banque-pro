import { useState } from "react";

export default function Profile(){

const [photo,setPhoto] = useState(null)

function upload(e){

const file = e.target.files[0]
setPhoto(URL.createObjectURL(file))

}

return(

<div style={{padding:"30px"}}>

<h2>Profil utilisateur</h2>

<div>

<img
src={photo || "/default-avatar.png"}
alt="profil"
style={{width:120,borderRadius:"50%"}}
/>

<input type="file" onChange={upload}/>

</div>

</div>

)

}



