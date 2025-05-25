import { configureRuleEngine } from '../index.js';

describe('Error Handling and Edge Cases', () => {
  test('should handle missing facts gracefully', async () => {
    const rule = {
      condition: { "==": ["$age", 25] },
      actions: [
        { type: 'assign', key: 'status', value: 'eligible' }
      ]
    };
    const facts = {};
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.status).toBeUndefined();
  });

  test('should handle null or undefined values in conditions', async () => {
    const rule = {
      condition: { "==": ["$status", null] },
      actions: [
        { type: 'assign', key: 'isNull', value: true }
      ]
    };
    const facts = { status: null };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.isNull).toBe(true);
  });

  test('should handle deeply nested undefined paths', async () => {
    const rule = {
      condition: { "==": ["$user.profile.settings.notifications", true] },
      actions: [
        { type: 'assign', key: 'hasNotifications', value: true }
      ]
    };
    const facts = { user: {} };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.hasNotifications).toBeUndefined();
  });

  test('should handle invalid condition types', async () => {
    const rule = {
      condition: { "invalid": ["$age", 25] },
      actions: [
        { type: 'assign', key: 'status', value: 'eligible' }
      ]
    };

    const facts = { age: 25 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.status).toBeUndefined();
  });

  test('should handle invalid action types', async () => {
    const rule = {
      condition: { "==": ["$age", 25] },
      actions: [
        { type: 'invalidAction', key: 'status', value: 'eligible' }
      ]
    };

    const facts = { age: 25 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.status).toBeUndefined();
  });

  test('should handle circular references in facts', async () => {
    const circularObj = { name: 'test' };
    circularObj.self = circularObj;

    const rule = {
      condition: { "==": ["$name", "test"] },
      actions: [
        { type: 'assign', key: 'isCircular', value: true }
      ]
    };

    const facts = circularObj;
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.isCircular).toBe(true);
  });
}); 