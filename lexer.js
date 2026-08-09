// =======================================
// Bahasa Indonesia Programming Language
// Lexer v2
// =======================================

const KEYWORDS = require("./keywords");


// =======================================
// Token
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
// Lexer
// =======================================

class Lexer {

    constructor(source) {

        this.source = source;

        this.position = 0;

        this.line = 1;

        this.column = 1;

    }


    // ===================================
    // Navigation
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

        const char = this.current();

        if (char === "\n") {

            this.line++;
            this.column = 1;

        } else {

            this.column++;

        }

        this.position++;

        return char;

    }


    // ===================================
    // Character Helpers
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
            char !== undefined &&
            /[0-9]/.test(char)
        );

    }


    isLetter(char) {

        return (
            char !== undefined &&
            /[A-Za-z_]/.test(char)
        );

    }


    isAlphaNumeric(char) {

        return (
            char !== undefined &&
            /[A-Za-z0-9_]/.test(char)
        );

    }


    // ===================================
    // Token
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
    // Whitespace
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
    // Comments
    // ===================================

    skipComment() {

        // -------------------------------
        // #
        // -------------------------------

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


        // -------------------------------
        // //
        // -------------------------------

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


        // -------------------------------
        // /* ... */
        // -------------------------------

        if (
            this.current() === "/" &&
            this.peek() === "*"
        ) {

            const startLine =
                this.line;

            const startColumn =
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

            throw new Error(
                `Lexer Error (${startLine}:${startColumn}) ` +
                `Komentar multiline belum ditutup.`
            );

        }


        return false;

    }


    // ===================================
    // Number
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


            if (this.isDigit(char)) {

                text += char;

                this.advance();

                continue;

            }


            if (
                char === "." &&
                !hasDot &&
                this.isDigit(this.peek())
            ) {

                hasDot = true;

                text += char;

                this.advance();

                continue;

            }


            break;

        }


        const value =
            Number(text);


        if (Number.isNaN(value)) {

            throw new Error(
                `Lexer Error (${line}:${column}) ` +
                `Angka '${text}' tidak valid.`
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
    // String
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


            // ---------------------------
            // String selesai
            // ---------------------------

            if (char === quote) {

                this.advance();

                return this.makeToken(
                    "STRING",
                    value,
                    line,
                    column
                );

            }


            // ---------------------------
            // Escape
            // ---------------------------

            if (char === "\\") {

                this.advance();


                if (this.eof()) {

                    break;

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

                        value += escaped;

                        break;

                }


                this.advance();

                continue;

            }


            // ---------------------------
            // Newline dalam string
            // ---------------------------

            if (char === "\n") {

                throw new Error(
                    `Lexer Error (${line}:${column}) ` +
                    `String belum ditutup.`
                );

            }


            value += char;

            this.advance();

        }


        throw new Error(
            `Lexer Error (${line}:${column}) ` +
            `String belum ditutup.`
        );

    }


    // ===================================
    // Identifier / Keyword
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

            value += this.current();

            this.advance();

        }


        // -------------------------------
        // Keyword
        // -------------------------------

        const keywordType =
            KEYWORDS[value];


        if (keywordType) {

            // Boolean
            if (
                keywordType === "BOOLEAN"
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
                keywordType === "NULL"
            ) {

                return this.makeToken(
                    "NULL",
                    null,
                    line,
                    column
                );

            }


            return this.makeToken(
                keywordType,
                value,
                line,
                column
            );

        }


        // -------------------------------
        // Identifier
        // -------------------------------

        return this.makeToken(
            "IDENTIFIER",
            value,
            line,
            column
        );

    }


    // ===================================
    // Operator
    // ===================================

    readOperator() {

        const line =
            this.line;

        const column =
            this.column;

        const two =
            this.current() +
            this.peek();


        // ===============================
        // Two-character operators
        // ===============================

        const doubleOperators = {

            "==": "EQUAL_EQUAL",

            "!=": "NOT_EQUAL",

            ">=": "GREATER_EQUAL",

            "<=": "LESS_EQUAL",

            "&&": "AND",

            "||": "OR"

        };


        if (
            doubleOperators[two]
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


        // ===============================
        // Single-character operators
        // ===============================

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
            operators[this.current()];


        if (type) {

            const value =
                this.current();

            this.advance();

            return this.makeToken(
                type,
                value,
                line,
                column
            );

        }


        return null;

    }


    // ===================================
    // Symbol
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
    // Main Tokenizer
    // ===================================

    tokenize() {

        const tokens = [];


        while (!this.eof()) {

            // ---------------------------
            // Whitespace
            // ---------------------------

            if (
                this.isWhitespace(
                    this.current()
                )
            ) {

                this.skipWhitespace();

                continue;

            }


            // ---------------------------
            // Comment
            // ---------------------------

            if (
                this.skipComment()
            ) {

                continue;

            }


            // ---------------------------
            // Number
            // ---------------------------

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


            // ---------------------------
            // String
            // ---------------------------

            if (
                this.current() === "\"" ||
                this.current() === "'"
            ) {

                tokens.push(
                    this.readString()
                );

                continue;

            }


            // ---------------------------
            // Identifier
            // ---------------------------

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


            // ---------------------------
            // Operator
            // ---------------------------

            const operator =
                this.readOperator();


            if (operator) {

                tokens.push(operator);

                continue;

            }


            // ---------------------------
            // Symbol
            // ---------------------------

            const symbol =
                this.readSymbol();


            if (symbol) {

                tokens.push(symbol);

                continue;

            }


            // ---------------------------
            // Unknown
            // ---------------------------

            throw new Error(

                `Lexer Error (${this.line}:${this.column}) ` +
                `Karakter '${this.current()}' tidak dikenali.`

            );

        }


        // =================================
        // EOF
        // =================================

        tokens.push(

            this.makeToken(
                "EOF",
                null
            )

        );


        return tokens;

    }

}


// =======================================
// Export
// =======================================

module.exports = {

    Lexer,

    Token

};