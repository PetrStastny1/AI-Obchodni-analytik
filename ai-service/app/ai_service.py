from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_sql(question: str) -> str:
    prompt = f"""
You are a SQL generator for MySQL.
Convert the following question into a valid MySQL SQL query.

TABLE: sales
COLUMNS:
  id (int)
  date (datetime)
  product (varchar)
  quantity (int)
  price (decimal)

RULES:
1. Do NOT use unsupported MySQL statistical functions such as CORR() or COVAR_POP().
2. If the user asks for correlation between two columns, use the Pearson correlation formula:

   (COUNT(*) * SUM(x*y) - SUM(x) * SUM(y)) /
   SQRT(
       (COUNT(*) * SUM(x*x) - SUM(x)*SUM(x)) *
       (COUNT(*) * SUM(y*y) - SUM(y)*SUM(y))
   )

3. Replace x and y with actual column names.
4. If correlation is per product, include GROUP BY product.
5. Return only SQL without explanations or formatting.
6. Do not include code fences.

User question: "{question}"
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    sql = response.choices[0].message.content.strip()
    sql = sql.replace("```sql", "").replace("```", "").strip()
    return sql

def summarize_result(question: str, result: list) -> str:
    prompt = f"""
User question: "{question}"
SQL result as JSON: {result}
Write a short summary in Czech.
"""

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    return response.choices[0].message.content.strip()
