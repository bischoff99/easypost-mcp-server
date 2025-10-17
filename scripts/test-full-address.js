import { parseShippingInput, selectShipFromAddress } from './dist/src-utils-validation.js';

const testCases = [
  {
    name: 'Memory Foam Pillow',
    csv: 'California\tFEDEX\tTest\tPerson\tphone\temail\tstreet\t\tcity\tNetherlands\tzip\tNL\tFALSE\t14 x 12 x 9\t6.6 lbs\t(2) Gel-Infused Cooling Memory Foam Pillow HTS Code: 9404.90.1000 ($38 each)'
  },
  {
    name: 'Dead Sea Bath Salts',
    csv: 'California\tFEDEX\tTest\tPerson\tphone\temail\tstreet\t\tcity\tUK\tzip\tGB\tFALSE\t13 x 12 x 2\t1.2 lbs\t 1.5 lbs Dead Sea Mineral Bath Salts HTS Code: 3307.30.1000 ($27)'
  }
];

console.log('=== TESTING COMPLETE SHIP-FROM ADDRESSES ===\n');

testCases.forEach(test => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(test.name);
  console.log('='.repeat(60));
  
  const parsed = parseShippingInput(test.csv);
  const shipFrom = selectShipFromAddress(parsed);
  
  console.log('Complete Ship-From Address:');
  console.log('  Company:', shipFrom.company);
  console.log('  Name:', shipFrom.name, shipFrom.name ? '✅' : '❌ MISSING');
  console.log('  Street:', shipFrom.street1);
  console.log('  City:', shipFrom.city + ', ' + shipFrom.state + ' ' + shipFrom.zip);
  console.log('  Country:', shipFrom.country);
  console.log('  Phone:', shipFrom.phone, shipFrom.phone ? '✅' : '❌ MISSING');
  console.log('  Email:', shipFrom.email);
  
  // Verify all required fields
  const required = ['company', 'name', 'street1', 'city', 'state', 'zip', 'country', 'phone', 'email'];
  const missing = required.filter(field => !shipFrom[field]);
  
  if (missing.length === 0) {
    console.log('\n✅ ALL REQUIRED FIELDS PRESENT');
  } else {
    console.log('\n❌ MISSING FIELDS:', missing.join(', '));
  }
});

console.log('\n' + '='.repeat(60));

