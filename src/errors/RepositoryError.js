class RepositoryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'RepositoryError';
    this.cause = cause;
  }
}
module.exports = RepositoryError;
