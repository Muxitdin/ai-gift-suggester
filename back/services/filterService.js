import Product from "../models/Product.js";

export const filterProducts = async (interests, age, gender) => {
    return await Product.find({
        interest_category: { $in: interests },
        target_gender: gender,
        age_min: { $lte: age },
        age_max: { $gte: age },
    }).limit(5);
};
