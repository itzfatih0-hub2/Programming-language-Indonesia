// =======================================
// Bahasa Indonesia Programming Language
// Compiler v2
// Stable AST -> JavaScript Compiler
// =======================================

class Compiler {

    constructor(options = {}) {

    this.indentLevel = 0;

    this.options = {
        async: true,
        runtimeName: "__indo",
        stdlibPath: null,
        ...options
      };

    }


    // ===================================
    // PROGRAM
    // ===================================

    compile(program) {

        if (
            !program ||
            program.type !== "Program" ||
            !Array.isArray(program.body)
        ) {

            throw new Error(
                "AST tidak valid. Root harus bertipe 'Program'."
            );

        }


        // Compile semua statement.
        const body =
            program.body
                .map(node =>
                    this.compileStatement(node)
                )
                .filter(code =>
                    typeof code === "string" &&
                    code.trim().length > 0
                )
                .join("\n");


        const runtimeName =
            this.compileIdentifier(
                this.options.runtimeName
            );


        const mainKeyword =
            this.options.async
                ? "async "
                : "";


        const mainBody =
            body.trim().length === 0
                ? ""
                : this.indentBlock(body);


        let output =

`${mainKeyword}function ${runtimeName}() {
${mainBody}
}`;


        // Jalankan main.
        if (this.options.async) {

            if (this.options.catchErrors) {

                output +=

`\n\n${runtimeName}().catch(error => {
    console.error("Indo Runtime Error:");
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
});`;

            } else {

                output +=
                    `\n\n${runtimeName}();`;

            }

        } else {

            output +=
                `\n\n${runtimeName}();`;

        }


        return output;

    }


    // ===================================
    // STATEMENT
    // ===================================

    compileStatement(node) {

        if (
            !node ||
            typeof node.type !== "string"
        ) {

            throw new Error(
                "Compiler: Statement AST tidak valid."
            );

        }


        switch (node.type) {

            case "VariableDeclaration":
                return this.compileVariable(node);

            case "PrintStatement":
                return this.compilePrint(node);

            case "ExpressionStatement":
                return this.compileExpressionStatement(node);

            case "IfStatement":
                return this.compileIf(node);

            case "WaitStatement":
                return this.compileWait(node);

            case "WhileStatement":
                return this.compileWhile(node);

            case "ForStatement":
                return this.compileFor(node);

            case "FunctionDeclaration":
                return this.compileFunction(node);

            case "ReturnStatement":
                return this.compileReturn(node);

            case "ImportStatement":
                return this.compileImport(node);

            case "ClassDeclaration":
                return this.compileClass(node);

            default:

                throw new Error(
                    `Compiler: Statement '${node.type}' belum didukung.`
                );

        }

    }


    // ===================================
    // VARIABLE
    // ===================================

    compileVariable(node) {

        if (
            !node.identifier ||
            node.identifier.type !== "Identifier"
        ) {

            throw new Error(
                "Compiler: Identifier variabel tidak valid."
            );

        }


        const name =
            this.compileIdentifier(
                node.identifier.name
            );


        const value =
            this.compileExpression(
                node.initializer
            );


        return `let ${name} = ${value};`;

    }


    // ===================================
    // PRINT
    // ===================================

    compilePrint(node) {

        const value =
            this.compileExpression(
                node.value
            );


        return `console.log(${value});`;

    }


    // ===================================
    // EXPRESSION STATEMENT
    // ===================================

    compileExpressionStatement(node) {

        return (
            this.compileExpression(
                node.expression
            ) + ";"
        );

    }


    // ===================================
    // WAIT STATEMENT
    // ===================================

    compileWait(node) {

        this.requireAsync(
            "Statement 'tunggu'"
        );


        const duration =
            this.compileExpression(
                node.duration
            );


        return (
            `await new Promise(resolve => ` +
            `setTimeout(resolve, (${duration}) * 1000));`
        );

    }


    // ===================================
    // IF
    // ===================================

