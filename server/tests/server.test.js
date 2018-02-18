const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosData = [
  {text: 'First test todo'},
  {text: 'Second test todo'}
];

beforeEach(done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todosData);
  }).then(() => done());
});

describe('Todo#create', () => {

  test('should create a new todo', done => {
    const text = 'Test the todo';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) done(err);

        Todo
          .find({text})
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  test('should not create todo with invalid data', done => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) done(err);

        Todo
          .find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe('Todo#index', () => {
  
  test('should get all todos', done => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});