from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_sql(question: str) -> str:
    prompt = f"""
Jsi generátor SQL dotazů pro MySQL databázi.

TABULKA: sale
SLOUPCE:
  id (int)
  date (datetime)
  product (varchar)
  quantity (int)
  price (decimal)

ÚKOL:
Převeď otázku uživatele na platný SQL dotaz.

PRAVIDLA:
1) Nepoužívej nepodporované funkce MySQL jako CORR(), COVAR_POP(), MEDIAN apod.
2) Pro výpočet korelace použij Pearsonův vzorec:

   (COUNT(*) * SUM(x*y) - SUM(x) * SUM(y)) /
   SQRT(
       (COUNT(*) * SUM(x*x) - SUM(x)*SUM(x)) *
       (COUNT(*) * SUM(y*y) - SUM(y)*SUM(y))
   )

3) x a y vždy nahraď skutečnými názvy sloupců.
4) Pokud je korelace podle produktů, přidej GROUP BY product.
5) Vrať pouze SQL bez vysvětlení, komentářů a bez formátování.
6) Nikdy nepoužívej "sales", tabulka se jmenuje "sale".

OTÁZKA: "{question}"
"""
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    sql = response.choices[0].message.content.strip()

    # Bezpečná sanitizace názvu tabulky
    sql = sql.replace("sales", "sale").replace("Sales", "sale").replace("SALE", "sale")
    sql = sql.replace("FROM sales", "FROM sale").replace("JOIN sales", "JOIN sale")
    return sql


def summarize_result(question: str, result: list) -> str:
    prompt = f"""
Jsi seniorní analytik specializovaný na e-commerce a luxusní alkohol.
Tvým úkolem je stručně vysvětlit data a doporučit konkrétní obchodní akce.

📌 PRAVIDLA:
• Pokud prodeje rostou → doporuč prémiový upsell, limitované edice, zdůraznění luxusu.
• Pokud klesají → navrhni mírnou slevu, bundle, storytelling, edukaci značky.
• Pokud je vysoká marže → zákaz slev! Preferuj dárková balení, VIP nabídky, exkluzivitu.
• Pokud se produkt rychle vyprodává → navrhni navýšení zásob, NE slevy.
• Cross-sell příklady:
  - Gin + tonic
  - Rum + čokoláda/káva
  - Whisky + sklenice/dárkové balení
  - Champagne + firemní dárkové boxy
• Sezónnost:
  - Zima: whisky, koňak
  - Léto: gin, koktejlové rumy
  - Svátky: šampaňské, prémiové víno

🎯 VÝSTUP MUSÍ OBSAHOVAT:
1) Krátké shrnutí dat (max. 3 věty).
2) Doporučení v bodech:
   • 💰 Cenová strategie
   • 🎁 Nabídka / bundle
   • 📣 Marketing / komunikace

🛑 NEUVÁDĚJ SQL ANI JSON.

📊 DATA: {result}
❓ OTÁZKA: "{question}"
"""
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.25,
    )
    return response.choices[0].message.content.strip()
