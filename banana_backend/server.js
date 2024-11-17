import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userAuthRoutes from "./routes/userAuthRoutes.js";
import connectDb from "./db.js";

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());
connectDb();

app.use("/api/auth", userAuthRoutes
);

app.listen(PORT, () => {
  console.log(`program listening ${PORT}`);
});

//0vrXHdXNXKGWjX10