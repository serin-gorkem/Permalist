import express from "express";
import bodyParser from "body-parser";
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL ,
})


pool.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id ASC") 
    items = result.rows;
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.error(error);
  }


});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await pool.query("INSERT INTO items(title) VALUES ($1)",[item]);
  } catch (error) {
    console.error("Error inserting item");
  }
  res.redirect("/");
});

app.post("/edit",async (req, res) => {
  const title =  req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;

  try {
    await pool.query("UPDATE items SET title = $1 WHERE id = $2", [title,itemId]);
  } catch (error) {
    console.error("Error updating item");
  }

  res.redirect("/");

});

app.post("/delete",async (req, res) => {
  const itemId = req.body.deleteItemId;
  try {
    await pool.query("DELETE FROM items WHERE id = $1",[itemId]);
  } catch (error) {
    console.error("Error deleting item");
  }
  res.redirect("/");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${port}`);
});
