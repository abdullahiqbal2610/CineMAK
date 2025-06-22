const express = require("express");
const sql = require("msnodesqlv8");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const connectionString =
  "server=ABDULLAHSLAPTOP\\SQLEXPRESS;Database=project;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";

let dbConn = null;
sql.open(connectionString, (err, conn) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    dbConn = conn;
    console.log("DB connected successfully!");
  }
});

function escapeString(str) {
  return str ? str.replace(/'/g, "''") : str;
}

function formatDate(dateStr) {
  const dateObj = new Date(dateStr);
  if (isNaN(dateObj)) {
    return new Date().toISOString().substring(0, 10);
  }
  return dateObj.toISOString().substring(0, 10);
}

app.post("/api/users/signup", (req, res) => {
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const { fullname, email, password, phonenum, gender, usertype } = req.body;
  if (!fullname || !email || !password || !phonenum || !gender || !usertype) {
    return res.status(400).json({ error: "all fields are required" });
  }

  const sqlQuery = `
    exec createnewuser
      @fullname = '${escapeString(fullname)}',
      @email = '${escapeString(email)}',
      @password = '${escapeString(password)}',
      @phonenum = '${escapeString(phonenum)}',
      @gender = '${escapeString(gender)}',
      @usertype = '${escapeString(usertype)}'
  `;

  dbConn.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("signup procedure error:", err);

      return res.status(500).json({ error: "error creating user" });
    }

    return res.json({ message: "user created" });
  });
});

app.post("/api/users/login", async (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const selectQuery = `
      select userId, FullName, Email, Password, userType
      from Users
      where Email = '${escapeString(email)}'
    `;
    dbConn.query(selectQuery, async (err, rows) => {
      if (err) {
        console.error("Login select error:", err);
        return res.status(500).json({ error: "Error fetching user" });
      }
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = rows[0];

      if (password !== user.Password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      return res.json({
        message: "Login successful",
        userId: user.userId,
        fullName: user.FullName,
        email: user.Email,
        userType: user.userType,
      });
    });
  } catch (error) {
    console.error("Login exception:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/reservations/full-details", (req, res) => {
  //done
  const sqlQuery = `
    select r.resid, r.showtimeid, r.reservationdate, u.fullname, u.phonenum
    from reservations r
    inner join customers c on r.customerid = c.customerid
    inner join users u on c.userid = u.userid
    order by r.reservationdate desc
  `;
  dbConn.query(sqlQuery, (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ error: "error fetching reservation details" });
    res.json(rows);
  });
});

// movies from ombd

app.get("/api/movies/fromapi/:title", async (req, res) => {
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected yet" });
  }

  const movieTitleParam = req.params.title;
  const OMDB_API_KEY = "b5cdc0e5";

  try {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: { apikey: OMDB_API_KEY, t: movieTitleParam },
    });
    const data = response.data;

    if (data.Response === "False") {
      return res.status(404).json({ error: "Movie not found in OMDb API" });
    }

    let omdbGenre = "Unknown";
    if (data.Genre && data.Genre !== "N/A") {
      omdbGenre = data.Genre.split(",")[0].trim();
    }
    const genreQuery = `SELECT TOP 1 genreId FROM Genre WHERE genreType = '${escapeString(
      omdbGenre
    )}'`;
    dbConn.query(genreQuery, (genreErr, genreRows) => {
      if (genreErr) {
        console.error("Error fetching genre:", genreErr);
        return res.status(500).json({ error: "Error fetching genre" });
      }
      let genreId = null;
      if (genreRows && genreRows.length > 0) {
        genreId = genreRows[0].genreId;
      }

      const title = data.Title || movieTitleParam;
      let duration = 90;
      if (data.Runtime && data.Runtime !== "N/A") {
        const runtimeMatch = data.Runtime.match(/(\d+)/);
        if (runtimeMatch) {
          duration = parseInt(runtimeMatch[0]);
        }
      }
      const releaseDate =
        data.Released && data.Released !== "N/A"
          ? new Date(data.Released).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10);
      const rating =
        data.imdbRating && data.imdbRating !== "N/A"
          ? parseFloat(data.imdbRating)
          : 0;
      const description =
        data.Plot && data.Plot !== "N/A"
          ? data.Plot
          : "No description available.";
      const posterUrl =
        data.Poster && data.Poster !== "N/A" ? data.Poster : null;

      // If posterUrl exists, wrap it in quotes, else use SQL NULL.
      const posterUrlValue = posterUrl
        ? `'${escapeString(posterUrl)}'`
        : "NULL";

      const insertQuery = `
        INSERT INTO Movies (Title, GenreId, Duration, ReleaseDate, Rating, Description, posterUrl)
        VALUES (
          '${escapeString(title)}',
          ${genreId ? genreId : "NULL"},
          ${duration},
          '${releaseDate}',
          ${rating},
          '${escapeString(description)}',
          ${posterUrlValue}
        )
      `;

      dbConn.query(insertQuery, (insertErr) => {
        if (insertErr) {
          console.error("Insert error:", insertErr);
          return res
            .status(500)
            .json({ error: "Error inserting movie into database" });
        }
        res.json({
          message: "Movie inserted successfully",
          movie: {
            title,
            genreId,
            duration,
            releaseDate,
            rating,
            description,
            posterUrl, // returned in the API response
          },
        });
      });
    });
  } catch (error) {
    console.error("Error fetching movie from OMDb:", error);
    res.status(500).json({ error: "Error fetching movie from OMDb API" });
  }
});

