# Logic Rule Engine

A powerful, async-ready JSON-based logic rule engine for evaluating nested conditions, variable bindings, dynamic file loading, and custom actions.

## ✅ Features

- Nested condition support (AND/OR/==/!=/...).
- `$` variables resolved from provided context.
- `$file.variable` for dynamic external data resolution.
- Preload data from files via `useFiles` config.
- Support for `log`, `assign`, and custom actions.
- Fully async-compatible and optimized.
- Easily configurable for different contexts and sources.

---

## 📦 Installation

```bash
npm install logic-rule-engine
```

## 🚀 Usage

```js
import { configureRuleEngine } from 'logic-rule-engine';
import rules from './examples/rules.json';

const defaultContext = {
  source: "calculator",
  productId: "10001101",
  baseProductId: "10001101"
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext
});

const result = await engine();
console.log(result);
```

## 📘 Rules Structure

```json
{
  "id": "migration-rule",
  "useFiles": {
    "productFile": {
      "path": "products/$baseProductId.json",
      "variable": ["migrationTo"]
    }
  },
  "condition": {
    "and": [
      { "==": ["$source", "calculator"] },
      { "==": ["$productId", "10001101"] }
    ]
  },
  "actions": [
    {
      "type": "assign",
      "key": "migrations",
      "value": "$productFile.migrationTo"
    }
  ]
}
```

---

## 🔧 Actions

- **log**: `{ "type": "log", "message": "something" }`
- **assign**: `{ "type": "assign", "key": "targetKey", "value": "$someKey" }`

## 📁 Dynamic File Loading

Supports `useFiles` to load data from external JSON dynamically using variable interpolation like `$baseProductId`.

---