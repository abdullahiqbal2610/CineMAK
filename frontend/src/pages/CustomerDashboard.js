// src/pages/CustomerDashboard.js
import React, { useState, useEffect } from "react";
import {
  getHighRatingShowtimes, // API 6
  getMoviesByTitle, // API 7
  getTop3Movies, // API 8
  getUpcomingMovies, // API 9
  getNowShowingMovies, // API 10
  searchMoviesByGenre, // API 11
  getNowReleasedInCinema, // API 12
  getAvailableSeats, // API 14
  getSeatingDetails, // API 17
  getReservationsByCustomer, // API 18
  processCheckout, // API 20
  submitFeedback, // API 22
  bookMultipleSeatsForAllTypes, // API 27
} from "../api/api";
import "../styles/CustomerDashboard.css";

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

// FiveStarRating Component
const FiveStarRating = ({ rating, setRating }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="five-star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${rating >= star ? "filled" : ""}`}
          onClick={() => setRating(star)}
        >
          &#9733;
        </span>
      ))}
    </div>
  );
};

// MovieCard Component: Displays a clickable movie card
const MovieCard = ({ movie, openModal, showPoster = true }) => {
  return (
    <div className="movie-card" onClick={() => openModal(movie)}>
      {showPoster && movie.posterUrl && movie.posterUrl.trim() !== "" && (
        <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
      )}
      <div className="movie-info">
        <h4>{movie.title}</h4>
        <p>Released: {formatDate(movie.releasedate)}</p>
        <p>Rating: {movie.rating}</p>
      </div>
    </div>
  );
};

// ShowtimeCard Component for High Rating Showtimes (no poster)
const ShowtimeCard = ({ showtime }) => (
  <div className="showtime-card">
    <div className="showtime-info">
      <h4>
        {showtime.title ? showtime.title : "Showtime " + showtime.showtimeid}
      </h4>
      <p>Starts: {formatDateTime(showtime.startingtime)}</p>
    </div>
  </div>
);

