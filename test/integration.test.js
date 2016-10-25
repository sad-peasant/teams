'use strict';

const mongoose = require('mongoose');
const mockgoose = require('mockgoose');

const chai = require('chai');

const expect = chai.expect;

chai.use(require('chai-http'));

const Team = require('../app/models/team');

describe('App', () => {
  let app;

  before((done) => {
    mockgoose(mongoose).then(() => {
      app = require('../index');
      done();
    });
  });

  beforeEach((done) => {
    Team.remove({}, (err) => {
      done();
    });
  });

  describe('/POST teams', () => {

    it('should create an team', (done) => {
      let team = { "name": "the-name", "slug": "the-slug" };

      chai.request(app)
        .post('/teams')
        .send(team)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.contains(team);
          done();
        });
    });

    it('should send the location header', (done) => {
      let team = { "name": "the-name", "slug": "the-slug" };

      chai.request(app)
        .post('/teams')
        .send(team)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.headers[ 'location' ]).to.equals('/teams/the-slug');
          done();
        });
    });

    it('should send 409 conflict on duplicate team', (done) => {
      let team = new Team({ "name": "the-name", "slug": "the-slug" });
      team.save()
        .then(() => {
          chai.request(app)
            .post('/teams')
            .send(team)
            .end((err, res) => {
              expect(res).to.have.status(409);
              done();
            });
        });
    });
  });

  describe('/GET teams/:id', () => {

    it('should return an team', (done) => {
      let team = new Team({ "name": "the-name", "slug": "the-slug" });
      team.save()
        .then(() => {
          chai.request(app)
            .get('/teams/the-slug')
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('name').equal('the-name');
              expect(res.body).to.have.property('slug').equal('the-slug');
              done();
            });
        });
    });

    it('should return 404 if team does not exists', (done) => {
      chai.request(app)
        .get('/teams/the-slug')
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('/GET teams', () => {

    beforeEach((done) => {
      let firstTeam = new Team({ "name": "1", "slug": "1" });
      let secondTeam = new Team({ "name": "2", "slug": "2" });
      let thirdTeam = new Team({ "name": "3", "slug": "3" });
      let fourthTeam = new Team({ "name": "4", "slug": "4" });
      let fifthTeam = new Team({ "name": "5", "slug": "5" });

      firstTeam.save()
        .then(() => secondTeam.save())
        .then(() => thirdTeam.save())
        .then(() => fourthTeam.save())
        .then(() => fifthTeam.save())
        .then(() => {
          done()
        });
    });

    afterEach((done) => {
      Team.remove().then(() => done());
    });

    it('should return all teams', (done) => {
      chai.request(app)
        .get('/teams')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.deep.property('[0].name').equal('1');
          expect(res.body).to.have.deep.property('[0].slug').equal('1');
          expect(res.body).to.have.deep.property('[1].name').equal('2');
          expect(res.body).to.have.deep.property('[1].slug').equal('2');
          expect(res.body).to.have.deep.property('[2].name').equal('3');
          expect(res.body).to.have.deep.property('[2].slug').equal('3');
          expect(res.body).to.have.deep.property('[3].name').equal('4');
          expect(res.body).to.have.deep.property('[3].slug').equal('4');
          expect(res.body).to.have.deep.property('[4].name').equal('5');
          expect(res.body).to.have.deep.property('[4].slug').equal('5');
          done();
        });
    });

    it('should set the X-Total-Count header', (done) => {
      chai.request(app)
        .get('/teams')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'x-total-count' ]).to.be.equal('5');
          done();
        });
    });

    it('should set the Link header if paginated', (done) => {
      chai.request(app)
        .get('/teams?offset=2&limit=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'link' ]).to.contains('</teams?offset=3&limit=1>; rel="next"');
          expect(res.headers[ 'link' ]).to.contains('</teams?offset=4&limit=1>; rel="last"');
          expect(res.headers[ 'link' ]).to.contains('</teams?offset=0&limit=1>; rel="first"');
          expect(res.headers[ 'link' ]).to.contains('</teams?offset=1&limit=1>; rel="prev"');
          done();
        });
    });

    it('should not set first and prev in the Link header if it is the first page', (done) => {
      chai.request(app)
        .get('/teams?offset=0&limit=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'link' ]).not.to.contains('rel="first"');
          expect(res.headers[ 'link' ]).not.to.contains('rel="prev"');
          done();
        });
    });

    it('should not set prev with a negative value in the Link header if limit is higher than offset', (done) => {
      chai.request(app)
        .get('/teams?offset=1&limit=2')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'link' ]).to.contains('</teams?offset=0&limit=2>; rel="prev"');
          done();
        });
    });


    it('should not set last and next in the Link header if it is the last page', (done) => {
      chai.request(app)
        .get('/teams?offset=4&limit=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'link' ]).not.to.contains('rel="last"');
          expect(res.headers[ 'link' ]).not.to.contains('rel="next"');
          done();
        });
    });

    it('should not set the Link header if not paginated', (done) => {
      chai.request(app)
        .get('/teams')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.headers[ 'link' ]).to.be.undefined;
          done();
        });
    });

    it('should not set the Link header if there is no teams', (done) => {
      Team.remove().then(() => {
        chai.request(app)
          .get('/teams?offset=1&limit=1')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.headers[ 'link' ]).to.be.undefined;
            done();
          });
      });
    });

    it('should return all teams limited by the limit parameter', (done) => {
      chai.request(app)
        .get('/teams?limit=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.deep.property('[0].name').equal('1');
          expect(res.body).to.have.deep.property('[0].slug').equal('1');
          expect(res.body).to.have.lengthOf(1);
          done();
        });
    });

    it('should return all teams if limit is higher than available data', (done) => {
      chai.request(app)
        .get('/teams?limit=100')
        .end((err, res) => {
          expect(res).to.have.status(200);

          expect(res.body).to.have.deep.property('[0].name').equal('1');
          expect(res.body).to.have.deep.property('[0].slug').equal('1');
          expect(res.body).to.have.deep.property('[1].name').equal('2');
          expect(res.body).to.have.deep.property('[1].slug').equal('2');
          expect(res.body).to.have.deep.property('[2].name').equal('3');
          expect(res.body).to.have.deep.property('[2].slug').equal('3');
          expect(res.body).to.have.deep.property('[3].name').equal('4');
          expect(res.body).to.have.deep.property('[3].slug').equal('4');
          expect(res.body).to.have.deep.property('[4].name').equal('5');
          expect(res.body).to.have.deep.property('[4].slug').equal('5');
          expect(res.body).to.have.lengthOf(5);
          done();
        });
    });

    it('should return the second team if offset is set to 1', (done) => {

      chai.request(app)
        .get('/teams?offset=1')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.deep.property('[0].name').equal('2');
          expect(res.body).to.have.deep.property('[0].slug').equal('2');
          expect(res.body).to.have.deep.property('[1].name').equal('3');
          expect(res.body).to.have.deep.property('[1].slug').equal('3');
          expect(res.body).to.have.deep.property('[2].name').equal('4');
          expect(res.body).to.have.deep.property('[2].slug').equal('4');
          expect(res.body).to.have.deep.property('[3].name').equal('5');
          expect(res.body).to.have.deep.property('[3].slug').equal('5');
          expect(res.body).to.have.lengthOf(4);
          done();
        });
    });
  });
});