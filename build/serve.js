// @ts-check

import { build } from "./build.js"; // In Node.js ESM, the .js extension is often required

const server = Bun.serve({
    port: process.env.PORT || 1024,
    // Note: The 'routes' property is a Bun-specific extension.
    // It is not part of the standard Web APIs.
    routes: {
        "/": async () => {
            // Build the files
            const buildOutput = await build(false);

            // Send the file content as the response
            return new Response(buildOutput, {
                headers: {
                    "cache-control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                    "content-type": "text/javascript",
                },
            });
        },
    },

    /**
     * Fallback fetch handler for any requests that don't match the 'routes' object.
     * @param {Request} req - The incoming request object.
     * @returns {Response} - A default response.
     */
    fetch(req) {
        // This will handle requests for any path other than "/"
        return new Response(
            "Hi! It wasn't expected for you to visit this page."
        );
    },
});

console.log(`[+] Listening for requests at http://localhost:${server.port}`);
