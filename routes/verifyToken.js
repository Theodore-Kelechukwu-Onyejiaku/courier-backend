//This is a middleware that we add to any private 
//route to check if there is any token or valid token

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next){
    //Check if the token is in the header
    const token = req.header("auth-token");
    if(!token) return res.status(401).send("Access Denied!")

    //Verify the token
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified
        next();
    }catch(err){
        res.status(400).send("Invalid Token")
    }
}