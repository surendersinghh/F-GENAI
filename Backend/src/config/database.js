const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to Database.");

    } catch (err) {
        console.log("Database failed to connect.");
        console.log(err);
    }
}

module.exports = connectToDB;