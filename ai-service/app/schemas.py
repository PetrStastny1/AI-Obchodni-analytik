from typing import Any, Dict, List
from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    question: str
    limit: int = 100

class AnalysisResponse(BaseModel):
    sql: str
    result: List[Dict[str, Any]]
    summary: str
