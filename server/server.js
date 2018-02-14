const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

const Todo = mongoose.model('Todo', {
  text: {
    type: String
  },
  completed: {
    type: Boolean
  },
  completedAt: {
    type: Number
  }
});

const newTodo = new Todo({
  text: 'Eat lunch'
});

newTodo.save()
  .then(doc => {
    console.log('Saved todo:', doc);
  }, err => {
    console.log('Unable to save Todo');
  });

const myTodo = new Todo({
  text: 'Get job',
  completed: true,
  completedAt: 21216
});

myTodo.save()
  .then(doc => {
    console.log('Saved my todo:', doc);
  }, err => {
    console.log('Unable to save Todo');
  });