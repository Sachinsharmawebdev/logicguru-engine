import { configureRuleEngine } from '../index.js';

describe('Array Actions Context Storage', () => {
  test('should store results in context for chaining actions', async () => {
    const rules = [{
      id: 'context-chain-test',
      condition: { '==': [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$context.items',
          target: 'activeItems',
          matchProperty: 'status',
          matchValue: 'active'
        },
        {
          type: 'updateKeyInArray',
          source: '$activeItems',
          target: 'processedItems',
          matchProperty: 'priority',
          matchValue: 'high',
          updates: {
            processed: true,
            timestamp: '2024-01-15'
          }
        },
        {
          type: 'assign',
          key: 'result',
          value: {
            originalCount: '$context.items.length',
            activeCount: '$activeItems.length',
            processedCount: '$processedItems.length',
            processedItems: '$processedItems'
          }
        }
      ]
    }];

    const context = {
      context: {
        items: [
          { id: 1, status: 'active', priority: 'high' },
          { id: 2, status: 'inactive', priority: 'low' },
          { id: 3, status: 'active', priority: 'medium' },
          { id: 4, status: 'active', priority: 'high' }
        ]
      }
    };

    const engine = await configureRuleEngine(rules, { defaultContext: context });
    const result = await engine();

    // Verify each step is stored in context
    expect(result.activeItems).toHaveLength(3);
    expect(result.processedItems).toHaveLength(3);
    expect(result.result.originalCount).toBe(4);
    expect(result.result.activeCount).toBe(3);
    expect(result.result.processedCount).toBe(3);
    
    // Verify high priority items were updated
    const highPriorityItems = result.processedItems.filter(item => item.priority === 'high');
    expect(highPriorityItems).toHaveLength(2);
    expect(highPriorityItems[0].processed).toBe(true);
    expect(highPriorityItems[1].processed).toBe(true);
  });
});