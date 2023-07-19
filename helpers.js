// function to get a user by email from the users object
function getUserByEmail(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

// function to get the URLs associated with a specific user
function urlsForUser(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

// helper function to generate a random alphanumeric string for the shortURL
function generateRandomString() {
  const length = 6;
  let randomString = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

// Middleware function to check if the user is logged in
function checkLoggedIn(req, res, next) {
  if (!req.session.user_id) {
    // If the user is not logged in, send a 401 Unauthorized status with an error message
    return res.status(401).send("<h1>401 Unauthorized</h1><p>Please log in to view this page.</p>");
  }
  // If the user is logged in, proceed to the next middleware or route handler
  next();
}

module.exports = {
  urlsForUser,
  checkLoggedIn,
  generateRandomString,
  getUserByEmail
};
