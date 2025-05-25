import { configureRuleEngine } from '../index.js';

describe('Async Operations', () => {
  test('should handle simple async-compatible condition', async () => {
    const rule = {
      condition: { "==": ["$age", 20] },
      actions: [
        { type: 'assign', key: 'isAdult', value: true }
      ]
    };
    const facts = { age: 20 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.isAdult).toBe(true);
  });
}); 