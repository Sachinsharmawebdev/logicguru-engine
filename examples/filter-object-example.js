import { configureRuleEngine } from '../index.js';

async function runExample() {
  try {
    const rules = [
      {
        id: 'filter-suminsure-by-key',
        condition: { "==": [true, true] },
        actions: [
          {
            type: 'filterObject',
            source: '$sumInsure',
            target: 'highTierSumInsure',
            filterBy: 'key',
            operator: '>',
            compareValue: 6
          }
        ]
      },
      {
        id: 'filter-suminsure-by-value',
        condition: { "==": [true, true] },
        actions: [
          {
            type: 'filterObject',
            source: '$sumInsure',
            target: 'premiumSumInsure',
            filterBy: 'value',
            operator: '>=',
            compareValue: 100000
          }
        ]
      }
    ];

    const context = {
      sumInsure: {
        1: 20000,
        2: 50000,
        3: 70000,
        4: 100000,
        6: 1500000,
        7: 2000000
      }
    };

    const engine = await configureRuleEngine(rules);
    const result = await engine(context);
    
    console.log('Original sumInsure:', context.sumInsure);
    console.log('\nFiltered by key > 6:', result.highTierSumInsure);
    console.log('\nFiltered by value >= 100000:', result.premiumSumInsure);
  } catch (error) {
    console.error('Error in filter object example:', error.message);
  }
}

runExample();