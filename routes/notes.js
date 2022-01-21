const express = require("express");
const Note = require("../models/Notes");
const { body, validationResult } = require('express-validator');
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();

// Get all notes of a particular user login required   Get : /api/notes/fetchallnotes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        let notes = await Note.find({ user: req.user.id });
        res.status(200).send(notes);
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Add a new note Login required  POST : /api/notes/addnote
router.post('/addnote', fetchuser, [
    body('title', "Enter a valid title").isLength({ min: 3 }),
    body('description', "Description must be atleast 5 characters").isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success:success, message: errors.array()[0].msg });
    }
    let { title, description } = req.body;
    try {
        const note = await Note.create({
            title: title,
            description: description,
            user: req.user.id
        })
        success = true;
        res.status(200).json({success,note});
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success, message: "Internal Server Error" });
    }
})

// Update an existing note POST :/api/notes/updatenote
router.post('/updatenote/:id',fetchuser,async (req,res)=>{
    let {title,description} = req.body;
    let success = false;
    try {
        const newnote = {};
        if(title){newnote.title = title;}
        if(description){newnote.description=description;}
        let note = await Note.findById(req.params.id);
        if(!note){
            res.status(400).json({success:success,message:"Not Found"});
        }
        // console.log(note.user.toString());
        // console.log(req.user.id);
        if(note.user.toString() !== req.user.id){
            res.status(401).json({success:success,message:"Access Denied"});
        }
        note = await Note.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
        success = true;
        res.status(200).json({success,note});
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success,error:"Internal Setver Error"});
    }
})

// Endpoint for deleting the note DELETE request : /api/notes/deletenote  Login required
router.delete('/deletenote/:id',fetchuser,async (req,res)=>{
    let success = false;
    try {
        let note = await Note.findById(req.params.id);
        if(!note){
            res.status(400).json({success:success,message:"Not Found"});
        }
        if(note.user.toString() !== req.user.id){
            res.status(401).json({success:success,message:"Access Denied"});
        }
        note = await Note.findByIdAndDelete(req.params.id,);
        success = true;
        res.status(200).json({success:success,note:note});
    } catch (error) {
        // console.log(error.message);
        res.status(500).json({success:success,error:"Internal Server Error"});
    }
    
})

module.exports = router;