const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//Importing User model
const User = require("../model/User");
const {validateRegistration, validateLogin} = require("../validation");
const bcrypt = require("bcryptjs");
require("dotenv").config();
//Importing JWT
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
//Use of cookies
router.use(cookieParser());
//Verify token middleware
function verify(req, res, next) {

    var token = req.cookies.auth;
  
    // decode token
    if (token) {
  
      jwt.verify(token, process.env.TOKEN_SECRET, function(err, token_data) {
        if (err) {
           return res.status(403).render('login', {message: "Please Login"});
        } else {
          req.user_data = token_data;
          next();
        }
      });
    } else {
      return res.status(403).render('login', {message: "Please Login"});
    }
  }


  //Register Super Admin
router.post("/register", async(req, res) =>{    
    //Using Joi to validate
   const {error} = validateRegistration(req.body);
   if(error){
      return  res.render("index", {error :error.details[0].message});
   }

   //Checking if the user is already in the database
   const emailExist = await User.findOne({email: req.body.email});
   if(emailExist){
       return res.render("index", {error : "Email already exists"})
   }

   //creating the salt and hashing the password entered
   const salt = await bcrypt.genSalt(10);
   const hashPassword = await bcrypt.hash(req.body.password, salt);

   const user = new User({
        name: req.body.name,
        email : req.body.email,
        password: hashPassword
    })

    //Saving User
    var result = user;
    user.save()
        .then(() =>{ 
            console.log(result);
           return res.render("login", {message : "Account Created Successfully! Login Now"})
        })
        .catch(err => {console.error(err)});
})

//Login validation
router.post("/login", async (req, res, next)=>{
    //validating the user details before submittin to database
    const {error} = validateLogin(req.body);
    if(error){
      return  res.render("login", {error :error.details[0].message});
    }

    
    //Checking if the user exists
    const user  = User.findOne({email: req.body.email});
    var ordinaryUser = {
      name : "Ordinary"
    }
    if(!user){
       return res.render("login", {error : "Email or password is wrong"}); 
    }

    //If the user exists, here we compare password
    const validPass = bcrypt.compare(req.body.password, user.password)
    

    //If the passwords do not match
    if(!validPass) return res.render("login", {error: "Email or password is wrong"})

    //Create and assign a token
    var token = jwt.sign( ordinaryUser, process.env.TOKEN_SECRET,{ expiresIn: '59m' });

    res.cookie('auth',token);

    res.redirect("/api/user/dashboard")
})

router.get("/dashboard", verify, (req, res)=>{
    res.redirect("/api/admin/viewAdmin")
})



module.exports = router;
