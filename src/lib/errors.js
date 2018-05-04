exports.ValidationError = class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = 400;
    if (fields) {
      this.fields = Array.isArray(fields) ? fields : [fields];
    }
  }
};

exports.AccessError = class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = 401;
  }
};
