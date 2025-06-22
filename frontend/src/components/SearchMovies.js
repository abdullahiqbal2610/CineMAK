// src/components/SearchMovies.js
import React, { useState } from "react";
import { getMoviesByTitle } from "../api/api";

const SearchMovies = () => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const data = await getMoviesByTitle(keyword);
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching movies.");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>Search Movies by Title</h3>
      <input
        type="text"
        placeholder="Enter movie title..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button onClick={handleSearch} style={{ marginLeft: "10px" }}>
        Search
      </button>
      <ul>
        {results.map((movie) => (
          <li key={movie.movieid}>
            {movie.title} (Rating: {movie.rating})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchMovies;
