// =======================================
// Bahasa Indonesia Programming Language
// Runtime v4
// Async + Scope + AST Consistent Runtime
// =======================================

class ReturnSignal {

    constructor(value) {
        this.value = value;
    }

}


// =======================================
// RUNTIME
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

            scope.set(
                name,
                value
            );

        }

        this.scopes.push(scope);

        return scope;

    }


    popScope() {

        if (
            this.scopes.length <= 1
        ) {

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

            for (
                const statement
                of program.body
            ) {

                result =
                    await this.execute(
                        statement
                    );

            }

        } catch (error) {

            if (
                error instanceof ReturnSignal
            ) {

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

                return this.executeFunction(node);


            case "ReturnStatement":

                return await this.executeReturn(node);


            case "ImportStatement":

                return await this.executeImport(node);


            case "ClassDeclaration":

                return this.executeClass(node);


            default:

                throw new Error(
                    `Statement '${node.type}' belum didukung.`
                );

        }

    }


    // ===================================
    // WAIT STATEMENT
    // ===================================

    async executeWait(node) {

        const duration =
            await this.evaluate(
                node.duration
            );

        await this.sleep(
            duration
        );

        return null;

    }


    // ===================================
    // WAIT HELPER
    // ===================================

    validateDuration(duration) {

        if (
            typeof duration !== "number" ||
            !Number.isFinite(duration)
        ) {

            throw new Error(
                "Durasi 'tunggu' harus berupa angka."
            );

        }

        if (
            duration < 0
        ) {

            throw new Error(
                "Durasi 'tunggu' tidak boleh negatif."
            );

        }

    }


    sleep(seconds) {

        this.validateDuration(
            seconds
        );

        return new Promise(resolve => {

            setTimeout(
                resolve,
                seconds * 1000
            );

        });

    }


    // ===================================
    // VARIABLE
    // ===================================

    async executeVariable(node) {

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
            await this.evaluate(
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

    async executePrint(node) {

        const value =
            await this.evaluate(
                node.value
            );

        console.log(
            this.formatOutput(value)
        );

        return value;

    }


    formatOutput(value) {

        if (
            value === undefined
        ) {

            return "tidak terdefinisi";

        }

        if (
            value === null
        ) {

            return "kosong";

        }

        if (
            typeof value === "object"
        ) {

            try {

                return JSON.stringify(
                    value,
                    null,
                    2
                );

            } catch {

                return String(value);

            }

        }

        return value;

    }


    // ===================================
    // IF
    // ===================================

    async executeIf(node) {

        const condition =
            await this.evaluate(
                node.condition
            );

        const body =
            condition
                ? node.thenBody
                : node.elseBody;

        if (
            !body
        ) {

            return null;

        }

        let result = null;

        for (
            const statement
            of body
        ) {

            result =
                await this.execute(
                    statement
                );

        }

        return result;

    }


    // ===================================
    // WHILE
    // ===================================

    async executeWhile(node) {

        let result = null;

        while (
            await this.evaluate(
                node.condition
            )
        ) {

            for (
                const statement
                of node.body
            ) {

                result =
                    await this.execute(
                        statement
                    );

            }

        }

        return result;

    }


    // ===================================
    // FOR
    // ===================================

    async executeFor(node) {

        const start =
            await this.evaluate(
                node.start
            );

        const end =
            await this.evaluate(
                node.end
            );

        const step =
            await this.evaluate(
                node.step
            );

        if (
            typeof start !== "number" ||
            typeof end !== "number" ||
            typeof step !== "number"
        ) {

            throw new Error(
                "Loop 'untuk' membutuhkan nilai angka."
            );

        }

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(end) ||
            !Number.isFinite(step)
        ) {

            throw new Error(
                "Loop 'untuk' membutuhkan angka yang valid."
            );

        }

        if (
            step === 0
        ) {

            throw new Error(
                "Loop 'untuk' tidak boleh menggunakan langkah 0."
            );

        }

        let result = null;

        this.pushScope();

        try {

            if (
                step > 0
            ) {

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
                            await this.execute(
                                statement
                            );

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
                            await this.execute(
                                statement
                            );

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

        if (
            !node.name
        ) {

            throw new Error(
                "Fungsi harus memiliki nama."
            );

        }

        this.scope.set(
            node.name,
            node
        );

        return node;

    }


    // ===================================
    // RETURN
    // ===================================

    async executeReturn(node) {

        const value =
            node.value === null ||
            node.value === undefined
                ? null
                : await this.evaluate(
                    node.value
                );

        throw new ReturnSignal(
            value
        );

    }


    // ===================================
    // IMPORT
    // ===================================

    async executeImport(node) {

        const moduleName =
            this.normalizeModuleName(
                node.file
            );

        if (
            !moduleName
        ) {

            throw new Error(
                "Nama module tidak boleh kosong."
            );

        }

        const module =
            this.stdlib[moduleName];

        if (
            !module
        ) {

            throw new Error(
                `Modul '${moduleName}' tidak ditemukan di stdlib.`
            );

        }

        /*
         * pakai "http"
         *
         * menghasilkan:
         *
         * http -> module
         *
         * sehingga:
         *
         * http.ambil(...)
         */

        this.globals.set(
            moduleName,
            module
        );

        return module;

    }


    normalizeModuleName(name) {

        if (
            typeof name !== "string"
        ) {

            return name;

        }

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

    async evaluate(node) {

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

                return await this.evaluateWaitExpression(
                    node
                );


            // ---------------------------
            // Assignment
            // ---------------------------

            case "AssignmentExpression":

                return await this.evaluateAssignment(
                    node
                );


            // ---------------------------
            // Binary
            // ---------------------------

            case "BinaryExpression":

                return await this.evaluateBinary(
                    node
                );


            // ---------------------------
            // Logical
            // ---------------------------

            case "LogicalExpression":

                return await this.evaluateLogical(
                    node
                );


            // ---------------------------
            // Unary
            // ---------------------------

            case "UnaryExpression":

                return await this.evaluateUnary(
                    node
                );


            // ---------------------------
            // Call
            // ---------------------------

            case "CallExpression":

                return await this.evaluateCall(
                    node
                );


            // ---------------------------
            // Member
            // ---------------------------

            case "MemberExpression":

                return await this.evaluateMember(
                    node
                );


            // ---------------------------
            // Array
            // ---------------------------

            case "ArrayExpression": {

                const result = [];

                for (
                    const element
                    of node.elements
                ) {

                    result.push(
                        await this.evaluate(
                            element
                        )
                    );

                }

                return result;

            }


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
                        await this.evaluate(
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
    // WAIT EXPRESSION
    // ===================================

    async evaluateWaitExpression(node) {

        const duration =
            await this.evaluate(
                node.duration
            );

        this.validateDuration(
            duration
        );

        await this.sleep(
            duration
        );

        /*
         * Setelah delay selesai,
         * baru evaluasi expression.
         *
         * Jadi:
         *
         * tunggu 2 http.ambil(...)
         *
         * = tunggu
         * = panggil http.ambil()
         * = tunggu Promise-nya
         * = kembalikan hasil
         */

        return await this.evaluate(
            node.expression
        );

    }


    // ===================================
    // VARIABLE LOOKUP
    // ===================================

    getVariable(name) {

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

    async evaluateAssignment(node) {

        const value =
            await this.evaluate(
                node.right
            );

        const target =
            node.left;

        if (
            target.type === "Identifier"
        ) {

            return this.assignVariable(
                target.name,
                value
            );

        }

        if (
            target.type === "MemberExpression"
        ) {

            return await this.assignMember(
                target,
                value
            );

        }

        throw new Error(
            "Target assignment tidak valid."
        );

    }


    assignVariable(name, value) {

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


    // ===================================
    // MEMBER ASSIGNMENT
    // ===================================

    async assignMember(node, value) {

        const object =
            await this.evaluate(
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
                ? await this.evaluate(
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

    async evaluateUnary(node) {

        const value =
            await this.evaluate(
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

    async evaluateLogical(node) {

        const left =
            await this.evaluate(
                node.left
            );

        if (
            node.operator === "AND"
        ) {

            if (!left) {

                return left;

            }

            return await this.evaluate(
                node.right
            );

        }

        if (
            node.operator === "OR"
        ) {

            if (left) {

                return left;

            }

            return await this.evaluate(
                node.right
            );

        }

        throw new Error(
            `Operator logical '${node.operator}' tidak dikenal.`
        );

    }


    // ===================================
    // BINARY
    // ===================================

    async evaluateBinary(node) {

        const left =
            await this.evaluate(
                node.left
            );

        const right =
            await this.evaluate(
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

    async evaluateCall(node) {

        /*
         * Evaluasi argument satu per satu.
         */

        const args = [];

        for (
            const argument
            of node.arguments
        ) {

            args.push(
                await this.evaluate(
                    argument
                )
            );

        }


        // =================================
        // METHOD CALL
        // =================================

        if (
            node.callee &&
            node.callee.type ===
                "MemberExpression"
        ) {

            const object =
                await this.evaluate(
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
                    ? await this.evaluate(
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
             * await juga menangani:
             *
             * function biasa
             * Promise
             * async function
             */

            return await func.apply(
                object,
                args
            );

        }


        // =================================
        // NORMAL FUNCTION
        // =================================

        const func =
            await this.evaluate(
                node.callee
            );


        // =================================
        // STDLIB / JS FUNCTION
        // =================================

        if (
            typeof func === "function"
        ) {

            return await func(
                ...args
            );

        }


        // =================================
        // USER FUNCTION
        // =================================

        if (
            func &&
            func.type ===
                "FunctionDeclaration"
        ) {

            return await this.callFunction(
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

    async callFunction(func, args) {

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

            try {

                for (
                    const statement
                    of func.body
                ) {

                    result =
                        await this.execute(
                            statement
                        );

                }

            } catch (error) {

                if (
                    error instanceof ReturnSignal
                ) {

                    return error.value;

                }

                throw error;

            }

            return result;

        } finally {

            this.popScope();

        }

    }


    // ===================================
    // MEMBER ACCESS
    // ===================================

    async evaluateMember(node) {

        const object =
            await this.evaluate(
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
                ? await this.evaluate(
                    node.property
                )
                : node.property.name;

        return object[property];

    }

}


// =======================================
// EXPORT
// =======================================

module.exports = Runtime;