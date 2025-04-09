import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;
app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(`select * from assignments`);
    return res.status(200).json({
      data: result.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.get("/assignments/:assignmentsId", async (req, res) => {
  try {
    const assignmentsId = req.params.assignmentsId;
    const result = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignmentsId]
    );
    if (result.rows.length > 0) {
      return res.status(200).json({
        data: result.rows,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment" });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentsId", async (req, res) => {
  try {
    const assignmentsId = req.params.assignmentsId;
    const newAssignment = {
      ...req.body,
      updated_at: new Date(),
      published_at: new Date(),
    };
    const result = await connectionPool.query(
      `update assignments
      set title = $2, content = $3 , category = $4 , updated_at = $5 , published_at = $6 
      where assignment_id = $1`,
      [
        assignmentsId,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
    if (result.rowCount > 0) {
      return res.status(200).json({
        message: "Updated assignment sucessfully",
      });
    } else {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentsId", async (req, res) => {
  try {
    const assignmentsId = req.params.assignmentsId;
    const result = await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentsId]
    );
    if (result.rowCount > 0) {
      return res.status(200).json({ message: "Deleted assignment sucessfully" });
    } else {
      return res
        .status(404)
        .json({ message: "Server could not find a requested assignment to delete"  });
    }
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
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
      [
        newPost.title,
        newPost.content,
        newPost.category,
        newPost.created_at,
        newPost.updated_at,
        newPost.published_at,
      ]
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
