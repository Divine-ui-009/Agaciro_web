# Agaciro Backend API

Agaciro Backend API is a RESTful e-commerce backend built with :contentReference[oaicite:0]{index=0}, :contentReference[oaicite:1]{index=1}, :contentReference[oaicite:2]{index=2}, and :contentReference[oaicite:3]{index=3}. It provides secure user authentication, role-based authorization, product management, and order processing.

The system supports two user roles:

- **Admin** – Can manage products (create, update, delete) and view all orders.
- **Customer** – Can browse products and place orders.

---

## Features

### Authentication and Authorization
- User registration with encrypted passwords using :contentReference[oaicite:4]{index=4}
- User login with JWT token generation
- Role-based access control (Admin and Customer)
- Protected API routes

### Product Management
- Add new products (Admin only)
- View all products
- View a single product by ID
- Update product details (Admin only)
- Delete products (Admin only)

### Order Management
- Place orders
- Automatic stock quantity reduction after purchase
- Customers can view their own orders
- Admins can view all orders

### Database Integration
- MySQL database connection using :contentReference[oaicite:5]{index=5}
- Structured tables for users, products, and orders

---

## Technologies Used

- :contentReference[oaicite:6]{index=6}
- :contentReference[oaicite:7]{index=7}
- :contentReference[oaicite:8]{index=8}
- :contentReference[oaicite:9]{index=9}
- :contentReference[oaicite:10]{index=10}
- :contentReference[oaicite:11]{index=11}

---

## Project Structure

```text
Agaciro/
│── server.js
│── db.js
│── package.json
│── middleware/
│   ├── auth.js
│   └── role.js
