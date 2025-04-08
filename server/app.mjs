import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;
app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  if (!newPost.title || !newPost.content || !newPost.category) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }


  try {
    await connectionPool.query(
      `INSERT INTO assignments(title, content, category, created_at, updated_at, published_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      [newPost.title, newPost.content, newPost.category, newPost.created_at, newPost.updated_at, newPost.published_at]
    );

    return res.status(201).json({
      message: "Created assignment successfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment due to database error",
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
