// =======================================
// Bahasa Indonesia Programming Language
// Parser v4
// =======================================

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.currentIndex = 0;

    }

    // =======================================
    // NAVIGATION
    // =======================================

    current() {

        return this.tokens[this.currentIndex];

    }

    previous() {

        return this.tokens[this.currentIndex - 1];

    }

    peek(offset = 1) {

        return this.tokens[
            this.currentIndex + offset
        ];

    }

    isAtEnd() {

        return this.current().type === "EOF";

    }

    advance() {

        if (!this.isAtEnd()) {

            this.currentIndex++;

        }

        return this.previous();

    }

    // =======================================
    // TOKEN CHECKING
    // =======================================

    check(type, value = null) {

        if (this.isAtEnd()) {

            return type === "EOF";

        }

        const token = this.current();

        if (token.type !== type) {

            return false;

        }

        if (
            value !== null &&
            token.value !== value
        ) {

            return false;

        }

        return true;

    }

    match(type, value = null) {

        if (this.check(type, value)) {

            this.advance();

            return true;

        }

        return false;

    }

    expect(type, value = null) {

        if (this.check(type, value)) {

            return this.advance();

        }

        const token = this.current();

        const expected =
            value !== null
                ? `${type} '${value}'`
                : type;

        throw new Error(

            `Parser Error (${token.line}:${token.column})\n` +
            `Diharapkan ${expected}, ` +
            `tetapi mendapat ${token.type}` +
            (
                token.value !== null
                    ? ` '${token.value}'`
                    : ""
            )

        );

    }

    // =======================================
    // PROGRAM
    // =======================================

    parse() {

        const body = [];

        while (!this.isAtEnd()) {

            // Izinkan ; sebagai pemisah statement
            if (this.match("SEMICOLON")) {

                continue;

            }

            body.push(
                this.parseStatement()
            );

        }

        return {

            type: "Program",

            body

        };

    }

    // =======================================
    // STATEMENT
    // =======================================

    parseStatement() {

        if (this.match("VAR")) {

            return this.parseVariable();

        }

        if (this.match("PRINT")) {

            return this.parsePrint();

        }

        if (this.match("IF")) {

            return this.parseIf();

        }

        if (this.match("WAIT")) {

            return this.parseWait();

        }

        if (this.match("WHILE")) {

            return this.parseWhile();

        }

        if (this.match("FOR")) {

            return this.parseFor();

        }

        if (this.match("FUNCTION")) {

            return this.parseFunction();

        }

        if (this.match("RETURN")) {

            return this.parseReturn();

        }

        if (this.match("CLASS")) {

            return this.parseClass();

        }

        if (this.match("IMPORT")) {

            return this.parseImport();

        }

        return this.parseExpressionStatement();

    }

    // =======================================
    // WAIT
    // =======================================

    parseWait() {

    const duration =
        this.parseExpression();

    this.match("SEMICOLON");

    return {

        type: "WaitStatement",

        duration

      };

    }

    // =======================================
    // VARIABLE
    // =======================================

    parseVariable() {

        const identifier = {

            type: "Identifier",

            name:
                this.expect("IDENTIFIER").value

        };

        this.expect("ASSIGN");

        const initializer =
            this.parseExpression();

        this.match("SEMICOLON");

        return {

            type: "VariableDeclaration",

            identifier,

            initializer

        };

    }

    // =======================================
    // PRINT
    // =======================================

    parsePrint() {

        const value =
            this.parseExpression();

        this.match("SEMICOLON");

        return {

            type: "PrintStatement",

            value

        };

    }

    // =======================================
    // EXPRESSION STATEMENT
    // =======================================

    parseExpressionStatement() {

        const expression =
            this.parseExpression();

        this.match("SEMICOLON");

        return {

            type: "ExpressionStatement",

            expression

        };

    }

    // =======================================
    // IF
    // =======================================

    parseIf() {

    const condition =
        this.parseExpression();

    const thenBody =
        this.parseBlock();

    let elseBody = null;

    if (this.match("ELSE")) {

        elseBody =
            this.parseBlock();

    }

    return {

        type: "IfStatement",

        condition,

        thenBody,

        elseBody

      };

    }

    // =======================================
    // WHILE
    // =======================================

    parseWhile() {

    const condition =
        this.parseExpression();

    this.expect("LEFT_BRACE");

    const body = [];

    while (
        !this.check("RIGHT_BRACE") &&
        !this.isAtEnd()
    ) {

        body.push(
            this.parseStatement()
        );

    }

    this.expect("RIGHT_BRACE");

    return {

        type: "WhileStatement",

        condition,

        body

      };

    }

    // =======================================
    // FOR
    // =======================================

    parseFor() {

    const variable =
        this.expect("IDENTIFIER").value;

    this.expect("FROM");

    const start =
        this.parseExpression();

    this.expect("TO");

    const end =
        this.parseExpression();

    let step = {
        type: "Literal",
        value: 1
    };

    if (this.match("STEP")) {

        step =
            this.parseExpression();

    }

    // "lakukan"
    this.expect("DO");

    // Block menggunakan { ... }
    const body =
        this.parseBlock();

    return {

        type: "ForStatement",

        variable,

        start,

        end,

        step,

        body

     };

    }

    // =======================================
    // BLOCK
    // =======================================

    parseBlock() {

    this.expect("LEFT_BRACE");

    const body = [];

    while (
        !this.check("RIGHT_BRACE") &&
        !this.isAtEnd()
    ) {

        if (this.match("SEMICOLON")) {
            continue;
        }

        body.push(
            this.parseStatement()
        );

    }

    this.expect("RIGHT_BRACE");

    return body;

    }

    // =======================================
    // FUNCTION
    // =======================================
    parseFunction() {

    const name =
        this.expect("IDENTIFIER").value;

    this.expect("LEFT_PAREN");

    const params = [];

    if (!this.check("RIGHT_PAREN")) {

        do {

            params.push(
                this.expect("IDENTIFIER").value
            );

        } while (
            this.match("COMMA")
        );

    }

    this.expect("RIGHT_PAREN");

    // Function menggunakan { ... }
    const body =
        this.parseBlock();

    this.match("SEMICOLON");

    return {

        type: "FunctionDeclaration",

        name,

        params,

        body

     };

    }

    // =======================================
    // RETURN
    // =======================================

    parseReturn() {

        let value = null;

        /*
         * return tanpa nilai:
         *
         * kembali
         * selesai
         */

        if (
        !this.check("RIGHT_BRACE") &&
        !this.check("ELSE") &&
        !this.check("EOF") &&
        !this.check("SEMICOLON")
        ) {

            value =
                this.parseExpression();

        }

        this.match("SEMICOLON");

        return {

            type: "ReturnStatement",

            value

        };

    }

    // =======================================
    // IMPORT
    // =======================================

    parseImport() {

        const file =
            this.expect("STRING").value;

        this.match("SEMICOLON");

        return {

            type: "ImportStatement",

            file

        };

    }

    // =======================================
    // CLASS
    // =======================================

    parseClass() {

        const name =
            this.expect("IDENTIFIER").value;
        
        const body =
        this.parseBlock();

        return {

            type: "ClassDeclaration",

            name,

            body

        };

    }

    // =======================================
    // EXPRESSION
    // =======================================

    parseExpression() {

        return this.parseAssignment();

    }

    // =======================================
    // ASSIGNMENT
    // =======================================

    parseAssignment() {

        const left =
            this.parseLogicalOr();

        if (this.match("ASSIGN")) {

            if (
                left.type !== "Identifier" &&
                left.type !== "MemberExpression"
            ) {

                throw this.error(
                    "Target assignment harus berupa variabel atau property."
                );

            }

            const right =
                this.parseAssignment();

            return {

                type: "AssignmentExpression",

                left,

                right

            };

        }

        return left;

    }

    // =======================================
    // LOGICAL OR
    // =======================================

    parseLogicalOr() {

        let expr =
            this.parseLogicalAnd();

        while (
            this.match("OR")
        ) {

            expr = {

                type: "LogicalExpression",

                operator: "OR",

                left: expr,

                right:
                    this.parseLogicalAnd()

            };

        }

        return expr;

    }

    // =======================================
    // LOGICAL AND
    // =======================================

    parseLogicalAnd() {

        let expr =
            this.parseEquality();

        while (
            this.match("AND")
        ) {

            expr = {

                type: "LogicalExpression",

                operator: "AND",

                left: expr,

                right:
                    this.parseEquality()

            };

        }

        return expr;

    }

    // =======================================
    // EQUALITY
    // =======================================

    parseEquality() {

        let expr =
            this.parseComparison();

        while (
            this.match("EQUAL_EQUAL") ||
            this.match("NOT_EQUAL")
        ) {

            const operator =
                this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right:
                    this.parseComparison()

            };

        }

        return expr;

    }

    // =======================================
    // COMPARISON
    // =======================================

    parseComparison() {

        let expr =
            this.parseTerm();

        while (
            this.match("GREATER") ||
            this.match("GREATER_EQUAL") ||
            this.match("LESS") ||
            this.match("LESS_EQUAL")
        ) {

            const operator =
                this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right:
                    this.parseTerm()

            };

        }

        return expr;

    }

    // =======================================
    // TERM
    // =======================================

    parseTerm() {

        let expr =
            this.parseFactor();

        while (
            this.match("PLUS") ||
            this.match("MINUS")
        ) {

            const operator =
                this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right:
                    this.parseFactor()

            };

        }

        return expr;

    }

    // =======================================
    // FACTOR
    // =======================================

    parseFactor() {

        let expr =
            this.parseUnary();

        while (
            this.match("STAR") ||
            this.match("SLASH") ||
            this.match("PERCENT")
        ) {

            const operator =
                this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right:
                    this.parseUnary()

            };

        }

        return expr;

    }

    // =======================================
    // UNARY
    // =======================================

    parseUnary() {

        if (this.match("NOT")) {

            return {

                type: "UnaryExpression",

                operator: "NOT",

                argument:
                    this.parseUnary()

            };

        }

        if (this.match("MINUS")) {

            return {

                type: "UnaryExpression",

                operator: "MINUS",

                argument:
                    this.parseUnary()

            };

        }

        return this.parseCall();

    }

    // =======================================
    // CALL / MEMBER / INDEX
    // =======================================

    parseCall() {

        let expr =
            this.parsePrimary();

        while (true) {

            // -------------------------------
            // Function Call
            // -------------------------------

            if (this.match("LEFT_PAREN")) {

                const args = [];

                if (
                    !this.check("RIGHT_PAREN")
                ) {

                    do {

                        args.push(
                            this.parseExpression()
                        );

                    } while (
                        this.match("COMMA")
                    );

                }

                this.expect("RIGHT_PAREN");

                expr = {

                    type: "CallExpression",

                    callee: expr,

                    arguments: args

                };

                continue;

            }

            // -------------------------------
            // Member Access
            // -------------------------------

            if (this.match("DOT")) {

                const property = {

                    type: "Identifier",

                    name:
                        this.expect(
                            "IDENTIFIER"
                        ).value

                };

                expr = {

                    type: "MemberExpression",

                    object: expr,

                    property,

                    computed: false

                };

                continue;

            }

            // -------------------------------
            // Array Index
            // -------------------------------

            if (this.match("LEFT_BRACKET")) {

                const property =
                    this.parseExpression();

                this.expect(
                    "RIGHT_BRACKET"
                );

                expr = {

                    type: "MemberExpression",

                    object: expr,

                    property,

                    computed: true

                };

                continue;

            }

            break;

        }

        return expr;

    }

    // =======================================
    // PRIMARY
    // =======================================

    parsePrimary() {

        // -------------------------------
        // Number
        // -------------------------------

        if (this.match("NUMBER")) {

            return {

                type: "Literal",

                value:
                    this.previous().value

            };

        }

        // -------------------------------
        // String
        // -------------------------------

        if (this.match("STRING")) {

            return {

                type: "Literal",

                value:
                    this.previous().value

            };

        }

        // -------------------------------
        // Boolean
        // -------------------------------

        if (this.match("BOOLEAN")) {

            return {

                type: "Literal",

                value:
                    this.previous().value

            };

        }

        // -------------------------------
        // Wait Expression
        // -------------------------------

        if (this.match("WAIT")) {

        const duration =
           this.parseUnary();

        const expression =
           this.parseUnary();

        return {

           type: "WaitExpression",

           duration,

           expression

           };

        }

        // -------------------------------
        // Null
        // -------------------------------

        if (this.match("NULL")) {

            return {

                type: "Literal",

                value: null

            };

        }

        // -------------------------------
        // Identifier
        // -------------------------------

        if (this.match("IDENTIFIER")) {

            return {

                type: "Identifier",

                name:
                    this.previous().value

            };

        }

        // -------------------------------
        // Grouping
        // -------------------------------

        if (this.match("LEFT_PAREN")) {

            const expression =
                this.parseExpression();

            this.expect("RIGHT_PAREN");

            return expression;

        }

        // -------------------------------
        // Array
        // -------------------------------

        if (this.match("LEFT_BRACKET")) {

            const elements = [];

            if (
                !this.check("RIGHT_BRACKET")
            ) {

                do {

                    elements.push(
                        this.parseExpression()
                    );

                } while (
                    this.match("COMMA")
                );

            }

            this.expect("RIGHT_BRACKET");

            return {

                type: "ArrayExpression",

                elements

            };

        }

        // -------------------------------
        // Object
        // -------------------------------

        if (this.match("LEFT_BRACE")) {

            const properties = [];

            if (
                !this.check("RIGHT_BRACE")
            ) {

                do {

                    let key;

                    // Object key bisa identifier
                    if (
                        this.check("IDENTIFIER")
                    ) {

                        key =
                            this.advance().value;

                    }

                    // Atau string
                    else if (
                        this.check("STRING")
                    ) {

                        key =
                            this.advance().value;

                    }

                    else {

                        throw this.error(
                            "Key object harus berupa identifier atau string."
                        );

                    }

                    this.expect("COLON");

                    const value =
                        this.parseExpression();

                    properties.push({

                        key,

                        value

                    });

                } while (
                    this.match("COMMA")
                );

            }

            this.expect("RIGHT_BRACE");

            return {

                type: "ObjectExpression",

                properties

            };

        }

        throw this.error(
            `Expression tidak valid. ` +
            `Mendapat ${this.current().type}` +
            (
                this.current().value !== null
                    ? ` '${this.current().value}'`
                    : ""
            )
        );

    }

    // =======================================
    // ERROR
    // =======================================

    error(message) {

        const token =
            this.current();

        return new Error(

            `Parser Error (${token.line}:${token.column})\n` +
            message

        );

    }

}


// =======================================
// EXPORT
// =======================================

module.exports = Parser;