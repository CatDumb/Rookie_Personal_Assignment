-- This script verifies the order of books returned by the popular books endpoint

-- Query that mimics the updated popular books endpoint
SELECT
    b.id as book_id,
    b.book_title,
    a.author_name,
    b.book_price,
    d.discount_price,
    bs.review_count,
    'Popular endpoint' as source
FROM
    books b
JOIN
    bookstats bs ON b.id = bs.id
JOIN
    authors a ON b.author_id = a.id
LEFT JOIN
    discounts d ON (
        b.id = d.book_id
        AND d.discount_start_date <= CURRENT_DATE
        AND d.discount_end_date >= CURRENT_DATE
    )
ORDER BY
    COALESCE(bs.review_count, 0) DESC,
    b.book_title ASC
LIMIT 8;

-- Query that mimics the pagination endpoint with sort_by="popularity"
SELECT
    b.id as book_id,
    b.book_title,
    a.author_name,
    b.book_price,
    d.discount_price,
    bs.review_count,
    'Pagination endpoint' as source
FROM
    books b
JOIN
    authors a ON b.author_id = a.id
JOIN
    categories c ON b.category_id = c.id
LEFT JOIN
    discounts d ON (
        b.id = d.book_id
        AND d.discount_start_date <= CURRENT_DATE
        AND d.discount_end_date >= CURRENT_DATE
    )
LEFT JOIN
    bookstats bs ON b.id = bs.id
ORDER BY
    COALESCE(bs.review_count, 0) DESC,
    b.book_title ASC
LIMIT 8;

-- Combined query to directly compare both endpoints
WITH popular_endpoint AS (
    SELECT
        b.id as book_id,
        b.book_title,
        bs.review_count
    FROM
        books b
    JOIN
        bookstats bs ON b.id = bs.id
    JOIN
        authors a ON b.author_id = a.id
    LEFT JOIN
        discounts d ON (
            b.id = d.book_id
            AND d.discount_start_date <= CURRENT_DATE
            AND d.discount_end_date >= CURRENT_DATE
        )
    ORDER BY
        COALESCE(bs.review_count, 0) DESC,
        b.book_title ASC
    LIMIT 8
),
pagination_endpoint AS (
    SELECT
        b.id as book_id,
        b.book_title,
        bs.review_count
    FROM
        books b
    JOIN
        authors a ON b.author_id = a.id
    JOIN
        categories c ON b.category_id = c.id
    LEFT JOIN
        discounts d ON (
            b.id = d.book_id
            AND d.discount_start_date <= CURRENT_DATE
            AND d.discount_end_date >= CURRENT_DATE
        )
    LEFT JOIN
        bookstats bs ON b.id = bs.id
    ORDER BY
        COALESCE(bs.review_count, 0) DESC,
        b.book_title ASC
    LIMIT 8
)
SELECT
    'Results match' as comparison_result
WHERE
    (SELECT string_agg(book_id::text, ',' ORDER BY book_id) FROM popular_endpoint) =
    (SELECT string_agg(book_id::text, ',' ORDER BY book_id) FROM pagination_endpoint);
