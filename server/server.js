const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

// Routes

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then(doc => {
      res.send(doc);
    }, e => {
      res.status(400).send(e);
    });  
});

// Run

app.listen(3000, () => {
  console.log("Running on port 3000");
});

// Export

module.exports = {app};