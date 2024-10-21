require("dotenv").config(); // Load environment variables

const Binance = require("node-binance-api");
const binance = new Binance().options({
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,
    useServerTime: true,
    recvWindow: 60000,
    verbose: true,
    log: (log) => console.log(log),
    family: 4,
});

async function getBalances() {
    try {
        // Set server time
        await binance.useServerTime();

        return new Promise((resolve, reject) => {
            binance.balance((error, balances) => {
                if (error) {
                    console.error("Error:", error.body || error);
                    reject(error);
                    return;
                }

                const availableBalances = [];
                const cashBalances = [];

                for (const asset in balances) {
                    const available = parseFloat(balances[asset].available);
                    if (available > 0) {
                        availableBalances.push({
                            symbol: asset,
                            available,
                        });

                        // Eğer asset 'USDT' ise cashBalances dizisine ekle
                        if (asset === "USDT") {
                            cashBalances.push({
                                symbol: asset,
                                available,
                            });
                        }
                    }
                }

                resolve({ availableBalances, cashBalances });
            });
        });
    } catch (error) {
        console.error("Error:", error.body || error);
    }
}

module.exports = { getBalances };