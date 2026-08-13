// =======================================
// Bahasa Indonesia Programming Language
// Runtime v3
// AST Consistent Runtime
// =======================================

class ReturnSignal {

    constructor(value) {
        this.value = value;
    }

}


// =======================================
// Runtime
// =======================================

class Runtime {

    constructor(stdlib = {}) {

        this.stdlib = stdlib;

        this.globals = new Map();

        this.scopes = [
            this.globals
        ];

    }


    // ===================================
    // SCOPE
    // ===================================

    get scope() {

        return this.scopes[
            this.scopes.length - 1
        ];

    }


    pushScope(initial = {}) {

        const scope = new Map();

        for (
            const [name, value]
            of Object.entries(initial)
        ) {

            scope.set(name, value);

        }

        this.scopes.push(scope);

        return scope;

    }


    popScope() {

        if (this.scopes.length <= 1) {

            throw new Error(
                "Tidak bisa menghapus global scope."
            );

        }

        return this.scopes.pop();

    }


    // ===================================
    // PROGRAM
    // ===================================

    async run(program) {

    if (
        !program ||
        program.type !== "Program"
    ) {
        throw new Error(
            "AST tidak valid. Root harus bertipe 'Program'."
        );
    }

    let result = null;

    try {

        for (const statement of program.body) {

            result = await this.execute(statement);

        }

    } catch (error) {

        if (error instanceof ReturnSignal) {

            throw new Error(
                "Pernyataan 'kembali' tidak boleh berada di luar fungsi."
            );

        }

        throw error;
      }

       return result;
    }


    // Alias
    async interpret(program) {

    return this.run(program);

    }


    // ===================================
    // STATEMENT
    // ===================================

    async execute(node) {

        if (
            !node ||
            !node.type
        ) {

            throw new Error(
                "AST Node tidak valid."
            );

        }

        switch (node.type) {

            case "VariableDeclaration":

                return await this.executeVariable(node);


            case "PrintStatement":

                return await this.executePrint(node);


            case "ExpressionStatement":

                return await this.evaluate(
                    node.expression
                );


            case "IfStatement":

                return await this.executeIf(node);

            case "WaitStatement":

                return await this.executeWait(node);


            case "WhileStatement":

                return await this.executeWhile(node);


            case "ForStatement":

                return await this.executeFor(node);


            case "FunctionDeclaration":

                return await this.executeFunction(node);


            case "ReturnStatement":

                return await this.executeReturn(node);


            case "ImportStatement":

                return await this.executeImport(node);


            case "ClassDeclaration":

                return await this.executeClass(node);


            default:

                throw new Error(
                    `Statement '${node.type}' belum didukung.`
                );

        }

    }

    // =======================================
    // WAIT
    // =======================================

    executeWait(node) {

    const duration =
        this.evaluate(node.duration);

    if (
        typeof duration !== "number" ||
        !Number.isFinite(duration)
    ) {

        throw new Error(
            "Durasi 'tunggu' harus berupa angka."
        );

    }

    if (duration < 0) {

        throw new Error(
            "Durasi 'tunggu' tidak boleh negatif."
        );

    }

    return new Promise(resolve => {

        setTimeout(
            resolve,
            duration * 1000
          );

       });

    } 

    // ===================================
    // VARIABLE
    // ===================================

    executeVariable(node) {

        if (
            !node.identifier ||
            node.identifier.type !== "Identifier"
        ) {

            throw new Error(
                "Deklarasi variabel memiliki identifier yang tidak valid."
            );

        }

        const name =
            node.identifier.name;

        const value =
            this.evaluate(
                node.initializer
            );

        this.scope.set(
            name,
            value
        );

        return value;

    }


    // ===================================
    // PRINT
    // ===================================

    executePrint(node) {

        const value =
            this.evaluate(
                node.value
            );

        console.log(
            this.formatOutput(value)
        );

        return value;

    }


    formatOutput(value) {

        if (
            typeof value === "object" &&
            value !== null
        ) {

            return value;

        }

        return value;

    }


