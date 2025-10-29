# Data Processing API – 2025

A RESTful API built for the **Data Processing** course.  
This project demonstrates how to process, validate, and serve live data from external APIs (such as **OpenFoodFacts**) in both **JSON** and **XML** formats, with schema validation, persistent storage using **Supabase**, and auto-generated **Swagger** documentation.

---

## Overview

This backend provides endpoints to:
- Fetch and normalize nutritional data from the OpenFoodFacts public API.
- Validate incoming data using JSON Schema and XSD.
- Store validated data in a Supabase PostgreSQL database.
- Serve data in JSON or XML formats.
- Provide API documentation through Swagger UI.
- Be consumed by an Angular front-end for data visualization.

---

## Tech Stack

Runtime: Node.js (JavaScript, ES Modules)  
Framework: Express.js  
Database: Supabase (PostgreSQL)  
Validation: Ajv (JSON Schema) & libxmljs (XML XSD)  
Docs: Swagger (OpenAPI 3)  
Deployment: Render  
CORS: Enabled for localhost:4200 and Render frontend URLs

---

## Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/API-backend-DP2025.git
cd API-backend-DP2025
```

### 2. Install dependencies
```bash
npm install
```

---

## Running Locally

Start the backend server:
```bash
npm start
```

Open:  
http://localhost:3000

Swagger docs:  
http://localhost:3000/api-docs (TODO)

---

## Example Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| GET | /foods/:barcode | Get product by barcode (JSON format) |
| GET | /foods/:barcode/xml | Get product by barcode (XML format) |
| GET | /foods | Get all stored foods (JSON format) |

Example:
```
GET http://localhost:3000/foods/4056489680536
```

**Response (JSON):**
```json
{
  "barcode": "4056489680536",
  "product_name": "Gerookte kipfilet Zwagerman Vleeswaren",
  "nutritional_facts": {
    "energy_kcal": 108,
    "protein": 23.4,
    "carbohydrates": 1.2,
    "sugars": 0.9,
    "fat": 1.6,
    "saturated_fat": 0.3,
    "salt": 2.3
  }
}
```

---

## Validation

- JSON Schema validation ensures incoming product data matches the expected format before being stored.  
- XML validation uses an XSD file to ensure exported XML is structured correctly.  

Schemas are defined in `/utils/jsonSchema.js` and `/utils/xmlSchema.xsd`.

---

## Database Schema (Supabase)

```sql
create table public.foods (
  id bigint generated always as identity primary key,
  barcode text unique not null,
  product_name text not null,
  energy_kcal numeric,
  protein numeric,
  carbohydrates numeric,
  sugars numeric,
  fat numeric,
  saturated_fat numeric,
  salt numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## CORS Setup

CORS is enabled for:
- http://localhost:4200 (Angular dev server)
- https://your-frontend.onrender.com (Render production URL)

---

## Future Extensions

- Add OSRS Hiscore API integration.  
- Add comparison endpoints (e.g. compare two foods by protein content).  
- Add caching to reduce OpenFoodFacts API calls.  

---

## Author

**Ian Donker 4629981**  
Data Processing – Resit 2025  
Software Engineering Program

---

## License

MIT License © 2025

