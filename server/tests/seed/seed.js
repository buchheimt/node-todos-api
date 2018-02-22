const {ObjectId} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');

const userId1 = new ObjectId();
const userId2 = new ObjectId();

const todosData = [
  {
    _id: new ObjectId(),
    text: 'First test todo',
    _creator: userId1
  },
  {
    _id: new ObjectId(),
    text: 'Second test todo',
    completed: true,
    completedAt: 122250,
    _creator: userId2
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todosData);
    })
    .then(() => done());
};

const usersData = [
  {
    _id: userId1,
    email: 'tyler@example.com',
    password: 'tylerpass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userId1, access: 'auth'}, 'supersecret').toString()
    }]
  },
  {
    _id: userId2,
    email: 'emma@example.com',
    password: 'emmapass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userId2, access: 'auth'}, 'supersecret').toString()
    }]
  }
];

const populateUsers = done => {
  User.remove({})
    .then(() => {
      const user1 = new User(usersData[0]).save();
      const user2 = new User(usersData[1]).save();

      return Promise.all([user1, user2]);
    })
    .then(() => done());
}

module.exports = {
  todosData,
  populateTodos,
  usersData,
  populateUsers
};