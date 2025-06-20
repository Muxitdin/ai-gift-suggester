import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    id: String,
    name: String,
    price: String,
    interest_category: String,
    target_gender: String,
    age_min: Number,
    age_max: Number,
    imageUrl: String,
});

export default mongoose.model("Product", productSchema);
