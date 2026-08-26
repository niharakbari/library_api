const express = require("express");

const authRoutes = require('./routes/authRoutes');

const bookRoutes = require('./routes/bookRoutes');

const importRoutes = require('./routes/bookImportRoutes');

const dashboardRoutes = require('./routes/dashboardRoutes');

const inventoryRoutes = require('./routes/inventoryRoutes');

const dataQualityRoutes = require(`./routes/dataQualityRoutes`);

const reportRoutes = require('./routes/reportRoutes');

const exportRoutes = require('./routes/exportRoutes');

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

app.use("/api/books", bookRoutes);

app.use("/api/books/import", importRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/inventory/search", inventoryRoutes);

app.use("/api/data-quality", dataQualityRoutes);

app.use("/api/advanced", reportRoutes);

app.use('/api/export', exportRoutes);


app.use(globalErrorHandler);


module.exports = app;