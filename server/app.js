const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();
const port = 4000;

app.use(cors());

app.get("/hotels", async (req, res) => {
  try {
    const {
      sortedBy = "name",
      order = "asc",
      searchQuery = "",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    // Fetch hotels from the database with sorting, filtering, and pagination
    const sqlQuery = `
      SELECT * FROM hotels
      WHERE LOWER(name) LIKE $1
      ORDER BY ${sortedBy} ${order}
      LIMIT $2 OFFSET $3;
    `;

    const values = [`%${searchQuery.toLowerCase()}%`, limit, offset];

    const result = await pool.query(sqlQuery, values);

    // Fetch the total count of results for pagination
    const countQuery = `
        SELECT COUNT(*) FROM hotels
        WHERE LOWER(name) LIKE $1;
    `;

    const countResult = await pool.query(countQuery, [
      `%${searchQuery.toLowerCase()}%`,
    ]);
    const totalResults = parseInt(countResult.rows[0].count, 10);

    res.json({
      data: result.rows,
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      currentPage: parseInt(page, 10),
    });
  } catch (err) {
    console.error("Internal server error", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

// function sortHotels(hotels, sortedBy, order) {
//   const sortedHotels = [...hotels];
//   const ascendingMultiplier = order === "asc" ? 1 : -1;
//   if (sortedBy === "name") {
//     sortedHotels.sort((a, b) => {
//       if (a.name < b.name) return -1 * ascendingMultiplier;
//       if (a.name > b.name) return 1 * ascendingMultiplier;
//       return 0;
//     });
//   } else if (sortedBy === "location") {
//     sortedHotels.sort((a, b) => {
//       if (a.location < b.location) return -1 * ascendingMultiplier;
//       if (a.location > b.location) return 1 * ascendingMultiplier;
//       return 0;
//     });
//   }
//   return sortedHotels;
// }