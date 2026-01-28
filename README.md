# 💸 Feezy

**Feezy** is a modern commission and payment tracking platform built to help individuals and small businesses **manage commissions, settlements, and pending balances with complete clarity**.

🔗 **Live Demo**
👉 [https://commission-clarity.vercel.app/](https://commission-clarity.vercel.app/)

## ✨ What is Feezy?

Managing commissions manually often leads to:

* Confusion between received vs pending money
* Incorrect monthly calculations
* No visibility into historical dues

**Feezy fixes this by providing:**

* Clear separation between **payments** and **settlements**
* Accurate commission calculations
* Real-time pending balance tracking
* Secure, user-specific data access

## 🚀 Core Features

### 📊 Dashboard

* **Total Commission** (all-time)
* **Total Received** settlements
* **Pending Amount** (auto-calculated)
* **This Month’s Earnings** (based on actual payment date)

### 💰 Payments

* Add payments with:

  * Client
  * Amount
  * Month paid for
  * Actual **payment date**
* Support for **previous pending / opening balance**
* Each payment is tied to the logged-in user

### 🤝 Settlements

* Record received settlements
* Automatically reduces pending balance
* Cleanly separated from payments for accuracy

### 🔐 Authentication & Data Security

* Supabase authentication
* Row Level Security (RLS)
* Users can only view & modify **their own data**

## 🛠️ Tech Stack

### Frontend

* **React + TypeScript**
* **Vite**
* **Tailwind CSS**
* **Framer Motion**
* **shadcn/ui**
* **Lucide Icons**

### Backend

* **Supabase**

  * PostgreSQL
  * Auth
  * RLS Policies
  * REST APIs

### Hosting

* **Vercel** (Frontend)
* **Supabase Free Tier** (Backend)

## 🧠 Architecture Highlights

* **Payment Date ≠ Created At**
  Analytics use `payment_date` for correct monthly insights.

* **Opening Balance Support**
  Previous pending commissions can be added without affecting analytics.

* **User-Centric Data Model**
  Every record is associated with a `user_id`.

## 🗄️ Database Schema (Simplified)

### Payments

* `client_id`
* `month_for`
* `amount`
* `payment_date`
* `user_id`
* `is_opening_balance`
* `status`

### Settlements

* `amount`
* `settlement_date`
* `user_id`

All tables are protected with **Row Level Security**.

## 🧪 Local Development

```bash
git clone https://github.com/your-username/feezy.git
cd feezy
npm install
npm run dev
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌱 Planned Enhancements

* Client-wise analytics
* Export reports (PDF / Excel)
* Advanced filters & insights
* Settlement-to-payment mapping
* Multi-currency support
* Admin dashboards

## 👨‍💻 Author

**Sohan**

Feezy was built as a **real-world financial tracking system**, focusing on:

* Proper data modeling
* Secure multi-user architecture
* Accurate financial calculations

## ⭐ Final Thoughts

Feezy is intentionally:

* **Simple**
* **Accurate**
* **Scalable**

It’s designed to solve a real problem, not to overcomplicate it.

