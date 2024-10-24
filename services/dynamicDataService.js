const WebSocket = require("ws");
const { getFuturesAccount } = require("./futureServices");
const { getBalances } = require("./spotServices");

let ws;

// WebSocket sunucusunu başlat
function startWebSocket() {
    ws = new WebSocket.Server({ port: 8080 });

    ws.on("connection", (socket) => {
        console.log("Yeni bir WebSocket bağlantısı kuruldu");

        // İlk veriyi gönder
        sendFuturesAndSpotData(socket);

        // Belirli bir süre aralığında güncelleme gönder
        setInterval(() => {
            sendFuturesAndSpotData(socket);
        }, 5000); // Her 5 saniyede bir güncelle
    });

    ws.on("close", () => {
        console.log("WebSocket bağlantısı kapatıldı");
    });

    console.log("WebSocket sunucusu 8080 portunda çalışıyor");
}

// Hem futures hem spot verilerini al ve socket'e gönder
async function sendFuturesAndSpotData(socket) {
    try {
        const futures = await getFuturesAccount();
        const spot = await getBalances();

        // Hem futures hem spot verilerini birleştir
        const data = { futures, spot };

        // Verileri socket'e gönder
        socket.send(JSON.stringify(data));

        // Terminalde güncellenmiş verileri yazdır
        // console.log("Gelen güncellenmiş veriler:", JSON.stringify(JSON.parse(data), null, 2));
    } catch (error) {
        console.error("Veriler alınırken hata:", error);
    }
}

// Dışarıya aktarma
module.exports = { startWebSocket };