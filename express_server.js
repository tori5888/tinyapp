const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// Define the database to store the shortURL-longURL key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

  /*
      ======================================================
                        R O U T E S
      ======================================================
  */

// get all URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Pass the username to the template
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

// POST route handler to store the shortURL-longURL pair in the database
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a unique shortURL
  const longURL = req.body.longURL; // Assuming the form field has the name "longURL"

  // Store the shortURL-longURL pair in the urlDatabase
  urlDatabase[shortURL] = longURL;

  // Redirect to the show page for the newly created URL
  res.redirect(`/urls/${shortURL}`);
});

// get specific short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id]; // Retrieve the longURL from the urlDatabase

  const templateVars = {
    username: req.cookies["username"], // Pass the username to the template
    id,
    longURL
  };
  res.render("urls_show", templateVars);
});

// create new url and longURL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"] // Pass the username to the template
  };
  res.render("urls_new", templateVars);
});

// Updating long URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the URL ID from the request parameters
  const newLongURL = req.body.longURL; // Get the updated longURL from the request body

  // Update the longURL in the urlDatabase
  urlDatabase[id] = newLongURL;

  // Redirect to the show page for the updated URL
  res.redirect(`/urls/${id}`);
});

// go to longURL website/page
app.get('/u/:id', (req, res) => {
//get website from the specificid
  const longURLWebsite = urlDatabase[req.params.id]
//redirect to that longURL
  res.redirect(longURLWebsite)
})

// deleting url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

// get register page
app.get("/register", (req, res) => {
   const templateVars = {
    username: req.cookies["username"]
  };
  res.render("url_register", templateVars);
});

// POST route handler for login
app.post("/login", (req, res) => {
  const username = req.body.username; // Get the username from the request body

  // Set the username as a cookie
  res.cookie("username", username);

  // Redirect back to the /urls page
  res.redirect("/urls");
});

// POST route handler for logout   ---  and clear cookie
app.post("/logout", (req, res) => {
  // Clear the username cookie
  res.clearCookie("username");

  // Redirect back to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});