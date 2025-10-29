# API Requirements
The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as data shapes the frontend and backend have agreed meet the requirements of the application. 


- **GET** `/` — Service health (returns "server is running")

### Products
- **GET** `/products` — List all products
- **GET** `/products/:id` — Get a single product by **id**
- **POST** `/products` — Create a product (requires token)

### Users
- **POST** `/users` — Register (create) a user; returns JWT
- **POST** `/users/authenticate` — Login; returns JWT
- **GET** `/users` — List all users (requires token)
- **GET** `/users/:id` — Get a single user by **id** (requires token)

### Orders
- **POST** `/orders` — Create an order (requires Bearer token)
- **POST** `/orders/:id/products` — Add a product to an order (body: `product_id`, `quantity`) (requires token)
- **GET** `/users/:id/orders/current` — Get the current active order for a user (requires token)


## Data Shapes

## Products

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name  TEXT    NOT NULL,
    price NUMERIC NOT NULL
);

## Users

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50), 
    last_name VARCHAR(50), 
    password VARCHAR(150)
    );

## Orders

CREATE TABLE orders (
    id SERIAL PRIMARY KEY, 
    user_id INTEGER NOT NULL REFERENCES users(id), 
    status VARCHAR(50) NOT NULL
    );

## Order_items

CREATE TABLE order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id), 
    product_id INTEGER NOT NULL REFERENCES products(id), 
    quantity INTEGER NOT NULL, 
    PRIMARY KEY (order_id, product_id)
    );
