// @ts-check

const OUTPUT_DIR = "dist/";
const ENTRY_POINT = "src/index.js"; // Changed extension to .js
const BANNER_FILE = "src/metadata.txt";

/**
 * Builds the project using Bun's build API.
 * @param {boolean} [isProduction=false] - Flag to determine if the build is for production.
 * @returns {Promise<string>} - A promise that resolves with the text content of the primary output file.
 */
const build = async (isProduction = false) => {
    try {
        const result = await Bun.build({
            entrypoints: [ENTRY_POINT],

            banner:
                (await Bun.file(BANNER_FILE).text()) +
                "\n\n" +
                `const css = \`${await Bun.file("src/static/style.css").text()}\`;` +
                "\n\n" +
                `const js = \`${await Bun.file("src/static/script.js").text()}\`;`,

            ...(isProduction ? { outdir: OUTPUT_DIR } : {}),
        });

        console.log("[+] Build successful.");
        return result.outputs[0].text();
    } catch (err) {
        console.log(err);
        console.warn("[E] Failed to build.");
        return Promise.reject(err);
    }
};

// Assuming Bun's environment or a module runner that provides these globals
if (process.argv[1] === import.meta.filename) {
    console.log("[+] Saving to " + OUTPUT_DIR);
    build(true);
}

export { build };
