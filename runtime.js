// =======================================
// Bahasa Indonesia Programming Language
// runtime.js
// =======================================

class RuntimeError extends Error {

    constructor(message, node = null) {

        super(message);

        this.name = "RuntimeError";

        this.node = node;

    }

}


// =======================================
// Environment
// =======================================

class Environment {

    constructor(parent = null) {

        this.values = new Map();

        this.parent = parent;

    }


    // ===================================
    // Define
    // ===================================

    define(name, value) {

        this.values.set(name, value);

        return value;

    }


    // ===================================
    // Check Local
    // ===================================

    hasLocal(name) {

        return this.values.has(name);

    }


    // ===================================
    // Check Semua Scope
    // ===================================

    has(name) {

        if (this.values.has(name)) {

            return true;

        }

        if (this.parent) {

            return this.parent.has(name);

        }

        return false;

    }


    // ===================================
    // Get
    // ===================================

    get(name) {

        if (this.values.has(name)) {

            return this.values.get(name);

        }

        if (this.parent) {

            return this.parent.get(name);

        }

        throw new RuntimeError(
            `Variabel '${name}' belum dibuat.`
        );

    }


    // ===================================
    // Assign
    // ===================================

    assign(name, value) {

        if (this.values.has(name)) {

            this.values.set(name, value);

            return value;

        }

        if (this.parent) {

            return this.parent.assign(
                name,
                value
            );

        }

        throw new RuntimeError(
            `Variabel '${name}' belum dibuat.`
        );

    }


    // ===================================
    // Buat Child Scope
    // ===================================

    child() {

        return new Environment(this);

    }

}


// =======================================
// User Function
// =======================================

class RuntimeFunction {

    constructor(declaration, closure) {

        this.declaration = declaration;

        this.closure = closure;

    }


    call(interpreter, args) {

        const environment =
            this.closure.child();


        // ===============================
        // Parameter
        // ===============================

        const params =
            this.declaration.params || [];


        for (
            let i = 0;
            i < params.length;
            i++
        ) {

            const value =
                i < args.length
                    ? args[i]
                    : null;

            environment.define(
                params[i],
                value
            );

        }


        // ===============================
        // Jalankan Body
        // ===============================

        try {

            interpreter.executeBlock(
                this.declaration.body,
                environment
            );

        }

        catch (error) {

            if (
                error instanceof ReturnSignal
            ) {

                return error.value;

            }

            throw error;

        }


        return null;

    }


    arity() {

        return (
            this.declaration.params || []
        ).length;

    }

}


// =======================================
// Return Signal
// =======================================
//
// Digunakan agar "kembali" bisa keluar
// dari function tanpa menghentikan seluruh
// interpreter.
//

class ReturnSignal {

    constructor(value) {

        this.value = value;

    }

}


// =======================================
// Runtime Object
// =======================================

class RuntimeObject {

    constructor() {

        this.fields = new Map();

    }


    get(name) {

        if (this.fields.has(name)) {

            return this.fields.get(name);

        }

        throw new RuntimeError(
            `Property '${name}' tidak ditemukan.`
        );

    }


    set(name, value) {

        this.fields.set(
            name,
            value
        );

        return value;

    }

}


// =======================================
// Utility
// =======================================

function isCallable(value) {

    return (
        typeof value === "function" ||
        value instanceof RuntimeFunction
    );

}


function callFunction(
    callable,
    interpreter,
    args
) {

    if (typeof callable === "function") {

        return callable(...args);

    }


    if (
        callable instanceof RuntimeFunction
    ) {

        return callable.call(
            interpreter,
            args
        );

    }


    throw new RuntimeError(
        "Nilai tersebut bukan sebuah fungsi."
    );

}


// =======================================
// Export
// =======================================

module.exports = {

    RuntimeError,

    Environment,

    RuntimeFunction,

    ReturnSignal,

    RuntimeObject,

    isCallable,

    callFunction

};