import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Ajv from "ajv";
import { Builder } from "xml2js";
import libxml from "libxml-xsd";
import foodSchema from "./schemas/foods.schema.json" with { type: "json" };
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Ajv JSON validator
const ajv = new Ajv();
const validateFood = ajv.compile(foodSchema);

// Load XSD schema
const xsdSchema = libxml.parseFile("./schemas/food.xsd");

// Extract only the nutrition fields you want
function extractNutriments(product) {
    const n = product.nutriments || {};
    return {
        product_name: product.product_name || "Unknown",
        energy_kcal: n["energy-kcal_100g"] || null,
        protein: n["proteins_100g"] || null,
        carbohydrates: n["carbohydrates_100g"] || null,
        sugars: n["sugars_100g"] || null,
        fat: n["fat_100g"] || null,
        saturated_fat: n["saturated-fat_100g"] || null,
        salt: n["salt_100g"] || null,
    };
}

// JSON lookup endpoint
app.get("/foods/:barcode", async (req, res) => {
    try {
        const { barcode } = req.params;
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

        const { data } = await axios.get(url);
        if (!data || data.status === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = extractNutriments(data.product);

        // Validate JSON
        if (!validateFood(product)) {
            return res.status(400).json({ error: "Invalid JSON", details: validateFood.errors });
        }

        // Store in Supabase if not exists
        const { data: existing } = await supabase
            .from("foods")
            .select("id")
            .eq("barcode", barcode)
            .single();

        if (!existing) {
            await supabase.from("foods").insert([{ barcode, ...product }]);
        }

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

        // Fetch from Supabase
        const { data, error } = await supabase
            .from("foods")
            .select("*")
            .eq("barcode", barcode)
            .single();

        if (error || !data) return res.status(404).send("Not found");

        // Convert to XML
        const builder = new Builder({ rootName: "food", headless: true });
        const xml = builder.buildObject(data);

        // Validate XML
        xsdSchema.validate(xml, (err, validationErrors) => {
            if (validationErrors) {
                return res.status(400).send("Invalid XML: " + JSON.stringify(validationErrors));
            }
            res.type("application/xml").send(xml);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// List all foods (JSON only)
app.get("/foods", async (req, res) => {
    const { data, error } = await supabase.from("foods").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
