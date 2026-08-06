const os = require("os");
const process = require("process");

module.exports = {

    platform() {

        return os.platform();

    },

    sistem() {

        return os.type();

    },

    arsitektur() {

        return os.arch();

    },

    hostname() {

        return os.hostname();

    },

    pengguna() {

        return os.userInfo().username;

    },

    memori() {

        return {

            total: os.totalmem(),

            bebas: os.freemem()

        };

    },

    cpu() {

        return os.cpus();

    },

    direktori() {

        return process.cwd();

    },

    keluar(kode = 0) {

        process.exit(kode);

    }

};