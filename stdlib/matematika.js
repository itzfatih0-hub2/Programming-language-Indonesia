module.exports = {

    akar: Math.sqrt,

    pangkat: Math.pow,

    bulat: Math.round,

    lantai: Math.floor,

    atas: Math.ceil,

    mutlak: Math.abs,

    maksimum: Math.max,

    minimum: Math.min,

    sinus: Math.sin,

    cosinus: Math.cos,

    tangen: Math.tan,

    acak(min = 0, max = 1) {

        return Math.random() * (max - min) + min;

    }

};