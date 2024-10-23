const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config(); // Ortam değişkenlerini kullanmak için dotenv'i dahil edin

const uri = process.env.MONGO_URI; // .env dosyasındaki URI'yi kullanın

// Bağlantı havuzu seçenekleri ile MongoClient oluşturun
const client = new MongoClient(uri, {
    maxPoolSize: 10, // Maksimum bağlantı sayısı (örneğin 10)
    minPoolSize: 2, // Minimum bağlantı sayısı (örneğin 2)
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


let dbInstance; // Bağlantıdan dönecek veritabanı örneği

async function connectDB() {
    if (!dbInstance) { // Eğer dbInstance yoksa
        try {
            await client.connect();
            console.log("Successfully connected to MongoDB!");
            dbInstance = client.db("mydatabase"); // 'mydatabase' isimli veritabanını kullanın
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error; // Hata fırlat
        }
    }
    return dbInstance; // Veritabanı örneğini döndür
}

module.exports = { client, connectDB };