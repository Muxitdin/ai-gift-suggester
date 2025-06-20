// import axios from "axios";
// import * as cheerio from "cheerio";
// import { v4 as uuidv4 } from "uuid";

// const parseProductsFromCategory = async (categoryUrl, categoryName) => {
//     try {
//         const { data } = await axios.get(categoryUrl, {
//             headers: {
//                 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:139.0) Gecko/20100101 Firefox/139.0",
//             },
//         });
//         console.log("🚀 ~ parseProductsFromCategory ~ data:", data);

//         const $ = cheerio.load(data);

//         const products = [];
//         console.log("🚀 ~ parseProductsFromCategory ~ products:", products);

//         $(".ui-card").each((i, el) => {
//             if (products.length >= 25) return;

//             const name = $(el).find("#text__product-name").text().trim();
//             const price = $(el).find(".actual-price").text().trim().toString() || null;
//             const imageUrl = $(el).find(".main-card-icon-and-classname-collision-made-to-minimum").attr("src") || "";

//             const randomizer = (key) => {
//                 let result = null;
//                 switch (key) {
//                     case "gender":
//                         result = Math.random() < 0.5 ? "male" : "female";
//                         break;
//                     case "age":
//                         const ageRanges = [
//                             { min: 12, max: 18 },
//                             { min: 18, max: 30 },
//                             { min: 30, max: 45 },
//                             { min: 45, max: 60 },
//                         ];
//                         return ageRanges[Math.floor(Math.random() * ageRanges.length)];
//                     default:
//                         return null;
//                 }
//             };

//             if (name) {
//                 const { min: age_min, max: age_max } = randomizer("age");
//                 products.push({
//                     id: uuidv4(),
//                     name,
//                     interest_category: categoryName,
//                     target_gender: randomizer("gender"),
//                     price,
//                     age_min,
//                     age_max,
//                     imageUrl,
//                 });
//             }
//         });

//         return products;
//     } catch (error) {
//         console.error(`Ошибка при парсинге категории ${categoryName}:`, error.message);
//         return [];
//     }
// };

// const CATEGORIES = [
//     { name: "красота и здоровье", url: "https://aliexpress.ru/category/16/beauty-health.html" },
//     { name: "электроника", url: "https://aliexpress.ru/category/15/electronics.html" },
//     { name: "спорт и развлечения", url: "https://aliexpress.ru/category/7/sports-entertainment.html" },
//     { name: "дом, сад и офис", url: "https://aliexpress.ru/category/6/home-garden-office.html" },
// ];
import puppeteer from "puppeteer";

const CATEGORIES = [
    { name: "красота и уход", url: "https://uzum.uz/ru/category/krasota-i-ukhod-10012" },
    { name: "электроника", url: "https://uzum.uz/ru/category/aksessuary-dlya-elektroniki-10020" },
    { name: "спорт и отдых", url: "https://uzum.uz/ru/category/sport-i-otdykh-10015" },
    { name: "товары для дома", url: "https://uzum.uz/ru/category/tovary-dlya-doma-10018" },
];

export const parseProductsFromCategory = async (categoryUrl, categoryName) => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(categoryUrl, {
        waitUntil: "networkidle2",
    });

    // Ждём рендеринга элементов
    await page.waitForSelector(".ui-card", { timeout: 10000 }).catch(() => {});
    console.log("~ parseProductsFromCategory ~ page:", page)
    
    const products = await page.evaluate((categoryName) => {
        const productElements = document.querySelectorAll(".ui-card");
        const results = [];

        const getRandom = (key) => {
            if (key === "gender") return Math.random() < 0.5 ? "male" : "female";
            if (key === "age") {
                const ranges = [
                    { min: 12, max: 18 },
                    { min: 18, max: 30 },
                    { min: 30, max: 45 },
                    { min: 45, max: 60 },
                ];
                return ranges[Math.floor(Math.random() * ranges.length)];
            }
        };

        for (let i = 0; i < productElements.length && results.length < 25; i++) {
            const el = productElements[i];

            const name = el.querySelector("#text__product-name")?.textContent.trim() || "";
            const price = el.querySelector(".actual-price")?.textContent.trim() || "";
            const imageUrl = el.querySelector("img")?.src || "";

            if (name) {
                const age = getRandom("age");
                results.push({
                    id: crypto.randomUUID(),
                    name,
                    interest_category: categoryName,
                    target_gender: getRandom("gender"),
                    price,
                    age_min: age.min,
                    age_max: age.max,
                    imageUrl,
                });
            }
        }

        return results;
    }, categoryName);

    await browser.close();
    console.log(`Спарсили ${products.length} товаров из ${categoryName}`);
    return products;
};

export const runParser = async () => {
    let allProducts = [];

    for (const cat of CATEGORIES) {
        const products = await parseProductsFromCategory(cat.url, cat.name);
        allProducts = allProducts.concat(products);
    }

    console.log(`Получено товаров: ${allProducts.length}`);
    console.log(allProducts.slice(0, 5)); // Показываем первые 5

    return allProducts;
};
