from typing import Any, Dict, List
from pydantic import BaseModel

# 🟢 ====== AI ANALYSIS ======

class AnalysisRequest(BaseModel):
    question: str
    limit: int = 100

class AnalysisResponse(BaseModel):
    sql: str
    result: List[Dict[str, Any]]
    summary: str


# 🟣 ====== FORECAST ======

class ForecastTotal(BaseModel):
    actual_to_date: float
    predicted_rest: float
    predicted_full_year: float

class ProductForecast(BaseModel):
    product: str
    actual_to_date: float
    predicted_rest: float
    predicted_full_year: float

class ForecastResponse(BaseModel):
    total: ForecastTotal
    products: List[ProductForecast]
