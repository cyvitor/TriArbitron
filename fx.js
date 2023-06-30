const fs = require('fs');
function calc(montanteInvestido, precoMoeda) {
    const quantidadeMoedas = montanteInvestido / precoMoeda;
    return quantidadeMoedas;
}
function calc2(montanteInvestido, precoMoeda, casasDecimais) {
    const quantidadeMoedas = montanteInvestido / precoMoeda;
    const fator = Math.pow(10, casasDecimais);
    const quantidadeTruncada = Math.floor(quantidadeMoedas * fator) / fator;
    return quantidadeTruncada;
}
function countDecimals(value) {
    if (Math.floor(value) === value) {
        return 0;
    }
    return value.toString().split(".")[1].length || 0;
}
function removeExcessDecimals(number, decimalPlaces) {
    const factor = 10 ** decimalPlaces;
    const truncatedNumber = Math.floor(number * factor) / factor;
    return truncatedNumber;
}
function escreveLog(msg, file) {
    const dataHora = new Date().toLocaleString();
    const texto = `${dataHora} - ${msg}\n`;
    console.log(texto);
    fs.appendFile(file, texto, err => {
        if (err) throw err;
    });
}

function escreveLogJson(txt, msg, file) {
    const dataHora = new Date().toLocaleString();
    const objetoString = JSON.stringify(msg);
    const texto = `${dataHora} - ${txt} - ${objetoString}\n`;
    console.log(texto);
    fs.appendFile(file, texto, err => {
        if (err) throw err;
    });
}
function escreveLogJson2(txt, msg, file) {
    const dataHora = new Date().toLocaleString();
    const objetoString = JSON.stringify(msg);
    const texto = `${dataHora} - ${txt} - ${objetoString}\n`;
    fs.appendFile(file, texto, err => {
        if (err) throw err;
    });
}

module.exports = {
    calc,
    calc2,
    countDecimals,
    removeExcessDecimals,
    escreveLog,
    escreveLogJson,
    escreveLogJson2
};