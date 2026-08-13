// =======================================
// Bahasa Indonesia Programming Language
// Lexer v3
// =======================================

const KEYWORDS = require("./keywords");


// =======================================
// TOKEN
// =======================================

class Token {

    constructor(type, value, line, column) {

        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;

    }

    toString() {

        return `${this.type}(${JSON.stringify(this.value)})`;

    }

}


// =======================================
// LEXER
// =======================================

class Lexer {

    constructor(source) {

        if (typeof source !== "string") {

            throw new TypeError(
                "Source lexer harus berupa string."
            );

        }

        this.source = source;

        this.position = 0;

        this.line = 1;

        this.column = 1;

    }


    // ===================================
    // NAVIGATION
    // ===================================

    current() {

        return this.source[this.position];

    }

    peek(offset = 1) {

        return this.source[
            this.position + offset
        ];

    }

    eof() {

        return (
            this.position >=
            this.source.length
        );

    }

    advance() {

        if (this.eof()) {

            return "";

        }

        const char =
            this.current();

        this.position++;

        if (char === "\n") {

            this.line++;
            this.column = 1;

        } else {

            this.column++;

        }

        return char;

    }


    // ===================================
    // CHARACTER HELPERS
    // ===================================

    isWhitespace(char) {

        return (
            char === " " ||
            char === "\t" ||
            char === "\r" ||
            char === "\n"
        );

    }

    isDigit(char) {

        return (
            typeof char === "string" &&
            /^[0-9]$/.test(char)
        );

    }

    isLetter(char) {

        return (
            typeof char === "string" &&
            /^[A-Za-z_]$/.test(char)
        );

    }

    isAlphaNumeric(char) {

        return (
            typeof char === "string" &&
            /^[A-Za-z0-9_]$/.test(char)
        );

    }


    // ===================================
    // TOKEN CREATOR
    // ===================================

    makeToken(
        type,
        value,
        line = this.line,
        column = this.column
    ) {

        return new Token(
            type,
            value,
            line,
            column
        );

    }


    // ===================================
    // ERROR
    // ===================================

    error(message, line = this.line, column = this.column) {

        return new Error(
            `Lexer Error (${line}:${column})\n${message}`
        );

    }


    // ===================================
    // WHITESPACE
    // ===================================

    skipWhitespace() {

        while (!this.eof()) {

            const char =
                this.current();

            if (!this.isWhitespace(char)) {

                break;

            }

            this.advance();

        }

    }


    // ===================================
    // COMMENTS
    // ===================================

    skipComment() {

        // --------------------------------
        // #
        // --------------------------------

        if (
            this.current() === "#"
        ) {

            while (
                !this.eof() &&
                this.current() !== "\n"
            ) {

                this.advance();

            }

            return true;

        }


        // --------------------------------
        // //
        // --------------------------------

        if (
            this.current() === "/" &&
            this.peek() === "/"
        ) {

            this.advance();
            this.advance();

            while (
                !this.eof() &&
                this.current() !== "\n"
            ) {

                this.advance();

            }

            return true;

        }


        // --------------------------------
        // /* ... */
        // --------------------------------

        if (
            this.current() === "/" &&
            this.peek() === "*"
        ) {

            const line =
                this.line;

            const column =
                this.column;

            this.advance();
            this.advance();

            while (!this.eof()) {

                if (
                    this.current() === "*" &&
                    this.peek() === "/"
                ) {

                    this.advance();
                    this.advance();

                    return true;

                }

                this.advance();

            }

            throw this.error(
                "Komentar multiline belum ditutup.",
                line,
                column
            );

        }

        return false;

    }


    // ===================================
    // NUMBER
    // ===================================

    readNumber() {

        const line =
            this.line;

        const column =
            this.column;

        let text = "";

        let hasDot = false;


        while (!this.eof()) {

            const char =
                this.current();

            // Angka
            if (this.isDigit(char)) {

                text += this.advance();

                continue;

            }

            // Desimal
            if (
                char === "." &&
                !hasDot &&
                this.isDigit(this.peek())
            ) {

                hasDot = true;

                text += this.advance();

                continue;

            }

            break;

        }


        const value =
            Number(text);


        if (
            !Number.isFinite(value)
        ) {

            throw this.error(
                `Angka '${text}' tidak valid.`,
                line,
                column
            );

        }


        return this.makeToken(
            "NUMBER",
            value,
            line,
            column
        );

    }


    // ===================================
    // STRING
    // ===================================

    readString() {

        const quote =
            this.current();

        const line =
            this.line;

        const column =
            this.column;

        this.advance();

        let value = "";


        while (!this.eof()) {

            const char =
                this.current();


            // --------------------------------
            // Penutup string
            // --------------------------------

            if (char === quote) {

                this.advance();

                return this.makeToken(
                    "STRING",
                    value,
                    line,
                    column
                );

            }


            // --------------------------------
            // Escape
            // --------------------------------

            if (char === "\\") {

                this.advance();

                if (this.eof()) {

                    throw this.error(
                        "String berakhir setelah karakter escape.",
                        line,
                        column
                    );

                }

                const escaped =
                    this.current();

                switch (escaped) {

                    case "n":
                        value += "\n";
                        break;

                    case "t":
                        value += "\t";
                        break;

                    case "r":
                        value += "\r";
                        break;

                    case "\\":
                        value += "\\";
                        break;

                    case "\"":
                        value += "\"";
                        break;

                    case "'":
                        value += "'";
                        break;

                    default:

                        // Untuk sekarang:
                        // \x -> x
                        value += escaped;

                        break;

                }

                this.advance();

                continue;

            }


            // --------------------------------
            // Newline
            // --------------------------------

            if (char === "\n") {

                throw this.error(
                    "String belum ditutup.",
                    line,
                    column
                );

            }


            value += this.advance();

        }


        throw this.error(
            "String belum ditutup.",
            line,
            column
        );

    }


