const expect = require('chai').expect;

const AlreadyExistsError = require('../../app/errors/already-exists-error');
const NotFoundError = require('../../app/errors/not-found-error');

const ErrorTranslator = require('../../app/errors/translator');
describe('ErrorTranslator', () => {
  describe('new', () => {
    it('should create a new instance', () => {
      expect(new ErrorTranslator()).not.to.be.null;
    });
  });

  describe('translate', () => {
    it('should translate AlreadyExistsError to 409', () => {
      let translator = new ErrorTranslator();

      expect(translator.translate(new AlreadyExistsError())).to.be.equal(409);
    });

    it('should translate NotFoundError to 404', () => {
      let translator = new ErrorTranslator();

      expect(translator.translate(new NotFoundError())).to.be.equal(404);
    });

    it('should translate unknown errors to 500', () => {
      let translator = new ErrorTranslator();

      expect(translator.translate(new Error())).to.be.equal(500);
    });
  });
});