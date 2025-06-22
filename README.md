
# CineMAK

> **Experience Cinema. Redefined**

CineMAK is an end-to-end movie reservation system built as a semester project for the **Database Management Systems** course. Architected and developed by **Abdullah Iqbal**, with support from teammates Areeb Zahra and Khadija Asim. Special thanks to our instructor **Muhammad Kamran** for his guidance.

---

## 🚀 Features

- **Admin Dashboard**  
  - Create, Read, Update, Delete (CRUD) endpoints for Movies & Showtimes  
  - Configurable theatre seating layouts stored in a normalized SQL schema  
  - Real-time booking analytics via indexed views and optimized queries  

- **Consumer Portal**  
  - Responsive UI for browsing titles and showtimes  
  - Seat-locking concurrency mechanism to prevent double-bookings  
  - One-page secure checkout with transaction management  

- **Backend & Database**  
  - Node.js + Express server with modular route handlers and middleware  
  - Microsoft SQL Server (Windows Authentication on `ABDULLAHSLAPTOP\SQLEXPRESS01`) with tables for Users, Movies, Showtimes, Seats, Reservations & Feedback  
  - Stored procedures and parameterized queries for data integrity and performance  

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express  
- **Frontend:** React (Create React App or similar)  
- **Database:** Microsoft SQL Server  
- **Query Driver:** `mssql` (or any preferred SQL driver)  
- **Version Control:** Git & GitHub  

---

## 📦 Installation & Setup

1. **Clone the repo**  
   ```bash
   git clone https://github.com/YourUsername/CineMAK.git
   cd CineMAK
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   * Copy `.env.example` to `.env`
   * Set your SQL Server connection string:

     ```ini
     DB_HOST=ABDULLAHSLAPTOP\SQLEXPRESS01
     DB_NAME=project
     DB_USER=YOUR_USERNAME   # if using SQL Authentication
     DB_PASS=YOUR_PASSWORD
     ```
   * If using Windows Authentication, adjust driver options in your code accordingly.

4. **Initialize the database**

   * Create a database named `project` in SQL Server.
   * Run the SQL scripts in the `server/db/` folder to create tables, relationships, stored procedures, and seed data.

5. **Start the application**

   ```bash
   npm run dev   # for development
   # or
   npm start     # for production
   ```

6. **Access the app**

   * Admin interface: `http://localhost:3000/admin`
   * Consumer interface: `http://localhost:3000/`

---

## 📁 Project Structure

```
CineMAK/
├── server/             # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── db/             # SQL scripts & migrations
│   └── server.js
├── client/             # React frontend (if separate)
├── .env.example
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add YourFeature"`)
4. Push to your branch (`git push origin feature/YourFeature`)
5. Open a Pull Request with a clear description of your changes

---

## 🏆 Acknowledgements

* **Instructor:** Muhammad Kamran
* **Team Support:** Areeb Zahra, Khadija Asim

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

```
```
