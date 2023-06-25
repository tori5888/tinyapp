const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");


// Define the database to store the shortURL-longURL key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// POST route handler to store the shortURL-longURL pair in the database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a unique shortURL
  const longURL = req.body.longURL; // Assuming the form field has the name "longURL"

  // Store the shortURL-longURL pair in the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect to the show page for the newly created URL
  res.redirect(`/urls/${shortURL}`);
});

// POST route handler to update the longURL of a URL resource
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the URL ID from the request parameters
  const newLongURL = req.body.longURL; // Get the updated longURL from the request body

  // Update the longURL in the urlDatabase
  urlDatabase[id] = newLongURL;

  // Redirect to the show page for the updated URL
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; // Retrieve the longURL from the urlDatabase

  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Helper function to generate a random alphanumeric string for the shortURL
function generateRandomString() {
  const length = 6;
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}
