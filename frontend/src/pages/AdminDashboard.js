// src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import {
  getFullReservationDetails, // API 3
  fetchMovieFromApi, // API 4
  getAllMovies, // API 5
  getMoviesByTitle, // API 7
  getMovieDetailsById, // API 13
  getAvailableSeats, // API 14
  assignShowtimes, // API 15
  addShowtimeSeats, // API 16
  getSeatingDetails, // API 17
  getFullShowtimes, // API 19
  getCheckouts, // API 21
  getFeedback, // API 23
  getDailySummary, // API 24
  updateNowShowing, // API 26
} from "../api/api";
import "../styles/AdminDashboard.css";

// Helper Functions
const formatDate = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const datePart = date.toISOString().split("T")[0];
  const timePart = date.toTimeString().split(" ")[0].substring(0, 5);
  return `${datePart} ${timePart}`;
};

// MovieCard Component: Displays movie summary and opens modal on click
const MovieCard = ({ movie, onClick }) => (
  <div className="movie-card" onClick={() => onClick(movie)}>
    {movie.posterUrl && (
      <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
    )}
    <div className="movie-info">
      <h4>{movie.title}</h4>
      <p>Released: {formatDate(movie.releasedate)}</p>
      <p>Rating: {movie.rating}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  // --- Data States ---
  const [reservations, setReservations] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedMovieDetails, setSelectedMovieDetails] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [seatingDetails, setSeatingDetails] = useState([]);
  const [fullShowtimes, setFullShowtimes] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [nowShowingUpdateMsg, setNowShowingUpdateMsg] = useState("");

  // --- Form States ---
  const [movieTitleForFetch, setMovieTitleForFetch] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [movieIdForDetails, setMovieIdForDetails] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [showtimeIdForAddSeats, setShowtimeIdForAddSeats] = useState("");
  const [showtimeIdForSeatingDetails, setShowtimeIdForSeatingDetails] =
    useState("");

  // --- Active Section for Dashboard Navigation ---
  const [activeSection, setActiveSection] = useState("Reservations");

  // --- Modal State for Movie Details ---
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);

  // --- API Data Fetching ---
  const fetchReservations = async () => {
    try {
      const data = await getFullReservationDetails();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchAllMovies = async () => {
    try {
      const data = await getAllMovies();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const fetchFullShowtimes = async () => {
    try {
      const data = await getFullShowtimes();
      setFullShowtimes(data);
    } catch (error) {
      console.error("Error fetching full showtimes:", error);
    }
  };

  const fetchCheckouts = async () => {
    try {
      const data = await getCheckouts();
      setCheckouts(data);
    } catch (error) {
      console.error("Error fetching checkouts:", error);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const data = await getFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const fetchDailySummary = async () => {
    try {
      const data = await getDailySummary();
      setDailySummary(data);
    } catch (error) {
      console.error("Error fetching daily summary:", error);
    }
  };

  const fetchAvailableSeatsData = async () => {
    try {
      const data = await getAvailableSeats();
      setAvailableSeats(data);
    } catch (error) {
      console.error("Error fetching available seats:", error);
    }
  };

  // --- useEffect: Initial Data Fetch ---
  useEffect(() => {
    fetchReservations();
    fetchAllMovies();
    fetchFullShowtimes();
    fetchCheckouts();
    fetchFeedbacks();
    fetchDailySummary();
    fetchAvailableSeatsData();
  }, []);

  // --- Action Handlers ---
  const handleFetchMovie = async () => {
    if (!movieTitleForFetch) return;
    try {
      const data = await fetchMovieFromApi(movieTitleForFetch);
      alert(data.message || "Movie inserted successfully.");
      setMovieTitleForFetch("");
      fetchAllMovies();
    } catch (error) {
      console.error("Error fetching movie from OMDb:", error);
      alert("Error fetching movie details.");
    }
  };

  const handleSearchMovies = async () => {
    if (!searchTitle) return;
    try {
      const data = await getMoviesByTitle(searchTitle);
      setMovies(data);
    } catch (error) {
      console.error("Error searching movies:", error);
      alert("Error searching movies.");
    }
  };

  const handleGetMovieDetails = async () => {
    if (!movieIdForDetails) return;
    try {
      const data = await getMovieDetailsById(movieIdForDetails);
      setSelectedMovieDetails(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      alert("Error fetching movie details.");
    }
  };

  const handleAssignShowtimes = async () => {
    if (!assignDate) return;
    try {
      const data = await assignShowtimes(assignDate);
      alert(data.message || "Showtimes assigned successfully.");
      setAssignDate("");
      fetchFullShowtimes();
    } catch (error) {
      console.error("Error assigning showtimes:", error);
      alert("Error assigning showtimes.");
    }
  };

  const handleAddSeats = async () => {
    if (!showtimeIdForAddSeats) return;
    try {
      const data = await addShowtimeSeats(showtimeIdForAddSeats);
      alert(data.message || "Seats added successfully.");
      setShowtimeIdForAddSeats("");
      fetchFullShowtimes();
    } catch (error) {
      console.error("Error adding seats:", error);
      alert("Error adding seats to showtime.");
    }
  };

  const handleGetSeatingDetails = async () => {
    if (!showtimeIdForSeatingDetails) return;
    try {
      const data = await getSeatingDetails(showtimeIdForSeatingDetails);
      setSeatingDetails(data);
    } catch (error) {
      console.error("Error fetching seating details:", error);
      alert("Error fetching seating details.");
    }
  };

  const handleUpdateNowShowing = async () => {
    try {
      const data = await updateNowShowing({});
      setNowShowingUpdateMsg(
        data.message || "Now showing updated successfully."
      );
      fetchAllMovies();
    } catch (error) {
      console.error("Error updating now showing:", error);
      alert("Error updating now showing movies.");
    }
  };

  // Open modal when a movie card is clicked
  const openMovieModal = (movie) => {
    setModalMovie(movie);
    setShowMovieModal(true);
  };

  const closeMovieModal = () => {
    setModalMovie(null);
    setShowMovieModal(false);
  };

  // --- Rendering Panels Based on Active Section ---
  const renderPanel = () => {
    switch (activeSection) {
      case "Reservations":
        return (
          <div className="panel">
            <h2>Reservations</h2>
            {reservations.length > 0 ? (
              <ul className="list">
                {reservations.map((res) => (
                  <li key={res.resid}>
                    {res.fullname} - {res.phonenum} on{" "}
                    {formatDate(res.reservationdate)} (Showtime:{" "}
                    {res.showtimeid})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reservations found.</p>
            )}
          </div>
        );
      case "Movies":
        return (
          <div className="panel">
            <h2>Movies</h2>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Movie title to fetch/insert"
                value={movieTitleForFetch}
                onChange={(e) => setMovieTitleForFetch(e.target.value)}
              />
              <button onClick={handleFetchMovie}>Fetch & Insert</button>
            </div>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Search movies by title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
              <button onClick={handleSearchMovies}>Search</button>
            </div>
            <div className="movies-grid">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <MovieCard
                    key={movie.movieid}
                    movie={movie}
                    onClick={openMovieModal}
                  />
                ))
              ) : (
                <p>No movies available.</p>
              )}
            </div>
            <div className="form-group-inline" style={{ marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Movie ID for details"
                value={movieIdForDetails}
                onChange={(e) => setMovieIdForDetails(e.target.value)}
              />
              <button onClick={handleGetMovieDetails}>Get Details</button>
            </div>
            {selectedMovieDetails && (
              <div className="movie-details">
                <strong>Details:</strong>
                <p>Title: {selectedMovieDetails.title}</p>
                <p>Released: {formatDate(selectedMovieDetails.releasedate)}</p>
                <p>Rating: {selectedMovieDetails.rating}</p>
                <p>Description: {selectedMovieDetails.description}</p>
                {selectedMovieDetails.posterUrl && (
                  <img
                    src={selectedMovieDetails.posterUrl}
                    alt={selectedMovieDetails.title}
                    className="movie-detail-poster"
                  />
                )}
              </div>
            )}
          </div>
        );
      case "Showtimes":
        return (
          <div className="panel">
            <h2>Showtimes & Seating</h2>
            <div className="form-group-inline">
              <label>
                Assign Showtimes for Date:{" "}
                <input
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                />
              </label>
              <button onClick={handleAssignShowtimes}>Assign</button>
            </div>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Showtime ID to add seats"
                value={showtimeIdForAddSeats}
                onChange={(e) => setShowtimeIdForAddSeats(e.target.value)}
              />
              <button onClick={handleAddSeats}>Add Seats</button>
            </div>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Showtime ID for seating details"
                value={showtimeIdForSeatingDetails}
                onChange={(e) => setShowtimeIdForSeatingDetails(e.target.value)}
              />
              <button onClick={handleGetSeatingDetails}>
                Get Seating Details
              </button>
            </div>
            {seatingDetails.length > 0 && (
              <ul className="list seating-details">
                {seatingDetails.map((seat) => (
                  <li key={seat.ShowtimeSeatId}>
                    ID: {seat.ShowtimeSeatId}, {seat.SeatType}, Price:{" "}
                    {seat.SeatPrice}, {seat.seatFull ? "Full" : "Available"}
                  </li>
                ))}
              </ul>
            )}
            <div className="panel-subsection">
              <h3>Available Seats by Showtime</h3>
              <ul className="list">
                {availableSeats.length > 0 ? (
                  availableSeats.map((item) => (
                    <li key={item.showtimeid}>
                      Showtime: {item.showtimeid} - {item.availableseats} seats
                      available
                    </li>
                  ))
                ) : (
                  <p>No seat data.</p>
                )}
              </ul>
            </div>
            <div className="panel-subsection">
              <h3>Full Showtimes</h3>
              <ul className="list">
                {fullShowtimes.length > 0 ? (
                  fullShowtimes.map((st) => (
                    <li key={st.showtimeid}>
                      {st.title} - {formatDateTime(st.startingtime)} to{" "}
                      {formatDateTime(st.endingtime)}
                    </li>
                  ))
                ) : (
                  <p>No full showtimes available.</p>
                )}
              </ul>
            </div>
          </div>
        );
      case "Checkouts":
        return (
          <div className="panel">
            <h2>Checkout Records</h2>
            {checkouts.length > 0 ? (
              <ul className="list">
                {checkouts.map((co, idx) => (
                  <li key={idx}>
                    ID: {co.resid}, Amount: {co.amount}, Bank Acc: {co.bankacc}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No checkout records found.</p>
            )}
          </div>
        );
      case "Feedback":
        return (
          <div className="panel">
            <h2>Feedback Records</h2>
            {feedbacks.length > 0 ? (
              <ul className="list">
                {feedbacks.map((fb, idx) => (
                  <li key={idx}>
                    Customer: {fb.customerID}, Review: {fb.review}, Rating:{" "}
                    {fb.rating}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No feedback available.</p>
            )}
          </div>
        );
      case "Daily Summary":
        return (
          <div className="panel">
            <h2>Daily Summary</h2>
            {dailySummary.length > 0 ? (
              <ul className="list">
                {dailySummary.map((summary, idx) => (
                  <li key={idx}>
                    Date: {formatDate(summary.reservationdate)} - Revenue:{" "}
                    {summary.totalrevenue} - Seats Sold: {summary.seatssold} -
                    Reservations: {summary.reservationscount}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No summary data available.</p>
            )}
          </div>
        );
      case "Update Now Showing":
        return (
          <div className="panel">
            <h2>Update Now Showing</h2>
            <button
              onClick={handleUpdateNowShowing}
              className="btn primary-btn"
            >
              Update Now Showing
            </button>
            {nowShowingUpdateMsg && (
              <p className="update-msg">{nowShowingUpdateMsg}</p>
            )}
          </div>
        );
      default:
        return <p>Select a section from the sidebar.</p>;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h2 className="sidebar-heading">CineMAK Admin</h2>
        <nav className="sidebar-nav">
          <button onClick={() => setActiveSection("Reservations")}>
            Reservations
          </button>
          <button onClick={() => setActiveSection("Movies")}>Movies</button>
          <button onClick={() => setActiveSection("Showtimes")}>
            Showtimes
          </button>
          <button onClick={() => setActiveSection("Checkouts")}>
            Checkouts
          </button>
          <button onClick={() => setActiveSection("Feedback")}>Feedback</button>
          <button onClick={() => setActiveSection("Daily Summary")}>
            Daily Summary
          </button>
          <button onClick={() => setActiveSection("Update Now Showing")}>
            Now Showing Update
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>CineMAK Dashboard</h1>
          <p>Welcome to the admin panel. Manage your cinema data with ease.</p>
        </header>
        <section className="dashboard-panel">{renderPanel()}</section>
      </main>

      {/* Modal for Movie Details */}
      {showMovieModal && modalMovie && (
        <div className="modal-overlay" onClick={closeMovieModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMovieModal}>
              &times;
            </button>
            <div className="modal-body">
              {modalMovie.posterUrl && (
                <img
                  src={modalMovie.posterUrl}
                  alt={modalMovie.title}
                  className="modal-poster"
                />
              )}
              <div className="modal-info">
                <h2>{modalMovie.title}</h2>
                <p>
                  <strong>Released:</strong>{" "}
                  {formatDate(modalMovie.releasedate)}
                </p>
                <p>
                  <strong>Rating:</strong> {modalMovie.rating}
                </p>
                <p>
                  <strong>Description:</strong> {modalMovie.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
