import fs from "fs/promises";
import path from "path";
import Product from "../models/Product.js";

export const importProducts = async () => {
    const ageRanges = [
        { min: 12, max: 18 },
        { min: 18, max: 30 },
        { min: 30, max: 45 },
        { min: 45, max: 60 },
    ];

    try {
        const filePath = path.resolve("products.json");
        const jsonData = await fs.readFile(filePath, "utf-8");
        const products = JSON.parse(jsonData);

        const updatedProducts = products.map((product) => {
            const randomAge = ageRanges[Math.floor(Math.random() * ageRanges.length)];
            return {
                ...product,
                age_min: randomAge.min,
                age_max: randomAge.max,
            };
        });
        console.log("~ updatedProducts ~ updatedProducts:", updatedProducts.slice(0, 5))

        // Очистка старых данных
        await Product.deleteMany({});
        return updatedProducts;
    } catch (err) {
        console.error("Ошибка импорта:", err);
    }
};
