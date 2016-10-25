class ErrorTranslator {

  constructor () {
    this.errorMapping = new Map();
    this.errorMapping.set('AlreadyExistsError', 409);
    this.errorMapping.set('NotFoundError', 404);
  }

  translate (error) {
    if (!this.errorMapping.has(error.constructor.name)) {
      return 500;
    }
    return this.errorMapping.get(error.constructor.name);
  }
}

module.exports = ErrorTranslator;