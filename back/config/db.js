import mongoose from "mongoose"
export default async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB подключен");
    } catch (err) {
        console.error("Ошибка подключения к MongoDB:", err.message);
        process.exit(1);
    }
};
