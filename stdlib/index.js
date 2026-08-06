const matematika = require("./matematika");
const teks = require("./teks");
const waktu = require("./waktu");
const acak = require("./acak");
const array = require("./array");
const file = require("./file");
const sistem = require("./sistem");

const json = require("./json");
const http = require("./http");
const database = require("./database");

module.exports = {

    ...matematika,
    ...teks,
    ...waktu,
    ...acak,
    ...array,
    ...file,
    ...sistem,

    ...json,
    ...http,
    ...database

};