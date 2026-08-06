// =======================================
// Bahasa Indonesia Programming Language
// Parser v4
// =======================================

class Parser {

    constructor(tokens) {

        this.tokens = tokens;
        this.position = 0;

    }

    // =======================================
    // Helper
    // =======================================

    current() {

        return this.tokens[this.position];

    }

    previous() {

        return this.tokens[this.position - 1];

    }

    peek(offset = 1) {

        return this.tokens[
            this.position + offset
        ];

    }

    isAtEnd() {

        return this.current().type === "EOF";

    }

    advance() {

        if (!this.isAtEnd()) {

            this.position++;

        }

        return this.previous();

    }

    check(type) {

        if (this.isAtEnd())
            return false;

        return this.current().type === type;

    }

    match(...types) {

        for (const type of types) {

            if (this.check(type)) {

                this.advance();

                return true;

            }

        }

        return false;

    }

    expect(type) {

        if (this.check(type))
            return this.advance();

        const token = this.current();

        throw new Error(

            `Parser Error (${token.line}:${token.column})

Diharapkan:

${type}

Tetapi mendapat:

${token.type}`

        );

    }

    // =======================================
    // Program
    // =======================================

    parse() {

        const body = [];

        while (!this.isAtEnd()) {

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
    // Statement Dispatcher
    // =======================================

    parseStatement() {

        if (this.match("VAR"))
            return this.parseVariable();

        if (this.match("PRINT"))
            return this.parsePrint();

        if (this.match("IF"))
            return this.parseIf();

        if (this.match("FUNCTION"))
            return this.parseFunction();

        if (this.match("RETURN"))
            return this.parseReturn();

        if (this.match("FOR"))
            return this.parseFor();

        if (this.match("WHILE"))
            return this.parseWhile();

        if (this.match("CLASS"))
            return this.parseClass();

        if (this.match("IMPORT"))
            return this.parseImport();

        return this.parseExpressionStatement();

    }

        // =======================================
    // Variable
    // =======================================

    parseVariable() {

        const identifier = this.expect("IDENTIFIER");

        this.expect("ASSIGN");

        const initializer = this.parseExpression();

        return {

            type: "VariableDeclaration",

            identifier: {

                type: "Identifier",

                name: identifier.value

            },

            initializer

        };

    }

    // =======================================
    // Print
    // =======================================

    parsePrint() {

        return {

            type: "PrintStatement",

            value: this.parseExpression()

        };

    }

    // =======================================
    // Expression Statement
    // =======================================

    parseExpressionStatement() {

        return {

            type: "ExpressionStatement",

            expression: this.parseExpression()

        };

    }

    // =======================================
    // Expression Entry
    // =======================================

    parseExpression() {

        return this.parseAssignment();

    }

        // =======================================
    // Assignment
    // =======================================

    parseAssignment() {

        let expr = this.parseLogicalOr();

        if (this.match("ASSIGN")) {

            if (expr.type !== "Identifier") {

                throw new Error(
                    "Target assignment harus berupa Identifier."
                );

            }

            return {

                type: "AssignmentExpression",

                left: expr,

                right: this.parseAssignment()

            };

        }

        return expr;

    }

    // =======================================
    // Logical OR
    // =======================================

    parseLogicalOr() {

        let expr = this.parseLogicalAnd();

        while (
            this.match("OR")
        ) {

            expr = {

                type: "LogicalExpression",

                operator: "OR",

                left: expr,

                right: this.parseLogicalAnd()

            };

        }

        return expr;

    }

    // =======================================
    // Logical AND
    // =======================================

    parseLogicalAnd() {

        let expr = this.parseEquality();

        while (
            this.match("AND")
        ) {

            expr = {

                type: "LogicalExpression",

                operator: "AND",

                left: expr,

                right: this.parseEquality()

            };

        }

        return expr;

    }

    // =======================================
    // Equality
    // =======================================

    parseEquality() {

        let expr = this.parseComparison();

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

                right: this.parseComparison()

            };

        }

        return expr;

    }

    // =======================================
    // Comparison
    // =======================================

