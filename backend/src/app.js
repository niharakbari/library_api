const express = require("express");

const authRoutes = require('./routes/authRoutes');

const bookRoutes = require('./routes/bookRoutes');

const cookieParser = require("cookie-parser");
const cors = require("cors");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


    
app.use("/auth", authRoutes);

app.use("/api/books", bookRoutes)



app.use(globalErrorHandler);


module.exports = app;