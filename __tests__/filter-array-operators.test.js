import { configureRuleEngine } from '../index.js';

describe('FilterArray with Operators', () => {
  test('should filter array with greater than operator', async () => {
    const rules = [{
      id: 'filter-gt',
      condition: { '==': [true, true] },
      actions: [{
        type: 'filterArray',
        source: '$context.items',
        target: 'expensiveItems',
        matchProperty: 'price',
        operator: '>',
        matchValue: 100
      }]
    }];

    const context = {
      context: {
        items: [
          { id: 1, price: 50 },
          { id: 2, price: 150 },
          { id: 3, price: 200 }
        ]
      }
    };

    const engine = await configureRuleEngine(rules, { defaultContext: context });
    const result = await engine();

    expect(result.expensiveItems).toHaveLength(2);
    expect(result.expensiveItems[0].price).toBe(150);
    expect(result.expensiveItems[1].price).toBe(200);
  });

  test('should filter array with less than or equal operator', async () => {
    const rules = [{
      id: 'filter-lte',
      condition: { '==': [true, true] },
      actions: [{
        type: 'filterArray',
        source: '$context.products',
        target: 'affordableProducts',
        matchProperty: 'price',
        operator: '<=',
        matchValue: 100
      }]
    }];

    const context = {
      context: {
        products: [
          { name: 'A', price: 80 },
          { name: 'B', price: 100 },
          { name: 'C', price: 120 }
        ]
      }
    };

    const engine = await configureRuleEngine(rules, { defaultContext: context });
    const result = await engine();

    expect(result.affordableProducts).toHaveLength(2);
    expect(result.affordableProducts[0].name).toBe('A');
    expect(result.affordableProducts[1].name).toBe('B');
  });

  test('should filter array with not equal operator', async () => {
    const rules = [{
      id: 'filter-ne',
      condition: { '==': [true, true] },
      actions: [{
        type: 'filterArray',
        source: '$context.users',
        target: 'activeUsers',
        matchProperty: 'status',
        operator: '!=',
        matchValue: 'inactive'
      }]
    }];

    const context = {
      context: {
        users: [
          { id: 1, status: 'active' },
          { id: 2, status: 'inactive' },
          { id: 3, status: 'pending' }
        ]
      }
    };

    const engine = await configureRuleEngine(rules, { defaultContext: context });
    const result = await engine();

    expect(result.activeUsers).toHaveLength(2);
    expect(result.activeUsers[0].status).toBe('active');
    expect(result.activeUsers[1].status).toBe('pending');
  });

  test('should store filtered array in context for subsequent actions', async () => {
    const rules = [{
      id: 'context-storage-test',
      condition: { '==': [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$context.products',
          target: 'premiumProducts',
          matchProperty: 'price',
          operator: '>',
          matchValue: 500
        },
        {
          type: 'assign',
          key: 'summary',
          value: {
            totalProducts: 3,
            premiumCount: '$premiumProducts.length',
            premiumProducts: '$premiumProducts'
          }
        }
      ]
    }];

    const context = {
      context: {
        products: [
          { name: 'Basic', price: 100 },
          { name: 'Premium', price: 800 },
          { name: 'Luxury', price: 1200 }
        ]
      }
    };

    const engine = await configureRuleEngine(rules, { defaultContext: context });
    const result = await engine();

    expect(result.premiumProducts).toHaveLength(2);
    expect(result.summary.totalProducts).toBe(3);
    expect(result.summary.premiumCount).toBe(2);
    expect(result.summary.premiumProducts).toHaveLength(2);
    expect(result.summary.premiumProducts[0].name).toBe('Premium');
  });
});