# Dataset for SQLEditor Storybook Testing

This directory contains dataset files used for testing the SQLEditor component in Storybook.

## Available Files

### CSV Files
- **users.csv** - Employee/user data with demographics (15 rows)
  - Columns: id, name, email, department, salary, join_date, city
  - Use case: User management, department analysis, salary queries

- **products.csv** - Product catalog data (15 rows)
  - Columns: id, name, category, price, stock, created_at, rating
  - Use case: Product analysis, inventory queries, pricing analysis

- **orders.csv** - Order/transaction data (20 rows)
  - Columns: id, user_id, product_id, quantity, total_amount, order_date, status
  - Use case: Sales analysis, order history, customer behavior

### Parquet Files
- **users.parquet** - Employee/user data (Parquet format, 15 rows)
  - Same structure as users.csv but in Apache Parquet format
  - Use case: Testing Parquet file loading and columnar data queries

- **products.parquet** - Product catalog data (Parquet format, 15 rows)
  - Same structure as products.csv but in Apache Parquet format
  - Use case: Testing Parquet file format support

- **orders.parquet** - Order/transaction data (Parquet format, 20 rows)
  - Same structure as orders.csv but in Apache Parquet format
  - Use case: Testing Parquet file loading with real transaction data

## Usage in Storybook

The SQLEditor stories reference these files using relative paths from the public directory:

```typescript
const dataSources = [
  {
    id: 'users-csv',
    url: '/users.csv',
    format: 'csv',
    name: 'Users Dataset (CSV)',
    // ... metadata
  },
  {
    id: 'users-parquet',
    url: '/users.parquet',
    format: 'parquet',
    name: 'Users Dataset (Parquet)',
    // ... metadata
  },
  // ... other data sources
]
```

## Sample SQL Queries

### Basic Queries
```sql
-- Select all users
SELECT * FROM users LIMIT 5;

-- Find high-value products
SELECT * FROM products WHERE price > 100;

-- Get completed orders
SELECT * FROM orders WHERE status = 'completed';
```

### Aggregation Queries
```sql
-- Average salary by department
SELECT department, AVG(salary) as avg_salary
FROM users
GROUP BY department;

-- Product count by category
SELECT category, COUNT(*) as product_count
FROM products
GROUP BY category;
```

### JOIN Queries
```sql
-- Users with their orders
SELECT u.name, u.department, o.total_amount, o.order_date
FROM users u
JOIN orders o ON u.id = o.user_id;
```

### Date/Time Queries
```sql
-- Recent hires
SELECT * FROM users WHERE join_date >= '2023-01-01';

-- Orders by month
SELECT DATE_TRUNC('month', order_date) as month,
       COUNT(*) as order_count,
       SUM(total_amount) as total_sales
FROM orders
GROUP BY DATE_TRUNC('month', order_date)
ORDER BY month;
```

## File Structure

```
.storybook/dataset/
├── README.md                 # This file
├── csv_to_parquet.py         # Python script to convert CSV to Parquet
├── users.csv                 # User data (15 rows)
├── products.csv              # Product data (15 rows)
├── orders.csv                # Order data (20 rows)
├── users.parquet             # User data (Parquet format)
├── products.parquet          # Product data (Parquet format)
└── orders.parquet            # Order data (Parquet format)
```

## CSV to Parquet Conversion

To regenerate Parquet files from CSV files:

```bash
# Install dependencies (one time)
pip install pandas pyarrow

# Run the conversion script
python csv_to_parquet.py
```

The script will:
1. Read each CSV file
2. Convert it to Apache Parquet format
3. Preserve all data types and structure
4. Create a new .parquet file for each CSV

## Storybook Static File Serving

Files are served through Storybook's static file configuration:

- **Configuration**: `.storybook/main.ts` includes `staticDirs: ['./dataset']`
- **URL Path**: Files are accessible via `/filename` (served from root)
- **Served Files**: All CSV and Parquet files in this directory

## Available Stories

- **Default** - All data sources loaded (CSV + Parquet)
- **CSVOnly** - Only CSV data sources
- **ParquetOnly** - Only Parquet data sources
- **ComplexQuery** - Aggregation and analytical queries
- **JoinQuery** - Multi-table join operations
- **AggregationQuery** - Complex aggregation with LEFT JOIN
- **Interactive** - Switch between CSV and Parquet formats dynamically

## Data Generation

The CSV files were manually created to provide realistic but manageable test data:
- Small file sizes for fast loading in Storybook
- Related datasets for JOIN operations
- Various data types (strings, numbers, dates)
- Realistic business scenarios
- Proper foreign key relationships for testing joins

The Parquet files are generated from the CSV files using the `csv_to_parquet.py` script.

## Adding New Data

To add new test data files:

1. Add CSV file to this directory
2. Run `python csv_to_parquet.py` to generate Parquet version
3. Update the `realDataSources` array in `stories/SQLEditor/SQLEditor.stories.tsx`
4. Add appropriate metadata (row count, columns, etc.)
5. Update this README file with file description and use cases

## Notes

- Files are served from the dataset directory and accessible via `/filename`
- Parquet files require DuckDB-WASM to be properly loaded
- All files are small enough for efficient Storybook loading
- Data is fictional and for testing purposes only
- Both CSV and Parquet versions contain identical data for format comparison testing