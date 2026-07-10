const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
  // Start the in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Connect Mongoose to the in-memory DB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Mock Cloudinary storage to prevent real uploads during tests
  jest.mock("multer-storage-cloudinary", () => {
    return {
      CloudinaryStorage: jest.fn().mockImplementation(() => {
        return {
          _handleFile: (req, file, cb) => {
            cb(null, {
              path: "https://res.cloudinary.com/demo/image/upload/v1593006240/sample.jpg",
              filename: "sample-mock.jpg"
            });
          },
          _removeFile: (req, file, cb) => {
            cb(null);
          }
        };
      })
    };
  });
});

afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
});
