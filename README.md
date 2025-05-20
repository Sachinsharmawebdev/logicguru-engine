# Logic Rule Engine

_A powerful, async-ready JSON-based logic rule engine for evaluating nested conditions, variable bindings, dynamic file loading, and custom actions._

## ✅ Features

- **Nested condition support `(AND/OR/==/!=/...)`**

- **`$` variables resolved from provided context**

- **Template string resolution (`${variable}` in log messages)**

- **`$file.variable` for dynamic external data resolution**

- **Preload data from files via useFiles config**

_Support for multiple action types:_

- **log (with template string support `${}`)**

- **`assign` (new object return with result)**

- **`update` (nested path support)**

- **`excludeVal` (array value removal)**

- **`deleteKey` (property deletion)**

- **Fully async-compatible and optimized**

- **Easily configurable for different contexts and sources**

---

## 📦 Installation

```bash
npm install logicguru-engine
```

## 🚀 Usage

```js
import { configureRuleEngine } from "logic-rule-engine";
import rules from "./examples/rules.json";

const context = {
  source: "evensect",
  productId: "123344",
  baseProductId: "123344",
  addons: ["1234", "5678"],
};

const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: context,
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
      "path": "${get.baseProductId}.json",
      "variable": ["ageOld"]
    }
  },
  "condition": {
    "and": [{ "==": ["$get.source", "evectus"] }],
    "and": [{ "includeIn": ["$get.agentList", "20001111"] }],
    "and": [{ "includeKey": ["$get.AdditionalDetails", "noUpsell"] }],
    "and": [{ "includeVal": ["$get.memberList", "234046574"] }]
  },
  "actions": [
    {
      "type": "log",
      "message": "Processing agent ${get.agentId}"
    },
    {
      "type": "update",
      "key": "$res.productId",
      "value": "$get.agentId",
      "returnKey": "res"
    },
    {
      "type": "excludeVal",
      "key": "$res.addons",
      "exclude": "1234",
      "returnKey": "res.addons"
    },
    {
      "type": "deleteKey",
      "key": "$temp.oldValue"
    }
  ]
}
```

---

## 🔧 Actions

- **log:**

```json
{
  "type": "log",
  "message": "Processing ${variable.path}"
}
```

- **assign:**

```json
{
  "type": "assign",
  "key": "targetKey",
  "value": "$someKey"
}
```

- **update**

```json
{
  "type": "update",
  "key": "$object.nested.path",
  "value": "$newValue",
  "returnKey": "resultKey"
}
```

- **excludeVal** //array removal

```json
{
  "type": "excludeVal",
  "key": "$target.array",
  "exclude": "valueToRemove",
  "returnKey": "modifiedArray"
}
```

- **deleteKey** //work on object

```json
{
  "type": "deleteKey",
  "key": "$object.keyToRemove",
  "returnKey": "modifiedobject"
}
```

## 📁 Dynamic File Loading

_Supports `useFiles` to load data from external JSON dynamically using variable interpolation like `$productFile`._
_Supports useFiles to load data from external JSON dynamically using variable interpolation:_

```json
"useFiles": {
  "productFile": {
    "path": "${get.baseProductId}.json",
    "variable": ["dataset"]
  }
}
```

## 🆕 Recent Updates

- **Added template string resolution `(${})` in log messages**

- **New `excludeVal` action for array value removal**

- **New `deleteKey` action for property deletion**

- **New `includeIn` action for array value condition check to find specific value**

- **New `includeKey` action for object property check to find specific key**

- **New `includeVal` action for object property check to find specific value**

- **Enhanced update action with nested path support**

- **Improved object handling in variable resolution**

## ensure your action types follow the new syntax, particularly:

- **Use `exclude` instead of `value` in `excludeVal` actions**

- **Template strings `${}`, now work in log messages**

- **Nested paths are fully supported in all actions**



-------------------

# Array Filter Actions

## Table of Contents

- [Overview](#overview)
- [excludeFromArr](#excludefromarr)
  - [Parameters](#exclude-parameters)
  - [Examples](#exclude-examples)
- [includeFromArr](#includefromarr)
  - [Parameters](#include-parameters)
  - [Examples](#include-examples)

## Overview

Two specialized actions for filtering arrays of objects:

| Action           | Description                                  |
| ---------------- | -------------------------------------------- |
| `excludeFromArr` | Removes objects matching specified values    |
| `includeFromArr` | Keeps only objects matching specified values |

## excludeFromArr

Removes objects that match specified values from an array.

### Parameters

| Parameter       | Type         | Required | Description                                           |
| --------------- | ------------ | -------- | ----------------------------------------------------- |
| `target`        | string       | Yes      | Context path to store results (supports `$` notation) |
| `source`        | string       | Yes      | Source array path (supports `$` notation)             |
| `matchProperty` | string       | Yes      | Property name to check in objects                     |
| `excludeValue`  | string/array | Yes      | Value(s) to exclude                                   |
| `returnKey`     | string       | No       | Key to return in result object                        |

### Examples

**Basic Usage:**

```json
{
  "type": "excludeFromArr",
  "target": "$res.addon",
  "source": "$get.data.addon",
  "matchProperty": "addonId",
  "excludeValue": ["0654", "1234"],
  "returnKey": "res"
}
```

**Basic Usage:**

```json
{
  "type": "includeFromArr",
  "target": "$res.addon",
  "source": "$get.data.addon",
  "matchProperty": "addonId",
  "includeValue": ["0654", "1234"],
  "returnKey": "res"
}
```

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
