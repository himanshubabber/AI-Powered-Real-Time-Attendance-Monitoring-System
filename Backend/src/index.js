// 1. THIS MUST BE THE VERY FIRST LINE
// This special syntax forces .env to load immediately
import "dotenv/config"; 

import connectDB from "./db/index.js";
import { app } from './app.js';

// 2. CONNECT TO DATABASE
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