// all movies
app.get("/api/movies", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected yet" });
  }

  const selectQuery = "select * from Movies";
  dbConn.query(selectQuery, (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Error fetching movies" });
    }
    res.json(rows);
  });
});

app.get("/api/showtimes/high-rating", (req, res) => {
  //done
  const sqlQuery = `
    select st.* 
    from showtime st 
    inner join movies m on st.movieid = m.movieid 
    where m.rating > 7 
    order by st.startingtime desc
  `;
  dbConn.query(sqlQuery, (err, rows) => {
    if (err)
      return res
        .status(500)
        .json({ error: "error fetching high rating showtimes" });
    res.json(rows);
  });
});

app.get("/api/movies/top3", (req, res) => {
  //done
  const sqlQuery = `
    select top 3 * from movies order by rating desc
  `;
  dbConn.query(sqlQuery, (err, rows) => {
    if (err)
      return res.status(500).json({ error: "error fetching top 3 movies" });
    res.json(rows);
  });
});

// upcoming movies
app.get("/api/movies/upcoming", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const query = `
    select * 
    from movies 
    where releasedate > CAST(GETDATE() as date)
    order by releasedate asc
  `;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Upcoming movies error:", err);
      return res.status(500).json({ error: "error fetching upcoming movies" });
    }
    res.json(rows);
  });
});

app.get("/api/movies/nowshowing", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }
  const query = `
  select m.movieid, m.title,m.genreid, m.duration,m.releasedate,m.rating,m.description,m.isreleased, MIN(st.startingtime) as earliest_start
from movies m
 join showtime st on m.movieid = st.movieid
where m.releasedate <= CAST(GETDATE() as date)
  and CAST(st.startingtime as date) = CAST(GETDATE() as date)
group by m.movieid, m.title, m.genreid, m.duration, m.releasedate, m.rating, m.description, m.isreleased
order by earliest_start asc;

  `;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Now showing movies error:", err);
      return res
        .status(500)
        .json({ error: "error fetching now showing movies" });
    }
    res.json(rows);
  });
});

app.get("/api/movies/titlesearch/:keyword", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const { keyword } = req.params;

  const searchKeyword = `%${keyword.toLowerCase()}%`;

  const sqlQuery = `
    select *
    from movies
    where LOWER(title) like ?
  `;

  dbConn.query(sqlQuery, [searchKeyword], (err, rows) => {
    if (err) {
      console.error("Title search error:", err);
      return res.status(500).json({ error: "Error searching by title" });
    }
    return res.json(rows);
  });
});

app.get("/api/movies/genresearch/:keyword", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const { keyword } = req.params;
  const lowerKeyword = keyword.toLowerCase();

  const sqlQuery = `
    select m.*
    from movies m
    inner join genre g on m.genreid = g.genreid
    where
      LOWER(g.genretype) = '${lowerKeyword}'
      or LOWER(CAST(g.genreSynoyms as VARCHAR(MAX))) like '%${lowerKeyword}%'
  `;

  dbConn.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("Genre search error:", err);
      return res
        .status(500)
        .json({ error: "Error searching by genre or synonym" });
    }
    return res.json(rows);
  });
});

