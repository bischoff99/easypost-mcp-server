import { EasyPostService } from './dist/src-services-easypost-client.js';

const easyPostClient = new EasyPostService();

console.log('=== CHECKING FOR DDP OPTIONS ===\n');

try {
  const shipmentData = {
    from_address: {
      street1: '1234 S Broadway',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90015',
      country: 'US'
    },
    to_address: {
      name: 'Julie Aldron',
      street1: '15c st Catherine\'s road',
      city: 'Bournemouth',
      state: 'Dorset',
      zip: 'BH6 4AE',
      country: 'GB'
    },
    parcel: {
      length: 13,
      width: 12,
      height: 2,
      weight: 37
    }
  };

  const shipment = await easyPostClient.client.Shipment.create(shipmentData);
  
  console.log('Total rates:', shipment.rates?.length);
  console.log('');
  
  // Check all FedEx services
  const fedexRates = shipment.rates?.filter(r => r.carrier.toLowerCase().includes('fedex')) || [];
  
  console.log(`FedEx rates found: ${fedexRates.length}\n`);
  
  fedexRates.forEach((rate, i) => {
    const isDDP = rate.service.includes('DDP') || rate.service.toLowerCase().includes('duty paid');
    const isDDU = rate.service.includes('DDU') || rate.service.toLowerCase().includes('duty unpaid');
    
    console.log(`${i + 1}. ${rate.service}`);
    console.log(`   Cost: $${rate.rate}`);
    console.log(`   Delivery: ${rate.delivery_days} days`);
    console.log(`   DDP: ${isDDP ? '✅ YES' : (isDDU ? '❌ NO (DDU)' : '⚠️  UNKNOWN')}`);
    console.log('');
  });
  
  // Check if there's an incoterm option
  console.log('\n=== TESTING WITH INCOTERM OPTION ===');
  
  const shipmentWithDDP = await easyPostClient.client.Shipment.create({
    ...shipmentData,
    options: {
      incoterm: 'DDP'  // Try to request DDP
    }
  });
  
  console.log('Shipment with incoterm:DDP created');
  const fedexWithDDP = shipmentWithDDP.rates?.filter(r => r.carrier.toLowerCase().includes('fedex')) || [];
  
  console.log(`FedEx rates: ${fedexWithDDP.length}\n`);
  fedexWithDDP.forEach(rate => {
    console.log(`- ${rate.service}: $${rate.rate}`);
  });
  
} catch (error) {
  console.error('ERROR:', error.message);
}


