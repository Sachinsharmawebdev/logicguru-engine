import { configureRuleEngine } from '../index.js';

async function runExample() {
  try {
    const rules = [
      {
        id: 'delete-keys-from-fruits',
        condition: { "==": [true, true] },
        actions: [
          {
            type: 'deleteKeyFromArray',
            source: '$fruitsPrices',
            target: 'fruitsWithoutPrice',
            matchProperty: 'location',
            matchValue: ['India', 'Mexico'],
            deleteKeys: ['price', 'supplier']
          }
        ]
      },
      {
        id: 'update-fruit-prices',
        condition: { "==": [true, true] },
        actions: [
          {
            type: 'updateKeyInArray',
            source: '$fruitsPrices',
            target: 'updatedFruits',
            matchProperty: 'location',
            matchValue: 'USA',
            updates: {
              price: '$newPrice',
              status: 'premium'
            }
          }
        ]
      },
      {
        id: 'add-discount-to-fruits',
        condition: { "==": [true, true] },
        actions: [
          {
            type: 'addKeyToArray',
            source: '$fruitsPrices',
            target: 'fruitsWithDiscount',
            matchProperty: 'location',
            matchValue: ['India', 'Brazil'],
            additions: {
              discount: '20%',
              discountPrice: '$discountedPrice'
            }
          }
        ]
      }
    ];

    const context = {
      fruitsPrices: [
        { name: 'Apple', price: 100, location: 'India', supplier: 'FarmCorp' },
        { name: 'Orange', price: 150, location: 'USA', supplier: 'CitrusCo' },
        { name: 'Banana', price: 80, location: 'Brazil', supplier: 'TropicalFarms' },
        { name: 'Mango', price: 200, location: 'India', supplier: 'MangoKing' },
        { name: 'Grape', price: 300, location: 'Mexico', supplier: 'VineYards' }
      ],
      newPrice: 175,
      discountedPrice: 64
    };

    const engine = await configureRuleEngine(rules);
    const result = await engine(context);
    
    console.log('Original fruits:', context.fruitsPrices);
    console.log('\nFruits without price (India/Mexico):', result.fruitsWithoutPrice);
    console.log('\nUpdated fruits (USA):', result.updatedFruits);
    console.log('\nFruits with discount (India/Brazil):', result.fruitsWithDiscount);
  } catch (error) {
    console.error('Error in array key operations example:', error.message);
  }
}

runExample();