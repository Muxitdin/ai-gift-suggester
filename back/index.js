import { config } from "dotenv";
import connectDB from "./config/db.js";
import startApp from './start/starter.js';

config();

const start = async () => {
    await connectDB();
    await startApp();
}
start();