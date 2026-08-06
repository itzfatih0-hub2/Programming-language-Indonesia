const Database = require("better-sqlite3");

module.exports = {

    buka(path) {

        return new Database(path);

    },

    jalankan(db, sql, ...params) {

        return db.prepare(sql).run(...params);

    },

    semua(db, sql, ...params) {

        return db.prepare(sql).all(...params);

    },

    satu(db, sql, ...params) {

        return db.prepare(sql).get(...params);

    },

    tutup(db) {

        db.close();

    }

};