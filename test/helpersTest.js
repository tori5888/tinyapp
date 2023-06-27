const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID, 'user ID should match the expected user ID');
  });


  it('should return null when an empty email is provided', function() {
    const user = getUserByEmail("", testUsers);
    assert.isNull(user, 'user should be null');
  });

  it('should return null when the users database is empty', function() {
    const emptyUsers = {};
    const user = getUserByEmail("user@example.com", emptyUsers);
    assert.isNull(user, 'user should be null');
  });

  it('should return null when the users database is not provided', function() {
    const user = getUserByEmail("user@example.com");
    assert.isNull(user, 'user should be null');
  });
});