    // ===================================
    // IF
    // ===================================

    async executeIf(node) {

    const condition =
        await this.evaluate(node.condition);

    const body =
        condition
            ? node.thenBody
            : node.elseBody;

    if (!body) {
        return null;
    }

    let result = null;

    for (const statement of body) {

        result =
            await this.execute(statement);

      }

      return result;

    }


    // ===================================
    // WHILE
    // ===================================

    executeWhile(node) {

        let result = null;

        while (
            this.evaluate(
                node.condition
            )
        ) {

            for (
                const statement
                of node.body
            ) {

                result =
                    this.execute(statement);

            }

        }

        return result;

    }


    // ===================================
    // FOR
    // ===================================

    executeFor(node) {

        const start =
            this.evaluate(node.start);

        const end =
            this.evaluate(node.end);

        const step =
            this.evaluate(node.step);

        if (
            typeof start !== "number" ||
            typeof end !== "number" ||
            typeof step !== "number"
        ) {

            throw new Error(
                "Loop 'untuk' membutuhkan nilai angka."
            );

        }

        if (step === 0) {

            throw new Error(
                "Loop 'untuk' tidak boleh menggunakan langkah 0."
            );

        }

        let result = null;

        /*
         * Buat scope khusus loop.
         */

        this.pushScope();

        try {

            if (step > 0) {

                for (
                    let i = start;
                    i <= end;
                    i += step
                ) {

                    this.scope.set(
                        node.variable,
                        i
                    );

                    for (
                        const statement
                        of node.body
                    ) {

                        result =
                            this.execute(statement);

                    }

                }

            } else {

                for (
                    let i = start;
                    i >= end;
                    i += step
                ) {

                    this.scope.set(
                        node.variable,
                        i
                    );

                    for (
                        const statement
                        of node.body
                    ) {

                        result =
                            this.execute(statement);

                    }

                }

            }

        } finally {

            this.popScope();

        }

        return result;

    }


    // ===================================
    // FUNCTION DECLARATION
    // ===================================

    executeFunction(node) {

        if (!node.name) {

            throw new Error(
                "Fungsi harus memiliki nama."
            );

        }

        /*
         * Simpan AST function secara langsung.
         *
         * Ini penting untuk recursion:
         *
         * faktorial()
         *
         * dapat menemukan dirinya sendiri
         * melalui environment global.
         */

        this.scope.set(
            node.name,
            node
        );

        return node;

    }


    // ===================================
    // RETURN
    // ===================================

    executeReturn(node) {

        const value =
            node.value === null ||
            node.value === undefined
                ? null
                : this.evaluate(
                    node.value
                );

        throw new ReturnSignal(value);

    }


    // ===================================
    // IMPORT
    // ===================================

    executeImport(node) {

        const moduleName =
            this.normalizeModuleName(
                node.file
            );

        if (!moduleName) {

            throw new Error(
                "Nama module tidak boleh kosong."
            );

        }

        const module =
            this.stdlib[moduleName];

        if (!module) {

            throw new Error(
                `Modul '${moduleName}' tidak ditemukan di stdlib.`
            );

        }

        /*
         * Import bersifat idempotent.
         *
         * pakai "matematika"
         * pakai "matematika"
         *
         * tidak masalah.
         */

        for (
            const [name, value]
            of Object.entries(module)
        ) {

            this.globals.set(
                name,
                value
            );

        }

        return module;

    }


    normalizeModuleName(name) {

        if (
            typeof name !== "string"
        ) {

            return name;

        }

        /*
         * Mendukung:
         *
         * "matematika"
         * "matematika.js"
         */

        if (
            name.endsWith(".js")
        ) {

            return name.slice(
                0,
                -3
            );

        }

        return name;

    }


    // ===================================
    // CLASS
    // ===================================

    executeClass(node) {

        const classObject = {

            __indoClass: true,

            type: "Class",

            name: node.name,

            body: node.body

        };

        this.scope.set(
            node.name,
            classObject
        );

        return classObject;

    }


