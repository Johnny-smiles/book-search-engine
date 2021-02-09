// linking middle ware
const { AuthenticationError } = require('apollo-server-express');
// linking model schemas
const { User } = require('../models');
// linking auth middle ware
const { signToken } = require('../utils/auth');

// retriving data
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
  },
  
  // setting up CRUD functions.

  Mutation: {

    // Creading users
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    // verifing login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    // Creating new book
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );

        return updatedUser;
      }
        // verifing login before allowing CRUD
      throw new AuthenticationError('You need to be logged in!');
    },
    // deleting book
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
      }
        // verifing login before allowing CRUD
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
