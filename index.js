const fs = require("fs");
const path = require("path");

const stdlib = require("./stdlib");

const { Lexer } = require("./lexer");
const Parser = require("./parser");
const Runtime = require("./runtime");

const file = process.argv[2];


// =======================================
// ARGUMENT
// =======================================

if (!file) {

    console.log("Penggunaan:");
    console.log("indo <file.indo>");

    process.exit(1);

}


// =======================================
// RESOLVE FILE
// =======================================

const fullPath =
    path.resolve(file);


// =======================================
// FILE CHECK
// =======================================

if (!fs.existsSync(fullPath)) {

    console.error(
        `indo : cannot find specific file or folder\n` +
        `Path : ${fullPath}`
    );

    process.exit(1);

}


// =======================================
// FILE TYPE
// =======================================

if (!fs.statSync(fullPath).isFile()) {

    console.error(
        `indo : '${file}' bukan sebuah file.`
    );

    process.exit(1);

}


// =======================================
// EXTENSION CHECK
// =======================================

if (
    path.extname(fullPath) !== ".indo"
) {

    console.error(
        "indo : hanya dapat menjalankan file berekstensi .indo"
    );

    process.exit(1);

}


// =======================================
// COMPILE + RUN
// =======================================

async function main() {

    try {

        // -------------------------------
        // Read source
        // -------------------------------

        const source =
            fs.readFileSync(
                fullPath,
                "utf8"
            );


        // -------------------------------
        // Lexer
        // -------------------------------

        const lexer =
            new Lexer(source);

        const tokens =
            lexer.tokenize();


        // -------------------------------
        // Parser
        // -------------------------------

        const parser =
            new Parser(tokens);

        const ast =
            parser.parse();


        // -------------------------------
        // Runtime
        // -------------------------------

        const runtime =
            new Runtime(stdlib);


        // -------------------------------
        // Execute AST
        // -------------------------------

        await runtime.run(ast);


    } catch (err) {

        console.error(
            "\nIndo Error:\n"
        );

        console.error(
            err.message
        );

        process.exit(1);

    }

}


// =======================================
// START
// =======================================

main();