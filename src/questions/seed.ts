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
];
