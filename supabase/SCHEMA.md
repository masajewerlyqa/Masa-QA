# MASA Database Schema – Table Overview

This document briefly describes each table in the MASA Supabase schema. The schema is applied via `supabase/migrations/001_masa_schema.sql`.

---

## Core identity & access

### `profiles`
**Purpose:** Extends Supabase `auth.users`. One row per user; stores display name, avatar, and **role** (`admin`, `seller`, `customer`). The MASA manager (and app logic) uses role to control access.  
**Key fields:** `id` (FK to `auth.users`), `role`, `full_name`, `avatar_url`, `email`, `phone`.  
**Note:** A trigger creates a profile on signup; the first admin must be set manually (e.g. `UPDATE profiles SET role = 'admin' WHERE email = '...'`).

---

## Seller onboarding

### `seller_applications`
**Purpose:** Applications to become a seller. A user submits one application; an admin approves or rejects it. Only approved users can create or join stores.  
**Key fields:** `user_id`, `status` (`pending` | `approved` | `rejected`), `business_name`, `contact_email`, `reviewed_by`, `reviewed_at`, `review_notes`.  
**Business rule:** One application per user (`UNIQUE (user_id)`).

---

## Stores & membership

### `stores`
**Purpose:** A store is owned by an approved seller and contains products. Public store page is identified by `slug`.  
**Key fields:** `owner_id` (profile), `name`, `slug` (unique), `description`, `logo_url`, `banner_url`, `status` (`active` | `suspended` | `closed`).

### `store_members`
**Purpose:** Many-to-many between users and stores. Allows multiple sellers per store with roles: `owner`, `manager`, `member`. The store’s `owner_id` is the main owner; additional members are listed here.  
**Key fields:** `store_id`, `user_id`, `role`, `joined_at`.  
**Constraint:** One membership per user per store (`UNIQUE (store_id, user_id)`).

---

## Catalog

### `products`
**Purpose:** Products belong to a store. Slug is unique per store. Price and stock are stored here; status controls visibility (e.g. draft vs active).  
**Key fields:** `store_id`, `name`, `slug`, `description`, `price`, `compare_at_price`, `sku`, `stock_quantity`, `status` (`draft` | `active` | `archived` | `out_of_stock`).  
**Constraint:** `UNIQUE (store_id, slug)`.

### `product_images`
**Purpose:** Images for a product (e.g. URLs from Supabase Storage). `sort_order` defines display order.  
**Key fields:** `product_id`, `url`, `alt`, `sort_order`.

---

## Orders

### `orders`
**Purpose:** Customer orders. One order can contain items from multiple stores. Stores totals and shipping/billing address (e.g. JSONB).  
**Key fields:** `customer_id`, `status` (e.g. `pending` → `confirmed` → `processing` → `shipped` → `delivered` or `cancelled`), `subtotal`, `shipping_cost`, `tax`, `total`, `shipping_address`, `billing_address`, `notes`.

### `order_items`
**Purpose:** Line items of an order. Stores quantity and **price snapshot** at order time (`unit_price`, `total_price`) so history is correct if product price changes.  
**Key fields:** `order_id`, `product_id`, `quantity`, `unit_price`, `total_price`.  
**Constraint:** One row per product per order (`UNIQUE (order_id, product_id)`).

---

## Reviews & wishlists

### `reviews`
**Purpose:** Customer reviews for products. One review per customer per product. Optional moderation via `status` (`pending` | `approved` | `rejected`).  
**Key fields:** `product_id`, `customer_id`, `rating` (1–5), `title`, `body`, `status`.

### `wishlists`
**Purpose:** One wishlist per customer (e.g. for “My wishlist” page).  
**Key fields:** `user_id` (unique).

### `wishlist_items`
**Purpose:** Products in a wishlist.  
**Key fields:** `wishlist_id`, `product_id`, `added_at`.  
**Constraint:** One row per product per wishlist (`UNIQUE (wishlist_id, product_id)`).

---

## Notifications & analytics

### `notifications`
**Purpose:** In-app notifications for users (e.g. application approved/rejected, order shipped).  
**Key fields:** `user_id`, `type`, `title`, `body`, `data` (JSONB), `read_at`, `created_at`.

### `analytics_events`
**Purpose:** Event stream for analytics (page views, product views, add to cart, etc.). Can be anonymous (e.g. `session_id`) or tied to `user_id`.  
**Key fields:** `event_type`, `user_id`, `session_id`, `entity_type`, `entity_id`, `payload` (JSONB), `created_at`.

---

## Summary

| Table               | Purpose in one line                                        |
|---------------------|------------------------------------------------------------|
| `profiles`          | User profile and role (admin / seller / customer).         |
| `seller_applications` | Seller applications; admin approves/rejects.            |
| `stores`            | Stores owned by approved sellers.                          |
| `store_members`     | Which sellers belong to which stores (and their role).     |
| `products`          | Products belonging to a store.                             |
| `product_images`    | Images for a product.                                      |
| `orders`            | Customer orders (totals, status, addresses).              |
| `order_items`       | Order line items with price snapshot.                      |
| `reviews`           | Customer reviews for products.                             |
| `wishlists`         | One wishlist per customer.                                 |
| `wishlist_items`    | Products in a wishlist.                                    |
| `notifications`     | In-app notifications per user.                             |
| `analytics_events`  | Event log for analytics.                                   |
