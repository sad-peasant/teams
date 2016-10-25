const router = require('express').Router();

const TeamController = require('./controllers/team');
const teamController = new TeamController();

router.get('/', teamController.findAll);
router.get('/:slug', teamController.findBySlug);
router.post('/', teamController.create);

module.exports = router;