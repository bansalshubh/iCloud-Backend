const db = require("mongoose");


const connectionString = "mongodb://localhost:27017/iclouddb?readPreference=primary&appname=MongoDB%20Compass&ssl=false"; 

const connectToMongo = async()=>{
    await db.connect(connectionString)
    console.log("Connected to Mongo Successfully");
};

module.exports = connectToMongo;