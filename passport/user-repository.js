const Users = require('../models/user');


async function findUserById(id) {
  try {
    const user = await Users.findById(id);
    return user;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
}

async function findUserByEmail(email) {
  try {
    const user = await Users.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

async function findUserByUsername(username) {
  try {
    const user = await Users.findOne({ username });
    return user;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw error;
  }
}

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByUsername,
};
