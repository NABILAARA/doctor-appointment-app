const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");

dotenv.config();
connectToDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.listen(process.env.PORT || 8000, () => console.log("🚀 Server on port 8000"));
