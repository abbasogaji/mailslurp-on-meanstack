const User = require("../model/User")
const emailtemplates = require('../utils/email-template')
const sgMail = require('@sendgrid/mail')

//
// ─── CREATE METHODS ─────────────────────────────────────────────────────────────
//


        exports.createUser = (req, res, next) => {
            const input = req.body
            let randEmailSix = generateRandSix()
            // console.log(input)
            
            const userData = {

                name : input.name,
                email : input.email,
                password : input.password,
                emailVerification : {
                    isVerified : false,
                    code : randEmailSix,
                    expiryDate : Date.now() + 3540000
                },
                verified : false

            }
            const conditions = {email : input.email, verified : false}
            User.findOneAndUpdate(conditions, userData, { new: true, upsert : true}).then(( user ) => {

                    if(user){
                        sendCodeToMail(randEmailSix, user.email)
                        return res.status(200).json({
                            dataTitle: "User created",
                            dataType : "object",
                            data : {id: user._id, email : user.email}
                        })
                    }else{
                            let error = new Error("Unable to create user")
                            error.statusCode = 422;
                            error.detail = "Unable to create user"
                            throw error;
                    }
                    
            }).catch(err => {
                console.log(err)
                next(err)
            })
        }

        exports.verifyEmailRegistered = async (req,res,next) => {
            const input = req.body;
            try {
                let user  = await User.findOne({_id : input.id})
                if(user){
                    console.log("EMAIL CODE", user.emailVerification.code )
                    console.log("EMAIL CODE", input.code )
                    if(user.emailVerification.code == input.code && user.emailVerification.expiryDate >= Date.now()){
                        user.emailVerification.isVerified  = true;
                        let email = user.email;
                        await user.save()
                        user = await User.findOne({_id : input.id})
            
                        if(user){
                            return res.status(200).json({
                                code : user.emailVerification.code,
                                isVerified : user.emailVerification.isVerified
                            })
                        }else{
                            let error = new Error("Unable to verify email!")
                            error.statusCode = 422;
                            error.detail = "Unable to verify email"
                            throw error;
                        }
                
                    }else{
                        let error = new Error("Expired verification code")
                        error.statusCode = 410;
                        error.detail = "Expired verification code"
                        throw error;
                    }
                }else{
                    let error = new Error("No record found!")
                    error.statusCode = 404;
                    error.detail = "No record found!"
                    throw error;
                }
            } catch (error) {
                next(error)
            }
            
        }


//
// ─── UTIL FUNCTIONS ────────────────────────────
//

    
        function generateRandSix(){
            let rand = Math.floor(Math.random() * 999999)
            return rand.toString().padStart(6, Math.floor(Math.random() * 9))
        }


        function sendCodeToMail(generatedCode, email){
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            const msg = {
                to: email,
                from: 'support@kormet.com.ng',
                subject: 'Registration Code',
                html: emailtemplates.RegistrationVerificationCodeTemplate(generatedCode),
            };
            sgMail.send(msg, false, function(err, info) {
                if (err ){
                    // console.log(err)
                }
                else {
                    console.log('Message sent');
                }
            });
            
        }






