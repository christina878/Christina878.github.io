# Book Finder Web App

This project is a simple web application that allows users to search for books, view book details, and save favorite books. It uses the **Open Library API** to retrieve book information such as titles, authors, covers, and descriptions.

This project was built using **HTML**, **Bootstrap**, and **JavaScript** only (no backend).

---

## 📌 Features

### 1. Home Page
- Display of recent/new books from the Open Library API.
- Each book is clickable and leads to a detailed view.
- Search bar with instant results.

### 2. Book Search
- Searches books by title using the Open Library Search API.
- Shows:
  - Book cover  
  - Title  
  - Author  
  - First publication year  
- Buttons for:
  - View Details  
  - Add to Favorites  

### 3. Book Details Page
- Displays:
  - Book cover  
  - Title  
  - Author  
  - Year  
  - Summary (when available)  
  - Book Type (based on subjects from API)  
- Includes:
  - Back button  
  - Add to Favorites button  

### 4. Favorites Page
- Stores favorite books using **localStorage**.
- Displays favorite books with covers.
- Books are clickable to open their details page.
- Ability to remove books from favorites.

---

## 📌 API Endpoints Used

### **1. Search API**
