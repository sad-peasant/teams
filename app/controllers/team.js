'use strict';
const TeamService = require('../services/team');
const teamService = new TeamService();

class TeamController {
  findBySlug (req, res, next) {
    teamService.findBySlug(req.params.slug)
      .then((team) => res.send(team))
      .catch(next);
  }

  findAll (req, res, next) {
    let options = {
      limit: parseInt(req.query.limit),
      offset: parseInt(req.query.offset)
    };

    teamService.findAll(options)
      .then((teams) => {
        return teamService.count().then((count) => {
          res.header('x-total-count', count);

          if (options.limit && count) {
            let links = [];

            if (options.offset + options.limit < count) {
              links.push(`</teams?offset=${options.limit + options.offset}&limit=${options.limit}>; rel="next"`);
              links.push(`</teams?offset=${count - options.limit}&limit=${options.limit}>; rel="last"`);
            }

            if (options.offset) {
              links.push(`</teams?offset=0&limit=${options.limit}>; rel="first"`);
              links.push(`</teams?offset=${Math.max(options.offset - options.limit, 0)}&limit=${options.limit}>; rel="prev"`);
            }

            res.header('link', links);
          }
          return teams;
        });
      })
      .then((teams) => res.send(teams))
      .catch(next);
  }

  create (req, res, next) {
    teamService.create(req.body)
      .then((team) => {
        res.header('location', `/teams/${team.slug}`);

        return team;
      })
      .then((team) => res.status(201).send(team))
      .catch(next);
  }
}

module.exports = TeamController;