module.exports = {

    sekarang() {

        return Date.now();

    },

    tanggal() {

        return new Date().toLocaleDateString("id-ID");

    },

    jam() {

        return new Date().toLocaleTimeString("id-ID");

    },

    tunggu(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );

    }

};