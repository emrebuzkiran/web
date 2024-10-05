// config.js
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config(); // Ortam değişkenlerini kullanmak için dotenv'i dahil edin

const uri = process.env.MONGO_URI; // .env dosyasındaki URI'yi kullanın
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB!");
    return client.db("mydatabase"); // 'mydatabase' isimli veritabanını kullanın
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = { client, connectDB };
