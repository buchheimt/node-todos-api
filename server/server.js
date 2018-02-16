const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');

const Todo = mongoose.model('Todo', {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Number,
    default: null
  }
});

const User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  }
})

const newTodo = new Todo({
  text: 'Testing 123'
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

const newUser = new User({email: 'test@testytest.net'});

newUser.save()
  .then(doc => {
    console.log(JSON.stringify(doc, undefined, 1));
  }, e => {
    console.log("Unable to save user:", e);
  });