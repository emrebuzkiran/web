const WebSocket = require("ws");
const { startWebSocket } = require("./services/testService"); // Güncelledik

// WebSocket sunucusunu başlat
startWebSocket();

// WebSocket istemcisini oluştur ve bağlan
const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
    console.log("WebSocket istemcisi bağlantı kurdu.");
});

socket.on("message", (data) => {
    console.log("Gelen güncellenmiş veriler:", JSON.stringify(JSON.parse(data), null, 2));
});

socket.on("error", (error) => {
    console.error("WebSocket hatası:", error);
});

socket.on("close", () => {
    console.log("WebSocket bağlantısı kapatıldı.");
});