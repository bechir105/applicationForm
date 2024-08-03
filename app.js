const express = require("express");
const connectDB = require("./config/db");

const app = express();
connectDB();
app.use(express.json({ extended: false }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api", require("./routes/applicationRoutes"));
app.use("/api", require("./routes/formRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