    // ===================================
    // IDENTIFIER / KEYWORD
    // ===================================

    readIdentifier() {

        const line =
            this.line;

        const column =
            this.column;

        let value = "";


        while (
            !this.eof() &&
            this.isAlphaNumeric(
                this.current()
            )
        ) {

            value += this.advance();

        }


        const keyword =
            KEYWORDS[value];


        // --------------------------------
        // Keyword
        // --------------------------------

        if (keyword) {

            // Boolean
            if (
                keyword === "BOOLEAN"
            ) {

                return this.makeToken(
                    "BOOLEAN",
                    value === "benar",
                    line,
                    column
                );

            }


            // Null
            if (
                keyword === "NULL"
            ) {

                return this.makeToken(
                    "NULL",
                    null,
                    line,
                    column
                );

            }


            return this.makeToken(
                keyword,
                value,
                line,
                column
            );

        }


        // --------------------------------
        // Identifier
        // --------------------------------

        return this.makeToken(
            "IDENTIFIER",
            value,
            line,
            column
        );

    }


    // ===================================
    // OPERATORS
    // ===================================

    readOperator() {

        const line =
            this.line;

        const column =
            this.column;

        const first =
            this.current();

        const second =
            this.peek();

        const two =
            `${first}${second}`;


        // --------------------------------
        // Two-character operators
        // --------------------------------

        const doubleOperators = {

            "==": "EQUAL_EQUAL",

            "!=": "NOT_EQUAL",

            ">=": "GREATER_EQUAL",

            "<=": "LESS_EQUAL",

            "&&": "AND",

            "||": "OR"

        };


        if (
            Object.prototype.hasOwnProperty.call(
                doubleOperators,
                two
            )
        ) {

            this.advance();
            this.advance();

            return this.makeToken(
                doubleOperators[two],
                two,
                line,
                column
            );

        }


        // --------------------------------
        // Single-character operators
        // --------------------------------

        const operators = {

            "=": "ASSIGN",

            "+": "PLUS",

            "-": "MINUS",

            "*": "STAR",

            "/": "SLASH",

            "%": "PERCENT",

            ">": "GREATER",

            "<": "LESS",

            "!": "NOT"

        };


        const type =
            operators[first];


        if (!type) {

            return null;

        }


        this.advance();

        return this.makeToken(
            type,
            first,
            line,
            column
        );

    }


    // ===================================
    // SYMBOLS
    // ===================================

    readSymbol() {

        const line =
            this.line;

        const column =
            this.column;

        const symbols = {

            "(": "LEFT_PAREN",

            ")": "RIGHT_PAREN",

            "{": "LEFT_BRACE",

            "}": "RIGHT_BRACE",

            "[": "LEFT_BRACKET",

            "]": "RIGHT_BRACKET",

            ",": "COMMA",

            ".": "DOT",

            ":": "COLON",

            ";": "SEMICOLON"

        };


        const char =
            this.current();

        const type =
            symbols[char];


        if (!type) {

            return null;

        }


        this.advance();

        return this.makeToken(
            type,
            char,
            line,
            column
        );

    }


    // ===================================
    // TOKENIZE
    // ===================================

    tokenize() {

        const tokens = [];


        while (!this.eof()) {

            // -------------------------------
            // Whitespace
            // -------------------------------

            if (
                this.isWhitespace(
                    this.current()
                )
            ) {

                this.skipWhitespace();

                continue;

            }


            // -------------------------------
            // Comment
            // -------------------------------

            if (
                this.skipComment()
            ) {

                continue;

            }


            // -------------------------------
            // Number
            // -------------------------------

            if (
                this.isDigit(
                    this.current()
                )
            ) {

                tokens.push(
                    this.readNumber()
                );

                continue;

            }


            // -------------------------------
            // String
            // -------------------------------

            if (
                this.current() === "\"" ||
                this.current() === "'"
            ) {

                tokens.push(
                    this.readString()
                );

                continue;

            }


            // -------------------------------
            // Identifier
            // -------------------------------

            if (
                this.isLetter(
                    this.current()
                )
            ) {

                tokens.push(
                    this.readIdentifier()
                );

                continue;

            }


            // -------------------------------
            // Operator
            // -------------------------------

            const operator =
                this.readOperator();

            if (operator) {

                tokens.push(operator);

                continue;

            }


            // -------------------------------
            // Symbol
            // -------------------------------

            const symbol =
                this.readSymbol();

            if (symbol) {

                tokens.push(symbol);

                continue;

            }


            // -------------------------------
            // Unknown character
            // -------------------------------

            throw this.error(
                `Karakter '${this.current()}' tidak dikenali.`
            );

        }


        // =================================
        // EOF
        // =================================

        tokens.push(
            this.makeToken(
                "EOF",
                null,
                this.line,
                this.column
            )
        );


        return tokens;

    }

}


// =======================================
// EXPORT
// =======================================

module.exports = {
    Lexer,
    Token
};