    parseComparison() {

        let expr = this.parseTerm();

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

                right: this.parseTerm()

            };

        }

        return expr;

    }

        // =======================================
    // Term (+ dan -)
    // =======================================

    parseTerm() {

        let expr = this.parseFactor();

        while (
            this.match("PLUS") ||
            this.match("MINUS")
        ) {

            const operator = this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right: this.parseFactor()

            };

        }

        return expr;

    }

    // =======================================
    // Factor (* / %)
    // =======================================

    parseFactor() {

        let expr = this.parseUnary();

        while (
            this.match("STAR") ||
            this.match("SLASH") ||
            this.match("PERCENT")
        ) {

            const operator = this.previous().type;

            expr = {

                type: "BinaryExpression",

                operator,

                left: expr,

                right: this.parseUnary()

            };

        }

        return expr;

    }

    // =======================================
    // Unary
    // =======================================

    parseUnary() {

        if (
            this.match("NOT") ||
            this.match("MINUS")
        ) {

            const operator = this.previous().type;

            return {

                type: "UnaryExpression",

                operator,

                argument: this.parseUnary()

            };

        }

        return this.parseCall();

    }

    // =======================================
    // Function Call
    // =======================================

    parseCall() {

        let expr = this.parsePrimary();

        while (true) {

            if (this.match("LEFT_PAREN")) {

                const args = [];

                if (!this.check("RIGHT_PAREN")) {

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

            break;

        }

        return expr;

    }

    // =======================================
    // Primary
    // =======================================

    parsePrimary() {

        if (this.match("NUMBER")) {

            return {

                type: "Literal",

                value: this.previous().value

            };

        }

        if (this.match("STRING")) {

            return {

                type: "Literal",

                value: this.previous().value

            };

        }

        if (this.match("BOOLEAN")) {

            return {

                type: "Literal",

                value: this.previous().value

            };

        }

        if (this.match("NULL")) {

            return {

                type: "Literal",

                value: null

            };

        }

        if (this.match("IDENTIFIER")) {

            return {

                type: "Identifier",

                name: this.previous().value

            };

        }

        if (this.match("LEFT_PAREN")) {

            const expr = this.parseExpression();

            this.expect("RIGHT_PAREN");

            return expr;

        }

        const token = this.current();

        throw new Error(
            `Expression tidak valid pada ${token.type} (${token.line}:${token.column})`
        );

    }

        // =======================================
    // IF Statement
    // =======================================

    parseIf() {

        const condition = this.parseExpression();

        this.expect("THEN");

        const thenBody = [];

        while (
            !this.check("ELSE") &&
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            thenBody.push(
                this.parseStatement()
            );

        }

        let elseBody = null;

        if (this.match("ELSE")) {

            elseBody = [];

            while (
                !this.check("END") &&
                !this.isAtEnd()
            ) {

                elseBody.push(
                    this.parseStatement()
                );

            }

        }

        this.expect("END");

        return {

            type: "IfStatement",

            condition,

            thenBody,

            elseBody

        };

    }

    // =======================================
    // RETURN Statement
    // =======================================

    parseReturn() {

        let value = null;

        if (
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            value = this.parseExpression();

        }

        return {

            type: "ReturnStatement",

            value

        };

    }

    // =======================================
    // IMPORT Statement
    // =======================================

    parseImport() {

        const moduleName = this.expect(
            "IDENTIFIER"
        );

        return {

            type: "ImportDeclaration",

            module: moduleName.value

        };

    }

        // =======================================
    // FUNCTION
    // =======================================

    parseFunction() {

        const name = this.expect("IDENTIFIER").value;

        this.expect("LEFT_PAREN");

        const params = [];

        if (!this.check("RIGHT_PAREN")) {

            do {

                params.push(
                    this.expect("IDENTIFIER").value
                );

            } while (this.match("COMMA"));

        }

        this.expect("RIGHT_PAREN");

        const body = [];

        while (
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            body.push(
                this.parseStatement()
            );

        }

        this.expect("END");

        return {

            type: "FunctionDeclaration",

            name,

            params,

            body

        };

    }

    // =======================================
    // WHILE
    // =======================================

    parseWhile() {

        const condition =
            this.parseExpression();

        this.expect("DO");

        const body = [];

        while (
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            body.push(
                this.parseStatement()
            );

        }

        this.expect("END");

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

        this.expect("DO");

        const body = [];

        while (
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            body.push(
                this.parseStatement()
            );

        }

        this.expect("END");

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
    // CLASS
    // =======================================

    parseClass() {

        const name =
            this.expect("IDENTIFIER").value;

        const body = [];

        while (
            !this.check("END") &&
            !this.isAtEnd()
        ) {

            if (this.match("FUNCTION")) {

                body.push(
                    this.parseFunction()
                );

            } else {

                body.push(
                    this.parseStatement()
                );

            }

        }

        this.expect("END");

        return {

            type: "ClassDeclaration",

            name,

            body

        };

    }

}
module.exports = Parser;