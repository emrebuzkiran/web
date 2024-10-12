const Binance = require("binance-api-node").default; // Doğru içe aktarma
const { DateTime } = require("luxon"); // Tarih ve saat formatlama için kullanılabilir

// Binance API anahtarlarınızı ortam değişkenlerinden alın
const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
});

// Anlık SPOT hesap bilgisi al
const getAccountInfo = async() => {
    try {
        const accountInfo = await client.accountInfo(); // accountInfo() fonksiyonunu kullan
        return accountInfo;
    } catch (error) {
        throw new Error("Error fetching account info: " + error.message);
    }
};

// Binance borsasındaki geçerli tüm işlem çiftlerini al
const getValidSymbols = async() => {
    try {
        const exchangeInfo = await client.exchangeInfo();
        return exchangeInfo.symbols.map((symbol) => symbol.symbol);
    } catch (error) {
        throw new Error("Error fetching exchange info: " + error.message);
    }
};

// Sıfır olmayan bakiyelere sahip sembolleri kontrol et
const getSymbolsWithBalance = async() => {
    const accountInfo = await getAccountInfo();
    const validSymbols = await getValidSymbols();
    const symbols = [];
    for (const balance of accountInfo.balances) {
        const asset = balance.asset;
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);

        if (free > 0 || locked > 0) {
            const symbol = `${asset}USDT`;
            if (validSymbols.includes(symbol)) {
                symbols.push(symbol);
            }
        }
    }

    return symbols;
};

// Her sembol için alım/satım işlemlerini göster
const getTradeHistory = async(symbol) => {
    try {
        const orders = await client.myTrades({ symbol });
        const tradeHistory = []; // İşlem geçmişini tutmak için bir dizi oluştur

        for (const order of orders) {
            const date = DateTime.fromMillis(order.time).toFormat(
                "yyyy-MM-dd HH:mm:ss"
            );
            const side = order.isBuyer ? "BUY" : "SELL";

            // İşlemi tarih, sembol, tür, taraf, fiyat ve miktar ile bir nesne olarak ekle
            tradeHistory.push({
                date,
                symbol: order.symbol,
                type: "MARKET",
                side,
                price: order.price,
                amount: order.qty,
            });
        }

        return tradeHistory; // İşlem geçmişini döndür
    } catch (error) {
        console.error(`Error fetching trades for ${symbol}: ${error.message}`);
        return []; // Hata durumunda boş bir dizi döndür
    }
};

// Ana fonksiyon, tüm semboller için işlem geçmişini alır
const getAllTradeHistories = async() => {
    const symbols = await getSymbolsWithBalance();
    const allTradeHistories = []; // Tüm işlem geçmişlerini saklamak için bir dizi

    for (const symbol of symbols) {
        const tradeHistory = await getTradeHistory(symbol);
        allTradeHistories.push(...tradeHistory); // İşlem geçmişlerini topla
    }

    return allTradeHistories; // Tüm işlem geçmişlerini döndür
};

module.exports = {
    getAccountInfo,
    getValidSymbols,
    getSymbolsWithBalance,
    getTradeHistory,
    getAllTradeHistories,
};