const CustomerDashboard = () => {
  // Data States
  const [topMovies, setTopMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [releasedMovies, setReleasedMovies] = useState([]);
  const [moviesByTitle, setMoviesByTitle] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState([]);
  const [highRatingShowtimes, setHighRatingShowtimes] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [seatingDetails, setSeatingDetails] = useState([]);
  const [reservations, setReservations] = useState([]);

  // Form States
  const [titleSearch, setTitleSearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [seatDetailsShowtimeId, setSeatDetailsShowtimeId] = useState("");

  // Checkout form
  const [checkoutResId, setCheckoutResId] = useState("");
  const [bankAcc, setBankAcc] = useState("");

  // Feedback form
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);

  // Book multiple seats form
  const [bookShowtimeId, setBookShowtimeId] = useState("");
  const [platCount, setPlatCount] = useState(0);
  const [goldCount, setGoldCount] = useState(0);
  const [regularCount, setRegularCount] = useState(0);

  // Notification state
  const [notification, setNotification] = useState("");

  // Fixed Customer ID for demo
  const customerID = 1;

  // Active Tab for Navigation
  const [activeTab, setActiveTab] = useState("Top Movies");

  // Modal State for Movie Details
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [modalMovie, setModalMovie] = useState(null);

  // Auto-clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Data Fetch on Mount
  useEffect(() => {
    getTop3Movies().then(setTopMovies).catch(console.error);
    getUpcomingMovies().then(setUpcomingMovies).catch(console.error);
    getNowShowingMovies().then(setNowShowingMovies).catch(console.error);
    getNowReleasedInCinema().then(setReleasedMovies).catch(console.error);
    getHighRatingShowtimes().then(setHighRatingShowtimes).catch(console.error);
    getAvailableSeats().then(setAvailableSeats).catch(console.error);
    getReservationsByCustomer(customerID)
      .then(setReservations)
      .catch(console.error);
  }, [customerID]);

  // ---------------------------
  // Action Handlers
  // ---------------------------
  const handleTitleSearch = async () => {
    if (!titleSearch) return;
    try {
      const result = await getMoviesByTitle(titleSearch);
      setMoviesByTitle(result);
    } catch (error) {
      console.error("Error searching movies by title:", error);
      setNotification("Error searching movies by title.");
    }
  };

  const handleGenreSearch = async () => {
    if (!genreSearch) return;
    try {
      const result = await searchMoviesByGenre(genreSearch);
      setMoviesByGenre(result);
    } catch (error) {
      console.error("Error searching movies by genre:", error);
      setNotification("Error searching movies by genre.");
    }
  };

  const handleSeatingDetails = async () => {
    if (!seatDetailsShowtimeId) return;
    try {
      const result = await getSeatingDetails(seatDetailsShowtimeId);
      setSeatingDetails(result);
    } catch (error) {
      console.error("Error fetching seating details:", error);
      setNotification("Error fetching seating details.");
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutResId || !bankAcc) {
      setNotification("Please provide Reservation ID and Bank Account.");
      return;
    }
    try {
      const result = await processCheckout({
        resid: checkoutResId,
        bankacc: bankAcc,
      });
      console.log("Checkout Details:", result);

      setNotification(`Checkout Successful!
  Reservation ID: ${result.reservationid}, Total Amount: ${result.totalamount}`);
      setCheckoutResId("");
      setBankAcc("");

      getReservationsByCustomer(customerID)
        .then(setReservations)
        .catch(console.error);
    } catch (error) {
      console.error("Error processing checkout:", error);
      setNotification("Error processing checkout.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText) {
      setNotification("Please provide feedback text.");
      return;
    }
    try {
      const result = await submitFeedback({
        customerID,
        review: feedbackText,
        rating: feedbackRating,
      });
      console.log("Feedback Details:", result);
      setNotification("Feedback Submitted Successfully");
      setFeedbackText("");
      setFeedbackRating(5);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setNotification("Error submitting feedback.");
    }
  };

  const handleBookMultipleSeats = async (e) => {
    e.preventDefault();
    if (!bookShowtimeId) {
      setNotification("Please provide a Showtime ID.");
      return;
    }
    try {
      const result = await bookMultipleSeatsForAllTypes({
        showtimeid: parseInt(bookShowtimeId),
        customerid: customerID,
        platcount: parseInt(platCount),
        goldcount: parseInt(goldCount),
        regularcount: parseInt(regularCount),
      });
      console.log("Seat Booking Details:", result);
      setNotification(
        `Reservation Successful! Reservation ID: ${result.newReservationID}`
      );
      setBookShowtimeId("");
      setPlatCount(0);
      setGoldCount(0);
      setRegularCount(0);

      getReservationsByCustomer(customerID)
        .then(setReservations)
        .catch(console.error);
    } catch (error) {
      console.error("Error booking seats:", error);
      setNotification("Error booking seats.");
    }
  };

  // Modal Controls for Movie Details
  const openMovieModal = (movie) => {
    setModalMovie(movie);
    setShowMovieModal(true);
  };
  const closeMovieModal = () => {
    setModalMovie(null);
    setShowMovieModal(false);
  };

  // ---------------------------
  // Render Tab Content
  // ---------------------------
  const renderTabContent = () => {
    switch (activeTab) {
      case "Top Movies":
        return (
          <div className="panel">
            <h2>Top 3 Movies</h2>
            {topMovies.length > 0 ? (
              <div className="movies-carousel">
                {topMovies.map((movie) => (
                  <MovieCard
                    key={movie.movieid}
                    movie={movie}
                    openModal={openMovieModal}
                  />
                ))}
              </div>
            ) : (
              <p>No top movies available.</p>
            )}
          </div>
        );
      case "Upcoming Movies":
        return (
          <div className="panel">
            <h2>Upcoming Movies</h2>
            {upcomingMovies.length > 0 ? (
              <div className="movies-grid">
                {upcomingMovies.map((movie) => (
                  <MovieCard
                    key={movie.movieid}
                    movie={movie}
                    openModal={openMovieModal}
                  />
                ))}
              </div>
            ) : (
              <p>No upcoming movies available.</p>
            )}
          </div>
        );
      case "Today Showing":
        return (
          <div className="panel">
            <h2>Today Showing Movies</h2>
            {nowShowingMovies.length > 0 ? (
              <div className="movies-grid">
                {nowShowingMovies.map((movie) => (
                  // Remove poster as requested
                  <MovieCard
                    key={movie.movieid}
                    movie={movie}
                    openModal={openMovieModal}
                    showPoster={false}
                  />
                ))}
              </div>
            ) : (
              <p>No movies showing today.</p>
            )}
          </div>
        );
      case "Released Movies":
        return (
          <div className="panel">
            <h2>Movies Released in Cinemas</h2>
            {releasedMovies.length > 0 ? (
              <div className="movies-grid">
                {releasedMovies.map((movie) => (
                  <MovieCard
                    key={movie.movieid}
                    movie={movie}
                    openModal={openMovieModal}
                  />
                ))}
              </div>
            ) : (
              <p>No movies released in cinemas available.</p>
            )}
          </div>
        );
      case "High Rating Showtimes":
        return (
          <div className="panel">
            <h2>High-Rating Showtimes</h2>
            {highRatingShowtimes.length > 0 ? (
              <div className="showtimes-grid">
                {highRatingShowtimes.map((st) => (
                  <ShowtimeCard key={st.showtimeid} showtime={st} />
                ))}
              </div>
            ) : (
              <p>No high-rating showtimes available.</p>
            )}
          </div>
        );
      case "Search":
        return (
          <div className="panel">
            <h2>Search Movies</h2>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Search by Title"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="fancy-input"
              />
              <button onClick={handleTitleSearch} className="btn primary-btn">
                Search Title
              </button>
            </div>
            {moviesByTitle.length > 0 && (
              <>
                <h3>Results by Title</h3>
                <div className="movies-grid">
                  {moviesByTitle.map((movie) => (
                    <MovieCard
                      key={movie.movieid}
                      movie={movie}
                      openModal={openMovieModal}
                    />
                  ))}
                </div>
              </>
            )}
            <div className="form-group-inline" style={{ marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Search by Genre"
                value={genreSearch}
                onChange={(e) => setGenreSearch(e.target.value)}
                className="fancy-input"
              />
              <button onClick={handleGenreSearch} className="btn primary-btn">
                Search Genre
              </button>
            </div>
            {moviesByGenre.length > 0 && (
              <>
                <h3>Results by Genre</h3>
                <div className="movies-grid">
                  {moviesByGenre.map((movie) => (
                    <MovieCard
                      key={movie.movieid}
                      movie={movie}
                      openModal={openMovieModal}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case "Reservations":
        return (
          <div className="panel">
            <h2>My Reservations</h2>
            {reservations.length > 0 ? (
              <div className="card-grid">
                {reservations.map((res) => (
                  <div key={res.ResID} className="card">
                    <h4>Res. ID: {res.ResID}</h4>
                    <p>Showtime: {res.ShowTIMEId}</p>
                    <p>Date: {formatDate(res.ReservationDate)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reservations found.</p>
            )}
          </div>
        );
      case "Checkout":
        return (
          <div className="panel form-panel">
            <h2>Process Checkout</h2>
            <form onSubmit={handleCheckout} className="form-vertical">
              <label>
                Reservation ID:
                <input
                  type="text"
                  value={checkoutResId}
                  onChange={(e) => setCheckoutResId(e.target.value)}
                  className="fancy-input"
                />
              </label>
              <label>
                Bank Account:
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  className="fancy-input"
                />
              </label>
              <button type="submit" className="btn primary-btn">
                Process Checkout
              </button>
            </form>
          </div>
        );
      case "Feedback":
        return (
          <div className="panel form-panel">
            <h2>Submit Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="form-vertical">
              <label>
                Feedback:
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="fancy-textarea"
                />
              </label>
              <label>
                Rating:
                <FiveStarRating
                  rating={feedbackRating}
                  setRating={setFeedbackRating}
                />
              </label>
              <button type="submit" className="btn primary-btn">
                Submit Feedback
              </button>
            </form>
          </div>
        );
      case "Book Seats":
        return (
          <div className="panel form-panel">
            <h2>Book Multiple Seats</h2>
            {/* Price Information Panel */}
            <div className="price-info">
              <p>
                <strong>Seat Prices:</strong>
              </p>
              <p>Plat: 1250</p>
              <p>Gold: 1000</p>
              <p>Regular: 750</p>
            </div>
            <form onSubmit={handleBookMultipleSeats} className="form-vertical">
              <label>
                Showtime ID:
                <input
                  type="text"
                  value={bookShowtimeId}
                  onChange={(e) => setBookShowtimeId(e.target.value)}
                  className="fancy-input"
                />
              </label>
              <label>
                Plat Count:
                <input
                  type="number"
                  value={platCount}
                  onChange={(e) => setPlatCount(e.target.value)}
                  className="fancy-input small-input"
                />
              </label>
              <label>
                Gold Count:
                <input
                  type="number"
                  value={goldCount}
                  onChange={(e) => setGoldCount(e.target.value)}
                  className="fancy-input small-input"
                />
              </label>
              <label>
                Regular Count:
                <input
                  type="number"
                  value={regularCount}
                  onChange={(e) => setRegularCount(e.target.value)}
                  className="fancy-input small-input"
                />
              </label>
              <button type="submit" className="btn primary-btn">
                Book Seats
              </button>
            </form>
          </div>
        );
      case "Seating Details":
        return (
          <div className="panel">
            <h2>Seating Details</h2>
            <div className="form-group-inline">
              <input
                type="text"
                placeholder="Enter Showtime ID"
                value={seatDetailsShowtimeId}
                onChange={(e) => setSeatDetailsShowtimeId(e.target.value)}
                className="fancy-input"
              />
              <button
                onClick={handleSeatingDetails}
                className="btn primary-btn"
              >
                Get Details
              </button>
            </div>
            {seatingDetails.length > 0 ? (
              <div className="seat-grid">
                {seatingDetails.map((seat) => (
                  <div
                    key={seat.ShowtimeSeatId}
                    className={`seat ${
                      seat.seatFull ? "seat-full" : "seat-available"
                    }`}
                  >
                    {seat.SeatType}
                  </div>
                ))}
              </div>
            ) : (
              <p>No seating details available.</p>
            )}
          </div>
        );
      case "Available Seats":
        return (
          <div className="panel">
            <h2>Available Seats (by Showtime)</h2>
            {availableSeats.length > 0 ? (
              <div className="card-grid">
                {availableSeats.map((item) => (
                  <div key={item.showtimeid} className="card">
                    <h4>Showtime: {item.showtimeid}</h4>
                    <p>{item.availableseats} seats available</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No available seats data.</p>
            )}
          </div>
        );
      default:
        return <p>Select a tab to view your dashboard data.</p>;
    }
  };

  return (
    <div className="customer-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">CineMAK</h1>
        <p>
          Welcome to your cinema hub. Discover movies, book your seats, and
          share your experience.
        </p>
      </header>
      {notification && <div className="notification">{notification}</div>}
      <nav className="tab-nav">
        {[
          "Top Movies",
          "Upcoming Movies",
          "Today Showing",
          "Released Movies",
          "High Rating Showtimes",
          "Search",
          "Reservations",
          "Seating Details",
          "Available Seats",
          "Book Seats",
          "Checkout",
          "Feedback",
        ].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      <section className="tab-content">{renderTabContent()}</section>

      {/* Modal for Movie Details */}
      {showMovieModal && modalMovie && (
        <div className="modal-overlay" onClick={closeMovieModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeMovieModal}>
              &times;
            </button>
            <div className="modal-body">
              <img
                src={
                  modalMovie.posterUrl && modalMovie.posterUrl.trim() !== ""
                    ? modalMovie.posterUrl
                    : "/assets/placeholder.jpg"
                }
                alt={modalMovie.title}
                className="modal-poster"
              />
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

export default CustomerDashboard;
