import { configureRuleEngine } from '../index.js';

describe('FilterArray Action', () => {
  test('should filter array based on single match value', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$items',
          target: 'filteredItems',
          matchProperty: 'category',
          matchValue: 'A'
        }
      ]
    };

    const context = {
      items: [
        { id: '1', name: 'Item1', category: 'A' },
        { id: '2', name: 'Item2', category: 'B' },
        { id: '3', name: 'Item3', category: 'A' }
      ]
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.filteredItems).toHaveLength(2);
    expect(result.filteredItems[0]).toEqual({ id: '1', name: 'Item1', category: 'A' });
    expect(result.filteredItems[1]).toEqual({ id: '3', name: 'Item3', category: 'A' });
  });

  test('should filter array based on array match values', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$items',
          target: 'filteredItems',
          matchProperty: 'status',
          matchValue: ['active', 'pending']
        }
      ]
    };

    const context = {
      items: [
        { id: '1', status: 'active' },
        { id: '2', status: 'inactive' },
        { id: '3', status: 'pending' },
        { id: '4', status: 'deleted' }
      ]
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.filteredItems).toHaveLength(2);
    expect(result.filteredItems[0].status).toBe('active');
    expect(result.filteredItems[1].status).toBe('pending');
  });

  test('should return empty array when no matches found', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$items',
          target: 'filteredItems',
          matchProperty: 'category',
          matchValue: 'Z'
        }
      ]
    };

    const context = {
      items: [
        { id: '1', category: 'A' },
        { id: '2', category: 'B' }
      ]
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.filteredItems).toEqual([]);
  });
});