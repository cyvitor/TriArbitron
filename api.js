const axios = require('axios');

async function exchangeInfo() {
    const response = await axios.get("https://api.binance.com/api/v3/exchangeInfo");

    const symbols = response.data.symbols.filter(s => s.status === 'TRADING');

    const result = symbols.map(s => {
        const minQtyFilter = s.filters.find(f => f.filterType === 'LOT_SIZE');
        const minQty = parseFloat(minQtyFilter.minQty);
        if (Math.floor(minQty) === minQty) {
            decimals = 0;
        }else{
            decimals = minQty.toString().split(".")[1].length || 0;
        }

        return {
            symbol: s.symbol,
            base: s.baseAsset,
            quote: s.quoteAsset,
            minQty: minQty,
            decimals: decimals
        };
    });

    return result;
}

module.exports = { exchangeInfo }