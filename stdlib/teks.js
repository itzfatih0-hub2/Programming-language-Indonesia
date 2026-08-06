module.exports = {

    panjang(teks) {

        return teks.length;

    },

    besar(teks) {

        return teks.toUpperCase();

    },

    kecil(teks) {

        return teks.toLowerCase();

    },

    potong(teks, awal, akhir) {

        return teks.slice(awal, akhir);

    },

    ganti(teks, lama, baru) {

        return teks.replaceAll(lama, baru);

    },

    gabung(...teks) {

        return teks.join("");

    }

};