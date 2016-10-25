const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-as-promised'));

const sinon = require('sinon');
require('sinon-as-promised');
require('sinon-mongoose');
const mongoose = require('mongoose');

const Team = require('../../app/models/team');

describe('Team', function () {
  describe('validate', () => {

    it('should be invalid if name is empty', function (done) {
      let team = new Team();

      team.validate((err) => {
        expect(err.errors.name).to.exist;
        done();
      });
    });

    it('should be invalid if slug is empty', function (done) {
      let team = new Team();

      team.validate((err) => {
        expect(err.errors.slug).to.exist;
        done();
      });
    });

    it('should be invalid if slug contains special char other than "-"', function (done) {
      let team = new Team({ slug: '!@#$%^&*()' });

      team.validate((err) => {
        expect(err.errors.slug).to.exist;
        done();
      });
    });

    it('should be valid if slug contains only alphanumerical characters', function (done) {
      let team = new Team({ slug: 'aA098bB' });

      team.validate((err) => {
        expect(err.errors.slug).not.to.exist;
        done();
      });
    });
    it('should be valid if slug contains alphanumerical characters and "-"', function (done) {
      let team = new Team({ slug: 'aA098bB-a' });

      team.validate((err) => {
        expect(err.errors.slug).not.to.exist;
        done();
      });
    });

    it('should be lowercasing slug', function () {
      let team = new Team({ slug: 'AAAAAAA' });

      expect(team.slug).to.equal('aaaaaaa');
    });
  });

  describe('exists', () => {
    let TeamMock;

    beforeEach(() => {
      TeamMock = sinon.mock(Team);
    });

    afterEach(() => {
      TeamMock.restore();
    });

    it('should return true if found', () => {
      TeamMock.expects('findOne').withArgs({slug: 'the-slug'})
        .chain('exec')
        .resolves({});

      return expect(Team.exists('the-slug')).to.eventually.be.true;
    });

    it('should return false if not found', () => {
      TeamMock.expects('findOne').withArgs({slug: 'the-slug'})
        .chain('exec')
        .resolves(undefined);

      return expect(Team.exists('the-slug')).to.eventually.be.false;
    });
  });
});