from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import get_db
from . import schemas
from .ai_service import generate_sql, summarize_result

app = FastAPI(
    title="AI Service",
    version="0.1.0",
    docs_url=None,
    redoc_url=None
)

@app.get("/docs", response_class=HTMLResponse)
def custom_docs():
    return """
    <!DOCTYPE html>
    <html lang="cs">
    <head>
        <meta charset="UTF-8" />
        <title>AI Business Analytik – API dokumentace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
            :root {
                color-scheme: light dark;
            }
            * {
                box-sizing: border-box;
            }
            body {
                margin: 0;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                background: radial-gradient(circle at top left, #eef2ff 0, #fdf2f8 40%, #f9fafb 100%);
                color: #0f172a;
            }
            .page {
                max-width: 1120px;
                margin: 0 auto;
                padding: 2.5rem 1.5rem 3rem;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1.5rem;
                margin-bottom: 1.75rem;
            }
            .logo-wrap {
                display: flex;
                align-items: center;
                gap: 0.9rem;
            }
            .logo-mark {
                width: 40px;
                height: 40px;
                border-radius: 1.3rem;
                background: radial-gradient(circle at 20% 0, #22c55e 0, #22c55e 10%, #0ea5e9 55%, #6366f1 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.1rem;
                box-shadow: 0 18px 40px rgba(79,70,229,0.5);
            }
            .logo-text-main {
                font-size: 1.25rem;
                font-weight: 650;
                letter-spacing: -0.03em;
            }
            .logo-text-sub {
                font-size: 0.8rem;
                color: #6b7280;
            }
            .header-right {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .btn {
                border-radius: 999px;
                padding: 0.4rem 0.9rem;
                font-size: 0.8rem;
                border: 1px solid rgba(148,163,184,0.7);
                background: rgba(255,255,255,0.9);
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                color: #111827;
                text-decoration: none;
                cursor: pointer;
            }
            .btn svg {
                width: 14px;
                height: 14px;
            }
            .qr-wrap {
                width: 82px;
                height: 82px;
                border-radius: 1rem;
                padding: 0.25rem;
                background: rgba(15,23,42,0.04);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .qr-wrap img {
                width: 70px;
                height: 70px;
                border-radius: 0.6rem;
            }
            h1 {
                font-size: 2.05rem;
                letter-spacing: -0.03em;
                margin: 0 0 0.5rem;
            }
            .subtitle {
                color: #4b5563;
                max-width: 640px;
                font-size: 0.95rem;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            .grid {
                display: grid;
                grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.2fr);
                gap: 1.5rem;
            }
            @media (max-width: 900px) {
                .header {
                    flex-direction: column;
                    align-items: flex-start;
                }
                .header-right {
                    align-self: stretch;
                    justify-content: space-between;
                }
                .grid {
                    grid-template-columns: minmax(0, 1fr);
                }
            }
            @media (max-width: 640px) {
                .header-right {
                    flex-direction: row-reverse;
                }
            }
            .card {
                background: rgba(255,255,255,0.96);
                border-radius: 1.25rem;
                padding: 1.5rem 1.4rem;
                box-shadow: 0 18px 45px rgba(15,23,42,0.08);
                border: 1px solid rgba(148,163,184,0.35);
                backdrop-filter: blur(10px);
            }
            .pill-title {
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                color: #6b7280;
                margin-bottom: 0.55rem;
            }
            .endpoint {
                margin-bottom: 1rem;
            }
            .method {
                font-size: 0.78rem;
                font-weight: 600;
                padding: 0.1rem 0.55rem;
                border-radius: 999px;
                margin-right: 0.4rem;
            }
            .method-get { background: rgba(16,185,129,0.12); color: #047857; }
            .method-post { background: rgba(59,130,246,0.16); color: #1d4ed8; }
            .path {
                font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.86rem;
            }
            .endpoint-desc {
                font-size: 0.85rem;
                color: #4b5563;
                margin-top: 0.15rem;
            }
            ul {
                font-size: 0.86rem;
                padding-left: 1.1rem;
                color: #374151;
                margin: 0.15rem 0 0.3rem;
            }
            li {
                margin-bottom: 0.18rem;
            }
            code {
                font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 0.82rem;
                background: rgba(15,23,42,0.04);
                padding: 0.08rem 0.25rem;
                border-radius: 0.4rem;
            }
            pre {
                background: #020617;
                color: #e5e7eb;
                padding: 0.9rem 1rem;
                border-radius: 0.9rem;
                font-size: 0.78rem;
                overflow-x: auto;
                border: 1px solid rgba(15,23,42,0.9);
                margin-top: 0.4rem;
            }
            .chip-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.4rem;
                margin-top: 0.25rem;
            }
            .chip {
                font-size: 0.76rem;
                padding: 0.12rem 0.55rem;
                border-radius: 999px;
                background: rgba(15,23,42,0.04);
                color: #374151;
            }
            .muted {
                font-size: 0.8rem;
                color: #6b7280;
            }
            .ai-form {
                display: flex;
                flex-direction: column;
                gap: 0.6rem;
            }
            .ai-input {
                width: 100%;
                border-radius: 0.85rem;
                border: 1px solid rgba(148,163,184,0.9);
                padding: 0.7rem 0.8rem;
                font-size: 0.9rem;
                resize: vertical;
                min-height: 3rem;
                max-height: 120px;
            }
            .ai-run {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                align-self: flex-end;
                border-radius: 999px;
                border: none;
                padding: 0.45rem 0.9rem;
                background: linear-gradient(135deg, #4f46e5, #22c55e);
                color: white;
                font-size: 0.85rem;
                font-weight: 500;
                cursor: pointer;
                box-shadow: 0 14px 35px rgba(79,70,229,0.65);
            }
            .ai-run:disabled {
                opacity: 0.6;
                box-shadow: none;
                cursor: default;
            }
            .ai-output-section {
                margin-top: 0.9rem;
                display: grid;
                grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
                gap: 0.75rem;
            }
            @media (max-width: 640px) {
                .ai-output-section {
                    grid-template-columns: minmax(0, 1fr);
                }
            }
            .ai-block-title {
                font-size: 0.78rem;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                color: #6b7280;
                margin-bottom: 0.3rem;
            }
            .box {
                background: rgba(15,23,42,0.97);
                color: #e5e7eb;
                border-radius: 0.85rem;
                padding: 0.7rem 0.8rem;
                font-size: 0.8rem;
                min-height: 60px;
                border: 1px solid rgba(15,23,42,0.9);
                white-space: pre-wrap;
                word-break: break-word;
                overflow-x: auto;
            }
            .summary-box {
                background: rgba(248,250,252,0.9);
                color: #111827;
                border: 1px solid rgba(209,213,219,0.9);
            }
            .deploy-grid {
                display: grid;
                grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
                gap: 1.3rem;
            }
            @media (max-width: 800px) {
                .deploy-grid {
                    grid-template-columns: minmax(0, 1fr);
                }
            }
            .deploy-steps li {
                margin-bottom: 0.35rem;
            }
        </style>
    </head>
    <body>
        <div class="page">
            <div class="header">
                <div class="logo-wrap">
                    <div class="logo-mark">AI</div>
                    <div>
                        <div class="logo-text-main">AI Obchodní Analytik</div>
                        <div class="logo-text-sub">FastAPI AI service pro dotazy nad databází sales</div>
                    </div>
                </div>
                <div class="header-right">
                    <a class="btn" href="https://github.com/PetrStastny1/AI-Obchodni-analytik" target="_blank" rel="noreferrer">
                        <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
                            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                            -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78
                            -.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21
                            2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16
                            1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54
                            1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
                        </svg>
                        <span>GitHub repo</span>
                    </a>
                    <div class="qr-wrap">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=http://localhost:8001/docs" alt="QR kód /docs" />
                    </div>
                </div>
            </div>

            <h1>Dokumentace AI služby</h1>
            <p class="subtitle">
                Tato služba poskytuje AI analytiku nad tabulkou <code>sales</code>. Přijímá dotazy v češtině,
                generuje SQL pro MySQL, provede dotaz nad databází a vrací výsledky spolu se shrnutím.
            </p>

            <div class="grid">
                <div class="card">
                    <div class="pill-title">Endpointy</div>

                    <div class="endpoint">
                        <span class="method method-get">GET</span>
                        <span class="path">/health</span>
                        <div class="endpoint-desc">Jednoduchý health-check. Vrací <code>{"status": "ok"}</code>, pokud služba běží.</div>
                    </div>

                    <div class="endpoint">
                        <span class="method method-post">POST</span>
                        <span class="path">/analyze</span>
                        <div class="endpoint-desc">
                            Hlavní AI endpoint. Vstupem je dotaz v přirozeném jazyce, výstupem je SQL dotaz, data z MySQL a shrnutí.
                        </div>
                    </div>

                    <div class="pill-title">Request body – /analyze</div>
                    <ul>
                        <li><code>question</code> – textový dotaz (např. <code>"Kolik objednávek bylo celkem?"</code>)</li>
                        <li><code>limit</code> – volitelné, max. počet řádků (default 100)</li>
                    </ul>

                    <div class="pill-title" style="margin-top:0.9rem;">Response body – /analyze</div>
                    <ul>
                        <li><code>sql</code> – vygenerovaný SQL dotaz (MySQL)</li>
                        <li><code>result</code> – pole objektů s výsledkem dotazu</li>
                        <li><code>summary</code> – shrnutí výsledku v češtině</li>
                    </ul>

                    <div class="pill-title" style="margin-top:1.1rem;">Datový model (tabulka sales)</div>
                    <ul>
                        <li><code>id</code> – INT, primární klíč</li>
                        <li><code>date</code> – DATETIME, datum prodeje</li>
                        <li><code>product</code> – VARCHAR(255), název produktu</li>
                        <li><code>quantity</code> – INT, prodané množství</li>
                        <li><code>price</code> – DECIMAL(10,2), cena za kus</li>
                    </ul>
                </div>

                <div class="card">
                    <div class="pill-title">Interaktivní AI konzole</div>
                    <form class="ai-form" onsubmit="runAnalyze(event)">
                        <textarea id="question-input" class="ai-input" placeholder="Např. 'Který produkt byl nejprodávanější?'"></textarea>
                        <button id="run-btn" type="submit" class="ai-run">
                            <span>Spustit analýzu</span>
                        </button>
                    </form>
                    <div class="muted" style="margin-top:0.3rem;">
                        Dotaz je poslán na <code>POST /analyze</code>, backend vygeneruje SQL, provede ho a vrátí výsledek.
                    </div>

                    <div class="ai-output-section" style="margin-top:1rem;">
                        <div>
                            <div class="ai-block-title">SQL dotaz</div>
                            <div id="sql-block" class="box"></div>
                        </div>
                        <div>
                            <div class="ai-block-title">Výsledek (JSON)</div>
                            <div id="result-block" class="box"></div>
                        </div>
                    </div>

                    <div style="margin-top:0.9rem;">
                        <div class="ai-block-title">Shrnutí</div>
                        <div id="summary-block" class="box summary-box"></div>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:1.8rem;">
                <div class="pill-title">Jak službu nasadit</div>
                <div class="deploy-grid">
                    <div>
                        <ul class="deploy-steps">
                            <li>1. Spustit MySQL (Docker) s databází <code>analytics</code> a tabulkou <code>sales</code>.</li>
                            <li>2. Nastavit proměnné v <code>.env</code> (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, OPENAI_API_KEY).</li>
                            <li>3. Vytvořit a aktivovat virtuální prostředí <code>python -m venv .venv</code>.</li>
                            <li>4. Nainstalovat závislosti <code>pip install -r requirements.txt</code>.</li>
                            <li>5. Spustit API: <code>uvicorn app.main:app --reload --port 8001</code>.</li>
                            <li>6. Backend (NestJS) volá tento servis přes HTTP endpoint <code>/analyze</code>.</li>
                        </ul>
                    </div>
                    <div>
                        <div class="pill-title">Stack</div>
                        <div class="chip-row">
                            <div class="chip">FastAPI</div>
                            <div class="chip">OpenAI GPT-4.1-mini</div>
                            <div class="chip">MySQL</div>
                            <div class="chip">SQLAlchemy</div>
                            <div class="chip">NestJS</div>
                            <div class="chip">Angular dashboard</div>
                        </div>
                        <p class="muted" style="margin-top:0.7rem;">
                            Tento AI microservice je volán z NestJS backendu (GraphQL resolver <code>askAI</code>) a výsledky
                            se zobrazují v Angular BI dashboardu (AI sekce).
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <script>
            async function runAnalyze(event) {
                event.preventDefault();
                const input = document.getElementById('question-input');
                const btn = document.getElementById('run-btn');
                const sqlBlock = document.getElementById('sql-block');
                const resultBlock = document.getElementById('result-block');
                const summaryBlock = document.getElementById('summary-block');
                const question = input.value.trim();
                if (!question) {
                    return;
                }
                btn.disabled = true;
                btn.innerText = 'Probíhá analýza...';
                sqlBlock.textContent = '';
                resultBlock.textContent = '';
                summaryBlock.textContent = '';
                try {
                    const res = await fetch('/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question })
                    });
                    if (!res.ok) {
                        let detail = res.statusText;
                        try {
                            const err = await res.json();
                            if (err && err.detail) {
                                detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
                            }
                        } catch (e) {}
                        summaryBlock.textContent = 'Chyba: ' + detail;
                    } else {
                        const data = await res.json();
                        sqlBlock.textContent = data.sql || '';
                        resultBlock.textContent = JSON.stringify(data.result || [], null, 2);
                        summaryBlock.textContent = data.summary || '';
                    }
                } catch (e) {
                    summaryBlock.textContent = 'Chyba při volání API.';
                } finally {
                    btn.disabled = false;
                    btn.innerText = 'Spustit analýzu';
                }
            }
        </script>
    </body>
    </html>
    """

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze", response_model=schemas.AnalysisResponse)
def analyze(request: schemas.AnalysisRequest, db: Session = Depends(get_db)):
    sql = generate_sql(request.question)

    try:
        rows = db.execute(text(sql)).mappings().all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL error: {str(e)}")

    result = [dict(row) for row in rows]
    summary = summarize_result(request.question, result)

    return schemas.AnalysisResponse(
        sql=sql,
        result=result,
        summary=summary
    )
