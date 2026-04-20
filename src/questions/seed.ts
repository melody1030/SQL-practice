import type { Question } from './schema';

const employeesSchema = `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER,
  hire_date TEXT
);
INSERT INTO employees VALUES
  (1, 'Alice',   'Engineering', 95000, '2020-03-15'),
  (2, 'Bob',     'Engineering', 72000, '2021-07-01'),
  (3, 'Carol',   'Sales',       68000, '2019-11-20'),
  (4, 'Dan',     'Sales',       54000, '2022-01-10'),
  (5, 'Eve',     'Marketing',   80000, '2018-06-30'),
  (6, 'Frank',   'Marketing',   62000, '2023-02-14'),
  (7, 'Grace',   'Engineering',110000, '2017-09-05'),
  (8, 'Heidi',   'Support',     45000, '2022-08-22');
`;

const ordersSchema = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  amount INTEGER,
  order_date TEXT
);
INSERT INTO customers VALUES
  (1,'Ana','USA'),(2,'Ben','UK'),(3,'Cid','USA'),(4,'Dee','Canada');
INSERT INTO orders VALUES
  (1,1,120,'2024-01-05'),
  (2,1,80, '2024-02-11'),
  (3,2,200,'2024-01-17'),
  (4,3,50, '2024-03-02'),
  (5,3,300,'2024-03-18'),
  (6,1,90, '2024-04-01');
