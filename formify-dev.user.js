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
        url: DEV_SERVER + '/?_=' + Date.now(),
        onload: function (response) {
            if (response.status === 200) {
                try {
                    const fn = new Function('GM_addStyle', 'unsafeWindow', response.responseText);
                    fn(GM_addStyle, typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
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