app.get("/api/movies/nowreleasedInCinema", (req, res) => {
  ///done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }
  const sqlQuery = `
    select m.*
    from nowshowing ns
    inner join movies m on ns.movieid = m.movieid
    where m.isReleased = 1
    order by m.releasedate desc
  `;

  dbConn.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("nowshowing movies error:", err);
      return res
        .status(500)
        .json({ error: "error fetching now showing movies" });
    }
    return res.json(rows);
  });
});

app.get("/api/movies/:id", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected yet" });
  }

  const movieId = parseInt(req.params.id, 10);
  if (isNaN(movieId)) {
    return res.status(400).json({ error: "Invalid movie ID" });
  }

  const query = `select * from Movies where movieId = ${movieId}`;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return res.status(500).json({ error: "Error fetching movie" });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json(rows[0]);
  });
});

app.post("/api/movies/update-nowshowing", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const sqlQuery = `exec update_now_showing`;

  dbConn.query(sqlQuery, (err) => {
    if (err) {
      console.error("update now showing error:", err);
      return res
        .status(500)
        .json({ error: "error updating now showing movies" });
    }
    return res.json({ message: "now showing updated successfully" });
  });
});

app.get("/api/showtimes/available-seats", (req, res) => {
  //done
  const sqlQuery = `
    select showtimeid, count(*) as availableseats 
    from showtimeseating 
    where seatfull = 0 
    group by showtimeid
  `;
  dbConn.query(sqlQuery, (err, rows) => {
    if (err)
      return res.status(500).json({ error: "error fetching available seats" });
    res.json(rows);
  });
});

app.post("/api/showtimes/assign", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }
  const { date } = req.body;
  if (!date) {
    return res.status(400).json({ error: "date is required" });
  }
  const sqlQuery = `
    exec assign_showtimes @date = '${escapeString(date)}'
  `;
  dbConn.query(sqlQuery, (err, result) => {
    if (err) {
      console.error("assign showtimes error:", err);
      return res.status(500).json({ error: "error assigning showtimes" });
    }
    res.json({ message: "showtimes assigned successfully" });
  });
});

app.post("/api/showtimes/:showtimeid/addseats", (req, res) => {
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const showtimeid = parseInt(req.params.showtimeid, 10);
  if (isNaN(showtimeid)) {
    return res.status(400).json({ error: "invalid showtimeid" });
  }

  const sqlQuery = `exec addshowtimeseats @showtimeid = ${showtimeid}`;

  dbConn.query(sqlQuery, (err) => {
    if (err) {
      console.error("add showtime seats error:", err);
      return res.status(500).json({ error: "error adding seats" });
    }

    return res.json({ message: "seats added successfully" });
  });
});

app.get("/api/showtimes/:showTimeId/seats", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected yet" });
  }

  const showTimeId = parseInt(req.params.showTimeId, 10);
  const query = `
    select s.ShowtimeSeatId, s.seatFull, sp.SeatType, sp.SeatPrice
    from ShowtimeSeating s
     join SeatingPlan sp on s.seatId = sp.seatId
    where s.ShowTimeId = ${showTimeId}
  `;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("List seats error:", err);
      return res.status(500).json({ error: "Error fetching seats" });
    }
    res.json(rows);
  });
});

app.post("/api/showtimes/:showtimeid/addseats", (req, res) => {
  ///donee
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const showtimeid = parseInt(req.params.showtimeid, 10);
  if (isNaN(showtimeid)) {
    return res.status(400).json({ error: "invalid showtimeid" });
  }

  const sqlQuery = `exec addshowtimeseats @showtimeid = ${showtimeid}`;
  dbConn.query(sqlQuery, (err) => {
    if (err) {
      console.error("add showtime seats error:", err);
      return res.status(500).json({ error: "error adding seats" });
    }
    return res.json({ message: "seats added successfully" });
  });
});

