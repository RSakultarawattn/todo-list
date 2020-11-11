require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('returns todos, testing post and get', async () => {

      const expectation = [
        {
          id: 4,
          todo: 'wash the dishes',
          completed: false,
          owner_id: 2
        },
        {
          id: 5,
          todo: 'take out the trash',
          completed: false,
          owner_id: 2
        },
        {
          id: 6,
          todo: 'tidy your room',
          completed: false,
          owner_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const postResponse = await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[2])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);


      const data = await fakeRequest(app)
        .get('/api/todos')

        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);



      expect(data.body).toEqual(expectation);
      expect(postResponse.body).toEqual(
        [{
          id: 6,
          todo: 'tidy your room',
          completed: false,
          owner_id: 2
        }]
      );


    });
    test('update todo with put', async () => {


      const data = await fakeRequest(app)
        .put('/api/todos/6')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([{
        id: 6,
        todo: 'tidy your room',
        completed: true,
        owner_id: 2

      }]);
    });

  });


});
