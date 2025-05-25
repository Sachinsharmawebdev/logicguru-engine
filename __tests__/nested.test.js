import { configureRuleEngine } from '../index.js';

describe('Nested Conditions and Complex Scenarios', () => {
  test('should evaluate deeply nested conditions', async () => {
    const rule = {
      condition: {
        and: [
          {
            or: [
              { "==": ["$user.type", "admin"] },
              { "==": ["$user.type", "moderator"] }
            ]
          },
          { ">": ["$user.reputation", 1000] }
        ]
      },
      actions: [
        { type: 'assign', key: 'canModerate', value: true }
      ]
    };
    const facts = {
      user: {
        type: 'moderator',
        reputation: 1500
      }
    };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.canModerate).toBe(true);
  });

  test('should handle complex nested conditions with multiple operators', async () => {
    const rule = {
      condition: {
        and: [
          { "!=": ["$status", "blocked"] },
          {
            or: [
              {
                and: [
                  { ">": ["$age", 18] },
                  { "==": ["$country", "USA"] }
                ]
              },
              { "==": ["$isVerified", true] }
            ]
          }
        ]
      },
      actions: [
        { type: 'assign', key: 'canAccess', value: true }
      ]
    };
    const facts = {
      status: 'active',
      age: 20,
      country: 'USA',
      isVerified: false
    };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result.canAccess).toBe(true);
  });

  test('should handle nested object paths in conditions', async () => {
    const rule = {
      condition: {
        and: [
          { "==": ["$user.profile.status", "active"] },
          { ">": ["$user.profile.score", 50] }
        ]
      },
      actions: [
        { type: 'assign', key: 'user.profile.level', value: 'premium' }
      ]
    };
    const facts = {
      user: {
        profile: {
          status: 'active',
          score: 75
        }
      }
    };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(facts);
    expect(result['user.profile.level']).toBe('premium');
  });
}); 