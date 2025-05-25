import { configureRuleEngine } from '../index.js';

describe('Basic Rule Evaluation', () => {
  test('should evaluate simple condition correctly', async () => {
    const rule = {
      condition: { "==": ["$age", 25] },
      actions: [
        { type: 'assign', key: 'status', value: 'eligible' }
      ]
    };
    const facts = { age: 25 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.status).toBe('eligible');
  });

  test('should handle multiple conditions with AND operator', async () => {
    const rule = {
      condition: {
        and: [
          { ">": ["$age", 18] },
          { "==": ["$country", "USA"] }
        ]
      },
      actions: [
        { type: 'assign', key: 'canVote', value: true }
      ]
    };
    const facts = { age: 20, country: 'USA' };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.canVote).toBe(true);
  });

  test('should handle OR operator correctly', async () => {
    const rule = {
      condition: {
        or: [
          { "==": ["$status", "active"] },
          { "==": ["$status", "pending"] }
        ]
      },
      actions: [
        { type: 'assign', key: 'canAccess', value: true }
      ]
    };
    const facts = { status: 'pending' };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.canAccess).toBe(true);
  });

  test('should handle NOT operator using !=', async () => {
    const rule = {
      condition: { "!=": ["$status", "blocked"] },
      actions: [
        { type: 'assign', key: 'isActive', value: true }
      ]
    };
    const facts = { status: 'active' };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.isActive).toBe(true);
  });

  test('should evaluate age using year() date function in condition', async () => {
    const rule = {
      condition: { ">=": ["${year($birthDate)}", 18] },
      actions: [
        { type: 'assign', key: 'isAdult', value: true },
        { type: 'assign', key: 'age', value: "${year($birthDate)}" },
        { type: 'assign', key: 'months', value: "${month($birthDate)}" },
        { type: 'assign', key: 'days', value: "${day($birthDate)}" }
      ]
    };
    // Set a birthDate 20 years ago from today
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    const birthDateStr = birthDate.toISOString().slice(0, 10);
    const facts = { birthDate: birthDateStr };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.isAdult).toBe(true);
    expect(result.age).toBe(20);
    expect(result.months).toBeGreaterThanOrEqual(240); // 20 years * 12 months
    expect(result.days).toBeGreaterThanOrEqual(365 * 19); // at least 19 years in days
  });
}); 