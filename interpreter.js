// =======================================
// Bahasa Indonesia Programming Language
// Interpreter v2
// AST Consistent Edition
// =======================================

class ReturnSignal {

    constructor(value) {
        this.value = value;
    }

}

// =======================================
// Interpreter
// =======================================

class Interpreter {

    constructor(stdlib = {}) {

    this.globals = new Map();

    this.stdlib = stdlib;

    }

    // =======================================
    // PROGRAM
    // =======================================

    interpret(program) {

        if (!program || program.type !== "Program") {

            throw new Error(
                "AST tidak valid. Root harus bertipe 'Program'."
            );

        }

        let result = null;

        for (const statement of program.body) {

            result = this.execute(statement);

        }

        return result;

    }

    // =======================================
    // STATEMENT
    // =======================================

    execute(node) {

        if (!node || !node.type) {

            throw new Error(
                "AST Node tidak valid."
            );

        }

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

            case "FunctionDeclaration":
                return this.executeFunction(node);

            case "ReturnStatement":
                return this.executeReturn(node);

            case "ImportStatement":
                return this.executeImport(node);

            case "ClassDeclaration":
                return this.executeClass(node);

            default:

                throw new Error(
                    `Statement '${node.type}' belum didukung.`
                );

        }

    }

    // =======================================
    // VARIABLE
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
    // PRINT
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

        const condition =
            this.evaluate(node.condition);

        if (condition) {

            for (const statement of node.thenBody) {

                this.execute(statement);

            }

            return;

        }

        if (node.elseBody) {

            for (const statement of node.elseBody) {

                this.execute(statement);

            }

        }

    }

    // =======================================
    // WHILE
    // =======================================

    executeWhile(node) {

        while (
            this.evaluate(node.condition)
        ) {

            try {

                for (const statement of node.body) {

                    this.execute(statement);

                }

            } catch (error) {

                if (error instanceof ReturnSignal) {

                    throw error;

                }

                throw error;

            }

        }

    }

    // =======================================
    // FOR
    // =======================================

    executeFor(node) {

        const start =
            this.evaluate(node.start);

        const end =
            this.evaluate(node.end);

        const step =
            this.evaluate(node.step);

        if (step === 0) {

            throw new Error(
                "Loop 'untuk' tidak boleh menggunakan langkah 0."
            );

        }

        if (step > 0) {

            for (
                let i = start;
                i <= end;
                i += step
            ) {

                this.globals.set(
                    node.variable,
                    i
                );

                for (const statement of node.body) {

                    this.execute(statement);

                }

            }

        } else {

            for (
                let i = start;
                i >= end;
                i += step
            ) {

                this.globals.set(
                    node.variable,
                    i
                );

                for (const statement of node.body) {

                    this.execute(statement);

                }

            }

        }

    }

    // =======================================
    // FUNCTION DECLARATION
    // =======================================

    executeFunction(node) {

        this.globals.set(
            node.name,
            node
        );

        return node;

    }

    // =======================================
    // RETURN
    // =======================================

    executeReturn(node) {

        const value = node.value === null
            ? null
            : this.evaluate(node.value);

        throw new ReturnSignal(value);

    }

    // =======================================
    // IMPORT
    // =======================================

    executeImport(node) {

    const namaModule = node.file;

    if (!namaModule) {
        throw new Error(
            "Import membutuhkan nama module."
        );
    }

    // Kalau stdlib sudah tersedia di globals,
    // tidak perlu load ulang.
    if (this.globals.has(namaModule)) {
        return this.globals.get(namaModule);
    }

    throw new Error(
        `Modul '${namaModule}' tidak ditemukan.`
      );

    }

    // =======================================
    // CLASS
    // =======================================

    executeClass(node) {

        const classObject = {

            type: "Class",

            name: node.name,

            body: node.body

        };

        this.globals.set(
            node.name,
            classObject
        );

        return classObject;

    }

    // =======================================
    // EXPRESSION
    // =======================================

    evaluate(node) {

        if (!node || !node.type) {

            throw new Error(
                "Expression AST tidak valid."
            );

        }

        switch (node.type) {

            // ===================================
            // Literal
            // ===================================

            case "Literal":

                return node.value;

            // ===================================
            // Identifier
            // ===================================

            case "Identifier":

                return this.getVariable(
                    node.name
                );

            // ===================================
            // Assignment
            // ===================================

            case "AssignmentExpression":

                return this.evaluateAssignment(node);

            // ===================================
            // Binary
            // ===================================

            case "BinaryExpression":

                return this.evaluateBinary(node);

            // ===================================
            // Logical
            // ===================================

            case "LogicalExpression":

                return this.evaluateLogical(node);

            // ===================================
            // Unary
            // ===================================

            case "UnaryExpression":

                return this.evaluateUnary(node);

            // ===================================
            // Function Call
            // ===================================

            case "CallExpression":

                return this.evaluateCall(node);

            // ===================================
            // Member
            // ===================================

            case "MemberExpression":

                return this.evaluateMember(node);

            // ===================================
            // Array
            // ===================================

            case "ArrayExpression":

                return node.elements.map(
                    element => this.evaluate(element)
                );

            // ===================================
            // Object
            // ===================================

            case "ObjectExpression": {

                const object = {};

                for (const property of node.properties) {

                    object[property.key] =
                        this.evaluate(property.value);

                }

                return object;

            }

            default:

                throw new Error(
                    `Expression '${node.type}' belum didukung.`
                );

        }

    }

    // =======================================
    // VARIABLE LOOKUP
    // =======================================

    getVariable(name) {

        if (!this.globals.has(name)) {

            throw new Error(
                `Variabel atau fungsi '${name}' belum dibuat.`
            );

        }

        return this.globals.get(name);

    }

    // =======================================
    // ASSIGNMENT
    // =======================================

    evaluateAssignment(node) {

        const value =
            this.evaluate(node.right);

        const name =
            node.left.name;

        if (!this.globals.has(name)) {

            throw new Error(
                `Variabel '${name}' belum dibuat.`
            );

        }

        this.globals.set(
            name,
            value
        );

        return value;

    }

    // =======================================
    // UNARY
    // =======================================

    evaluateUnary(node) {

        const value =
            this.evaluate(node.argument);

        switch (node.operator) {

            case "!":
            case "NOT":

                return !value;

            case "-":

            case "MINUS":

                return -value;

            default:

                throw new Error(
                    `Operator unary '${node.operator}' tidak dikenal.`
                );

        }

    }

    // =======================================
    // LOGICAL
    // =======================================

    evaluateLogical(node) {

        const left =
            this.evaluate(node.left);

        if (
            node.operator === "AND"
        ) {

            return (
                left &&
                this.evaluate(node.right)
            );

        }

        if (
            node.operator === "OR"
        ) {

            return (
                left ||
                this.evaluate(node.right)
            );

        }

        throw new Error(
            `Operator logical '${node.operator}' tidak dikenal.`
        );

    }

    // =======================================
    // BINARY
    // =======================================

    evaluateBinary(node) {

        const left =
            this.evaluate(node.left);

        const right =
            this.evaluate(node.right);

        switch (node.operator) {

            case "+":
            case "PLUS":

                return left + right;

            case "-":
            case "MINUS":

                return left - right;

            case "*":
            case "STAR":

                return left * right;

            case "/":
            case "SLASH":

                if (right === 0) {

                    throw new Error(
                        "Tidak bisa membagi dengan 0."
                    );

                }

                return left / right;

            case "%":
            case "PERCENT":

                return left % right;

            case ">":
            case "GREATER":

                return left > right;

            case ">=":
            case "GREATER_EQUAL":

                return left >= right;

            case "<":
            case "LESS":

                return left < right;

            case "<=":
            case "LESS_EQUAL":

                return left <= right;

            case "==":
            case "EQUAL_EQUAL":

                return left === right;

            case "!=":
            case "NOT_EQUAL":

                return left !== right;

            default:

                throw new Error(
                    `Operator '${node.operator}' belum didukung.`
                );

        }

    }

    // =======================================
    // FUNCTION CALL
    // =======================================

    evaluateCall(node) {

    const args =
        node.arguments.map(
            argument => this.evaluate(argument)
        );

    // ===================================
    // Method call
    // ===================================

    if (
        node.callee &&
        node.callee.type === "MemberExpression"
    ) {

        const object =
            this.evaluate(node.callee.object);

        if (
            object === null ||
            object === undefined
        ) {

            throw new Error(
                "Tidak bisa memanggil method dari nilai kosong."
            );

        }

        const property =
            node.callee.computed
                ? this.evaluate(node.callee.property)
                : node.callee.property.name;

        const func =
            object[property];

        if (typeof func !== "function") {

            throw new Error(
                `'${property}' bukan sebuah fungsi.`
            );

        }

        return func.apply(object, args);

    }

    // ===================================
    // Function biasa
    // ===================================

    const func =
        this.evaluate(node.callee);

    // Standard library
    if (typeof func === "function") {

        return func(...args);

    }

    // User-defined function
    if (
        func &&
        func.type === "FunctionDeclaration"
    ) {

        return this.callFunction(
            func,
            args
        );

    }

    throw new Error(
        "Objek yang dipanggil bukan sebuah fungsi."
      );

    }

    // =======================================
    // MEMBER ACCESS
    // =======================================

    evaluateMember(node) {

        const object =
            this.evaluate(node.object);

        if (object === null ||
            object === undefined) {

            throw new Error(
                "Tidak bisa mengakses property dari nilai kosong."
            );

        }

        let property;

        if (node.computed) {

            property =
                this.evaluate(node.property);

        } else {

            property =
                node.property.name;

        }

        return object[property];

    }

}

// =======================================
// Export
// =======================================

module.exports = Interpreter;