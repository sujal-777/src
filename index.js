import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"


dotenv.config({
    path: "./env"  // Ensure the path to your .env file is correct
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed", err);
    });








    

/*
// Uncommented code example
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        app.on("error", (error) => {
            console.log("Cannot communicate with Express", error);
            throw error;
        });

        app.listen(process.env.PORT || 8000, () => {
            console.log(`App is listening on port ${process.env.PORT || 8000}`);
        });
    } catch (error) {
        console.error("ERROR:", error);
        throw error;
    }
})();

*/