    compileIf(node) {

        const condition =
            this.compileExpression(
                node.condition
            );


        const thenBody =
            this.compileBlock(
                node.thenBody
            );


        let result =
            `if (${condition}) ${thenBody}`;


        if (
            Array.isArray(node.elseBody)
        ) {

            const elseBody =
                this.compileBlock(
                    node.elseBody
                );


            result +=
                ` else ${elseBody}`;

        }


        return result;

    }


    // ===================================
    // WHILE
    // ===================================

    compileWhile(node) {

        const condition =
            this.compileExpression(
                node.condition
            );


        const body =
            this.compileBlock(
                node.body
            );


        return `while (${condition}) ${body}`;

    }


    // ===================================
    // FOR
    // ===================================

    compileFor(node) {

        const variable =
            this.compileIdentifier(
                node.variable
            );


        const start =
            this.compileExpression(
                node.start
            );


        const end =
            this.compileExpression(
                node.end
            );


        const step =
            this.compileExpression(
                node.step
            );


        const body =
            this.compileBlock(
                node.body
            );

        return (

`for (
    let ${variable} = ${start};
    ((${step}) >= 0
        ? ${variable} <= (${end})
        : ${variable} >= (${end}));
    ${variable} += (${step})
) ${body}`

        );

    }


    // ===================================
    // FUNCTION
    // ===================================

    compileFunction(node) {

        const name =
            this.compileIdentifier(
                node.name
            );


        const params =
            node.params
                .map(param =>
                    this.compileIdentifier(param)
                )
                .join(", ");

        const body =
            this.compileBlock(
                node.body
            );


        return (
            `async function ${name}(${params}) ` +
            body
        );

    }


    // ===================================
    // RETURN
    // ===================================

    compileReturn(node) {

        if (
            node.value === null ||
            node.value === undefined
        ) {

            return "return;";

        }


        return (
            `return ${this.compileExpression(
                node.value
            )};`
        );

    }


    // ===================================
    // IMPORT
    // ===================================

    compileImport(node) {

    if (
        !node ||
        typeof node.file !== "string" ||
        node.file.trim() === ""
    ) {

        throw new Error(
            "Compiler: nama module tidak valid."
        );

    }

    const moduleName =
        this.sanitizeModuleName(
            node.file
        );

    if (!this.options.stdlibPath) {

        throw new Error(
            "Compiler: lokasi stdlib belum ditentukan."
        );

    }

    const modulePath =
        path.join(
            this.options.stdlibPath,
            `${moduleName}.js`
        );

    return `const ${moduleName} = require(${JSON.stringify(modulePath)});`;

    }


    // ===================================
    // CLASS
    // ===================================

    compileClass(node) {

        const name =
            this.compileIdentifier(
                node.name
            );


        if (
            !Array.isArray(node.body)
        ) {

            throw new Error(
                "Compiler: Body class tidak valid."
            );

        }

        const body =
            node.body
                .map(statement =>
                    this.compileStatement(
                        statement
                    )
                )
                .join("\n");


        if (!body.trim()) {

            return `class ${name} {}`;

        }


        return (
            `class ${name} {\n` +
            `${this.indentBlock(body)}\n` +
            `}`
        );

    }


    // ===================================
    // BLOCK
    // ===================================

    compileBlock(body) {

        if (!Array.isArray(body)) {

            throw new Error(
                "Compiler: Block harus berupa array."
            );

        }


        if (body.length === 0) {

            return "{}";

        }


        const compiled =
            body
                .map(statement =>
                    this.compileStatement(
                        statement
                    )
                )
                .filter(Boolean)
                .join("\n");


        return (
            "{\n" +
            this.indentBlock(compiled) +
            "\n}"
        );

    }


    // ===================================
    // EXPRESSION
    // ===================================

