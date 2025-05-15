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
npm install logicguru-engine
```

## 🚀 Usage

```js
import { configureRuleEngine } from 'logic-rule-engine';
import rules from './examples/rules.json';

const defaultContext = {
  source: "evensect",
  productId: "123344",
  baseProductId: "123344"
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
  "id": "section-rule",
  "useFiles": {
    "productFile": {
      "path": "$other.json",
      "variable": ["ageOld"]
    }
  },
  "condition": {
    "and": [
      { "==": ["$source", "eventTo"] },
      { "==": ["$productId", "S1234"] }
    ]
  },
  "actions": [
    {
      "type": "assign",
      "key": "chnageTo",
      "value": "$productFile.dataset"
    }
  ]
}
```

---

## 🔧 Actions

- **log**: `{ "type": "log", "message": "something" }`
- **assign**: `{ "type": "assign", "key": "targetKey", "value": "$someKey" }`

## 📁 Dynamic File Loading

Supports `useFiles` to load data from external JSON dynamically using variable interpolation like `$productFile`.

---