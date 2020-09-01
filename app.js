const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const bodyparser = require("body-parser");
//Importing User model
const User = require("./model/User");
//Importing Courier model
const Courier = require("./model/Courier")
const {validateRegistration, validateLogin} = require("./validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser");
//Use of cookies
app.use(cookieParser());

//Middleware to verify token
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
app.get("/",verify, (req, res)=>{
    res.render("index")
})

//Get Details about a delivery
app.get("/track", (req, res)=>{
    Courier.find({p_id: req.body.id}, (err, doc)=>{
        if(err){
            res.send("No information about such package");
        }else{
            res.render("customerPackage",{courier: doc})
        }
    })
})

app.get("/api/admin/registerAdmin", verify, (req, res)=>{
    res.render("registerAdmin")
})

app.get("/api/admin/viewAdmin", verify, (req, res)=>{
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

app.get("/logout", (req, res)=>{
    res.cookie("auth", "");
    res.render("login")
})

app.get("/register", verify, (req, res)=>{
    res.render("registerSuperAdmin")
})

//to delete an admin
app.get("/api/admin/:id", verify, (req, res)=>{
    User.findByIdAndRemove(req.params.id, (err, doc)=>{
        if(!err){
            res.redirect("/api/admin/viewAdmin");
        }else{
            res.redirect("/api/admin/viewAdmin");
        }
    })
})

app.get("/api/package", verify, (req, res)=>{
    Courier.find((err, doc)=>{
        if(!err){
            res.render("package", {courier: doc})
        }else{
            res.render("package", {message: "Error, No courier gotten"})
        }
    })  
})

app.get("*", (req, res)=>{
    res.send("<h1> 404 Error. Page Does not exist </h1>")
})
//Register an admin
app.post("/api/admin/registerAdmin", verify, async(req, res)=>{
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

app.listen(process.env.PORT || 5000, ()=>{
    console.log("Server running successfully on port: "+5000)
})