app.get("/api/reservations/customer/:customerID", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const customerID = parseInt(req.params.customerID, 10);
  if (isNaN(customerID)) {
    return res.status(400).json({ error: "Invalid customer ID" });
  }

  const query = `
    select r.ResID, r.ShowTIMEId, r.ReservationDate
    from Reservations r
    where r.customerID = ${customerID}
    order by r.ReservationDate desc
  `;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Get reservations error:", err);
      return res.status(500).json({ error: "Error fetching reservations" });
    }
    res.json(rows);
  });
});

app.get("/api/showtimes/full", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }
  const query = `
    select st.showtimeid, st.startingtime, st.endingtime, m.movieid, m.title, m.releasedate, m.rating, m.description
    from showtime st
    inner join movies m on st.movieid = m.movieid
    order by st.startingtime asc
  `;
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Full showtimes error:", err);
      return res
        .status(500)
        .json({ error: "error fetching showtimes with movies" });
    }
    res.json(rows);
  });
});

app.post("/api/reservations/bookmultipleseats", (req, res) => {
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const { showtimeid, customerid, platcount, goldcount, regularcount } =
    req.body;
  if (
    showtimeid == null ||
    customerid == null ||
    platcount == null ||
    goldcount == null ||
    regularcount == null
  ) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const query = `
    declare @newresid int;
    exec bookmultipleseatsforalltypes
      @showtimeid = ${showtimeid},
      @customerid = ${customerid},
      @platcount = ${platcount},
      @goldcount = ${goldcount},
      @regularcount = ${regularcount},
      @newresid = @newresid output;
    select @newresid as newreservationid;
  `;

  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Error executing bookmultipleseatsforalltypes:", err);

      return res
        .status(500)
        .json({ error: err.message || "Error booking seats" });
    }

    const newResId = rows && rows[0] ? rows[0].newreservationid : null;

    return res.json({
      message: "Booking processed successfully",
      newReservationID: newResId,
    });
  });
});

app.post("/api/checkout", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }

  const { resid, bankacc } = req.body;
  if (!resid || !bankacc) {
    return res.status(400).json({ error: "missing fields for checkout" });
  }

  const reservationId = parseInt(resid, 10);
  if (isNaN(reservationId)) {
    return res.status(400).json({ error: "invalid reservation ID" });
  }

  const sqlQuery = "EXEC calculatecheckoutbill @resid = ?, @bankacc = ?";
  dbConn.query(sqlQuery, [reservationId, bankacc], (err, result) => {
    if (err) {
      console.error("checkout error:", err);
      return res.status(500).json({ error: "error processing checkout" });
    }

    if (result && result.length > 0) {
      return res.json(result[0]);
    } else {
      return res.status(400).json({ error: "no checkout record created" });
    }
  });
});

app.get("/api/checkout", (req, res) => {
  //done
  const query = "select * from Checkout";
  dbConn.query(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching checkouts" });
    }
    return res.json(rows);
  });
});

app.post("/api/feedback", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const { customerID, review, rating } = req.body;
  if (!customerID || !review) {
    return res.status(400).json({ error: "Missing customerID or review" });
  }

  const procedureCall = `
    EXEC AddCustomerFeedback @customerID = ${customerID}, @review = '${escapeString(
    review
  )}', @rating = ${rating || 0}
  `;
  dbConn.query(procedureCall, (err) => {
    if (err) {
      console.error("Feedback procedure error:", err);
      return res.status(500).json({ error: "Error adding feedback" });
    }
    res.json({ message: "Feedback added successfully" });
  });
});

app.get("/api/feedback", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "Database not connected" });
  }

  const query = "select * from Feedback";
  dbConn.query(query, (err, rows) => {
    if (err) {
      console.error("Feedback fetch error:", err);
      return res.status(500).json({ error: "Error fetching feedback" });
    }
    res.json(rows);
  });
});

app.get("/api/dailysummary", (req, res) => {
  //done
  if (!dbConn) {
    return res.status(500).json({ error: "database not connected" });
  }
  const sqlQuery =
    "select * from dailysummaryview order by reservationdate desc";
  dbConn.query(sqlQuery, (err, rows) => {
    if (err) {
      console.error("daily summary error:", err);
      return res.status(500).json({ error: "error fetching daily summary" });
    }
    res.json(rows);
  });
});

app.get("/", (req, res) => {
  res.send("Movie Reservation API Server is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