    // ===================================
    // EXPRESSION
    // ===================================

    evaluate(node) {

        if (
            !node ||
            !node.type
        ) {

            throw new Error(
                "Expression AST tidak valid."
            );

        }

        switch (node.type) {

            // ---------------------------
            // Literal
            // ---------------------------

            case "Literal":

                return node.value;


            // ---------------------------
            // Identifier
            // ---------------------------

            case "Identifier":

                return this.getVariable(
                    node.name
                );

            // ---------------------------
            // Wait
            // ---------------------------

            case "WaitExpression":

            return this.evaluateWaitExpression(node);


            // ---------------------------
            // Assignment
            // ---------------------------

            case "AssignmentExpression":

                return this.evaluateAssignment(
                    node
                );


            // ---------------------------
            // Binary
            // ---------------------------

            case "BinaryExpression":

                return this.evaluateBinary(
                    node
                );


            // ---------------------------
            // Logical
            // ---------------------------

            case "LogicalExpression":

                return this.evaluateLogical(
                    node
                );


            // ---------------------------
            // Unary
            // ---------------------------

            case "UnaryExpression":

                return this.evaluateUnary(
                    node
                );


            // ---------------------------
            // Function call
            // ---------------------------

            case "CallExpression":

                return this.evaluateCall(
                    node
                );


            // ---------------------------
            // Member
            // ---------------------------

            case "MemberExpression":

                return this.evaluateMember(
                    node
                );


            // ---------------------------
            // Array
            // ---------------------------

            case "ArrayExpression":

                return node.elements.map(
                    element =>
                        this.evaluate(element)
                );


            // ---------------------------
            // Object
            // ---------------------------

            case "ObjectExpression": {

                const object = {};

                for (
                    const property
                    of node.properties
                ) {

                    object[property.key] =
                        this.evaluate(
                            property.value
                        );

                }

                return object;

            }


            default:

                throw new Error(
                    `Expression '${node.type}' belum didukung.`
                );

        }

    }

    // ===================================
    // EvaluateWait
    // ===================================

    async evaluateWaitExpression(node) {

    const duration =
        this.evaluate(node.duration);

    await new Promise(resolve => {

        setTimeout(
            resolve,
            duration * 1000
        );

    });

    return await this.evaluate(
        node.expression
      );

    }


    // ===================================
    // VARIABLE LOOKUP
    // ===================================

    getVariable(name) {

        /*
         * Cari dari scope terdalam
         * menuju global.
         */

        for (
            let i = this.scopes.length - 1;
            i >= 0;
            i--
        ) {

            const scope =
                this.scopes[i];

            if (
                scope.has(name)
            ) {

                return scope.get(name);

            }

        }

        throw new Error(
            `Variabel atau fungsi '${name}' belum dibuat.`
        );

    }


    // ===================================
    // ASSIGNMENT
    // ===================================

    evaluateAssignment(node) {

        const value =
            this.evaluate(
                node.right
            );

        const target =
            node.left;

        // -------------------------------
        // Variable
        // -------------------------------

        if (
            target.type === "Identifier"
        ) {

            return this.assignVariable(
                target.name,
                value
            );

        }


        // -------------------------------
        // Property / index
        // -------------------------------

        if (
            target.type === "MemberExpression"
        ) {

            return this.assignMember(
                target,
                value
            );

        }


        throw new Error(
            "Target assignment tidak valid."
        );

    }


    assignVariable(name, value) {

        /*
         * Cari scope yang sudah memiliki
         * variable tersebut.
         */

        for (
            let i = this.scopes.length - 1;
            i >= 0;
            i--
        ) {

            const scope =
                this.scopes[i];

            if (
                scope.has(name)
            ) {

                scope.set(
                    name,
                    value
                );

                return value;

            }

        }

        throw new Error(
            `Variabel '${name}' belum dibuat.`
        );

    }


