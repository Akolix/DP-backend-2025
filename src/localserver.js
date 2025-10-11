import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Ajv from "ajv";
import { Builder, parseStringPromise } from "xml2js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import foodSchema from "./schemas/foods.schema.json" with { type: "json" };

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for local testing
const localFoods = {};

app.use(
    cors({
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Ajv JSON validator
const ajv = new Ajv();
const validateFood = ajv.compile(foodSchema);

// --- Helper functions ---
function sanitizeNutriments(product) {
    const n = product.nutriments || {};
    const parseValue = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    };

    return {
        product_name: product.product_name || "Unknown",
        energy_kcal: parseValue(n["energy-kcal_100g"]),
        protein: parseValue(n["proteins_100g"]),
        carbohydrates: parseValue(n["carbohydrates_100g"]),
        sugars: parseValue(n["sugars_100g"]),
        fat: parseValue(n["fat_100g"]),
        saturated_fat: parseValue(n["saturated-fat_100g"]),
        salt: parseValue(n["salt_100g"]),
        fiber: parseValue(n["fiber_100g"] || n["fibers_100g"]),
    };
}

// --- Routes ---

// JSON lookup endpoint
app.get("/foods/:barcode", async (req, res) => {
    try {
        const { barcode } = req.params;
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

        const { data } = await axios.get(url);
        if (!data || data.status === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = sanitizeNutriments(data.product);

        if (!validateFood(product)) {
            return res.status(400).json({ error: "Invalid JSON", details: validateFood.errors });
        }

        // Store in local in-memory object
        localFoods[barcode] = product;

        res.json({ barcode, ...product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// XML endpoint
app.get("/foods/:barcode/xml", async (req, res) => {
    try {
        const { barcode } = req.params;

        const { data, error } = await supabase
            .from("foods")
            .select("*")
            .eq("barcode", barcode)
            .single();

        if (error || !data) return res.status(404).send("Not found");

        const builder = new Builder({ rootName: "food", headless: true });
        const xml = builder.buildObject(data);

        await parseStringPromise(xml);

        res.type("application/xml").send(xml);
    } catch (err) {
        console.error(err);
        res.status(400).send("Invalid XML: " + err.message);
    }
});

// List all foods (JSON)
app.get("/foods", (req, res) => {
    const allFoods = Object.entries(localFoods).map(([barcode, data]) => ({
        barcode,
        ...data,
    }));
    res.json(allFoods);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});