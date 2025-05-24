# Logic Guru Engine Documentation

## Overview
Logic Guru Engine is a powerful, flexible rule engine that allows you to define and execute complex business rules using JSON configuration. It's perfect for implementing business logic, workflows, and decision automation in your applications.

## Key Features
- JSON-based rule configuration
- Nested conditions support
- Async evaluation
- Dynamic file loading
- Flexible action system
- TypeScript support
- Context-based rule execution

## Installation
```bash
npm install logicguru-engine
```

## Basic Usage

### 1. Import the Engine
```javascript
import { configureRuleEngine } from 'logicguru-engine';
```

### 2. Define Your Rules
Rules are defined in JSON format. Here's a basic example:

```json
[
  {
    "id": "my-rule",
    "condition": {
      "and": [
        { "==": ["$context.value", 100] }
      ]
    },
    "actions": [
      {
        "type": "assign",
        "key": "result.status",
        "value": "success"
      }
    ]
  }
]
```

### 3. Configure and Run the Engine
```javascript
const engine = await configureRuleEngine(rules, {
  basePath: "./data",
  defaultContext: {
    value: 100
  }
});

const result = await engine();
```

## Rule Structure

### Rule Components
1. **id** (optional): Unique identifier for the rule
2. **useFiles** (optional): Configuration for dynamic file loading
3. **condition**: Logic conditions to evaluate
4. **actions**: Actions to execute when conditions are met

### Conditions
The engine supports the following operators:

1. **Logical Operators**
   - `and`: All conditions must be true
   - `or`: Any condition must be true

2. **Comparison Operators**
   Currently Supported:
   - `==`: Equality check
   - `!=`: Not equal to
   - `>`: Greater than
   - `<`: Less than
   - `>=`: Greater than or equal to
   - `<=`: Less than or equal to
   - `===`: Strict equality check
   - `!==`: Strict inequality check

3. **Array and Object Operators**
   - `includeIn`: Check if a value exists in an array
   - `includeKey`: Check if a key exists in an object
   - `includeVal`: Check if a value exists in object values

Example:
```json
{
  "condition": {
    "and": [
      { "==": ["$context.age", 18] },
      { "includeIn": ["$context.status", "$context.allowedStatuses"] },
      { "includeKey": ["name", "$context.user"] }
    ]
  }
}
```

### Actions
The engine supports the following action types:

1. **log**: Log a message to console
```json
{
  "type": "log",
  "message": "Processing user: ${user.name}"
}
```

2. **assign**: Assign a value to a key
```json
{
  "type": "assign",
  "key": "result.status",
  "value": "approved"
}
```

3. **update**: Update a value in the context
```json
{
  "type": "update",
  "key": "$context.user.status",
  "value": "active",
  "returnKey": "$result.userStatus"
}
```

4. **excludeVal**: Exclude a value from an array
```json
{
  "type": "excludeVal",
  "key": "$context.items",
  "exclude": "item1",
  "returnKey": "$result.filteredItems"
}
```

5. **deleteKey**: Delete a key from the context
```json
{
  "type": "deleteKey",
  "key": "$context.tempData",
  "returnKey": "$result.status"
}
```

6. **excludeFromArr**: Exclude items from an array based on a property
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

7. **includeFromArr**: Include specific items in an array
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

## Context Variables
- All context variables must be prefixed with `$`
- Nested properties can be accessed using dot notation (e.g., `$user.profile.name`)
- Template strings can be used with `${variable}` syntax

## Dynamic File Loading
You can load external files dynamically using the `useFiles` configuration:

```json
{
  "useFiles": {
    "configFile": {
      "path": "/config/${context.id}_slug.json"
    }
  }
}
```

## TypeScript Support
The engine includes TypeScript definitions. Here's how to use it with TypeScript:

```typescript
import { configureRuleEngine, Rule, RuleEngineOptions } from 'logicguru-engine';

const rules: Rule[] = [
  // Your rules here
];

const options: RuleEngineOptions = {
  basePath: './data',
  defaultContext: {
    // Your context here
  }
};

const engine = configureRuleEngine(rules, options);
```

## Best Practices

1. **Rule Organization**
   - Keep rules modular and focused
   - Use meaningful IDs for rules
   - Group related rules together
   - Document rule dependencies
   - Use consistent naming conventions
   - Version control your rules
   - Maintain a rule catalog

2. **Condition Writing**
   - Use clear, descriptive conditions
   - Break complex conditions into smaller parts
   - Use appropriate operators for the data type
   - Avoid deeply nested conditions (max 3 levels)
   - Use comments for complex logic
   - Validate input data before conditions
   - Handle edge cases explicitly

3. **Action Design**
   - Keep actions simple and focused
   - Use appropriate action types
   - Consider the order of actions
   - Validate action results
   - Handle action failures gracefully
   - Use meaningful return keys
   - Document action side effects

4. **Context Management**
   - Initialize context with default values
   - Use clear naming conventions
   - Document context structure
   - Validate context data
   - Handle missing context gracefully
   - Use type checking where possible
   - Maintain context immutability

5. **Date Handling**
   - Always use YYYY-MM-DD format
   - Validate dates before use
   - Handle timezone considerations
   - Cache date calculations
   - Document date dependencies
   - Handle invalid dates gracefully
   - Consider date range validations

6. **Performance Optimization**
   - Minimize file loading operations
   - Cache frequently used data
   - Use efficient operators
   - Avoid redundant conditions
   - Optimize array operations
   - Batch similar operations
   - Monitor rule execution time

7. **Error Handling**
   - Implement proper error logging
   - Use meaningful error messages
   - Handle all possible error cases
   - Provide fallback values
   - Document error scenarios
   - Implement retry mechanisms
   - Monitor error patterns

