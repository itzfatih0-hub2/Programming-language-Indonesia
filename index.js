const fs = require("fs");
const path = require("path");
const stdlib = require("./stdlib");

const { Lexer } = require("./lexer");
const Parser = require("./parser");
const Interpreter = require("./interpreter");

const file = process.argv[2];

if (!file) {

    console.log("Penggunaan:");
    console.log("indo <file.indo>");
    process.exit(1);

}

const fullPath = path.resolve(file);

// File tidak ditemukan
if (!fs.existsSync(fullPath)) {

    console.error(
        `indo : cannot find specific file or folder\n` +
        `Path : ${fullPath}`
    );

    process.exit(1);

}

// Bukan file
if (!fs.statSync(fullPath).isFile()) {

    console.error(
        `indo : '${file}' bukan sebuah file.`
    );

    process.exit(1);

}

// Ekstensi salah
if (path.extname(fullPath) !== ".indo") {

    console.error(
        "indo : hanya dapat menjalankan file berekstensi .indo"
    );

    process.exit(1);

}

try {

    const source =
        fs.readFileSync(fullPath, "utf8");

    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter =
        new Interpreter(stdlib);

    interpreter.interpret(ast);

} catch (err) {

    console.error(
        "\nRuntime Error:\n"
    );

    console.error(err.message);

    process.exit(1);

}