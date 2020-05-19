const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");
//Importing User model
const User = require("./model/User");
const {validateRegistration, validateLogin} = require("./validation");
const bcrypt = require("bcryptjs");




//Importing user route
const userRoute = require("./routes/user");
//Importing admin router
const adminRoute = require("./routes/admin");

//connectin to database
mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true } )
    .then(()=>{console.log("Connected to Db")})
    .catch(err => {console.log("Error connecting to DB")})


//Middlewares

app.use(express.static("public"));
//Importing the body-parser middle ware
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json())
//for cors
app.use(cors());


app.set("views", path.join(__dirname, "/views") )
app.set("view engine", "ejs");

//user route
app.use("/api/user", userRoute);
//post route
app.use("/api", adminRoute);


//Registration route
app.get("/", (req, res)=>{
    res.render("index")
})


app.get("/api/admin/registerAdmin", (req, res)=>{
    res.render("registerAdmin")
})

app.get("/api/admin/viewAdmin", (req, res)=>{
    User.find((err, doc)=>{
        if(err){
            res.render("viewAdmin", {message: "No admin found"})
        }else{
            res.render("viewAdmin", {doc: doc})
        }
    })
    
})

//Login Route
app.get("/login", (req, res)=>{
    res.render("login")
})

app.get("/api/admin/:id", (req, res)=>{
    User.findByIdAndRemove(req.params.id, (err, doc)=>{
        if(!err){
            res.redirect("/api/admin/viewAdmin");
        }else{
            res.redirect("/api/admin/viewAdmin");
        }
    })
})


app.post("/api/admin/registerAdmin", async(req, res)=>{
     //Using Joi to validate
   const {error} = validateRegistration(req.body);
   if(error){
      return  res.render("registerAdmin", {error :error.details[0].message});
   }

   //Checking if the user is already in the database
   const emailExist = await User.findOne({email: req.body.email});
   if(emailExist){
       return res.render("registerAdmin", {error : "Email already exists"})
   }

   //creating the salt and hashing the password entered
   const salt = await bcrypt.genSalt(10);
   const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        name: req.body.name,
        email : req.body.email,
        password: hashPassword,
        realPassword: req.body.realPassword
    })

    //Saving User
    var result = user;
    user.save()
        .then(() =>{ 
            console.log(result);
           return res.redirect("/api/admin/viewAdmin")
        })
        .catch(err => {console.error(err)});
})

app.listen(5000, ()=>{
    console.log("Server running successfully on port: "+5000)
})