8. **Testing and Validation**
   - Write unit tests for rules
   - Test edge cases
   - Validate rule outputs
   - Test with sample data
   - Implement integration tests
   - Use test fixtures
   - Document test scenarios

9. **Security Considerations**
   - Validate all inputs
   - Sanitize context data
   - Control file access
   - Implement access control
   - Log security events
   - Handle sensitive data
   - Follow security best practices

10. **Maintenance and Documentation**
    - Keep documentation updated
    - Version your rules
    - Document rule changes
    - Maintain change logs
    - Review rules regularly
    - Remove unused rules
    - Document dependencies

### Example Implementations

1. **Well-Structured Rule**
```json
{
  "id": "age-verification-rule",
  "description": "Verifies user age and eligibility",
  "condition": {
    "and": [
      { ">=": ["${year($context.birthDate)}", 18] },
      { "!=": ["$context.status", "suspended"] }
    ]
  },
  "actions": [
    {
      "type": "assign",
      "key": "result.isEligible",
      "value": true
    },
    {
      "type": "log",
      "message": "User verified: ${$context.userId}"
    }
  ]
}
```

2. **Error Handling Example**
```json
{
  "id": "safe-data-processing",
  "condition": {
    "and": [
      { "includeKey": ["birthDate", "$context"] },
      { "!=": ["$context.birthDate", null] }
    ]
  },
  "actions": [
    {
      "type": "assign",
      "key": "result.age",
      "value": "${year($context.birthDate)}"
    }
  ]
}
```

3. **Performance Optimized Rule**
```json
{
  "id": "efficient-data-filtering",
  "useFiles": {
    "configFile": {
      "path": "/config/${$context.type}_config.json"
    }
  },
  "condition": {
    "and": [
      { "includeIn": ["$context.id", "$configFile.validIds"] },
      { ">=": ["${month($context.lastActive)}", 1] }
    ]
  },
  "actions": [
    {
      "type": "includeFromArr",
      "target": "$result.items",
      "source": "$context.items",
      "matchProperty": "id",
      "includeValue": "$configFile.requiredItems",
      "returnKey": "$result.filteredItems"
    }
  ]
}
```

## Common Use Cases

1. **Business Rules**
   - Pricing rules
   - Discount calculations
   - Eligibility checks
   - Approval workflows

2. **Data Processing**
   - Data filtering
   - Data transformation
   - Data validation

3. **Workflow Automation**
   - Process automation
   - Decision trees
   - State management

## Error Handling
The engine provides error handling for:
- Invalid rule syntax
- Missing context values
- File loading errors
- Action execution errors

## Performance Considerations
- Keep rules simple and focused
- Use appropriate operators
- Minimize file loading operations
- Cache frequently used data

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## Support
For support, please:
- Open an issue on GitHub
- Contact: Sachinsharmawebdev@gmail.com
- Visit: https://github.com/Sachinsharmawebdev/logicguru-engine 

## Date Functions
The engine provides built-in date calculation functions that can be used in conditions, actions, and dynamic paths. These functions help calculate time differences from a given date to the current date.

### Available Date Functions

1. **year(date)**: Calculates the number of years
2. **month(date)**: Calculates the number of months
3. **day(date)**: Calculates the number of days

### Date Format
- All date functions expect dates in `YYYY-MM-DD` format
- Example: `2024-03-15`, `1990-01-01`, `2000-12-31`

### Usage Examples

1. **In Conditions**
```json
{
  "condition": {
    "and": [
      { ">": ["${year($context.birthDate)}", 18] },
      { "<": ["${month($context.joinDate)}", 6] }
    ]
  }
}
```

2. **In Actions**
```json
{
  "type": "assign",
  "key": "result.age",
  "value": "${year($context.birthDate)}"
}
```

3. **In Dynamic File Paths**
```json
{
  "useFiles": {
    "userFile": {
      "path": "/users/${year($context.birthDate)}_${month($context.birthDate)}.json"
    }
  }
}
```

4. **Complex Age Calculation**
```json
{
  "condition": {
    "and": [
      { ">=": ["${year($context.birthDate)}", 18] },
      { "or": [
        { ">": ["${month($context.birthDate)}", 0] },
        { "and": [
          { "==": ["${month($context.birthDate)}", 0] },
          { ">=": ["${day($context.birthDate)}", 0] }
        ]}
      ]}
    ]
  }
}
```

### Error Handling
- Invalid date formats will return 0 and log a warning
- Missing context values will return empty string
- All date calculations are based on the current date

### Best Practices
1. **Date Validation**
   - Always ensure dates are in YYYY-MM-DD format
   - Validate dates before using them in rules
   - Handle potential missing or invalid dates

2. **Performance**
   - Cache date calculations if used multiple times
   - Avoid unnecessary date calculations in loops

3. **Context Structure**
   - Use consistent date field names (e.g., birthDate, joinDate)
   - Document date format requirements
   - Include date validation in your application logic

### Common Use Cases

1. **Age Verification**
```json
{
  "condition": {
    ">=": ["${year($context.birthDate)}", 18]
  },
  "actions": [
    {
      "type": "assign",
      "key": "result.isAdult",
      "value": true
    }
  ]
}
```

2. **Membership Duration**
```json
{
  "condition": {
    ">=": ["${month($context.membershipStartDate)}", 12]
  },
  "actions": [
    {
      "type": "assign",
      "key": "result.membershipTier",
      "value": "premium"
    }
  ]
}
```

3. **Trial Period Check**
```json
{
  "condition": {
    "<=": ["${day($context.trialStartDate)}", 30]
  },
  "actions": [
    {
      "type": "assign",
      "key": "result.trialStatus",
      "value": "active"
    }
  ]
} 