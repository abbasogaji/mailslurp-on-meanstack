const httpMocks = require('node-mocks-http')
const expect = require('expect')
const mongoose = require('mongoose')
const { parse } = require('node-html-parser');
const userController = require('./user.controller')
const dotenv = require('dotenv').config();
const { MailSlurp } = require('mailslurp-client')
const User = require('../model/User')


const mailslurp = new MailSlurp({ apiKey: process.env.MAILSLURP_API_KEY })


describe('||||||||    U S E R  C O N T R O L L E R   T E S T    ||||||||', () => {

        let userId;
        let mailAddress = "185842a2-de92-4ecf-b03e-9e747312ef1d@mailslurp.com" ;
        let mailBoxId = "185842a2-de92-4ecf-b03e-9e747312ef1d";
        let username  = "john_wick";
        let password = "password";

        //  Execute before each test cases within scope

        beforeEach(() => {})


        //  Execute before all test cases within scope 

        beforeAll( () => {
                mongoose.connect(process.env.MONGODB_TEST_CONNECTION_URI, { useNewUrlParser : true, useFindAndModify : false})
        })


        //  Execute after each test cases within scope 

        afterEach(() => {})


        //  Execute after all test cases within scope

        afterAll( async(done) => {
                const data  = await User.deleteOne({_id : userId })
                mongoose.disconnect(done)
        })

        
        describe(':::::::CREATE USER::::::::::::::::::::::::::::::::::::::::::::::::::::::::', () => {

            it('[ CASE 1 ] Stores the personal information into database correctly', (done) => {
                let request = httpMocks.createRequest({
                    method : 'POST',
                    url : '/api/auth/signup',
                    body : {
                        
                        name : 'john wick',
                        email : mailAddress,
                        password : "password"

                    }
                })
                let response  = httpMocks.createResponse({
                    eventEmitter : require('events').EventEmitter
                })
                let next = (error) => { console.error(error) }
                userController.createUser(request, response, next)
                response.on('end', () => {
                        let data = response._getJSONData()
                        expect(typeof(data.data)).toBe("object")
                        userId = data.data.id
                        done();
                })
            })

            it('[ CASE 2 ] Verify email address using email verification code', async (done) => {
                const email = await mailslurp.waitForLatestEmail(mailBoxId)
                const emailCode = parse(email.body).querySelector("h1.big-text").childNodes[0].rawText
                let request = httpMocks.createRequest({
                    method : 'POST',
                    url : '/api/auth/verify/email-registered',
                    body : {
                        id : userId,
                        code : emailCode,

                    }
                })

                let response  = httpMocks.createResponse({
                    eventEmitter : require('events').EventEmitter
                })
                let next = (error) => {console.log(error)}
                userController.verifyEmailRegistered(request, response, next)
                response.on('end', () => {
                        let data = response._getJSONData()
                        expect(data.code).toEqual(emailCode)
                        expect(data.isVerified).toBe(true)
                        expect(typeof(data)).toBe("object")
                        done();
                })
                


            })
        })
})

