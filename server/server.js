require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {ObjectId} = require('mongodb');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// Routes

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then(doc => {
      res.send(doc);
    }, err => {
      res.status(400).send(err);
    });  
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then(todos => {
      res.send({todos});
    }, err => {
      res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      
      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({todo});
    })
    .catch(err => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectId.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({todo});
    })
    .catch(e => res.status(400).send());
});

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  const user = new User(body);

  user.save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      res.header('x-auth', token).send(user);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// Run

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

// Export

module.exports = {app};