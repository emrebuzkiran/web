const WebSocket = require("ws");
const { getFuturesAccount } = require("./services/futureServices");
const { getBalances } = require("./services/spotServices");
const { startWebSocket } = require("./services/testService"); // Güncelledik

// WebSocket sunucusunu başlat
startWebSocket();

// WebSocket istemcisini oluştur ve bağlan
const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
    console.log("WebSocket istemcisi bağlantı kurdu.");
});

socket.on("message", (data) => {
    console.log("Gelen güncellenmiş veriler:", JSON.parse(data));
});

socket.on("error", (error) => {
    console.error("WebSocket hatası:", error);
});

socket.on("close", () => {
    console.log("WebSocket bağlantısı kapatıldı.");
});