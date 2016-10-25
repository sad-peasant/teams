'use strict';

const AlreadyExistsError = require('../errors/already-exists-error');
const NotFoundError = require('../errors/not-found-error');

const Team = require('../models/team');

class TeamService {

  create (team) {
    return Team.exists(team.slug)
      .then(this._throwIfAlreadyExists)
      .then(this._doCreate(team));
  }

  _doCreate (team) {
    return () => Team.create(team);
  }

  _throwIfAlreadyExists (exists) {
    if (exists) {
      throw new AlreadyExistsError();
    }
  }

  findBySlug(slug) {
    return Team.findOne({slug: slug}).exec()
      .then(this._returnOrThrow);

  }

  _returnOrThrow(team) {
    if (!team) {
      throw new NotFoundError();
    }

    return team;
  }

  findAll(options) {
    let query = Team.find({});

    if (options && options.limit) {
      query = query.limit(options.limit);
    }
    if (options && options.offset) {
      query = query.skip(options.offset);
    }

    return query.exec().then(this._returnTeamsOrEmpty);
  }

  _returnTeamsOrEmpty(teams) {
    if (!teams) {
      return [];
    }

    if (!Array.isArray(teams)) {
      return [teams]
    }

    return teams;
  }

  count() {
    return Team.count().exec();
  }

}

module.exports = TeamService;