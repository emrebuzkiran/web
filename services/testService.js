const WebSocket = require('ws');
require("dotenv").config();
const Binance = require("node-binance-api");

const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
});

async function getFuturesAccount() {
    try {
        const position_data = await binance.futuresPositionRisk();
        const futuresPositions = [];

        position_data.forEach((position) => {
            if (Number(position.positionAmt) !== 0) {
                const markPrice = Number(position.markPrice);
                const quantity = Math.abs(Number(position.positionAmt));
                const amount = quantity * markPrice;

                futuresPositions.push({
                    symbol: position.symbol,
                    quantity: quantity.toFixed(2),
                    amount: amount.toFixed(2),
                    entryPrice: position.entryPrice,
                    markPrice: position.markPrice,
                });
            }
        });

        console.log(futuresPositions); // Pozisyon bilgilerini terminale yazdır
        return futuresPositions;
    } catch (error) {
        console.error("Hata:", error.body || error);
        throw error;
    }
}

// WebSocket ile pozisyon güncellemelerini dinle ve her 10 saniyede bir pozisyonları güncelle
function getInitialFuturesPositions() {
    const ws = new WebSocket('wss://fstream.binance.com/ws');

    ws.on('open', () => {
        console.log('WebSocket bağlantısı açıldı!');
        binance.futuresGetDataStream().then((response) => {
            const listenKey = response.listenKey;
            console.log('Listen key alındı:', listenKey);
            ws.send(JSON.stringify({
                method: "SUBSCRIBE",
                params: [`${listenKey}`],
                id: 1
            }));
        });

        // Her 10 saniyede bir pozisyon bilgilerini güncelle
        setInterval(async() => {
            console.log("10 saniyede bir pozisyon bilgileri güncelleniyor...");
            await getFuturesAccount();
        }, 10000); // 10 saniye (10000 milisaniye)
    });

    ws.on('message', async(data) => {
        const message = JSON.parse(data);
        if (message.e === "ACCOUNT_UPDATE") {
            console.log("WebSocket'ten güncellenmiş pozisyon bilgisi geldi:", message);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket bağlantısı kapandı. Yeniden bağlanılıyor...');
        getInitialFuturesPositions();
    });

    ws.on('error', (error) => {
        console.error('WebSocket hatası:', error);
    });
}

module.exports = { getInitialFuturesPositions };