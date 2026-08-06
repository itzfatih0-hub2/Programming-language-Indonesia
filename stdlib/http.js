const axios = require("axios");

module.exports = {

    async ambil(url) {

        const res = await axios.get(url);

        return res.data;

    },

    async kirim(url, data) {

        const res = await axios.post(
            url,
            data
        );

        return res.data;

    },

    async hapus(url) {

        const res = await axios.delete(url);

        return res.data;

    }

};