    compileExpression(node) {

        if (!node) {

            throw new Error(
                "Compiler: Expression tidak boleh kosong."
            );

        }


        if (
            typeof node.type !== "string"
        ) {

            throw new Error(
                "Compiler: Expression AST tidak valid."
            );

        }


        switch (node.type) {

            case "Literal":
                return this.compileLiteral(
                    node.value
                );


            case "Identifier":
                return this.compileIdentifier(
                    node.name
                );


            case "AssignmentExpression":
                return this.compileAssignment(
                    node
                );


            case "BinaryExpression":
                return this.compileBinary(
                    node
                );


            case "LogicalExpression":
                return this.compileLogical(
                    node
                );


            case "UnaryExpression":
                return this.compileUnary(
                    node
                );


            case "CallExpression":
                return this.compileCall(
                    node
                );


            case "MemberExpression":
                return this.compileMember(
                    node
                );


            case "ArrayExpression":
                return this.compileArray(
                    node
                );


            case "ObjectExpression":
                return this.compileObject(
                    node
                );


            case "WaitExpression":
                return this.compileWaitExpression(
                    node
                );


            default:

                throw new Error(
                    `Compiler: Expression '${node.type}' belum didukung.`
                );

        }

    }


    // ===================================
    // LITERAL
    // ===================================

    compileLiteral(value) {

        if (value === null) {

            return "null";

        }


        if (value === undefined) {

            return "undefined";

        }


        if (typeof value === "string") {

            return this.compileString(
                value
            );

        }


        if (typeof value === "boolean") {

            return value
                ? "true"
                : "false";

        }


        if (typeof value === "number") {

            if (!Number.isFinite(value)) {

                throw new Error(
                    "Compiler: Number harus finite."
                );

            }

            return String(value);

        }


        throw new Error(
            "Compiler: Literal tidak didukung."
        );

    }


    // ===================================
    // STRING
    // ===================================

    compileString(value) {

        return JSON.stringify(
            String(value)
        );

    }


    // ===================================
    // IDENTIFIER
    // ===================================

    compileIdentifier(name) {

        if (
            typeof name !== "string" ||
            !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
        ) {

            throw new Error(
                `Compiler: Identifier '${name}' tidak valid.`
            );

        }


        return name;

    }


    // ===================================
    // ASSIGNMENT
    // ===================================

    compileAssignment(node) {

        const left =
            this.compileExpression(
                node.left
            );


        const right =
            this.compileExpression(
                node.right
            );


        return `(${left} = ${right})`;

    }


    // ===================================
    // BINARY
    // ===================================

    compileBinary(node) {

        const left =
            this.compileExpression(
                node.left
            );


        const right =
            this.compileExpression(
                node.right
            );


        const operators = {

            PLUS: "+",
            MINUS: "-",
            STAR: "*",
            SLASH: "/",
            PERCENT: "%",

            GREATER: ">",
            GREATER_EQUAL: ">=",

            LESS: "<",
            LESS_EQUAL: "<=",

            EQUAL: "===",
            EQUAL_EQUAL: "===",

            NOT_EQUAL: "!=="

        };


        const operator =
            operators[node.operator];


        if (!operator) {

            throw new Error(
                `Compiler: Operator '${node.operator}' tidak didukung.`
            );

        }


        return (
            `(${left} ${operator} ${right})`
        );

    }


    // ===================================
    // LOGICAL
    // ===================================

    compileLogical(node) {

        const left =
            this.compileExpression(
                node.left
            );


        const right =
            this.compileExpression(
                node.right
            );


        const operators = {

            AND: "&&",

            OR: "||"

        };


        const operator =
            operators[node.operator];


        if (!operator) {

            throw new Error(
                `Compiler: Logical operator '${node.operator}' tidak didukung.`
            );

        }


        return (
            `(${left} ${operator} ${right})`
        );

    }


    // ===================================
    // UNARY
    // ===================================

    compileUnary(node) {

        const argument =
            this.compileExpression(
                node.argument
            );


        const operators = {

            NOT: "!",

            MINUS: "-",

            PLUS: "+"

        };


        const operator =
            operators[node.operator];


        if (!operator) {

            throw new Error(
                `Compiler: Unary operator '${node.operator}' tidak didukung.`
            );

        }


        return (
            `(${operator}${argument})`
        );

    }


