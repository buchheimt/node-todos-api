const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todosData, populateTodos, usersData, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('Todo', () => {

  describe('#create', () => {
    
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
  
  describe('#index', () => {
    
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
  
  describe('#show', () => {
  
    test('should return todo for valid id', done => {
      request(app)
        .get(`/todos/${todosData[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(todosData[0].text);
        })
        .end(done);
    });
  
    test('should return 404 when id is invalid', done => {
      request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
  
    test('should return a 404 when todo is not found', done => {
      request(app)
        .get(`/todos/${new ObjectId().toHexString()}`)
        .expect(404)
        .end(done);
    });
  });
  
  describe('#destroy', () => {
    test('should remove a todo', done => {
      const id = todosData[1]._id.toHexString();

      request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo._id).toBe(id);
        })
        .end((err, res) => {
          if (err) done(err);

          Todo.findById(id)
            .then(todo => {
              expect(todo).toBe(null);
              done();
            })
            .catch(e => done(e));
        });
    });

    test('should return 404 when id is invalid', done => {
      request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
    });

    test('should return 404 when todo is not found', done => {
      request(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .end(done);
    });
  });

  describe('#update', () => {

    test('should update a todo', done => {
      const id = todosData[0]._id.toHexString();
      const updateData = {
        text: 'hey look a test',
        completed: true
      }

      request(app)
        .patch(`/todos/${id}`)
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(updateData.text);
          expect(res.body.todo.completed).toBe(true);
          expect(typeof res.body.todo.completedAt).toBe('number');
        })
        .end(done);
    });

    test('should clear completedAt when todo is not completed', done => {
      const id = todosData[1]._id.toHexString();
      const updateData = {
        text: 'hey look, another test',
        completed: false
      }

      request(app)
        .patch(`/todos/${id}`)
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).toBe(updateData.text);
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });
  });
});

describe('User', () => {

  describe('#me', () => {

    test('should return user if authenticated', done => {
      request(app)
        .get('/users/me')
        .set('x-auth', usersData[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).toBe(usersData[0]._id.toHexString());
          expect(res.body.email).toBe(usersData[0].email);
        })
        .end(done);
    });

    test('should return 401 if not authorized', done => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect(res => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe('#create', () => {
    test('should create a user', done => {
      
      const email = 'arya@example.com';
      const password = 'secretpassword123';
      

      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).toBeTruthy();
          expect(res.body._id).toBeTruthy();
          expect(res.body.email).toBe(email);
        })
        .end(err => {
          if (err) {
            return done(err);
          }

          User.findOne({email})
            .then(user => {
              expect(user).toBeTruthy();
              expect(user.password).not.toBe(password);
              done();
            });
        });
    });

    test('should return validation errors if request is invalid', done => {
      const email = 'badEmail';
      const password = '123';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    test('should not create user if email is in use', done => {
      done();
      const email = usersData[0].email;
      const password = 'abc123';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
  })
});