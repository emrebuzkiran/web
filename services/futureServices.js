const Binance = require("node-binance-api");
require("dotenv").config();
const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
});

async function getFuturesAccount() {
    try {
        // Açık pozisyon risk verilerini al
        const position_data = await binance.futuresPositionRisk();
        const markets = Object.keys(position_data);

        const futuresPositions = []; // Store futures position data


        for (let market of markets) {
            let obj = position_data[market];
            let positionAmt = Number(obj.positionAmt);
            if (positionAmt === 0) continue; // Eğer pozisyon büyüklüğü 0 ise atla

            // Hesaplamalar
            let markPrice = Number(obj.markPrice);
            let quantity = Math.abs(positionAmt); // Pozisyon miktarının mutlak değeri
            let amount = quantity * markPrice; // Amount hesaplama

            // Pozisyon bilgilerini sakla
            futuresPositions.push({
                symbol: obj.symbol,
                quantity: quantity.toFixed(2), // İstediğin formatta göster
                amount: amount.toFixed(2), // İstediğin formatta göster
                entryPrice: obj.entryPrice,
                markPrice: obj.markPrice,
            });



        }

        return futuresPositions; // Return the structured data
    } catch (error) {
        console.error("Hata:", error.body || error);
        throw error; // Rethrow the error for handling in the route
    }
}

module.exports = { getFuturesAccount };