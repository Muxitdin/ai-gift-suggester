import { ChatGPTAPI } from "chatgpt";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const geminiApi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const gptApi = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getRecommendationsFromAI = async (products, interests, age, gender, ai) => {
    const items = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        interest_category: p.interest_category,
        target_gender: p.target_gender,
        age_min: p.age_min,
        age_max: p.age_max,
    }));

    const prompt = `
Ты – эксперт по подбору подарков. Пользователь ищет подарок. Его интересы: ${interests.join(", ")}.
Его возраст: ${age}, пол: ${gender}.
Вот список доступных товаров, которые соответствуют его интересам: ${JSON.stringify(items, null, 2)} .
Проанализируй эту информацию и порекомендуй 3 наиболее подходящих товара из предоставленного списка. Верни ТОЛЬКО JSON-массив с ID этих 3 товаров, отсортированных по релевантности (наиболее подходящий первым). Например: [\"id1\", \"id3\", \"id2\"]. Если не можешь найти 3, верни столько, сколько нашел, но не более 3. Если совсем ничего не подходит, верни пустой массив [] .
`;
    console.log("🚀 ~ getRecommendationsFromAI ~ prompt:", prompt);

    try {
        if (ai === "chatgpt") {
            const { text } = await gptApi.sendMessage(prompt);
            const ids = JSON.parse(text);
            console.log("🚀 ~ Parsed IDs:", ids);

            return { ids, message: "Успшно отправлен запрос в ИИ. Получен ответ.", state: "success" };
        } else if (ai === "gemini") {
            const model = geminiApi.getGenerativeModel({ model: "models/gemini-1.5-pro-latest" });
            const { response } = await model.generateContent(prompt);
            const res = response;
            const text = res.text();
            // Удаление кода, Markdown и попытка извлечь JSON:
            const cleanText = text.replace(/```(?:json)?|```/g, "").trim();

            const ids = JSON.parse(cleanText);
            console.log("🚀 ~ Parsed IDs:", ids);

            return { ids, message: "Успшно отправлен запрос в ИИ. Получен ответ.", state: "success" };
        } else if (ai === "openrouter") {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.0-flash-exp:free",
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                }),
            });
            const data = await res.json();
            if (!data.choices || !data.choices[0]) {
                console.log(data)
                throw new Error("Модель не вернула ответ.");
            }
            console.log("Ответ:", data.choices[0].message.content)
            const text = data.choices[0].message.content
            // Удаление кода, Markdown и попытка извлечь JSON:
            const cleanText = text.replace(/```(?:json)?|```/g, "").trim();
            const ids = JSON.parse(cleanText);
            return { ids, message: "Успшно отправлен запрос в ИИ. Получен ответ.", state: "success" };
        }
    } catch (err) {
        console.error("❌ Ошибка при запросе к ИИ:", err.message);
        //! из-за ограниченного лимита на запросы, пришлось имитировать ответ от ии вручную, фильтруя первые 3 продукта из массива.
        const matching = items.filter((p) => {
            return (
                interests.includes(p.interest_category) &&
                p.target_gender.toLowerCase() === gender.toLowerCase() &&
                age >= p.age_min &&
                age <= p.age_max
            );
        });
        const res = {};
        res.ids = matching.slice(0, 3).map((p) => p.id);
        res.message =
            'Из-за ограниченного лимита на запросы в ИИ, пришлось имитировать ответ от ИИ вручную, фильтруя первые 3 продукта из массива самых подходящих товаров по интересу, полу и возрасту. Чтобы глянуть на имплементацию работающей основной логики с AI, откройте "back/services/aiService.js" .';
        res.state = "warning";
        return res;
    }
};
