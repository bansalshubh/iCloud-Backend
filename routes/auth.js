const express = require("express");
const User = require("../models/Users");
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require('jsonwebtoken');

//middlewares
const fetchuser = require("../middleware/fetchuser")

//Secret Key
const JWT_SECRET = "Hellomydearfriendshowdoyoudo";


//creating a new user and handling user authentication POST : /api/auth
router.post('/createuser', [
    body('email', "Enter a valid email").isEmail(),     // using express validation to validate credentials
    body('name', "Enter a valid name").isLength({ min: 3 }),
    body('password', "Password must be of 8 characters").isLength({ min: 8 }),
    body('contact', "Enter a valid Phone Number").isMobilePhone()
], async (req, res) => {
    // If there are error in validation check return error and bad request
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success:success,message: errors.array()[0].msg });
    }
    // const user = User(req.body);
    // user.save();
    // obj = {
    //     name:"Shubham",
    //     age:18
    // }
    // res.json(user)`
    try {

        // Checking user with same email already exists or not
        let user = await User.findOne({ email: req.body.email });
        // console.log(user)
        if (user) {
            return res.status(401).json({ success:success,message: "Sorry a user with this email already exist" });
        }

        //  Creating new user 
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
            contact: req.body.contact
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.status(200).json({success, authtoken });
    }
    catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success, message: "Internal Server Error" });
    }
});


//login a user or authenticate s user POST : api/auth/login
router.post('/loginuser', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "Password must be of 8 characters").isLength({ min: 8 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success:success, message: errors.array()[0].msg });
    }
    let { email, password } = req.body;
    try {
        let user = await User.findOne({ email: email });
        if (!user) {
            res.status(400).json({
                success:success,
                message: "Please enter correct login credentials"
            });
        }
        let checkPass = await bcrypt.compare(password, user.password);
        if (!checkPass) {
            res.status(400).json({
                success:success,
                message: "Please enter correct login credentials"
            });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success, authtoken });
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success, message: "Some error occured" });
    }
});


// get user data of logged in user POST request :: /api/auth/getuser
router.post('/getuser',fetchuser, async (req,res)=>{
    let success = false;
    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        success = true;
        // console.log(user);
        res.json({success,user});
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success, error: "Some error occured" });
    }
});

module.exports = router;