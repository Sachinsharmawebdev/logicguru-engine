import { configureRuleEngine } from '../index.js';

describe('FilterObject Action', () => {
  test('should filter object by key condition', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterObject',
          source: '$data',
          target: 'filteredData',
          filterBy: 'key',
          operator: '>',
          compareValue: 3
        }
      ]
    };

    const context = {
      data: {
        1: 'value1',
        2: 'value2',
        3: 'value3',
        4: 'value4',
        5: 'value5'
      }
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.filteredData).toEqual({
      4: 'value4',
      5: 'value5'
    });
  });

  test('should filter object by value condition', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterObject',
          source: '$prices',
          target: 'expensiveItems',
          filterBy: 'value',
          operator: '>=',
          compareValue: 100
        }
      ]
    };

    const context = {
      prices: {
        item1: 50,
        item2: 150,
        item3: 75,
        item4: 200
      }
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.expensiveItems).toEqual({
      item2: 150,
      item4: 200
    });
  });

  test('should return empty object when no matches found', async () => {
    const rule = {
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterObject',
          source: '$data',
          target: 'filteredData',
          filterBy: 'value',
          operator: '>',
          compareValue: 1000
        }
      ]
    };

    const context = {
      data: {
        a: 10,
        b: 20,
        c: 30
      }
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);

    expect(result.filteredData).toEqual({});
  });
});