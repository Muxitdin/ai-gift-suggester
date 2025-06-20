import express from "express";
import cors from "cors";
import Product from "../models/Product.js";
import giftRoutes from "../routes/giftRoutes.js";
import { importProducts } from "../scripts/importProducts.js";
import { runParser } from "../scripts/parseProducts.js";

const app = express();

export default async function startApp() {
    app.use(cors());
    app.use(express.json());

    app.get("/", (req, res) => {
        res.send("API is running...");
    });
    app.use("/api", giftRoutes);

    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const products = [];

            if (process.env.USE_PARSER === "true") {
                console.log("БД пуста. Запускаем парсер...");
                products = await runParser();
            } else {
                products = await importProducts();
            }

            await Product.insertMany(products);
            console.log(`Импортировано ${products.length} товаров в MongoDB`);

            console.log("База товаров заполнена");
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`http://localhost:${PORT}/`));
    } catch (error) {
        console.error("Ошибка при запуске сервера: ", error);
        process.exit(1);
    }
}
