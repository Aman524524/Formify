import { build } from "./build";

const DEV_SCRIPT_PATH = "formify-dev.user.js";

const installPage = (port: number) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formify — Install Dev Script</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
            background: #0f0f1a;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .card {
            background: #1e1e2e;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 48px;
            max-width: 520px;
            width: 100%;
            text-align: center;
            box-shadow: 0 24px 80px rgba(0,0,0,0.4);
            animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .logo {
            font-size: 48px;
            margin-bottom: 8px;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #6366f1, #06b6d4, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            color: #94a3b8;
            font-size: 14px;
            margin-bottom: 32px;
        }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.3);
            color: #22c55e;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 28px;
        }
        .status::before {
            content: '';
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
        .install-btn {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
        }
        .install-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .install-btn:active {
            transform: translateY(0) scale(0.97);
        }
        .info {
            margin-top: 28px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.7;
        }
        .info code {
            background: #282840;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'SF Mono', 'Cascadia Code', monospace;
            font-size: 11px;
            color: #a5b4fc;
        }
        .steps {
            text-align: left;
            margin-top: 24px;
            padding: 16px 20px;
            background: #282840;
            border-radius: 12px;
            border: 1px solid #334155;
        }
        .steps li {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 8px;
            padding-left: 4px;
        }
        .steps li:last-child { margin-bottom: 0; }
        .steps li strong { color: #e2e8f0; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">⚡</div>
        <h1>Formify Dev</h1>
        <p class="subtitle">Development server with live reload</p>
        <div class="status">Server running on port ${port}</div>
        <br><br>
        <a href="/formify-dev.user.js" class="install-btn">Install Dev Userscript</a>
        <ol class="steps">
            <li><strong>Install Tampermonkey</strong> if you haven't already</li>
            <li>Click the button above — Tampermonkey will prompt to install</li>
            <li>Open any <strong>Google Form</strong> — it loads the latest build automatically</li>
            <li>Edit code → refresh page → changes apply instantly</li>
        </ol>
        <p class="info">
            Build endpoint: <code>GET /build</code> &nbsp;·&nbsp; 
            Script: <code>GET /formify-dev.user.js</code>
        </p>
    </div>
</body>
</html>`;

const server = Bun.serve({
    port: process.env["PORT"] || 1024,
    routes: {
        "/": (): Response => {
            return new Response(installPage(server.port!), {
                headers: { "content-type": "text/html" },
            });
        },
        "/build": async () => {
            const buildOutput = await build(false);
            return new Response(buildOutput, {
                headers: {
                    "cache-control": "no-store, no-cache, must-revalidate",
                    "content-type": "text/javascript",
                },
            });
        },
        "/formify-dev.user.js": async () => {
            const script = await Bun.file(DEV_SCRIPT_PATH).text();
            return new Response(script, {
                headers: {
                    "content-type": "text/javascript",
                },
            });
        },
    },
    fetch() {
        return Response.redirect("/", 302);
    },
});

console.log("[+] Listening at http://localhost:" + server.port);