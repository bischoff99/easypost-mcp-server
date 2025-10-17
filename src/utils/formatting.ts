export function formatShippingLabel(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function formatAddress(address: any): string {
  const lines = [
    address.name || address.company,
    address.street1,
    address.street2,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country
  ].filter(Boolean);

  return lines.join('\n');
}

export function formatWeight(ounces: number): string {
  const pounds = Math.floor(ounces / 16);
  const oz = (ounces % 16).toFixed(1);
  return pounds > 0 ? `${pounds} lbs ${oz} oz` : `${oz} oz`;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatTrackingNumber(carrier: string, tracking: string): string {
  // Format tracking numbers based on carrier
  if (carrier === 'UPS' && tracking.length === 18) {
    return tracking.match(/.{1,6}/g)?.join(' ') || tracking;
  }
  if (carrier === 'FedEx' && tracking.length === 12) {
    return tracking.match(/.{1,4}/g)?.join(' ') || tracking;
  }
  if (carrier === 'USPS' && tracking.length === 22) {
    return tracking.match(/.{1,4}/g)?.join(' ') || tracking;
  }
  return tracking;
}

