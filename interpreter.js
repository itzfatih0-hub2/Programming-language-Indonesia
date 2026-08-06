// =======================================
// Bahasa Indonesia Programming Language
// Interpreter v1
// =======================================
const stdlib = require("./stdlib");

class Interpreter {

    constructor() {

    this.globals = new Map();

    for (const [nama, fungsi] of Object.entries(stdlib)) {

        this.globals.set(nama, fungsi);

    }

    this.globals.set("benar", true);
    this.globals.set("salah", false);
    this.globals.set("kosong", null);

    }

    // =======================================
    // Entry
    // =======================================

    interpret(program) {

        for (const statement of program.body) {

            this.execute(statement);

        }

    }

    // =======================================
    // Execute Statement
    // =======================================

    execute(node) {

    switch (node.type) {

        case "VariableDeclaration":
            return this.executeVariable(node);

        case "PrintStatement":
            return this.executePrint(node);

        case "ExpressionStatement":
            return this.evaluate(node.expression);

        case "IfStatement":
            return this.executeIf(node);

        case "WhileStatement":
            return this.executeWhile(node);

        case "ForStatement":
            return this.executeFor(node);

        case "ReturnStatement":
            return this.executeReturn(node);

        case "FunctionDeclaration":
            return this.executeFunction(node);

        default:

            throw new Error(
                `Statement '${node.type}' belum didukung.`
            );

    }

}

    // =======================================
    // Variable
    // =======================================

    executeVariable(node) {

        const value =
            this.evaluate(node.initializer);

        this.globals.set(
            node.identifier.name,
            value
        );

        return value;

    }

    // =======================================
    // Print
    // =======================================

    executePrint(node) {

        const value =
            this.evaluate(node.value);

        console.log(value);

        return value;

    }

// =======================================
// IF
// =======================================

executeIf(node) {

    if (this.evaluate(node.condition)) {

        for (const stmt of node.thenBody) {

            this.execute(stmt);

        }

        return;

    }

    if (node.elseBody) {

        for (const stmt of node.elseBody) {

            this.execute(stmt);

        }

    }

}

// =======================================
// WHILE
// =======================================

executeWhile(node) {

    while (this.evaluate(node.condition)) {

        for (const stmt of node.body) {

            this.execute(stmt);

        }

    }

}

// =======================================
// FOR
// =======================================

executeFor(node) {

    const start = this.evaluate(node.start);

    const end = this.evaluate(node.end);

    const step = this.evaluate(node.step);

    for (

        let i = start;

        i <= end;

        i += step

    ) {

        this.globals.set(
            node.variable,
            i
        );

        for (const stmt of node.body) {

            this.execute(stmt);

        }

    }

}

// =======================================
// RETURN
// =======================================

executeReturn(node) {

    return this.evaluate(node.value);

}

// =======================================
// FUNCTION
// =======================================

executeFunction(node) {

    this.globals.set(
        node.name,
        node
    );

}

    // =======================================
    // Expression Evaluator
    // =======================================

        evaluate(node) {

        switch (node.type) {

            // ==========================
            // Literal
            // ==========================

            case "Literal":
                return node.value;

            // ==========================
            // Identifier
            // ==========================

            case "Identifier":

                if (!this.globals.has(node.name)) {

                    throw new Error(
                        `Variabel '${node.name}' belum dibuat.`
                    );

                }

                return this.globals.get(node.name);

            // ==========================
            // Assignment
            // ==========================

            case "AssignmentExpression": {

                const value = this.evaluate(node.right);

                this.globals.set(
                    node.left.name,
                    value
                );

                return value;

            }

            // ==========================
            // Unary
            // ==========================

            case "UnaryExpression": {

                const value =
                    this.evaluate(node.argument);

                switch (node.operator) {

                    case "MINUS":
                        return -value;

                    case "NOT":
                        return !value;

                    default:
                        throw new Error(
                            `Operator unary '${node.operator}' tidak dikenal.`
                        );

                }

            }

            // ==========================
            // Logical
            // ==========================

            case "LogicalExpression": {

                const left =
                    this.evaluate(node.left);

                if (node.operator === "AND") {

                    return left &&
                        this.evaluate(node.right);

                }

                if (node.operator === "OR") {

                    return left ||
                        this.evaluate(node.right);

                }

                throw new Error(
                    "Logical operator tidak dikenal."
                );

            }

            // ==========================
            // Binary
            // ==========================

            case "BinaryExpression": {

                const left =
                    this.evaluate(node.left);

                const right =
                    this.evaluate(node.right);

                switch (node.operator) {

                    case "PLUS":
                        return left + right;

                    case "MINUS":
                        return left - right;

                    case "STAR":
                        return left * right;

                    case "SLASH":
                        return left / right;

                    case "PERCENT":
                        return left % right;

                    case "GREATER":
                        return left > right;

                    case "GREATER_EQUAL":
                        return left >= right;

                    case "LESS":
                        return left < right;

                    case "LESS_EQUAL":
                        return left <= right;

                    case "EQUAL_EQUAL":
                        return left === right;

                    case "NOT_EQUAL":
                        return left !== right;

                    default:

                        throw new Error(
                            `Operator '${node.operator}' belum didukung.`
                        );

                }

            }

                        // ==========================
            // Function Call
            // ==========================

            case "CallExpression": {

                // Fungsi yang dipanggil
                const func = this.evaluate(node.callee);

                // Built-in JavaScript Function
                if (typeof func === "function") {

                    const args = node.arguments.map(arg =>
                        this.evaluate(arg)
                    );

                    return func(...args);

                }

                // User-defined Function
                if (
                    func &&
                    func.type === "FunctionDeclaration"
                ) {

                    const oldGlobals = new Map(this.globals);

                    // Parameter
                    for (let i = 0; i < func.params.length; i++) {

                        const value =
                            i < node.arguments.length
                                ? this.evaluate(node.arguments[i])
                                : null;

                        this.globals.set(
                            func.params[i],
                            value
                        );

                    }

                    let returnValue = null;

                    for (const stmt of func.body) {

                        if (
                            stmt.type === "ReturnStatement"
                        ) {

                            returnValue =
                                this.evaluate(stmt.value);

                            break;

                        }

                        this.execute(stmt);

                    }

                    // Restore Scope
                    this.globals = oldGlobals;

                    return returnValue;

                }

                throw new Error(
                    "Bukan sebuah fungsi."
                );

            }

            default:

                throw new Error(
                    `Expression '${node.type}' belum didukung.`
                );

        }

    }

}

module.exports = Interpreter;