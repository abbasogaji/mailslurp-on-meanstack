 //
 // ──────────────────────────────────────────────────────────────────────────── I ──────────
 //   :::::: U S E R   M O N G O D B   M O D E L : :  :   :    :     :        :          :
 // ──────────────────────────────────────────────────────────────────────────────────────
/********************************************************************************************
 * 
 * Information for stored in the document include;
 * Name,
 * Email,
 * Password
 * 
*********************************************************************************************/
//
// ─── IMPORTS ────────────────────────────────────────────────────────────────────
//


const mongoose = 
require("mongoose")


//
// ─── BODY ───────────────────────────────────────────────────────────────────────
//



const userSchema = 
new mongoose.Schema ({

name :      {
    type :  String,
    required: true
},

email :     {
    type: String,
    unique: true,
    required: true
},

password : {
    type: String,
    required: true
},

emailVerification : {
    isVerified : { type : Boolean, default : false},
    code : String,
    expiryDate : String
},

verified : {
    type : Boolean,
    required : true
}
},


{
timestamps : true
})


//
// ─── EXPORTS ────────────────────────────────────────────────────────────────────
//


module.exports = mongoose.model('User', userSchema)