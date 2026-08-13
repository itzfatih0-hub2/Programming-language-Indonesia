// =======================================
// Bahasa Indonesia Programming Language
// Standard Library - Matematika
// =======================================

module.exports = {

    // Dasar
    akar: Math.sqrt,
    pangkat: Math.pow,
    mutlak: Math.abs,

    // Pembulatan
    bulat: Math.round,
    lantai: Math.floor,
    atas: Math.ceil,
    trunc: Math.trunc,

    // Minimum / maksimum
    maksimum: Math.max,
    minimum: Math.min,

    // Pangkat & logaritma
    eksponensial: Math.exp,
    logaritma: Math.log,
    log10: Math.log10,
    log2: Math.log2,

    // Trigonometri
    sinus: Math.sin,
    cosinus: Math.cos,
    tangen: Math.tan,

    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    atan2: Math.atan2,

    // Konversi sudut
    derajatKeRadian(derajat) {
        return derajat * Math.PI / 180;
    },

    radianKeDerajat(radian) {
        return radian * 180 / Math.PI;
    },

    // Acak
    acak(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    },

    acakBulat(min, max) {
        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;
    },

    // Konstanta
    PI: Math.PI,
    E: Math.E,

};