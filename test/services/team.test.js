'use strict';

const sinon = require('sinon');
require('sinon-as-promised');
require('sinon-mongoose');
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-as-promised'));


const AlreadyExistsError = require('../../app/errors/already-exists-error');
const NotFoundError = require('../../app/errors/not-found-error');

const Team = require('../../app/models/team');
const TeamService = require('../../app/services/team');

describe('TeamService', () => {
  describe('new', () => {
    it('should create a new instance', () => {
      expect(new TeamService()).not.to.be.null;
    });
  });

  describe('create', () => {
    let TeamMock;

    beforeEach(() => {
      TeamMock = sinon.mock(Team);
    });

    afterEach(() => {
      TeamMock.restore();
    });

    it('should reject with a AlreadyExistsError if team already exists', () => {
      TeamMock.expects('exists')
        .withArgs('slug')
        .resolves(true);

      let service = new TeamService();

      return expect(service.create({name: 'name', slug: 'slug'})).to.be.rejectedWith(AlreadyExistsError);
    });

    it('should save the team if it does not exists and return it', () => {
      let team = {name: 'name', slug: 'slug'};
      let createdTeam = {_id: 'AAAA', name: 'name', slug: 'slug'};

      TeamMock.expects('exists')
        .withArgs('slug')
        .resolves(false);

      TeamMock.expects('create')
        .withArgs(team)
        .resolves(createdTeam);

      let service = new TeamService();

      return expect(service.create(team)).to.become(createdTeam);
    });
  });

  describe('findAll', () => {
    let TeamMock;

    beforeEach(() => {
      TeamMock = sinon.mock(Team);
    });

    afterEach(() => {
      TeamMock.restore();
    });

    it('should return an empty list if there is no team', () => {
      TeamMock.expects('find')
        .withArgs({})
        .chain('exec')
        .resolves(undefined);

      let service = new TeamService();

      return expect(service.findAll()).to.become([]);
    });

    it('should return a list if there is only one team', () => {
      let team = {slug: "slug1"};

      TeamMock.expects('find')
        .withArgs({})
        .chain('exec')
        .resolves(team);

      let service = new TeamService();

      return expect(service.findAll()).to.become([team]);
    });

    it('should return all teams', () => {
      let teams = [{slug: "slug1"}, {slug: "slug2"}];

      TeamMock.expects('find')
        .withArgs({})
        .chain('exec')
        .resolves(teams);

      let service = new TeamService();

      return expect(service.findAll()).to.become(teams);
    });

    it('should be limited by the limit parameter', () => {
      let teams = [{slug: "slug1"}, {slug: "slug2"}];

      TeamMock.expects('find')
        .withArgs({})
        .chain('limit').withArgs(1)
        .chain('exec')
        .resolves(teams);

      let service = new TeamService();

      return expect(service.findAll({limit: 1})).to.become(teams);
    });

    it('should be skipping an amount of teams equals to the offset parameter', () => {
      let teams = [{slug: "slug1"}, {slug: "slug2"}];

      TeamMock.expects('find')
        .withArgs({})
        .chain('skip').withArgs(1)
        .chain('exec')
        .resolves(teams);

      let service = new TeamService();

      return expect(service.findAll({offset: 1})).to.become(teams);
    });
  });

  describe('findBySlug', () => {
    let TeamMock;

    beforeEach(() => {
      TeamMock = sinon.mock(Team);
    });

    afterEach(() => {
      TeamMock.restore();
    });

    it('should reject with a NotFoundError if team does not exists', () => {
      TeamMock.expects('findOne')
        .withArgs({slug: 'the-slug'})
        .chain('exec')
        .resolves(undefined);

      let service = new TeamService();

      return expect(service.findBySlug('the-slug')).to.be.rejectedWith(NotFoundError);
    });

    it('should resolve the team if it exists', () => {
      let team = {_id: 'AAAA', name: 'name', slug: 'slug'};

      TeamMock.expects('findOne')
        .withArgs({slug: 'the-slug'})
        .chain('exec')
        .resolves(team);

      let service = new TeamService();

      return expect(service.findBySlug('the-slug')).to.become(team);
    });
  });

  describe('count', () => {
    let TeamMock;

    beforeEach(() => {
      TeamMock = sinon.mock(Team);
    });

    afterEach(() => {
      TeamMock.restore();
    });

    it('should return the total number of teams', () => {
      TeamMock.expects('count')
        .chain('exec')
        .resolves(12);

      let service = new TeamService();

      return expect(service.count()).to.be.eventually.equal(12);
    });
  });
});