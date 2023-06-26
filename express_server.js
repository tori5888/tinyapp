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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function getUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

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
    user: users[req.cookies.user_id], // Pass the user object to the template
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});


// POST route handler to store the shortURL-longURL pair in the database
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id]; // Get the user object using the user_id cookie

  // Check if the user is logged in
  if (!user) {
    res.status(401).send("You need to be logged in to shorten URLs");
    return;
  }

  const shortURL = generateRandomString(); // Generate a unique shortURL
  const longURL = req.body.longURL; // Assuming the form field has the name "longURL"

  // Store the shortURL-longURL pair in the urlDatabase only if the user is logged in
  urlDatabase[shortURL] = longURL;

  // Redirect to the show page for the newly created URL
  res.redirect(`/urls/${shortURL}`);
});


// get specific short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = {
    user: users[req.cookies.user_id], // Pass the user object to the template
    id,
    longURL
  };
  res.render("urls_show", templateVars);
});


// create new url and longURL
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id]; // Get the user object using the user_id cookie

  // Check if the user is not logged in
  if (!user) {
    res.redirect("/urls_login"); // Redirect to /login if not logged in
    return;
  }

  const templateVars = {
    user: user // Pass the user object to the template
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
  const user = users[req.cookies.user_id]; // Get the user object using the user_id cookie

  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if logged in
  } else {
    res.render("url_register"); // Render the registration page if not logged in
  }
});


// POST route handler for login
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Get the email and password from the request body

  // Check if the email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }

  // Find the user by email
  const user = getUserByEmail(email);

  // Check if the user exists and the password matches
  if (!user || user.password !== password) {
    res.status(403).send("Invalid email or password");
    return;
  }

  // Set the user_id as a cookie
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});


// login route
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id]; // Get the user object using the user_id cookie

  // Check if the user is already logged in
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if logged in
  } else {
    res.render("urls_login"); // Render the login page if not logged in
  }
});


// POST route handler for user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body; // Get the email and password from the request body

  // Check if the email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password are required");
    return;
  }

  // Check if the email already exists in the users object
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }

  const userId = generateRandomString(); // Generate a unique user ID

  // Create a new user object
  const newUser = {
    id: userId,
    email,
    password,
  };

  users[userId] = newUser; // Add the new user to the users object

  res.cookie("user_id", userId); // Set the user_id cookie

  res.redirect("/urls"); // Redirect to the /urls page
});


// POST route handler for logout and clear cookie
app.post("/logout", (req, res) => {
  // Clear the user_id cookie
  res.clearCookie("user_id");

  // Redirect back to the /urls page
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});