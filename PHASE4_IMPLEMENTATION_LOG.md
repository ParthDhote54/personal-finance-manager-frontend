# Phase 4 Implementation Log

- `src/pages/Transactions.jsx`: Replaced placeholder with a dynamic ledger component fetching data from `/api/transactions` and `/api/categories`. Implemented an "Add Transaction" modal form that elegantly maps the selected `<option>` name to its underlying numeric `id` and executes the `POST /api/transactions` request.
- `src/pages/Categories.jsx`: Replaced placeholder with a grid of custom and default category cards, featuring dynamic badge coloring based on type (INCOME/EXPENSE) and ownership. Implemented an "Add Category" modal mapping directly to the `POST /api/categories` API.
