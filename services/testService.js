const WebSocket = require("ws");
const { getFuturesAccount } = require("./futureServices");

let ws;

// WebSocket sunucusunu başlat
function startWebSocket() {
    ws = new WebSocket.Server({ port: 8080 });

    ws.on("connection", (socket) => {
        console.log("Yeni bir WebSocket bağlantısı kuruldu");

        // İlk veriyi gönder
        sendFuturesData(socket);

        // Belirli bir süre aralığında güncelleme gönder
        setInterval(() => {
            sendFuturesData(socket);
        }, 5000); // Her 5 saniyede bir güncelle
    });

    ws.on("close", () => {
        console.log("WebSocket bağlantısı kapatıldı");
    });

    console.log("WebSocket sunucusu 8080 portunda çalışıyor");
}

// Futures verilerini al ve socket'e gönder
async function sendFuturesData(socket) {
    try {
        const futures = await getFuturesAccount();
        socket.send(JSON.stringify(futures));

        // Terminalde güncellenmiş verileri yazdır
        console.log("Güncellenmiş futures verileri:", futures);
    } catch (error) {
        console.error("Güncellenmiş futures verisi alınırken hata:", error);
    }
}

// Dışarıya aktarma
module.exports = { startWebSocket };