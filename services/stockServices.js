const { connectDB } = require("../config"); // Bağlantıyı sağladığın dosya

async function getStockData() {
    try {
        const db = await connectDB(); // Veritabanına bağlan
        const stockCollection = db.collection("stock"); // "stock" tablosunu seç
        const stockData = await stockCollection.find({}).toArray(); // Verileri al ve diziye çevir
        return stockData; // Verileri geri döndür
    } catch (error) {
        console.error("Error retrieving stock data:", error);
        throw error;
    }
}

module.exports = { getStockData };