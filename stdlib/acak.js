module.exports = {

    angka(min, max) {

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    },

    pilih(array) {

        return array[
            Math.floor(
                Math.random() * array.length
            )
        ];

    }

};