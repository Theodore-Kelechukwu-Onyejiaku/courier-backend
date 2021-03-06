const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//Importing Tracker model
const Courier = require("../model/Courier");
const {validateRegistration, validateLogin} = require("../validation");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../model/User");

//Importing JWT
const jwt = require("jsonwebtoken")

//Verify token middleware
function verify(req, res, next) {

    var token = req.cookies.auth;
  
    // decode token
    if (token) {
  
      jwt.verify(token, process.env.TOKEN_SECRET, function(err, token_data) {
        if (err) {
           return res.status(403).render('loginAdmin', {message: "Please Login"});
        } else {
          req.user_data = token_data;
          next();
        }
      });
    } else {
      return res.status(403).render('loginAdmin', {message: "Please You Have To Login"});
    }
  }


router.get("/", (req, res)=>{
    res.render("loginAdmin");
})

router.get("/addCourier",verify, (req, res)=>{
    res.render("addCourier", {message : "Add Courier", btn: "Create", courier: ""});
})

router.get("/viewCourier", verify, (req, res)=>{
    Courier.find((err, doc)=>{
        if(!err){
            res.render("viewCourier", {doc: doc})
        }else{
            res.render("viewCourier", {message: "Error, No courier gotten"})
        }
    })
})

//Deleting a courier
router.get("/delete/:id", verify, (req, res)=>{
    Courier.findByIdAndRemove(req.params.id, (err, doc)=>{
        if(!err){
            res.redirect("/api/viewCourier");
        }else{
            alert("Cannot be deleted")
        }
    })
})

/**
 *  To get a single courier and update
 */
router.get("/update/:id", verify, (req, res)=>{
    Courier.findById(req.params.id, (err, doc)=>{
        if(!err){
            res.render("updateCourier", {message: "Update Courier", courier: doc, btn: "Update"})
        }else{
            console.err("Error in retrieving data")
        }
    })
})

router.get("/logout", (req, res)=>{
    res.cookie("auth", "");
    res.render("loginAdmin")
})

//Login validation
router.post("/login", async (req, res)=>{
    var realUser ={
        name: "Theoodre",
    }
    //validating the user details before submittin to database
    const {error} = validateLogin(req.body);

    if(error){
      return  res.render("loginAdmin", {error :error.details[0].message});
    }

    //Checking if the user exists
    const user  = await User.findOne({email: req.body.email});
    if(!user){
       return res.render("loginAdmin", {error : "Email or password is wrong"}); 
    }

    //If the user exists, here we compare password
    const validPass = await bcrypt.compare(req.body.password, user.password)

    //If the passwords do not match
    if(!validPass) return res.render("loginAdmin", {error: "Email or password is wrong"})

    //Create and assign a token
    const token = jwt.sign(realUser, process.env.TOKEN_SECRET, {  expiresIn: '59m' });
   
    
    res.cookie('auth', token)

    res.redirect("/api/viewCourier")
})

router.post("/addCourier",  verify, (req, res)=>{
    if(req.body._id == ""){
        var departureTime = req.body.p_departure_time;
        var pickupTime = req.body.p_pickup_time;
        var pt = pickupTime.split("");
        var dt = departureTime.split("");
        if(Number(dt[0]) != 2 ){
            departureTime = departureTime 
        }else{
            departureTime = departureTime 
        }
    
        if(Number(pt[0]) !=2 ){
            pickupTime = pickupTime
        }else{
            pickupTime = pickupTime
        }
        var stringArray = ["A","B", "C", "E", "F", "G","H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S","T", "U", "V", "W", "X", "Y", "Z"]
        const courier = new Courier({
            r_first_name : req.body.r_first_name,
            r_last_name: req.body.r_first_name,
            r_address: req.body.r_address,
            r_phone: req.body.r_phone,
            r_email: req.body.r_email,
            r_state: req.body.r_state,
            s_first_name : req.body.s_first_name,
            s_last_name: req.body.s_last_name,
            s_address: req.body.s_address,
            s_phone: req.body.s_phone,
            s_email: req.body.s_email,
            s_state: req.body.s_state,
            p_number: req.body.p_number,
            p_destination: req.body.p_destination,
            p_weight: req.body.p_weight,
            p_mode: req.body.p_mode,
            //Generate Random Number
            p_id: Math.floor(Math.random() * 888888 + 111111) + stringArray[Math.floor(Math.random() * 23 + 1)] +  stringArray[Math.floor(Math.random() * 23 + 1)] + stringArray[Math.floor(Math.random() * 23 + 1)] + Math.floor(Math.random() * 888 + 111), 
            p_items: req.body.p_items,
            p_payment: req.body.p_payment,
            p_delivery_date: req.body.p_delivery_date,
            p_departure_date: req.body.p_departure_date,
            p_departure_time: departureTime,
            p_pickup_time: pickupTime,
            p_pickup_date: req.body.p_pickup_date,
            p_arrived: req.body.p_arrived,
            p_location: req.body.p_location,
            p_comment: req.body.p_comment
        })
        var result = courier;
        courier.save()
            .then(() =>{ 
                console.log(result);
            return res.redirect("/api/viewCourier")
            })
            .catch(err => {
                res.render("addCourier", {error: err});
            });
    }else{
        Courier.findOneAndUpdate({_id: req.body._id}, req.body, {new: true}, (err, doc)=>{
            if(!err){
                res.redirect("/api/viewCourier");
            }else{
                console.error("Error in updating course information"+ err)
                res.render("updateCourier",{
                    error: "Error in updating course data",
                    })
                }
            })
        }
    
})

module.exports = router;