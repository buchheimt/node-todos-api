const request = require('supertest');
const expect = require('chai').expect;
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todosData, populateTodos, usersData, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('Todo', () => {

  describe('#create', () => {
    
    it('should create a new todo', done => {
      const text = 'Test the todo';
  
      request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect(res => {
          expect(res.body.text).to.equal(text);
        })
        .end((err, res) => {
          if (err) done(err);
  
          Todo
            .find({text})
            .then(todos => {
              expect(todos.length).to.equal(1);
              expect(todos[0].text).to.equal(text);
              done();
            })
            .catch(e => done(e));
        });
    });
  
    it('should not create todo with invalid data', done => {
      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
          if (err) done(err);
  
          Todo
            .find()
            .then(todos => {
              expect(todos.length).to.equal(2);
              done();
            })
            .catch(e => done(e));
        });
    });
  });
  
  describe('#index', () => {
    
    it('should get all todos', done => {
      request(app)
        .get('/todos')
        .expect(200)
        .expect(res => {
          expect(res.body.todos.length).to.equal(2);
        })
        .end(done);
    });
  });
  
  describe('#show', () => {
  
    it('should return todo for valid id', done => {
      request(app)
        .get(`/todos/${todosData[0]._id.toHexString()}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo.text).to.equal(todosData[0].text);
        })
        .end(done);
    });
  
    it('should return 404 when id is invalid', done => {
      request(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });
  
    it('should return a 404 when todo is not found', done => {
      request(app)
        .get(`/todos/${new ObjectId().toHexString()}`)
        .expect(404)
        .end(done);
    });
  });
  
  describe('#destroy', () => {

    it('should remove a todo', done => {
      const id = todosData[1]._id.toHexString();

      request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.todo._id).to.equal(id);
        })
        .end((err, res) => {
          if (err) done(err);

          Todo.findById(id)
            .then(todo => {
              expect(todo).to.not.exist;
              done();
            })
            .catch(e => done(e));
        });
    });

    it('should return 404 when id is invalid', done => {
      request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
    });

    it('should return 404 when todo is not found', done => {
      request(app)
      .get(`/todos/${new ObjectId().toHexString()}`)
      .expect(404)
      .end(done);
    });
  });

  describe('#update', () => {

    it('should update a todo', done => {
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
          expect(res.body.todo.text).to.equal(updateData.text);
          expect(res.body.todo.completed).to.equal(true);
          expect(res.body.todo.completedAt).to.be.a('number');
        })
        .end(done);
    });

    it('should clear completedAt when todo is not completed', done => {
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
          expect(res.body.todo.text).to.equal(updateData.text);
          expect(res.body.todo.completed).to.equal(false);
          expect(res.body.todo.completedAt).to.equal(null);
        })
        .end(done);
    });
  });
});

describe('User', () => {

  describe('#me', () => {

    it('should return user if authenticated', done => {
      request(app)
        .get('/users/me')
        .set('x-auth', usersData[0].tokens[0].token)
        .expect(200)
        .expect(res => {
          expect(res.body._id).to.equal(usersData[0]._id.toHexString());
          expect(res.body.email).to.equal(usersData[0].email);
        })
        .end(done);
    });

    it('should return 401 if not authorized', done => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect(res => {
          expect(res.body).to.deep.equal({});
        })
        .end(done);
    });
  });

  describe('#create', () => {
    it('should create a user', done => {
      
      const email = 'arya@example.com';
      const password = 'secretpassword123';
      

      request(app)
        .post('/users')
        .send({email, password})
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).to.exist;
          expect(res.body._id).to.exist;
          expect(res.body.email).to.equal(email);
        })
        .end(err => {
          if (err) {
            return done(err);
          }

          User.findOne({email})
            .then(user => {
              expect(user).to.exist;
              expect(user.password).not.to.equal(password);
              done();
            })
            .catch(e => done(e));
        });
    });

    it('should return validation errors if request is invalid', done => {
      const email = 'badEmail';
      const password = '123';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });

    it('should not create user if email is in use', done => {
      const email = usersData[0].email;
      const password = 'abc123';

      request(app)
        .post('/users')
        .send({email, password})
        .expect(400)
        .end(done);
    });
  });

  describe('#login', () => {
    it('should login user and return auth token', done => {
      const email = usersData[1].email;
      const password = usersData[1].password;

      request(app)
        .post('/users/login')
        .send({email, password})
        .expect(200)
        .expect(res => {
          expect(res.headers['x-auth']).to.exist;
        })
        .end((err, res) => {
          User.findById(usersData[1]._id)
            .then(user => {
              expect(user.tokens[0]).to.include({
                access: 'auth',
                token: res.headers['x-auth']
              });
              done();
            })
            .catch(e => done(e));
        });
    });

    it('should reject invalid login', done => {
      const email = usersData[1].email;
      const password = 'superhackerz';

      request(app)
        .post('/users/login')
        .send({email, password})
        .expect(400)
        .expect(res => {
          expect(res.headers['x-auth']).to.not.exist;
        })
        .end((err, res) => {
          User.findById(usersData[1]._id)
            .then(user => {
              expect(user.tokens.length).to.equal(0);
              done();
            })
            .catch(e => done(e));
        });
    });
  });
});