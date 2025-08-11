const path = require('path');

module.exports = [
    // Main build for dist folder
    {
        entry: "./src/consent.js",
        output: {
            filename: "consent.bundle.js",
            path: __dirname + "/dist",
            library: "ConsentModule",
            libraryTarget: "umd", // Universal support for CommonJS, AMD, and global
            libraryExport: "default",  // ✅ This removes the "default" wrapper!
            globalObject: "this", // Ensures compatibility in different environments
            environment: {
                arrowFunction: false, // No arrow functions
                const: false, // No const/let
                destructuring: false, // No destructuring
            },
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.handlebars$/,
                    loader: "handlebars-loader",
                    options: {
                        helperDirs: [
                            __dirname + "/src/handlebars-helpers"
                        ],
                        partialDirs: [
                            __dirname + "/src/templates"
                        ]
                    }
                }
            ],
        },
        resolve: {
            fullySpecified: false // Fixes issues with some old module formats
        },
    },
    // Additional build for examples/dist folder
    {
        entry: "./src/consent.js",
        output: {
            filename: "consent.bundle.js",
            path: path.resolve(__dirname, "examples/dist"),
            library: "ConsentModule",
            libraryTarget: "umd", // Universal support for CommonJS, AMD, and global
            libraryExport: "default",  // ✅ This removes the "default" wrapper!
            globalObject: "this", // Ensures compatibility in different environments
            environment: {
                arrowFunction: false, // No arrow functions
                const: false, // No const/let
                destructuring: false, // No destructuring
            },
        },
        module: {
            rules: [
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: "asset/inline",
                },
                {
                    test: /\.css$/i,
                    use: ["style-loader", "css-loader"]
                },
                {
                    test: /\.handlebars$/,
                    loader: "handlebars-loader",
                    options: {
                        helperDirs: [
                            __dirname + "/src/handlebars-helpers"
                        ],
                        partialDirs: [
                            __dirname + "/src/templates"
                        ]
                    }
                }
            ],
        },
        resolve: {
            fullySpecified: false // Fixes issues with some old module formats
        },
    }
];
