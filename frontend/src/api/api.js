// src/api/api.js
import axios from "axios";

// Create an axios instance with the base URL from the .env file
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // e.g., http://localhost:3000
});

// =======================
// USER APIs
// =======================

// 1. Signup API
export const signupUser = async (userData) => {
  const response = await api.post("/api/users/signup", userData);
  return response.data;
};

// 2. Login API
export const loginUser = async (credentials) => {
  const response = await api.post("/api/users/login", credentials);
  return response.data;
};

// =======================
// RESERVATION APIs
// =======================

// 3. Get Full Reservation Details API (Admin)
export const getFullReservationDetails = async () => {
  const response = await api.get("/api/reservations/full-details");
  return response.data;
};

// 18. Get Reservations by Customer (Customer)
export const getReservationsByCustomer = async (customerID) => {
  const response = await api.get(`/api/reservations/customer/${customerID}`);
  return response.data;
};

// =======================
// MOVIE APIs
// =======================

// 4. Fetch and Insert Movie Details API (Admin)
//    This calls the OMDb API, extracts details (including posterUrl), inserts into the DB, and returns the movie object.
export const fetchMovieFromApi = async (title) => {
  const response = await api.get(
    `/api/movies/fromapi/${encodeURIComponent(title)}`
  );
  return response.data;
};

// 5. Get All Movies API (Admin & Customer)
export const getAllMovies = async () => {
  const response = await api.get("/api/movies");
  return response.data;
};

// 7. Get Movies by Title API (Admin & Customer)
export const getMoviesByTitle = async (keyword) => {
  const response = await api.get(
    `/api/movies/titlesearch/${encodeURIComponent(keyword)}`
  );
  return response.data;
};

// 8. Get Top 3 Movies API (Customer)
export const getTop3Movies = async () => {
  const response = await api.get("/api/movies/top3");
  return response.data;
};

// 9. Get Upcoming Movies API (Customer)
export const getUpcomingMovies = async () => {
  const response = await api.get("/api/movies/upcoming");
  return response.data;
};

// 10. Get Now Showing Movies API (Customer)
export const getNowShowingMovies = async () => {
  const response = await api.get("/api/movies/nowshowing");
  return response.data;
};

// 11. Search Movies by Genre API (Customer)
export const searchMoviesByGenre = async (keyword) => {
  const response = await api.get(
    `/api/movies/genresearch/${encodeURIComponent(keyword)}`
  );
  return response.data;
};

// 12. Get Movies Released in Cinemas API (Customer)
export const getNowReleasedInCinema = async () => {
  const response = await api.get("/api/movies/nowreleasedInCinema");
  return response.data;
};

// 13. Get Movie Details by ID API (Admin & Customer)
export const getMovieDetailsById = async (movieId) => {
  const response = await api.get(`/api/movies/${movieId}`);
  return response.data;
};

// 26. Update Now Showing Movies API (Admin)
export const updateNowShowing = async (data) => {
  const response = await api.post("/api/movies/update-nowshowing", data);
  return response.data;
};

// =======================
// SHOWTIME & SEATING APIs
// =======================

// 6. Get High-Rating Showtimes API (Customer)
export const getHighRatingShowtimes = async () => {
  const response = await api.get("/api/showtimes/high-rating");
  return response.data;
};

// 14. Get Available Seats API (Admin & Customer)
export const getAvailableSeats = async () => {
  const response = await api.get("/api/showtimes/available-seats");
  return response.data;
};

// 15. Assign Showtimes API (Admin)
export const assignShowtimes = async (date) => {
  const response = await api.post("/api/showtimes/assign", { date });
  return response.data;
};

// 16. Add Seats to Showtime API (Admin)
export const addShowtimeSeats = async (showtimeid) => {
  const response = await api.post(`/api/showtimes/${showtimeid}/addseats`);
  return response.data;
};

// 17. Get Seating Details API (Admin & Customer)
export const getSeatingDetails = async (showTimeId) => {
  const response = await api.get(`/api/showtimes/${showTimeId}/seats`);
  return response.data;
};

// 19. Get Full Showtimes API (Admin)
export const getFullShowtimes = async () => {
  const response = await api.get("/api/showtimes/full");
  return response.data;
};

// =======================
// CHECKOUT APIs
// =======================

// =======================
// BOOK MULTIPLE SEATS API (27)
// =======================

// This calls the stored procedure 'bookmultipleseatsforalltypes' via our endpoint.
// The bookingData object should include: showtimeid, customerid, platcount, goldcount, regularcount.
export const bookMultipleSeatsForAllTypes = async (bookingData) => {
  const response = await api.post("/api/reservations/bookmultipleseats", bookingData);
  return response.data;
};



// 20. Process Checkout API (Customer)
export const processCheckout = async (checkoutData) => {
  const response = await api.post("/api/checkout", checkoutData);
  return response.data;
};

// 21. Get Checkout Records API (Admin)
export const getCheckouts = async () => {
  const response = await api.get("/api/checkout");
  return response.data;
};

// =======================
// FEEDBACK APIs
// =======================

// 22. Submit Feedback API (Customer)
export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/api/feedback", feedbackData);
  return response.data;
};

// 23. Get Feedback API (Admin)
export const getFeedback = async () => {
  const response = await api.get("/api/feedback");
  return response.data;
};

// =======================
// DAILY SUMMARY API
// =======================

// 24. Get Daily Summary API (Admin)
export const getDailySummary = async () => {
  const response = await api.get("/api/dailysummary");
  return response.data;
};

// =======================
// SERVER STATUS API
// =======================

// 25. Server Status API
export const getServerStatus = async () => {
  const response = await api.get("/");
  return response.data;
};

export default api;
