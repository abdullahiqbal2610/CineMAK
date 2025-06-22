// src/components/MovieCard.js
import React from "react";

const MovieCard = ({ movie }) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        display: "flex",
        alignItems: "flex-start",
      }}
    >
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{ width: "150px", marginRight: "10px" }}
        />
      ) : (
        <div
          style={{
            width: "150px",
            height: "225px",
            backgroundColor: "#eee",
            marginRight: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
          }}
        >
          No Image
        </div>
      )}
      <div>
        <h4>{movie.title}</h4>
        <p>Rating: {movie.rating}</p>
        <p>
          Released:{" "}
          {movie.releasedate
            ? new Date(movie.releasedate).toISOString().split("T")[0]
            : "N/A"}
        </p>
        <p>{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieCard;
