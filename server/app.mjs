import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

//Read All
app.get("/assignments", async (req, res) => {
  try {
    const result = await connectionPool.query(`SELECT * FROM assignments`);
    return res.status(200).json(result.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server could not read assignment because database connection" });
  }
});

//Read by Asm ID
app.get("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const result = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [assignmentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server could not read assignment because database connection" });
  }
});

//Delete
app.delete("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const checkAssignment = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [assignmentId]);
    if (checkAssignment.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to delete" });
    }

    const result = await connectionPool.query(`DELETE FROM assignments WHERE assignment_id = $1`, [assignmentId]);
    return res.status(200).json({ message: "Deleted assignment sucessfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server could not delete assignment because database connection" });
  }
});

//Check Asm ID on Delete
app.delete("/assignments/", async (req, res) => {
  return res.status(400).json({ message: "Assignment ID cannot be empty" });
});

//Create
app.post("/assignments", async (req, res) => {
  try {
    const newAssignment = {
      ...req.body,
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };

    //console.log(newAssignment);

    const result = await connectionPool.query(
      `INSERT INTO assignments (user_id, title, content, category, length, status, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        newAssignment.user_id,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );

    return res.status(201).json({
      message: "Created assignment sucessfully",
      data: result.rows,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server could not create assignment because database connection" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

//Update
app.put("/assignments/:assignmentId", async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;

    const checkAssignment = await connectionPool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [assignmentId]);
    if (checkAssignment.rows.length === 0) {
      return res.status(404).json({ message: "Server could not find a requested assignment to update" });
    }

    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    const result = await connectionPool.query(
      `UPDATE assignments SET title = $1, content = $2, category = $3, updated_at = $4 WHERE assignment_id = $5 RETURNING *`,
      [updateData.title, updateData.content, updateData.category, updateData.updated_at, assignmentId]
    );

    return res.status(200).json({
      message: "Updated assignment sucessfully",
      data: result.rows[0],
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server could not update assignment because database connection" });
  }
});

//Update with out Asm ID
app.put("/assignments/", async (req, res) => {
  return res.status(400).json({ message: "Assignment ID cannot be empty" });
});
