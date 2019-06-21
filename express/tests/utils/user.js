const User = require('../../app/models/User');
const UserProvider = require('../../app/models/UserProvider');

const createUser = async (email, { name, password, ...args } = {}) => {
  if (password === undefined) {
    password = 'basset';
  }
  return User.query().insertAndFetch({
    email,
    name,
    password,
    ...args,
  });
};

const createUserProvider = async (userId, args) => {
  return UserProvider.query().insertAndFetch({
    userId,
    ...args,
  });
};

module.exports = {
  createUser,
  createUserProvider,
};
