const fs = require("fs");

module.exports = {

    baca(path) {

        return fs.readFileSync(
            path,
            "utf8"
        );

    },

    tulis(path, isi) {

        fs.writeFileSync(
            path,
            isi
        );

        return true;

    },

    tambah(path, isi) {

        fs.appendFileSync(
            path,
            isi
        );

        return true;

    },

    ada(path) {

        return fs.existsSync(path);

    },

    hapus(path) {

        if (fs.existsSync(path)) {

            fs.unlinkSync(path);

            return true;

        }

        return false;

    },

    daftar(folder) {

        return fs.readdirSync(folder);

    }

};