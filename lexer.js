// =======================================
// Bahasa Indonesia Programming Language
// =======================================

class Token {

    constructor(type, value, line, column) {

        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;

    }

}

// =======================================
// KEYWORDS
// =======================================

const KEYWORDS = {

    // Variabel
    "buat": "VAR",
    "bikin": "VAR",

    // Output
    "tampilkan": "PRINT",
    "tampilin": "PRINT",

    // Kondisional
    "jika": "IF",
    "kalo": "IF",

    "maka": "THEN",
    "ya": "THEN",

    "lain": "ELSE",
    "else": "ELSE",

    "selesai": "END",
    "udah": "END",

    // Function
    "fungsi": "FUNCTION",
    "bikinfungsi": "FUNCTION",

    "kembali": "RETURN",
    "balikin": "RETURN",

    // Loop
    "untuk": "FOR",
    "dari": "FROM",
    "sampai": "TO",
    "sampe": "TO",

    "langkah": "STEP",

    "lakukan": "DO",

    "selama": "WHILE",
    "selagi": "WHILE",

    // Class
    "kelas": "CLASS",

    // Import
    "pakai": "IMPORT",
    "ambil": "IMPORT",

    // Logical
    "dan": "AND",
    "atau": "OR",
    "tidak": "NOT",

    // Boolean
    "benar": "BOOLEAN",
    "salah": "BOOLEAN",

    // Null
    "kosong": "NULL"

};

// =======================================
// LEXER
// =======================================

class Lexer {

    constructor(source) {

        this.source = source;

        this.position = 0;

        this.line = 1;

        this.column = 1;

    }

    // --------------------

    current() {

        return this.source[this.position];

    }

    peek(offset = 1) {

        return this.source[
            this.position + offset
        ];

    }

    eof() {

        return this.position >= this.source.length;

    }

    advance() {

        if (this.current() === "\n") {

            this.line++;
            this.column = 1;

        } else {

            this.column++;

        }

        this.position++;

    }

    createToken(type, value) {

        return new Token(
            type,
            value,
            this.line,
            this.column
        );

    }

    // --------------------

    isWhitespace(char) {

        return /\s/.test(char);

    }

    isLetter(char) {

        return /[A-Za-z_]/.test(char);

    }

    isDigit(char) {

        return /[0-9]/.test(char);

    }

    isAlphaNumeric(char) {

        return /[A-Za-z0-9_]/.test(char);

    }

        // =======================================
    // Skip Whitespace
    // =======================================

    skipWhitespace() {

        while (
            !this.eof() &&
            this.isWhitespace(this.current())
        ) {

            this.advance();

        }

    }

    // =======================================
    // Skip Comment
    // =======================================

    skipComment() {

        // #
        if (this.current() === "#") {

            while (
                !this.eof() &&
                this.current() !== "\n"
            ) {

                this.advance();

            }

            return true;

        }

        // //
        if (
            this.current() === "/" &&
            this.peek() === "/"
        ) {

            while (
                !this.eof() &&
                this.current() !== "\n"
            ) {

                this.advance();

            }

            return true;

        }

        // /* ... */
        if (
            this.current() === "/" &&
            this.peek() === "*"
        ) {

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
                `Komentar belum ditutup (${this.line}:${this.column})`
            );

        }

        return false;

    }

    // =======================================
    // Read Number
    // =======================================

    readNumber() {

        const line = this.line;
        const column = this.column;

        let value = "";
        let hasDot = false;

        while (!this.eof()) {

            const ch = this.current();

            if (this.isDigit(ch)) {

                value += ch;
                this.advance();
                continue;

            }

            if (ch === "." && !hasDot) {

                hasDot = true;
                value += ".";
                this.advance();
                continue;

            }

            break;

        }

        return new Token(
            "NUMBER",
            Number(value),
            line,
            column
        );

    }

    // =======================================
    // Read String
    // =======================================

    readString() {

        const quote = this.current();

        const line = this.line;
        const column = this.column;

        this.advance();

        let value = "";

        while (!this.eof()) {

            const ch = this.current();

            if (ch === "\\") {

                this.advance();

                if (this.eof()) break;

                switch (this.current()) {

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

                    case '"':
                        value += '"';
                        break;

                    case "'":
                        value += "'";
                        break;

                    default:
                        value += this.current();

                }

                this.advance();

                continue;

            }

            if (ch === quote) {

                this.advance();

                return new Token(
                    "STRING",
                    value,
                    line,
                    column
                );

            }

            value += ch;
            this.advance();

        }

        throw new Error(
            `String belum ditutup (${line}:${column})`
        );

    }

    // =======================================
    // Read Identifier
    // =======================================

    readIdentifier() {

        const line = this.line;
        const column = this.column;

        let value = "";

        while (
            !this.eof() &&
            this.isAlphaNumeric(this.current())
        ) {

            value += this.current();
            this.advance();

        }

        if (Object.hasOwn(KEYWORDS, value)) {

            const type = KEYWORDS[value];

            if (type === "BOOLEAN") {

                return new Token(
                    "BOOLEAN",
                    value === "benar",
                    line,
                    column
                );

            }

            if (type === "NULL") {

                return new Token(
                    "NULL",
                    null,
                    line,
                    column
                );

            }

            return new Token(
                type,
                value,
                line,
                column
            );

        }

        return new Token(
            "IDENTIFIER",
            value,
            line,
            column
        );

    }

    // =======================================
// TOKENIZER
// =======================================

tokenize() {

    const tokens = [];

    const tokenMap = {

        // Operator
        "==": "EQUAL_EQUAL",
        "!=": "NOT_EQUAL",

        ">=": "GREATER_EQUAL",
        "<=": "LESS_EQUAL",

        "&&": "AND",
        "||": "OR",

        "=": "ASSIGN",

        "+": "PLUS",
        "-": "MINUS",
        "*": "STAR",
        "/": "SLASH",
        "%": "PERCENT",

        ">": "GREATER",
        "<": "LESS",

        "!": "NOT",

        // Symbol
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

    const sorted = Object.keys(tokenMap)
        .sort((a, b) => b.length - a.length);

    while (!this.eof()) {

        if (this.isWhitespace(this.current())) {
            this.skipWhitespace();
            continue;
        }

        if (this.skipComment()) {
            continue;
        }

        if (this.isDigit(this.current())) {
            tokens.push(this.readNumber());
            continue;
        }

        if (
            this.current() === '"' ||
            this.current() === "'"
        ) {
            tokens.push(this.readString());
            continue;
        }

        if (this.isLetter(this.current())) {
            tokens.push(this.readIdentifier());
            continue;
        }

        let found = false;

        for (const symbol of sorted) {

            if (
                this.source.startsWith(
                    symbol,
                    this.position
                )
            ) {

                tokens.push(

                    new Token(

                        tokenMap[symbol],

                        symbol,

                        this.line,

                        this.column

                    )

                );

                for (
                    let i = 0;
                    i < symbol.length;
                    i++
                ) {

                    this.advance();

                }

                found = true;
                break;

            }

        }

        if (found)
            continue;

        throw new Error(

            `Lexer Error (${this.line}:${this.column}) Karakter '${this.current()}' tidak dikenali.`

        );

    }

    tokens.push(

        new Token(
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


module.exports = {

    Lexer,

    Token,

    KEYWORDS

};