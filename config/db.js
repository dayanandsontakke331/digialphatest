const mongoose = require('mongoose');

const dbUrl = "mongodb://127.0.0.1:27017/digialpha";

mongoose.connect(dbUrl, {});

const connection = mongoose.connection;
connection.on('connected', ()=>{
    console.log("MongoDB is ready to use");
})

connection.on('error', (err)=> {
    console.log("MongoDB connection Error : ", err);
});

module.exports = connection;