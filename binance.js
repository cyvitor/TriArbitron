const Binance = require('node-binance-api');
const fx = require('./fx');
const logFile = process.env.LOG;

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
    try {
        const r = await binance.marketBuy(symbol, quantity);
        return r;
    } catch (error) {
        console.error('ERROR: ', error);
        fx.escreveLogJson2("ERROR", error, logFile);
        return null;
    }
}

async function sendSpotSellMarket(apiKey, apiSecret, symbol, quantity) {

    // Configuração da conexão com a API
    const binance = new Binance({
        APIKEY: apiKey,
        APISECRET: apiSecret,
        ...binanceConfigSpot,
    });
    try {
        const r = await binance.marketSell(symbol, quantity);
        return r;
    } catch (error) {
        console.error('ERROR: ', error);
        fx.escreveLogJson2("ERROR", error, logFile);
        return null;
    }
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

async function getPrice(symbol) {
    const binance = new Binance({
        ...binanceConfigSpot
    });
    try {
        const bookTicker = await binance.bookTickers(symbol);
        const precoSpot = parseFloat(bookTicker.askPrice);

        return precoSpot;
    } catch (error) {
        console.error('Ocorreu um erro ao obter o preço do mercado spot:', error);
        return null;
    }
}

async function getPrices() {
    const binance = new Binance({
        ...binanceConfigSpot
    });
    try {
        const precos = await binance.prices();

        return precos;
    } catch (error) {
        console.error('Ocorreu um erro ao obter os preços de todos os pares:', error);
        return null;
    }
}

async function BBS(apiKey, apiSecret, symbolB1, symbolPriceB1, symbolB2, symbolPriceB2, symbolS1, invest, symbolsInfo) {
    //console.log(symbolsInfo);
    const symbolPropsB1 = symbolsInfo.find(s => s.symbol === symbolB1);
    const decimals = symbolPropsB1.decimals;
    const quantityB1 = fx.calc2(invest, symbolPriceB1, decimals);
    const B1 = await sendSpotBuyMarket(apiKey, apiSecret, symbolB1, quantityB1);
    fx.escreveLog(`${symbolB1} invest ${invest} preco ${symbolPriceB1} quanti ${quantityB1}`, logFile);
    fx.escreveLog(`order: executedQty: ${B1.executedQty}`, logFile);

    const symbolPropsB2 = symbolsInfo.find(s => s.symbol === symbolB2);
    const decimals2 = symbolPropsB2.decimals;
    const quantityB2 = fx.calc2(B1.executedQty, symbolPriceB2, decimals2);
    const B2 = await sendSpotBuyMarket(apiKey, apiSecret, symbolB2, quantityB2);
    fx.escreveLog(`${symbolB2} invest ${B1.executedQty} preco ${symbolPriceB2} quanti ${quantityB2}`, logFile);
    fx.escreveLog(`order: executedQty: ${B2.executedQty}`, logFile);
    
    const symbolPropsS1 = symbolsInfo.find(s => s.symbol === symbolS1);
    const quantityS1 = fx.removeExcessDecimals(B2.executedQty, symbolPropsS1.decimals);
    const S1 = await sendSpotSellMarket(apiKey, apiSecret, symbolS1, quantityS1);
    fx.escreveLog(`${symbolS1} vende ${B2.executedQty} quanti ${quantityS1}`, logFile);
    fx.escreveLog(`order: executedQty: ${S1.executedQty}`, logFile);  
    fx.escreveLog(`order: cummulativeQuoteQty: ${S1.cummulativeQuoteQty}`, logFile); 
    return true;
}

async function BSS (apiKey, apiSecret, symbolB1, symbolPriceB1, symbolS1, symbolS2, invest, symbolsInfo){
    const symbolPropsB1 = symbolsInfo.find(s => s.symbol === symbolB1);
    const decimals = symbolPropsB1.decimals;
    const quantityB1 = fx.calc2(invest, symbolPriceB1, decimals);
    const B1 = await sendSpotBuyMarket(apiKey, apiSecret, symbolB1, quantityB1);
    fx.escreveLog(`${symbolB1} invest ${invest} preco ${symbolPriceB1} quanti ${quantityB1}`, logFile);
    fx.escreveLog(`order: executedQty: ${B1.executedQty}`, logFile);

    const symbolPropsS1 = symbolsInfo.find(s => s.symbol === symbolS1);
    const quantityS1 = fx.removeExcessDecimals(B1.executedQty, symbolPropsS1.decimals);
    const S1 = await sendSpotSellMarket(apiKey, apiSecret, symbolS1, quantityS1);
    fx.escreveLog(`${symbolS1} vende ${B1.executedQty} quanti ${quantityS1}`, logFile);
    fx.escreveLog(`order: executedQty: ${S1.executedQty}`, logFile);  
    fx.escreveLog(`order: cummulativeQuoteQty: ${S1.cummulativeQuoteQty}`, logFile);    

    const symbolPropsS2 = symbolsInfo.find(s => s.symbol === symbolS2);
    const quantityS2 = fx.removeExcessDecimals(S1.cummulativeQuoteQty, symbolPropsS2.decimals);
    const S2 = await sendSpotSellMarket(apiKey, apiSecret, symbolS2, quantityS2);
    fx.escreveLog(`${symbolS2} vende ${S1.cummulativeQuoteQty} quanti ${quantityS2}`, logFile);
    fx.escreveLog(`order: executedQty: ${S2.executedQty}`, logFile);  
    fx.escreveLog(`order: cummulativeQuoteQty: ${S2.cummulativeQuoteQty}`, logFile);

    return true;
}

module.exports = {
    getSpotTrades,
    sendSpotBuyMarket,
    sendSpotSellMarket,
    getSpotBalances,
    exchangeInfo,
    getPrice,
    getPrices,
    BBS,
    BSS
};