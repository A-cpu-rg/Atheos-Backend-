const jwt = require("jsonwebtoken");
const { login, register } = require("../controller/auth.controller");
const User = require("../models/user");

// Mock the User model and JWT
jest.mock("../models/user");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "siteManager",
        department: "Operations",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("login", () => {
    test("should login user with valid credentials", async () => {
      // Mock user found and password match
      const mockUser = {
        _id: "123",
        email: "test@example.com",
        name: "Test User",
        role: "siteManager",
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("fake-token");

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: "tokenfake-",
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          role: "siteManager",
        },
      });
    });

    test("should return error for invalid credentials", async () => {
      // Mock user not found
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });
  });

  describe("register", () => {
    test("should register new user successfully", async () => {
      // Mock user creation
      const mockUser = {
        _id: "123",
        ...req.body,
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue("fake-token");

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: "fake-token",
        user: {
          id: "123",
          name: "Test User",
          email: "test@example.com",
          role: "siteManager",
        },
      });
    });

    test("should return error if user already exists", async () => {
      // Mock existing user
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already exists",
      });
    });
  });
});
