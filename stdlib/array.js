module.exports = {

    panjang(array) {
        return array.length;
    },

    tambah(array, nilai) {
        array.push(nilai);
        return array;
    },

    hapus(array) {
        return array.pop();
    },

    depan(array) {
        return array.shift();
    },

    tambahDepan(array, nilai) {
        array.unshift(nilai);
        return array;
    },

    indeks(array, index) {
        return array[index];
    },

    cari(array, nilai) {
        return array.indexOf(nilai);
    },

    ada(array, nilai) {
        return array.includes(nilai);
    },

    balik(array) {
        return [...array].reverse();
    },

    urut(array) {
        return [...array].sort();
    },

    gabung(array, pemisah = ",") {
        return array.join(pemisah);
    }

};