# Data Processing API – 2025

A RESTful API built for the **Data Processing** course.  
This project demonstrates how to process, validate, and serve live data from external APIs (such as **OpenFoodFacts**) in both **JSON** and **XML** formats, with schema validation, persistent storage using **Supabase**.

---

## Overview

This backend provides endpoints to:
- Fetch and normalize nutritional data from the OpenFoodFacts public API.
- Validate incoming data using JSON Schema and XSD.
- Store validated data in a Supabase PostgreSQL database.
- Serve data in JSON or XML formats.
- Be consumed by an Angular front-end for data visualization.

---

## Tech Stack

Runtime: Node.js (JavaScript, ES Modules)  
Framework: Express.js  
Database: Supabase (PostgreSQL)  
Validation: Ajv (JSON Schema) & libxmljs (XML XSD)  
Docs: Swagger (OpenAPI 3)   
CORS: Enabled for localhost:4200
---

## Setup & Installation

### 1. Clone the repo

### 2. Install dependencies in both front end and back end
```bash
cd frontend
npm install

cd backend
npm install
```

---

## Running the project

Start the backend server:
```bash
cd backend
npm start
```

Start the frontend server:
```bash
cd frontend
npm start
```

The frontend can now be visited on http://localhost:4200/dashboard

Swagger docs:  
http://localhost:3000/api-docs (TODO)

---

## Validation

- JSON Schema validation ensures incoming product data matches the expected format before being stored.  
- XML validation uses an XSD file to ensure exported XML is structured correctly.  

Schemas are defined in `/utils/jsonSchema.js` and `/utils/xmlSchema.xsd`.

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