`;

export const seedQuestions: Question[] = [
  {
    id: 'q-001',
    type: 'coding',
    difficulty: 'easy',
    concepts: ['SELECT', 'WHERE'],
    title: 'Engineers only',
    prompt:
      'Return the `name` and `salary` of every employee in the **Engineering** department.',
    schemaSql: employeesSchema,
    expectedSql:
      "SELECT name, salary FROM employees WHERE department = 'Engineering';",
    source: 'seed',
  },
  {
    id: 'q-002',
    type: 'coding',
    difficulty: 'easy',
    concepts: ['ORDER BY', 'SELECT'],
    title: 'Top 3 earners',
    prompt:
      'Return the `name` and `salary` of the 3 highest-paid employees, ordered by salary descending.',
    schemaSql: employeesSchema,
    expectedSql: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 3;',
    orderMatters: true,
    source: 'seed',
  },
  {
    id: 'q-003',
    type: 'mcq',
    difficulty: 'easy',
    concepts: ['SELECT'],
    title: 'SELECT syntax',
    prompt: 'Which statement retrieves every column from the `employees` table?',
    options: [
      { id: 'a', text: 'SELECT ALL FROM employees;' },
      { id: 'b', text: 'SELECT * FROM employees;' },
      { id: 'c', text: 'GET * FROM employees;' },
      { id: 'd', text: 'SELECT employees.*;' },
    ],
    correctOptionId: 'b',
    explanation:
      '`SELECT *` is the standard SQL way to retrieve all columns. `SELECT ALL` exists but means "include duplicates" (the default), not "all columns".',
    source: 'seed',
  },
  {
    id: 'q-004',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['GROUP BY', 'Aggregation'],
    title: 'Average salary per department',
    prompt:
      'For each department, return `department` and the average salary as `avg_salary` (integer ok). Ignore employees with no department.',
    schemaSql: employeesSchema,
    expectedSql:
      'SELECT department, AVG(salary) AS avg_salary FROM employees WHERE department IS NOT NULL GROUP BY department;',
    source: 'seed',
  },
  {
    id: 'q-005',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['JOIN', 'Aggregation'],
    title: 'Customer spend',
    prompt:
      'Return each customer\'s `name` and total `amount` spent across all orders as `total_spent`. Include only customers who placed at least one order.',
    schemaSql: ordersSchema,
    expectedSql:
      'SELECT c.name, SUM(o.amount) AS total_spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;',
    source: 'seed',
  },
  {
    id: 'q-006',
    type: 'mcq',
    difficulty: 'medium',
    concepts: ['JOIN'],
    title: 'INNER vs LEFT JOIN',
    prompt:
      'You have `customers` and `orders`. You want every customer listed, even those with no orders. Which join do you use?',
    options: [
      { id: 'a', text: 'INNER JOIN orders ON ...' },
      { id: 'b', text: 'LEFT JOIN orders ON ...' },
      { id: 'c', text: 'RIGHT JOIN orders ON ...' },
      { id: 'd', text: 'CROSS JOIN orders' },
    ],
    correctOptionId: 'b',
    explanation:
      'LEFT JOIN keeps every row from the left table (customers) and fills NULLs where no matching order exists. INNER JOIN would drop customers with no orders.',
    source: 'seed',
  },
  {
    id: 'q-007',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['Subquery', 'WHERE'],
    title: 'Above-average earners',
    prompt:
      'Return the `name` and `salary` of every employee who earns more than the overall average salary.',
    schemaSql: employeesSchema,
    expectedSql:
      'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
    source: 'seed',
  },
  {
    id: 'q-008',
    type: 'coding',
    difficulty: 'hard',
    concepts: ['JOIN', 'GROUP BY'],
    title: 'Departments with multiple high earners',
    prompt:
      'Return each `department` that has 2 or more employees earning at least 70000, along with the count as `high_earners`.',
    schemaSql: employeesSchema,
    expectedSql:
      'SELECT department, COUNT(*) AS high_earners FROM employees WHERE salary >= 70000 GROUP BY department HAVING COUNT(*) >= 2;',
    source: 'seed',
  },
  {
    id: 'q-009',
    type: 'coding',
    difficulty: 'hard',
    concepts: ['Window Functions'],
    title: 'Rank within department',
    prompt:
      'For each employee return `name`, `department`, `salary`, and `dept_rank` — their salary rank within their department (1 = highest), using `RANK()`.',
    schemaSql: employeesSchema,
    expectedSql:
      'SELECT name, department, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees;',
    source: 'seed',
  },
  {
    id: 'q-010',
    type: 'mcq',
    difficulty: 'hard',
    concepts: ['CTE', 'Subquery'],
    title: 'CTE vs subquery',
    prompt:
      'Which statement about a CTE (WITH clause) versus a subquery in the FROM clause is MOST accurate in standard SQL?',
    options: [
      {
        id: 'a',
        text: 'A CTE always executes faster than an equivalent subquery.',
      },
      {
        id: 'b',
        text: 'A CTE can be referenced multiple times in the same query and can be recursive; a plain subquery cannot.',
      },
      {
        id: 'c',
        text: 'CTEs cannot contain JOINs.',
      },
      {
        id: 'd',
        text: 'Subqueries can be recursive; CTEs cannot.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      'CTEs can be named, referenced multiple times within a query, and support recursion (WITH RECURSIVE). Performance vs. a subquery depends on the engine and query — not a guarantee.',
    source: 'seed',
  },
  {
    id: 'q-011',
    type: 'coding',
    difficulty: 'easy',
    concepts: ['SELECT'],
    title: 'Distinct departments',
    prompt:
      'Return each distinct `department` in the `employees` table. Exclude any NULL department. Order alphabetically.',
    schemaSql: employeesSchema,
    expectedSql:
      'SELECT DISTINCT department FROM employees WHERE department IS NOT NULL ORDER BY department;',
    orderMatters: true,
    source: 'seed',
  },
  {
    id: 'q-012',
    type: 'coding',
    difficulty: 'easy',
    concepts: ['Aggregation'],
    title: 'Employee headcount',
    prompt:
      'Return a single row with column `total` — the number of employees in the company.',
    schemaSql: employeesSchema,
    expectedSql: 'SELECT COUNT(*) AS total FROM employees;',
    source: 'seed',
  },
  {
    id: 'q-013',
    type: 'coding',
    difficulty: 'easy',
    concepts: ['WHERE', 'String Functions'],
    title: 'Names starting with A',
    prompt:
      'Return the `name` of every employee whose name begins with the letter **A** (case-sensitive). Use `LIKE`.',
    schemaSql: employeesSchema,
    expectedSql: "SELECT name FROM employees WHERE name LIKE 'A%';",
    source: 'seed',
  },
  {
    id: 'q-014',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['CASE', 'SELECT'],
    title: 'Salary brackets',
    prompt:
      "For each employee return `name` and a `bracket` column: `'High'` if salary ≥ 90000, `'Mid'` if salary ≥ 60000, otherwise `'Low'`.",
    schemaSql: employeesSchema,
    expectedSql:
      "SELECT name, CASE WHEN salary >= 90000 THEN 'High' WHEN salary >= 60000 THEN 'Mid' ELSE 'Low' END AS bracket FROM employees;",
    source: 'seed',
  },
  {
    id: 'q-015',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['UNION', 'WHERE'],
    title: 'Senior or tenured',
    prompt:
      "Return the distinct `name` of every employee who **either** earns at least 90000 **or** was hired before `'2020-01-01'`. Use `UNION`.",
    schemaSql: employeesSchema,
    expectedSql:
      "SELECT name FROM employees WHERE salary >= 90000 UNION SELECT name FROM employees WHERE hire_date < '2020-01-01';",
    source: 'seed',
  },
  {
    id: 'q-016',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['JOIN', 'WHERE'],
    title: 'Customers without orders',
    prompt:
      'Return the `name` of every customer who has **not** placed any orders. Use a `LEFT JOIN` + `IS NULL` pattern.',
    schemaSql: ordersSchema,
    expectedSql:
      'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
    source: 'seed',
  },
  {
    id: 'q-017',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['Date/Time', 'GROUP BY', 'Aggregation'],
    title: 'Hires by year',
    prompt:
      'Return `year` (as a 4-digit text) and `hires` — the number of employees hired in that year. Sort ascending by year. Hint: `strftime(\'%Y\', hire_date)` in SQLite.',
    schemaSql: employeesSchema,
    expectedSql:
      "SELECT strftime('%Y', hire_date) AS year, COUNT(*) AS hires FROM employees GROUP BY year ORDER BY year;",
    orderMatters: true,
    source: 'seed',
  },
  {
    id: 'q-018',
    type: 'mcq',
    difficulty: 'easy',
    concepts: ['WHERE'],
    title: 'Comparing with NULL',
    prompt:
      'Which predicate correctly returns rows where `department` has no value (is NULL)?',
    options: [
      { id: 'a', text: 'WHERE department = NULL' },
      { id: 'b', text: 'WHERE department == NULL' },
      { id: 'c', text: 'WHERE department IS NULL' },
      { id: 'd', text: "WHERE department = 'NULL'" },
    ],
    correctOptionId: 'c',
    explanation:
      'NULL is not a value you compare to with `=` — `NULL = NULL` is itself NULL (unknown), so the row is filtered out. The `IS NULL` / `IS NOT NULL` operators are the only correct way to test for absence of a value.',
    source: 'seed',
  },
  {
    id: 'q-019',
    type: 'mcq',
    difficulty: 'medium',
    concepts: ['GROUP BY', 'WHERE'],
    title: 'WHERE vs HAVING',
    prompt:
      'Which statement best describes the difference between `WHERE` and `HAVING`?',
    options: [
      { id: 'a', text: 'They are interchangeable.' },
      {
        id: 'b',
        text: '`WHERE` filters rows before aggregation; `HAVING` filters groups after aggregation.',
      },
      {
        id: 'c',
        text: '`HAVING` filters rows before aggregation; `WHERE` filters groups after aggregation.',
      },
      {
        id: 'd',
        text: '`HAVING` only works with `ORDER BY`.',
      },
    ],
    correctOptionId: 'b',
    explanation:
      '`WHERE` is evaluated row-by-row before `GROUP BY` runs, so it cannot reference aggregates like `COUNT(*)`. `HAVING` is evaluated on the grouped results and is the right place for predicates like `COUNT(*) >= 2`.',
    source: 'seed',
  },
  {
    id: 'q-020',
    type: 'mcq',
    difficulty: 'medium',
    concepts: ['String Functions'],
    title: 'String concatenation in SQLite',
    prompt:
      "Which expression concatenates the strings `'Hello '` and `'World'` in **SQLite**?",
    options: [
      { id: 'a', text: "'Hello ' + 'World'" },
      { id: 'b', text: "CONCAT('Hello ', 'World')" },
      { id: 'c', text: "'Hello ' || 'World'" },
      { id: 'd', text: "'Hello ' & 'World'" },
    ],
    correctOptionId: 'c',
    explanation:
      'SQLite uses the standard SQL `||` operator for string concatenation. `+` performs numeric addition (and coerces strings to 0). `CONCAT()` works in MySQL/Postgres but not SQLite.',
    source: 'seed',
  },
  {
    id: 'q-021',
    type: 'mcq',
    difficulty: 'easy',
    concepts: ['SELECT'],
    title: 'What does DISTINCT do?',
    prompt: 'What does `SELECT DISTINCT department FROM employees;` return?',
    options: [
      {
        id: 'a',
        text: 'Every row in the table, one per employee.',
      },
      {
        id: 'b',
        text: 'Only rows where `department` is unique per employee (no duplicates across columns).',
      },
      {
        id: 'c',
        text: 'One row per unique value of `department`, collapsing duplicates.',
      },
      { id: 'd', text: 'A random single row.' },
    ],
    correctOptionId: 'c',
    explanation:
      '`DISTINCT` collapses duplicate rows from the projected columns. Here that means one row per unique department. Useful for answering "what are the possible values?" without running `GROUP BY` just for de-duplication.',
    source: 'seed',
  },
  {
    id: 'q-022',
    type: 'coding',
    difficulty: 'hard',
    concepts: ['Window Functions', 'ORDER BY'],
    title: 'Running total of orders',
    prompt:
      'Return `id`, `amount`, and `running_total` — the cumulative sum of `amount` across all orders, ordered by `order_date` then `id`. Use a window function.',
    schemaSql: ordersSchema,
    expectedSql:
      'SELECT id, amount, SUM(amount) OVER (ORDER BY order_date, id) AS running_total FROM orders ORDER BY order_date, id;',
    orderMatters: true,
    source: 'seed',
  },
  {
    id: 'q-023',
    type: 'coding',
    difficulty: 'hard',
    concepts: ['CTE', 'Window Functions'],
    title: 'Top 2 per department',
    prompt:
      'Return the `name`, `department`, and `salary` of the top 2 highest-paid employees **in each department**. Use a CTE with `ROW_NUMBER()`.',
    schemaSql: employeesSchema,
    expectedSql:
      'WITH ranked AS (SELECT name, department, salary, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn FROM employees) SELECT name, department, salary FROM ranked WHERE rn <= 2;',
    source: 'seed',
  },
  {
    id: 'q-024',
    type: 'coding',
    difficulty: 'medium',
    concepts: ['Date/Time', 'GROUP BY'],
    title: 'Orders per month',
    prompt:
      "Return `month` (formatted as `'YYYY-MM'`) and `orders` — the number of orders placed in that month. Sort ascending. Hint: `strftime('%Y-%m', order_date)`.",
    schemaSql: ordersSchema,
    expectedSql:
      "SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month ORDER BY month;",
    orderMatters: true,
    source: 'seed',
  },
  {
    id: 'q-025',
    type: 'mcq',
    difficulty: 'hard',
    concepts: ['Aggregation'],
    title: 'COUNT(*) vs COUNT(column)',
    prompt:
      'A table has 10 rows. The column `department` is NULL for 3 of them. What do `COUNT(*)` and `COUNT(department)` return, in that order?',
    options: [
      { id: 'a', text: '10 and 10' },
      { id: 'b', text: '10 and 7' },
      { id: 'c', text: '7 and 7' },
      { id: 'd', text: '7 and 10' },
    ],
    correctOptionId: 'b',
    explanation:
      '`COUNT(*)` counts every row regardless of NULLs. `COUNT(col)` counts only rows where `col IS NOT NULL` — so it skips the 3 NULLs and returns 7. This distinction matters when computing "how many have a value" vs. "how many rows total".',
    source: 'seed',
  },
];
