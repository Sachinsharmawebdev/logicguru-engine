import { configureRuleEngine } from '../index.js';

describe('Array Key Operations', () => {
  const testData = [
    { id: '1', name: 'Item1', category: 'A', price: 100 },
    { id: '2', name: 'Item2', category: 'B', price: 200 },
    { id: '3', name: 'Item3', category: 'A', price: 150 }
  ];

  test('should delete keys from array objects based on condition', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'deleteKeyFromArray',
          source: '$items',
          target: 'result',
          matchProperty: 'category',
          matchValue: 'A',
          deleteKeys: ['price']
        }
      ]
    };

    const context = { items: testData };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.result[0]).toEqual({ id: '1', name: 'Item1', category: 'A' });
    expect(result.result[1]).toEqual({ id: '2', name: 'Item2', category: 'B', price: 200 });
    expect(result.result[2]).toEqual({ id: '3', name: 'Item3', category: 'A' });
  });

  test('should update keys in array objects based on condition', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'updateKeyInArray',
          source: '$items',
          target: 'result',
          matchProperty: 'category',
          matchValue: 'B',
          updates: {
            price: '$newPrice',
            status: 'updated'
          }
        }
      ]
    };

    const context = { items: testData, newPrice: 250 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.result[1]).toEqual({
      id: '2',
      name: 'Item2',
      category: 'B',
      price: 250,
      status: 'updated'
    });
  });

  test('should add keys to array objects based on condition', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'addKeyToArray',
          source: '$items',
          target: 'result',
          matchProperty: 'category',
          matchValue: ['A'],
          additions: {
            discount: '10%',
            finalPrice: '$discountPrice'
          }
        }
      ]
    };

    const context = { items: testData, discountPrice: 90 };
    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.result[0]).toEqual({
      id: '1',
      name: 'Item1',
      category: 'A',
      price: 100,
      discount: '10%',
      finalPrice: 90
    });
    expect(result.result[1]).toEqual({ id: '2', name: 'Item2', category: 'B', price: 200 });
  });
});