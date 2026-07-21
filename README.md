# 🚀 Dynamic Pricing Engine

A full-stack web application that automates product pricing based on real-time business factors such as inventory levels, demand, and competitor pricing. The system provides intelligent pricing recommendations, maintains pricing history, and offers analytics through an interactive dashboard.

---

## 📌 Features

### 🛍️ Product Management

* Add new products
* View all products
* Update product details
* Delete products
* Categorize products

### 📦 Inventory Management

* Track available stock
* Update inventory levels
* Automatic pricing evaluation whenever inventory changes

### 💰 Competitor Pricing

* Store competitor prices manually
* Compare market prices
* Trigger dynamic pricing recommendations

### ⚡ Dynamic Pricing Engine

Rule-based pricing system that automatically generates recommendations based on:

* 📈 High Demand + Low Inventory → Increase price by **10%**
* 📉 Low Demand + High Inventory → Decrease price by **10%**
* 💵 Competitor Price Lower → Reduce price by **5%**
* 💲 Competitor Price Higher → Increase price by **3%**

### 🤖 AI Pricing Explanation

Provides human-readable explanations for each pricing recommendation to improve decision transparency.

### 📜 Pricing History

* Stores every pricing recommendation
* View historical pricing changes
* Tracks old price, recommended price, reason, and timestamp

### 📊 Dashboard & Analytics

* Product overview
* Inventory status
* Latest pricing recommendations
* Price comparison with competitors
* Pricing history

---

# 🏗️ System Architecture

```text
                +------------------+
                |   React Frontend |
                +---------+--------+
                          |
                    REST APIs
                          |
                +---------v--------+
                | Spring Boot API  |
                +---------+--------+
                          |
        ---------------------------------------
        |          |            |             |
   Products   Inventory   Competitor   Pricing Engine
                                   |
                                   |
                           Pricing History
                                   |
                              MongoDB Atlas
```

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios

## Backend

* Java 17
* Spring Boot
* Spring Data MongoDB
* Lombok
* Maven

## Database

* MongoDB Atlas

## Tools

* Git
* GitHub
* Postman
* VS Code

---

# 📂 Project Structure

```text
Dynamic-Pricing-Engine/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   ├── dto/
│   └── config/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── README.md
```

---

# 📡 API Endpoints

## Products

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /products      |
| GET    | /products/{id} |
| POST   | /products      |
| PUT    | /products/{id} |
| DELETE | /products/{id} |

---

## Inventory

| Method | Endpoint        |
| ------ | --------------- |
| GET    | /inventory      |
| GET    | /inventory/{id} |
| POST   | /inventory      |
| PUT    | /inventory/{id} |
| DELETE | /inventory/{id} |

---

## Competitor Pricing

| Method | Endpoint                |
| ------ | ----------------------- |
| GET    | /competitor-prices      |
| GET    | /competitor-prices/{id} |
| POST   | /competitor-prices      |
| PUT    | /competitor-prices/{id} |
| DELETE | /competitor-prices/{id} |

---

## Pricing Engine

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | /pricing/recommendation/{productId} |

---

## Pricing History

| Method | Endpoint                             |
| ------ | ------------------------------------ |
| GET    | /pricing-history                     |
| GET    | /pricing-history/product/{productId} |

---

## Dashboard

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /dashboard                |
| GET    | /dashboard-recommendation |

---

# ⚙️ Dynamic Pricing Workflow

```text
Product Created
       │
       ▼
Inventory Updated
       │
       ▼
Competitor Price Added
       │
       ▼
Pricing Engine Executes
       │
       ▼
Recommendation Generated
       │
       ▼
Pricing History Saved
       │
       ▼
Dashboard Updated
```
