import { configureRuleEngine } from '../index.js';

async function runExample() {
  const rule = {
    condition: { ">=": ["${year($birthDate)}", 18] },
    actions: [
      { type: 'assign', key: 'isAdult', value: true },
      { type: 'assign', key: 'age', value: "${year($birthDate)}" },
      { type: 'assign', key: 'months', value: "${month($birthDate)}" },
      { type: 'assign', key: 'days', value: "${day($birthDate)}" }
    ]
  };

  // Set a birthDate 20 years ago from today
  const today = new Date();
  const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
  const birthDateStr = birthDate.toISOString().slice(0, 10);
  const facts = { birthDate: birthDateStr };

  const engine = await configureRuleEngine([rule]);
  const result = await engine(facts);
  console.log('Input facts:', facts);
  console.log('Engine result:', result);
}

runExample(); 