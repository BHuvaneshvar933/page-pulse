import express from "express";
import cors from "cors";

import apiRoutes from "./routes/api.routes.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Page Pulse API is running.",
        timestamp: new Date().toISOString(),
    });
});

// API Routes

app.use("/api", apiRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "The requested endpoint does not exist.",
        },
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

export default app;