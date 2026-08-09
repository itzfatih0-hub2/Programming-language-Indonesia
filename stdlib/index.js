// =======================================
// Bahasa Indonesia Programming Language
// Standard Library
// =======================================

const acak = require("./acak");
const array = require("./array");
const database = require("./database");
const file = require("./file");
const http = require("./http");
const json = require("./json");
const matematika = require("./matematika");
const sistem = require("./sistem");
const teks = require("./teks");
const waktu = require("./waktu");

module.exports = {

    ...acak,
    ...array,
    ...database,
    ...file,
    ...http,
    ...json,
    ...matematika,
    ...sistem,
    ...teks,
    ...waktu

};