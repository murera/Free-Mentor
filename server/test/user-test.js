/* eslint-disable max-len */
import jwt from 'jsonwebtoken';
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../index';

const { expect } = chai;
chai.should();
chai.use(chaiHttp);


const adminToken = jwt.sign({ id: 1, is_admin: true, is_mentor: false }, process.env.Token_Key);
const menteeToken = jwt.sign({ id: 1, is_admin: false, is_mentor: false }, process.env.Token_Key);
const invalidToken = jwt.sign({ id: 0, is_admin: false, is_mentor: false }, process.env.Token_Key);
const expired_token = jwt.sign({ id: 1000, is_admin: true, is_mentor: false }, process.env.Token_Key);

// 1.test for get all users
describe('admin get all users ', () => {
  it('should return all users', (done) => {
    chai.request(app)
      .get('/api/v1/users')
      .set('authorisation', adminToken)
      .set('Accept', 'aplication/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(200);

        expect(res.status).to.equal(200);
        done();
      });
  });
  it('should not be able to get all users when admin does not provide token', (done) => {
    chai.request(app)
      .get('/api/v1/users')
      .set('authorisation', '')
      .set('Accept', 'aplication/json')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('error');
        res.body.should.be.a('object');
        done();
      });
  });
  it('should not be able to get all users when admin provide invalid token', (done) => {
    chai.request(app)
      .get('/api/v1/users')
      .set('authorisation', 'invalidToken')
      .set('Accept', 'aplication/json')
      .end((err, res) => {
        res.body.should.have.property('status');
        res.body.should.have.property('error');
        done();
      });
  });
});

// 2.test for get a specific user
describe('get specific user', () => {
  it('should return details of specific user ', (done) => {
    chai.request(app)
      .get('/api/v1//users/2')
      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('data');
        expect(res.body.status).to.equal(200);
        expect(res.body).to.have.property('data').to.be.an('object');
        done();
      });
  });
});
// 3. test for get a specific user but a user not found
describe('admin gets a user by id but the user doesnt exist in the system', () => {
  it('should return user doesn\'t exist ', (done) => {
    chai.request(app)
      .get('/api/v1//users/1000')
      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// 4.change a user into a mentor
describe('admin can change user to mentor,api/v1/auth/user/:id', () => {
  it('should return User account changed to mentor', (done) => {
    chai.request(app)
      .patch('/api/v1/user/2')
      .set('authorisation', adminToken)
      .send({ is_mentor: 'true' })
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.status).to.equal(200);
        expect(res.body.status).to.equal(200);
        expect(res.body).to.have.property('data').to.be.an('object');
        done();
      });
  });
});

// 5. check if a user is already a mentor
describe('change into mentor a user who is already a mentor ', () => {
  it('should return User is already a mentor', (done) => {
    chai.request(app)
      .patch('/api/v1/user/4')
      .send({
        is_mentor: 'true',
      })
      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('error');
        done();
      });
  });
});
// 6. change to mentor a user who does\t exist in the system
describe('change into mentor a user who is already a mentor ', () => {
  it('should return User deos\'t exist', (done) => {
    chai.request(app)
      .patch('/api/v1/user/1000')
      .send({
        is_mentor: 'true',
      })
      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// 7. admin delete a user
describe('admin delete a user ', () => {
  it('should Successfully Deleted a User', (done) => {
    chai.request(app)
      .delete('/api/v1/user/2')

      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('message');
        done();
      });
  });
});
// 8. admin delete a user who deosn'\t exist
describe('admin delete a user who  deos nott exist ', () => {
  it('should return User does not exist', (done) => {
    chai.request(app)
      .delete('/api/v1/user/10000')

      .set('authorisation', adminToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// 9. delete a user without permission
describe('delete a user without permission ', () => {
  it('should not be able to delete a user when you are not administrator', (done) => {
    chai.request(app)
      .delete('/api/v1/user/10000')

      .set('authorisation', menteeToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});

// 10. user get all available mentors
describe('user can get all mentors', () => {
  it('should return all available mentors', (done) => {
    chai.request(app)
      .get('/api/v1/mentors')

      .set('authorisation', menteeToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body.status).to.equal(200);
        expect(res.status).to.equal(200);
        done();
      });
  });
});
// 11. user try to get all mentors with invalid token
describe('user can get all mentors with invalid token', () => {
  it('should return invalid token', (done) => {
    chai.request(app)
      .get('/api/v1/mentors')

      .set('authorisation', invalidToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// // 12. user try to get all mentors with invalid token
describe('user try to get all mentors when he does not send his token in request headers', () => {
  it('should return invalid token', (done) => {
    chai.request(app)
      .get('/api/v1/mentors')

      .set('authorisation', ' ')
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// 13. user get all mentors when he send an expired token
describe('user get all mentors when he send an expired token in request headers', () => {
  it('should return invalid token', (done) => {
    chai.request(app)
      .get('/api/v1/mentors')

      .set('authorisation', expired_token)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('error');
        done();
      });
  });
});
// 14. user get a specific mentor
describe('user get a specific mentor', () => {
  it('should return details of a specific mentor', (done) => {
    chai.request(app)
      .get('/api/v1/mentors/4')

      .set('authorisation', menteeToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        expect(res.body).to.be.an('object');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('data').to.be.an('object');
        done();
      });
  });
});
// 15. user try to get a mentor who does not exist in the system
describe('user get a unexisted mentor', () => {
  it('should return such mentor does not exist', (done) => {
    chai.request(app)
      .get('/api/v1/mentors/100')

      .set('authorisation', menteeToken)
      .set('Accept', 'application/json')
      .end((err, res) => {
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.should.have.property('error');
        done();
      });
  });
});