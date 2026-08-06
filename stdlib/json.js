module.exports = {

    parse(teks) {

        return JSON.parse(teks);

    },

    stringify(obj, indent = 4) {

        return JSON.stringify(
            obj,
            null,
            indent
        );

    }

};