import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD, //
  port: process.env.PORT
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: 'kljuc',
    resave: true,
    saveUninitialized: true
  })
);

/*let recenzija = [
  { id: 1, tekst: "Dobar restoran", ocjena: "5", username: "username1" },
  { id: 2, tekst: "ok restoran", ocjena: "4", username: "username2" },
];*/

app.get("/", (req, res) => {
  res.render("restoran.ejs");
});

app.get("/galerija", (req, res) => {
  res.render("galerija.ejs");
});

app.get("/kontakt", (req, res) => {
  res.render("kontakt.ejs");
});


app.get("/recenzije", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM recenzije ORDER BY id ASC");
    const recenzija = result.rows;
    res.render("recenzije.ejs", {
      listaRecenzija: recenzija,
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/recenzije2", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM recenzije ORDER BY id ASC");
    const recenzija = result.rows;
    res.render("recenzije2.ejs", {
      listaRecenzija: recenzija,
    });
  } catch (err) {
    console.log(err);
  }
});


app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const lozinka = req.body.lozinka;

  try {
    const result = await db.query("INSERT INTO gosti(username, email, lozinka) VALUES ($1, $2, $3)", [username, email, lozinka]);
    req.session.username = username;
    res.redirect("/recenzije2");
  } catch (err) {
    res.status(400).send("Korisnicko ime, email ili lozinka su zauzeti!");
    console.log(err);
  }
});


app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const lozinka = req.body.lozinka;

  try {
    const result = await db.query("SELECT * FROM gosti WHERE username = $1 AND lozinka = $2", [username, lozinka]);

    if (result.rows.length > 0) {
      req.session.username = username;
      //ako je korisnik u bazi vodi ga se na recenzije 2
      res.redirect("/recenzije2");

    } else {
      //U slucaju da korisnika nema u bazi vraca ga se na login
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
});

//korisnik unosi recenziju
app.post("/dodajrecenziju", async (req, res) => {
  const username = req.session.username;
  const tekst = req.body.tekst;
  const ocjena = req.body.ocjena;

  try {
    const result = await db.query("INSERT INTO recenzije (tekst, ocjena, username) VALUES ($1, $2, $3)", [tekst, ocjena, username]);
    res.redirect("/recenzije2");
  } catch (err) {
    console.log(err);
    res.render("err");
  }
});

app.post("/delete", async (req, res) => {
  const username = req.session.username;
  const id = req.body.izbrisiRecenziju;
  try {
    await db.query("DELETE FROM recenzije WHERE id = $1 AND username = $2 ", [id, username]);
    res.redirect("/recenzije2");
  } catch (err) {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const username = req.session.username;
  const tekst = req.body.prepravljenTekst;
  const id = req.body.ID;

  try {
    await db.query("UPDATE recenzije SET tekst = ($1) WHERE id = $2 AND username = $3", [tekst, id, username]);
    res.redirect("/recenzije2");
  } catch (err) {
    console.log(err);
  }
});

app.post("/editocjena", async (req, res) => {
  const username = req.session.username;
  const ocjena = req.body.prepravljenaOcjena;
  const id = req.body.ID;

  try {
    await db.query("UPDATE recenzije SET ocjena = ($1) WHERE id = $2 AND username = $3", [ocjena, id, username]);
    res.redirect("/recenzije2");
  } catch (err) {
    console.log(err);
  }
});

app.post("/logout", async (req, res) => {
  // Clear user session
  req.session.destroy();
  res.redirect("/recenzije");
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});