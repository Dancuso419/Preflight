import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reviewRouter from "./routes/review";
import mintRouter from "./routes/mint";
import attestationRouter from "./routes/attestation";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/review", reviewRouter);
app.use("/api/mint", mintRouter);
app.use("/api/attestation", attestationRouter);

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`PreFlight server on :${PORT}`));
