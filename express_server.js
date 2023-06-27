const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  secret: 'some-secret-key',
  keys: ['some-secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Define the database to store the shortURL-longURL key-value pairs
const urlDatabase = {
  "123456": {
    userId: "someID",
    longUrl: "https://www.example.com"
  },
  "789012": {
    userId: "anotherID",
    longUrl: "https://www.example.org"
  }
};

function urlsForUser(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

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

// function getUserByEmail(email) {
//   for (const userId in users) {
//     if (users[userId].email === email) {
//       return users[userId];
//     }
//   }
//   return null;
// }

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
  const user = users[req.session.user_id];

  // Check if the user is logged in
  if (!user) {
    res.redirect("/login"); // Redirect to the login page
    return;
  }

  const userUrls = urlsForUser(user.id);

  const templateVars = {
    user: user,
    urls: userUrls
  };

  res.render("urls_index", templateVars);
});


// POST route handler to store the shortURL-longURL pair in the database
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id]; // Replace with req.session.user_id

  // Check if the user is logged in
  if (!user) {
    res.status(401).send("You need to be logged in to shorten URLs");
    return;
  }

  const shortURL = generateRandomString(); // Generate a unique shortURL
  const longURL = req.body.longURL; // Assuming the form field has the name "longURL"

  // Store the shortURL-longURL pair in the urlDatabase only if the user is logged in
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.session.user_id
  };

  // "123456": {
  //   userId: "someID",
  //   longUrl: "https://www.example.com"
  // },

  // Redirect to the show page for the newly created URL
  res.redirect(`/urls/${shortURL}`);
});


// create new url and longURL
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];

  // Check if the user is not logged in
  if (!user) {
    res.redirect("/login"); // Redirect to /login if not logged in
    return;
  }

  const templateVars = {
    user: user // Pass the user object to the template
  };
  res.render("urls_new", templateVars);
});

// get specific short URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  const templateVars = {
    user: users[req.session.user_id], // Pass the user object to the template
    id,
    longURL
  };
  res.render("urls_show", templateVars);
});




// Updating long URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the URL ID from the request parameters
  const newLongURL = req.body.longURL; // Get the updated longURL from the request body

  // Update the longURL in the urlDatabase
  urlDatabase[id].longURL = newLongURL;

  // Redirect to the show page for the updated URL
  res.redirect(`/urls/${id}`);
});

// go to longURL website/page
app.get('/u/:id', (req, res) => {
  //get website from the specificid
  const longURLWebsite = urlDatabase[req.params.id];
  //redirect to that longURL
  res.redirect(longURLWebsite);
});

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
  const user = users[req.session.user_id]; // Replace with req.session.user_id

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
  const user = getUserByEmail(email, users);

  // Check if the user exists and the password matches
  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(403).send("Invalid email or password");
    return;
  }

  // Set the user_id on the session
  req.session.user_id = user.id;

  res.redirect("/urls");
});



// login route
app.get("/login", (req, res) => {
  const user = users[req.session.user_id]; // Replace with req.session.user_id

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
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }

  const userId = generateRandomString(); // Generate a unique user ID
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password using bcrypt

  // Create a new user object with the hashed password
  const newUser = {
    id: userId,
    email,
    password: hashedPassword, // Save the hashed password
  };

  users[userId] = newUser; // Add the new user to the users object

  // Set the user_id on the session
  req.session.user_id = userId;

  res.redirect("/urls"); // Redirect to the /urls page
});


// POST route handler for logout and clear cookie
app.post("/logout", (req, res) => {
  // Clear the user_id on the session
  req.session = null;


  // Redirect back to the /login page
  res.redirect("/login");
});



//app listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});