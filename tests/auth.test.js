const request = require("supertest");
const app = require("../app");
const User = require("../models/user");

describe("Auth Routes - POST /login", () => {
  const testUser = {
    username: "testuser",
    email: "test@example.com",
    password: "password123"
  };

  beforeEach(async () => {
    // Register a mock user before each test
    const newUser = new User({ email: testUser.email, username: testUser.username });
    await User.register(newUser, testUser.password);
  });

  it("should successfully login with valid credentials", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        username: testUser.username,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in successfully");
    expect(res.body.user).toHaveProperty("username", testUser.username);
    
    // Check if cookie is set (Fix 3 requires JWT in cookie, not response body)
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.startsWith("token="))).toBeTruthy();
  });

  it("should return 401 with invalid credentials", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        username: testUser.username,
        password: "wrongpassword"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should return 400 with missing fields", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        username: testUser.username
        // password missing
      });

    // Passport local strategy usually returns 400 for missing credentials
    expect(res.statusCode).toBe(400);
  });
});
