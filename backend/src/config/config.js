import dotenv from "dotenv";

dotenv.config();

const config = {
    port: Number(process.env.PORT) || 5000,

    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 10000,

    nodeEnv: process.env.NODE_ENV || "development",
};

export default Object.freeze(config);