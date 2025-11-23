from sqlalchemy import text
from app.database import SessionLocal


def detect_category(name: str) -> tuple[str, str]:
    n = name.lower()

    if any(x in n for x in ["whisky", "whiskey", "scotch", "bourbon", "single malt",
                            "macallan", "glen", "lagavulin", "laphroaig", "yamazaki",
                            "nikka", "chivas", "johnnie walker"]):
        return "whisky", "Whisky"

    if any(x in n for x in ["rum", "ron", "zacapa", "dictador", "abuelo",
                            "brugal", "diplom", "riise", "don papa"]):
        return "rum", "Rum"

    if any(x in n for x in ["gin", "hendrick", "tanqueray", "mare", "bombay"]):
        return "gin", "Gin"

    if any(x in n for x in ["champagne", "cava", "prosecco", "sekt",
                            "moët", "veuve", "krug", "bollinger",
                            "dom pérignon", "roederer", "ruinart", "taittinger"]):
        return "sparkling", "Šumivé víno / Champagne"

    if any(x in n for x in ["tequila", "mezcal", "patron", "don julio", "casa dragones", "clasé azul", "clase azul"]):
        return "tequila_mezcal", "Tequila / Mezcal"

    if any(x in n for x in ["vodka", "beluga", "belvedere"]):
        return "vodka", "Vodka"

    if any(x in n for x in [
        "pinot", "merlot", "cabernet", "riesling", "chardonnay",
        "chianti", "barolo", "rioja", "tokaj", "malbec",
        "veltlin", "frankovka", "burgund", "bordeaux"
    ]):
        return "wine", "Víno"

    return "other", "Ostatní"


def main():
    db = SessionLocal()

    try:
        rows = db.execute(
            text("SELECT product, AVG(price) AS avg_price FROM sale GROUP BY product")
        ).mappings().all()

        categories: dict[str, int] = {}
        existing = db.execute(
            text("SELECT id, category_key FROM product_category")
        ).mappings().all()
        for r in existing:
            categories[r["category_key"]] = r["id"]

        for row in rows:
            product_name = row["product"]
            avg_price = float(row["avg_price"]) if row["avg_price"] is not None else None

            key, cat_name = detect_category(product_name)

            if key not in categories:
                db.execute(
                    text(
                        """
                        INSERT INTO product_category (category_key, name)
                        VALUES (:key, :name)
                        ON DUPLICATE KEY UPDATE name = VALUES(name)
                        """
                    ),
                    {"key": key, "name": cat_name},
                )
                db.commit()
                new_id = db.execute(
                    text("SELECT id FROM product_category WHERE category_key = :key"),
                    {"key": key},
                ).scalar_one()
                categories[key] = new_id

            category_id = categories[key]

            db.execute(
                text(
                    """
                    INSERT INTO product (name, category_id, base_price, sell_price)
                    VALUES (:name, :category_id, NULL, :sell_price)
                    ON DUPLICATE KEY UPDATE
                        category_id = VALUES(category_id),
                        sell_price = VALUES(sell_price)
                    """
                ),
                {
                    "name": product_name,
                    "category_id": category_id,
                    "sell_price": avg_price,
                },
            )
            db.commit()

        db.execute(
            text(
                """
                UPDATE sale s
                JOIN product p ON p.name = s.product
                SET s.product_id = p.id
                WHERE s.product_id IS NULL
                """
            )
        )
        db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    main()
