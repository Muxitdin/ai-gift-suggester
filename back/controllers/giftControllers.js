import Product from "../models/Product.js";
import { filterProducts } from "../services/filterService.js";
import { getRecommendationsFromAI } from "../services/aiService.js";

export const recommendGift = async (req, res) => {
    try {
        const { interests: interest_category, age, gender: target_gender, ai } = req.body;

        if (!interest_category || !age || !target_gender) {
            return res.status(400).json({ error: "Не все данные переданы" });
        }

        const filtered = await filterProducts(interest_category, age, target_gender);
        if (filtered.length === 0) return res.json([]);

        const resObj = await getRecommendationsFromAI(filtered, interest_category, age, target_gender, ai);
        const recommended = await Product.find({ id: { $in: resObj.ids } });

        res.json({ data: recommended, message: resObj.message, status: resObj.state });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};
