const Binance = require('node-binance-api');

let binanceConfigSpot

if (process.env.TEST === "TRUE") {
    binanceConfigSpot = {
        recvWindow: 60000,
        urls: {
            base: 'https://testnet.binance.vision/api/'
        },
        'family': 4, // ajuste para funcionar no node 18
    }; 
} else {
    binanceConfigSpot = {
        recvWindow: 60000,
        'family': 4, // ajuste para funcionar no node 18
    };
}

async function getSpotTrades(apiKey, apiSecret) {

    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });

    binance.websockets.trades([], (trades) => {
        let { e: eventType, E: eventTime, s: symbol, p: price, q: quantity, m: maker, a: tradeId } = trades;
        console.info(symbol + " trade update. price: " + price + ", quantity: " + quantity + ", maker: " + maker);
    });

    return true;
}

async function sendSpotBuyMarket(apiKey, apiSecret, symbol, quantity) {

    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });
    const r = await binance.marketBuy(symbol, quantity);

    return r;
}

async function sendSpotSellMarket(apiKey, apiSecret, symbol, quantity) {

    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });
    const r = await binance.marketSell(symbol, quantity);

    return r;
}

async function getSpotBalances(apiKey, apiSecret) {

    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });

    const r = binance.balance();
    return r;
}

async function exchangeInfo(apiKey, apiSecret) {
    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });
    return binance.exchangeInfo();
}


module.exports = {
    getSpotTrades,
    sendSpotBuyMarket,
    sendSpotSellMarket,
    getSpotBalances,
    exchangeInfo
};