    assignMember(node, value) {

        const object =
            this.evaluate(
                node.object
            );

        if (
            object === null ||
            object === undefined
        ) {

            throw new Error(
                "Tidak bisa mengubah property dari nilai kosong."
            );

        }

        const property =
            node.computed
                ? this.evaluate(
                    node.property
                )
                : node.property.name;

        object[property] =
            value;

        return value;

    }


    // ===================================
    // UNARY
    // ===================================

    evaluateUnary(node) {

        const value =
            this.evaluate(
                node.argument
            );

        switch (node.operator) {

            case "!":
            case "NOT":

                return !value;


            case "-":
            case "MINUS":

                return -value;


            case "+":
            case "PLUS":

                return +value;


            default:

                throw new Error(
                    `Operator unary '${node.operator}' tidak dikenal.`
                );

        }

    }


    // ===================================
    // LOGICAL
    // ===================================

    evaluateLogical(node) {

        const left =
            this.evaluate(
                node.left
            );

        if (
            node.operator === "AND"
        ) {

            return (
                left &&
                this.evaluate(
                    node.right
                )
            );

        }

        if (
            node.operator === "OR"
        ) {

            return (
                left ||
                this.evaluate(
                    node.right
                )
            );

        }

        throw new Error(
            `Operator logical '${node.operator}' tidak dikenal.`
        );

    }


    // ===================================
    // BINARY
    // ===================================

    evaluateBinary(node) {

        const left =
            this.evaluate(
                node.left
            );

        const right =
            this.evaluate(
                node.right
            );

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

                if (
                    right === 0
                ) {

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


    // ===================================
    // FUNCTION CALL
    // ===================================

    evaluateCall(node) {

        const args =
            node.arguments.map(
                argument =>
                    this.evaluate(argument)
            );


        // =================================
        // Method Call
        // =================================

        if (
            node.callee &&
            node.callee.type ===
                "MemberExpression"
        ) {

            const object =
                this.evaluate(
                    node.callee.object
                );

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
                    ? this.evaluate(
                        node.callee.property
                    )
                    : node.callee.property.name;

            const func =
                object[property];

            if (
                typeof func !== "function"
            ) {

                throw new Error(
                    `'${property}' bukan sebuah fungsi.`
                );

            }

            /*
             * apply(object, args)
             *
             * penting untuk:
             *
             * array.push()
             * array.pop()
             * object.method()
             */

            return func.apply(
                object,
                args
            );

        }


        // =================================
        // Normal Function
        // =================================

        const func =
            this.evaluate(
                node.callee
            );


        // Standard library
        if (
            typeof func === "function"
        ) {

            return func(...args);

        }


        // User-defined function
        if (
            func &&
            func.type ===
                "FunctionDeclaration"
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


    // ===================================
    // USER FUNCTION
    // ===================================

    callFunction(func, args) {

        /*
         * Function mendapat scope baru.
         *
         * Scope parent tetap bisa diakses
         * melalui this.scopes.
         */

        this.pushScope();

        try {

            for (
                let i = 0;
                i < func.params.length;
                i++
            ) {

                const parameter =
                    func.params[i];

                const value =
                    i < args.length
                        ? args[i]
                        : null;

                this.scope.set(
                    parameter,
                    value
                );

            }


            let result = null;

            for (
                const statement
                of func.body
            ) {

                result =
                    this.execute(
                        statement
                    );

            }

            return result;

        } catch (error) {

            if (
                error instanceof ReturnSignal
            ) {

                return error.value;

            }

            throw error;

        } finally {

            this.popScope();

        }

    }


    // ===================================
    // MEMBER ACCESS
    // ===================================

    evaluateMember(node) {

        const object =
            this.evaluate(
                node.object
            );

        if (
            object === null ||
            object === undefined
        ) {

            throw new Error(
                "Tidak bisa mengakses property dari nilai kosong."
            );

        }

        const property =
            node.computed
                ? this.evaluate(
                    node.property
                )
                : node.property.name;

        return object[property];

    }

}


// =======================================
// Export
// =======================================

module.exports = Runtime;