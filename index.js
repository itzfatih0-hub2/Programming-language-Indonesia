// =======================================
// Bahasa Indonesia Programming Language
// CLI v2
// Stable CLI
// =======================================

"use strict";

const fs = require("fs");
const path = require("path");

const stdlib = require("./stdlib");

const { Lexer } = require("./lexer");
const Parser = require("./parser");
const Runtime = require("./runtime");
const Compiler = require("./compiler");


// =======================================
// VERSION
// =======================================

const VERSION = "0.9";


// =======================================
// HELP
// =======================================

function showHelp() {

    console.log(`
Bahasa Indonesia Programming Language
Version ${VERSION}

Penggunaan:

    indo <file.indo>
    indo run <file.indo>
    indo check <file.indo>
    indo compile <file.indo>

Perintah:

    run       Menjalankan program Indo
    check     Memeriksa syntax tanpa menjalankan
    compile   Mengubah Indo menjadi JavaScript

Opsi:

    -h, --help       Menampilkan bantuan
    -v, --version    Menampilkan versi

Contoh:

    indo Halo.indo
    indo run Halo.indo
    indo check Halo.indo
    indo compile Halo.indo
`);

}


// =======================================
// VERSION
// =======================================

function showVersion() {

    console.log(`Indo v${VERSION}`);

}


// =======================================
// ERROR
// =======================================

function showError(message) {

    console.error("\nIndo Error:\n");
    console.error(`  ${message}`);
    console.error("");

}


// =======================================
// FILE RESOLUTION
// =======================================

function resolveFile(file) {

    if (!file) {

        throw new Error(
            "File .indo belum diberikan."
        );

    }

    const fullPath =
        path.resolve(process.cwd(), file);

    if (!fs.existsSync(fullPath)) {

        throw new Error(
            `File '${file}' tidak ditemukan.\nPath: ${fullPath}`
        );

    }

    const stat =
        fs.statSync(fullPath);

    if (!stat.isFile()) {

        throw new Error(
            `'${file}' bukan sebuah file.`
        );

    }

    if (
        path.extname(fullPath).toLowerCase() !== ".indo"
    ) {

        throw new Error(
            "File yang digunakan harus berekstensi .indo."
        );

    }

    return fullPath;

}


// =======================================
// READ SOURCE
// =======================================

function readSource(fullPath) {

    try {

        return fs.readFileSync(
            fullPath,
            "utf8"
        );

    } catch (error) {

        throw new Error(
            `Gagal membaca file '${fullPath}': ${error.message}`
        );

    }

}


// =======================================
// PARSE
// =======================================

function parseSource(source) {

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


    return {
        tokens,
        ast
    };

}


// =======================================
// RUN
// =======================================

async function runFile(file) {

    const fullPath =
        resolveFile(file);

    const source =
        readSource(fullPath);

    const { ast } =
        parseSource(source);


    const runtime =
        new Runtime(stdlib);


    await runtime.run(ast);

}


// =======================================
// CHECK
// =======================================

function checkFile(file) {

    const fullPath =
        resolveFile(file);

    const source =
        readSource(fullPath);

    const { tokens, ast } =
        parseSource(source);


    console.log(
        `✓ Syntax valid: ${path.basename(fullPath)}`
    );

    console.log(
        `  Tokens : ${tokens.length}`
    );

    console.log(
        `  AST    : ${ast.type}`
    );

}


// =======================================
// COMPILE
// =======================================

function compileFile(file) {

    const fullPath =
        resolveFile(file);

    const source =
        readSource(fullPath);

    const { ast } =
        parseSource(source);


    const compiler =
    new Compiler({
        stdlibPath:
            path.resolve(
                __dirname,
                "stdlib"
            )
    });


    const javascript =
        compiler.compile(ast);


    const outputPath =
        path.join(
            path.dirname(fullPath),
            path.basename(
                fullPath,
                ".indo"
            ) + ".js"
        );


    fs.writeFileSync(
        outputPath,
        javascript,
        "utf8"
    );


    console.log(
        `✓ Compiled: ${path.basename(fullPath)}`
    );

    console.log(
        `  Output: ${outputPath}`
    );

}


// =======================================
// ARGUMENTS
// =======================================

const args =
    process.argv.slice(2);


// =======================================
// NO ARGUMENT
// =======================================

if (args.length === 0) {

    showHelp();

    process.exit(1);

}


// =======================================
// OPTIONS
// =======================================

if (
    args[0] === "-h" ||
    args[0] === "--help"
) {

    showHelp();

    process.exit(0);

}


if (
    args[0] === "-v" ||
    args[0] === "--version"
) {

    showVersion();

    process.exit(0);

}


// =======================================
// COMMAND
// =======================================

async function main() {

    try {

        let command;
        let file;


        // -------------------------------
        // Default:
        //
        // indo Halo.indo
        // -------------------------------

        if (
            args[0] &&
            args[0].toLowerCase().endsWith(".indo")
        ) {

            command = "run";
            file = args[0];

        } else {

            command =
                args[0];

            file =
                args[1];

        }


        // -------------------------------
        // RUN
        // -------------------------------

        if (command === "run") {

            if (!file) {

                throw new Error(
                    "Perintah 'run' membutuhkan file .indo."
                );

            }

            await runFile(file);

            return;

        }


        // -------------------------------
        // CHECK
        // -------------------------------

        if (command === "check") {

            if (!file) {

                throw new Error(
                    "Perintah 'check' membutuhkan file .indo."
                );

            }

            checkFile(file);

            return;

        }


        // -------------------------------
        // COMPILE
        // -------------------------------

        if (command === "compile") {

            if (!file) {

                throw new Error(
                    "Perintah 'compile' membutuhkan file .indo."
                );

            }

            compileFile(file);

            return;

        }


        // -------------------------------
        // UNKNOWN COMMAND
        // -------------------------------

        throw new Error(
            `Perintah '${command}' tidak dikenal. Gunakan 'indo --help'.`
        );

    } catch (error) {

        showError(
            error && error.message
                ? error.message
                : String(error)
        );

        process.exitCode = 1;

    }

}


// =======================================
// START
// =======================================

main();