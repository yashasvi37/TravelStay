const { ZodError } = require("zod");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body against the Zod schema
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors to return field-level issues
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        
        return res.status(400).json({
          error: "Validation Failed",
          details: formattedErrors,
        });
      }
      next(error);
    }
  };
};

module.exports = validateRequest;
