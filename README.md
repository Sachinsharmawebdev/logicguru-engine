# Logic Guru Engine

_A powerful, async-ready JSON-based logic rule engine for evaluating nested conditions, variable bindings, dynamic file loading, and custom actions._

## ✅ Features

- **Nested condition support**
  - Logical: `and`, `or`
  - Comparison: `==`, `!=`, `>`, `<`, `>=`, `<=`
  - Array/Object: `includeIn`, `includeKey`, `includeVal`

- **Date Functions**
  - `year(date)`: Calculate years from date
  - `month(date)`: Calculate months from date
  - `day(date)`: Calculate days from date

- **Context Variables**
  - `$` variables resolved from provided context
  - Template string resolution (`${variable}`)
  - Date function support (`${year($context.date)}`)

- **Dynamic File Loading**
  - `useFiles` for external data resolution
  - Template path support (`${variable}_slug.json`)
  - Preload data from files

- **Action Types**
  - `log`: Logging with template support
  - `assign`: Create new object with result
  - `update`: Update nested paths
  - `excludeVal`: Remove array values
  - `deleteKey`: Delete properties
  - `excludeFromArr`: Filter array by property
  - `includeFromArr`: Include array items by property
  - `deleteKeyFromArray`: Delete specific keys from array objects
  - `updateKeyInArray`: Update specific keys in array objects
  - `addKeyToArray`: Add new keys to array objects

- **Fully async-compatible and optimized**
- **TypeScript support**
- **Comprehensive error handling**

## 📦 Installation

```bash
npm install logicguru-engine
```

## 🚀 Basic Usage

```js
import { configureRuleEngine } from "logicguru-engine";

const rules = [
  {
    "id": "age-verification",
    "condition": {
      "and": [
        { ">=": ["${year($context.birthDate)}", 18] }
      ]
    },
    "actions": [
      {
        "type": "assign",
        "key": "result.isAdult",
        "value": true
      }
    ]
  }
];

const context = {
  birthDate: "2000-01-01"
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context
});

const result = await engine();
console.log(result);
```

## 📘 Rules Structure

```json
{
  "id": "user-verification",
  "useFiles": {
    "configFile": {
      "path": "/config/${$context.type}_config.json"
    }
  },
  "condition": {
    "and": [
      { ">=": ["${year($context.birthDate)}", 18] },
      { "!=": ["$context.status", "suspended"] },
      { "includeIn": ["$context.id", "$configFile.validIds"] }
    ]
  },
  "actions": [
    {
      "type": "log",
      "message": "Processing user: ${$context.userId}"
    },
    {
      "type": "assign",
      "key": "result.isEligible",
      "value": true
    }
  ]
}
```

## 🔧 Actions

### log
```json
{
  "type": "log",
  "message": "Processing ${variable.path}"
}
```

### assign
```json
{
  "type": "assign",
  "key": "targetKey",
  "value": "$someKey"
}
```

### update
```json
{
  "type": "update",
  "key": "$object.nested.path",
  "value": "$newValue",
  "returnKey": "resultKey"
}
```

### excludeVal
```json
{
  "type": "excludeVal",
  "key": "$target.array",
  "exclude": "valueToRemove",
  "returnKey": "modifiedArray"
}
```

### deleteKey
```json
{
  "type": "deleteKey",
  "key": "$object.keyToRemove",
  "returnKey": "modifiedObject"
}
```

### excludeFromArr
```json
{
  "type": "excludeFromArr",
  "target": "$result.items",
  "source": "$context.items",
  "matchProperty": "id",
  "excludeValue": ["item1", "item2"],
  "returnKey": "$result.filteredItems"
}
```

### includeFromArr
```json
{
  "type": "includeFromArr",
  "target": "$result.items",
  "source": "$context.items",
  "matchProperty": "id",
  "includeValue": ["item1", "item2"],
  "includeKeys": ["id", "name"],
  "returnKey": "$result.filteredItems"
}
```

### deleteKeyFromArray
```json
{
  "type": "deleteKeyFromArray",
  "source": "$context.fruits",
  "target": "fruitsWithoutPrice",
  "matchProperty": "location",
  "matchValue": ["India", "Mexico"],
  "deleteKeys": ["price", "supplier"]
}
```

### updateKeyInArray
```json
{
  "type": "updateKeyInArray",
  "source": "$context.fruits",
  "target": "updatedFruits",
  "matchProperty": "location",
  "matchValue": "USA",
  "updates": {
    "price": "$newPrice",
    "status": "premium"
  }
}
```

### addKeyToArray
```json
{
  "type": "addKeyToArray",
  "source": "$context.fruits",
  "target": "fruitsWithDiscount",
  "matchProperty": "location",
  "matchValue": ["India", "Brazil"],
  "additions": {
    "discount": "20%",
    "discountPrice": "$discountedPrice"
  }
}
```

## 📅 Date Functions

### year
```json
{
  "condition": {
    ">=": ["${year($context.birthDate)}", 18]
  }
}
```

### month
```json
{
  "condition": {
    "<": ["${month($context.joinDate)}", 6]
  }
}
```

### day
```json
{
  "condition": {
    "<=": ["${day($context.trialStartDate)}", 30]
  }
}
```

## 🆕 Recent Updates

- Added new comparison operators (`!=`, `>`, `<`, `>=`, `<=`)
- Added date functions (`year`, `month`, `day`)
- Enhanced error handling and logging
- Improved TypeScript support
- Added comprehensive documentation

## 📚 Documentation

For detailed documentation, including best practices and examples, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see the [LICENSE](./LICENSE) file for details.

## 💬 Support

For support, please:
- Open an issue on GitHub
- Contact: Sachinsharmawebdev@gmail.com
- Visit: https://github.com/Sachinsharmawebdev/logicguru-engine

\*\*for any `feedback/issue` you can directly mail me on `sachinsharmawebdev@gmail.com` or share issue on `github` by raising a issue on `https://github.com/Sachinsharmawebdev/logicguru-engine/issues`

## 💖 Support Our Open-Source Work

_If you find this project valuable and would like to support its continued development, please consider:_

**🌟 Sponsoring via GitHub**

**Your sponsorship helps us:**

- **Maintain and improve this project full-time**

- **Add new features and fix bugs faster**

- **Create more high-quality open-source tools**

_Every contribution makes a difference, no matter the size. Together we can build better tools for the developer community._
[![GitHub Sponsors](https://img.shields.io/badge/Support-Project-red?logo=github)](https://github.com/sponsors/Sachinsharmawebdev)

[![GitHub Discussions](https://img.shields.io/badge/reddit-Discussions-blue?logo=reddit)](https://www.reddit.com/r/LogicGuruEngine/)
[![Feedback Welcome](https://img.shields.io/badge/reddit)](https://www.reddit.com/r/LogicGuruEngine/)

---