    // ===================================
    // CALL
    // ===================================

    compileCall(node) {

        const callee =
            this.compileExpression(
                node.callee
            );


        if (
            !Array.isArray(node.arguments)
        ) {

            throw new Error(
                "Compiler: Arguments function harus berupa array."
            );

        }


        const args =
            node.arguments
                .map(argument =>
                    this.compileExpression(
                        argument
                    )
                )
                .join(", ");


        return `${callee}(${args})`;

    }


    // ===================================
    // MEMBER
    // ===================================

    compileMember(node) {

        const object =
            this.compileExpression(
                node.object
            );


        if (node.computed) {

            const property =
                this.compileExpression(
                    node.property
                );


            return (
                `${object}[${property}]`
            );

        }


        if (
            !node.property ||
            node.property.type !== "Identifier"
        ) {

            throw new Error(
                "Compiler: Property member tidak valid."
            );

        }


        const property =
            this.compileIdentifier(
                node.property.name
            );


        return (
            `${object}.${property}`
        );

    }


    // ===================================
    // ARRAY
    // ===================================

    compileArray(node) {

        if (
            !Array.isArray(node.elements)
        ) {

            throw new Error(
                "Compiler: Elements array tidak valid."
            );

        }


        return (

            "[" +

            node.elements
                .map(element =>
                    this.compileExpression(
                        element
                    )
                )
                .join(", ") +

            "]"

        );

    }


    // ===================================
    // OBJECT
    // ===================================

    compileObject(node) {

        if (
            !Array.isArray(node.properties)
        ) {

            throw new Error(
                "Compiler: Properties object tidak valid."
            );

        }


        const properties =
            node.properties
                .map(property => {

                    if (
                        !property ||
                        typeof property.key !== "string"
                    ) {

                        throw new Error(
                            "Compiler: Key object tidak valid."
                        );

                    }


                    const key =
                        /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(
                            property.key
                        )

                            ? property.key

                            : this.compileString(
                                property.key
                            );


                    const value =
                        this.compileExpression(
                            property.value
                        );


                    return (
                        `${key}: ${value}`
                    );

                })
                .join(", ");


        return `{ ${properties} }`;

    }


    // ===================================
    // WAIT EXPRESSION
    // ===================================

    compileWaitExpression(node) {

        this.requireAsync(
            "Expression 'tunggu'"
        );


        const duration =
            this.compileExpression(
                node.duration
            );


        const expression =
            this.compileExpression(
                node.expression
            );

        return (

            `(await (async () => {` +

            `await new Promise(resolve => ` +
            `setTimeout(resolve, (${duration}) * 1000)); ` +

            `return ${expression};` +

            `})())`

        );

    }


    // ===================================
    // ASYNC VALIDATION
    // ===================================

    requireAsync(feature) {

        if (!this.options.async) {

            throw new Error(
                `Compiler: ${feature} membutuhkan mode async.`
            );

        }

    }


    // ===================================
    // MODULE NAME
    // ===================================

    normalizeModuleName(name) {

        let result =
            String(name).trim();


        if (
            result.endsWith(".js")
        ) {

            result =
                result.slice(
                    0,
                    -3
                );

        }


        return result;

    }


    sanitizeModuleName(name) {

        let result =
            String(name)
                .replace(
                    /[^A-Za-z0-9_$]/g,
                    "_"
                );

        if (
            /^[0-9]/.test(result)
        ) {

            result =
                "_" + result;

        }


        return result;

    }


    // ===================================
    // INDENT BLOCK
    // ===================================

    indentBlock(text) {

        return String(text)
            .split("\n")
            .map(line => {

                if (
                    line.length === 0
                ) {

                    return "";

                }

                return "    " + line;

            })
            .join("\n");

    }

}


// =======================================
// EXPORT
// =======================================

module.exports = Compiler;