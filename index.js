const fs = require("fs");

const { Lexer } = require("./lexer");
const Parser = require("./parser");
const Interpreter = require("./interpreter");

const file = process.argv[2];

if (!file) {
    console.log("Penggunaan:");
    console.log("indo <file.indo>");
    process.exit(1);
}

const source = fs.readFileSync(file, "utf8");

const lexer = new Lexer(source);
const tokens = lexer.tokenize();

const parser = new Parser(tokens);
const ast = parser.parse();

const interpreter = new Interpreter();
interpreter.interpret(ast);