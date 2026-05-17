// ==UserScript==
// @name         Formify (Dev)
// @version      dev
// @description  Development loader — fetches latest build from local server with cache busting
// @author       Aman524524
// @license      MIT
// @namespace    https://docs.google.com/
// @match        https://docs.google.com/forms/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=docs.google.com
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const DEV_SERVER = 'http://localhost:1024';

    GM_xmlhttpRequest({
        method: 'GET',
        url: DEV_SERVER + '/build?_=' + Date.now(),
        onload: function (response) {
            if (response.status === 200) {
                try {
                    var code = response.responseText;

                    // Google Forms enforces Trusted Types — eval() accepts TrustedScript
                    // but the Function constructor does not, so we use eval here.
                    if (typeof trustedTypes !== 'undefined' && trustedTypes.createPolicy) {
                        try {
                            var policy = trustedTypes.createPolicy('formify-dev', {
                                createScript: function (s) { return s; },
                            });
                            code = policy.createScript(code);
                        } catch (_) {
                            // Policy creation may fail if CSP restricts policy names — try eval anyway
                        }
                    }

                    // eval runs in this scope, so GM_addStyle and unsafeWindow are accessible
                    eval(code);
                } catch (err) {
                    console.error('[Formify Dev] Eval error:', err);
                }
            } else {
                console.error('[Formify Dev] Server responded with:', response.status);
            }
        },
        onerror: function () {
            console.error('[Formify Dev] Could not reach dev server at ' + DEV_SERVER);
            console.error('[Formify Dev] Run: bun run dev');
        }
    });
})();
