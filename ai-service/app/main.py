from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date, datetime, timedelta

from .database import get_db
from . import schemas
from .ai_service import generate_sql, summarize_result

app = FastAPI(
    title="AI Service",
    version="0.2.0",
    docs_url=None,
    redoc_url=None
)

# 🟢 ===================== CUSTOM DOCS ==========================
@app.get("/docs", response_class=HTMLResponse)
def custom_docs():
    return """<meta http-equiv="refresh" content="0; url=/docs_full" />"""

@app.get("/docs_full", response_class=HTMLResponse)
def custom_docs_full():
    with open("app/docs.html", "r", encoding="utf-8") as f:
        return f.read()

# 🟢 ===================== HEALTH ===============================
@app.get("/health")
def health():
    return {"status": "ok"}

# 🟢 ===================== ANALYZE AI ===========================
@app.post("/analyze", response_model=schemas.AnalysisResponse)
def analyze(request: schemas.AnalysisRequest, db: Session = Depends(get_db)):
    sql = generate_sql(request.question)

    try:
        rows = db.execute(text(sql)).mappings().all()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL error: {str(e)}")

    result = [dict(row) for row in rows]
    summary = summarize_result(request.question, result)

    return schemas.AnalysisResponse(sql=sql, result=result, summary=summary)


# 🟢 ===================== FORECAST ENDPOINT ====================
@app.get("/forecast", response_model=schemas.ForecastResponse)
def get_forecast(db: Session = Depends(get_db)):
    """
    Predikce do konce roku:
    - využívá posledních 30 dní jako základ pro krátkodobou predikci
    - predikce tržeb celkem + per produkt (top 10)
    """

    today = date.today()
    end_of_year = date(today.year, 12, 31)

    if today > end_of_year:
        raise HTTPException(status_code=400, detail="Aktuální rok již skončil.")

    # 📌 Denní tržby
    total_rows = db.execute(text("""
        SELECT date AS d, SUM(quantity * sale_price) AS revenue
        FROM sale
        GROUP BY date
        ORDER BY date
    """)).fetchall()

    if not total_rows:
        raise HTTPException(status_code=404, detail="V databázi nejsou žádné prodeje.")

    daily = []
    for row in total_rows:
        d = row[0]
        if isinstance(d, str):
            d = datetime.strptime(d, "%Y-%m-%d").date()
        daily.append((d, float(row[1])))

    actual_to_date = sum(rev for (d, rev) in daily if d <= today)

    # 📌 Krátkodobá predikce
    lookback_days = 30
    from_day = today - timedelta(days=lookback_days)
    recent = [rev for (d, rev) in daily if from_day <= d <= today]

    if recent:
        avg_daily = sum(recent) / len(recent)
    else:
        avg_daily = actual_to_date / max(len(daily), 1)

    remaining_days = (end_of_year - today).days
    predicted_rest = max(0, avg_daily * remaining_days)
    predicted_full_year = actual_to_date + predicted_rest

    total_forecast = schemas.ForecastTotal(
        actual_to_date=round(actual_to_date, 2),
        predicted_rest=round(predicted_rest, 2),
        predicted_full_year=round(predicted_full_year, 2),
    )

    # 📌 Predikce per produkt
    product_rows = db.execute(text("""
        SELECT product, date, (quantity * sale_price) AS revenue
        FROM sale
        ORDER BY product, date
    """)).fetchall()

    by_product = {}
    for product, d, rev in product_rows:
        if isinstance(d, str):
            d = datetime.strptime(d, "%Y-%m-%d").date()
        by_product.setdefault(product, []).append((d, float(rev)))

    product_forecasts: list[schemas.ProductForecast] = []

    for product, rows in by_product.items():
        # 🔎 Skutečné tržby
        actual = sum(r for (d, r) in rows if d <= today)
        days_count = len({d for (d, _) in rows})

        # ❌ Pokud má produkt méně než 10 prodejních dnů → ignorujeme predikci
        if days_count < 10:
            product_forecasts.append(
                schemas.ProductForecast(
                    product=product,
                    actual_to_date=round(actual, 2),
                    predicted_rest=0.0,
                    predicted_full_year=round(actual, 2),
                )
            )
            continue

        # 📌 Predikce jen z reprezentativních dat
        recent_product = [r for (d, r) in rows if from_day <= d <= today]
        if recent_product:
            avg_daily_p = sum(recent_product) / len(recent_product)
        else:
            avg_daily_p = actual / days_count

        predicted_rest_p = max(0, avg_daily_p * remaining_days)
        predicted_full_year_p = actual + predicted_rest_p

        product_forecasts.append(
            schemas.ProductForecast(
                product=product,
                actual_to_date=round(actual, 2),
                predicted_rest=round(predicted_rest_p, 2),
                predicted_full_year=round(predicted_full_year_p, 2),
            )
        )

    # 🏆 TOP 10
    product_forecasts.sort(key=lambda p: p.predicted_full_year, reverse=True)
    product_forecasts = product_forecasts[:10]

    return schemas.ForecastResponse(total=total_forecast, products=product_forecasts)
