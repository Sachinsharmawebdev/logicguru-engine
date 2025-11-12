import { configureRuleEngine } from '../index.js';

async function runExample() {
  try {
    const rule = {
      id: 'filter-active-addons',
      condition: { "==": [true, true] },
      actions: [
        {
          type: 'filterArray',
          source: '$addons',
          target: 'activeAddons',
          matchProperty: 'status',
          matchValue: 'active'
        }
      ]
    };

    const context = {
      addons: [
        { id: '1', name: 'Addon 1', status: 'active', price: 100 },
        { id: '2', name: 'Addon 2', status: 'inactive', price: 200 },
        { id: '3', name: 'Addon 3', status: 'active', price: 150 },
        { id: '4', name: 'Addon 4', status: 'pending', price: 300 }
      ]
    };

    const engine = await configureRuleEngine([rule]);
    const result = await engine(context);
    
    console.log('Original addons:', context.addons);
    console.log('\nFiltered result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error in filter object example:', error.message);
  }
}

runExample();