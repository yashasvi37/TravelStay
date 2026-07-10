const { z } = require("zod");

// Fix 4: Input Validation for Auth Routes
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

module.exports = {
  signupSchema,
  loginSchema
};
