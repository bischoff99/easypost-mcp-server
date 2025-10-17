# 📦 Your 4 Shipments - Dynamic Ship-From Preview

**Generated:** October 16, 2025  
**Feature:** ✅ Dynamic address adaptation based on product type

---

## 🎯 **How Each Shipment Will Be Processed**

### **Shipment #1: Netherlands - Memory Foam Pillows**

**Product Input:**
```
(2) Gel-Infused Cooling Memory Foam Pillow
HTS Code: 9404.90.1000
Value: $38 each
```

**Auto-Generated Ship-From Address:**
```
Company: Memory Foam Comfort Solutions
Name: Jennifer Martinez
Address: 1234 S Broadway
         Los Angeles, CA 90015
         United States
Phone: (213) 555-0100
Email: orders@memoryfoamcomfort.com
```

**Shipping Details:**
- Carrier: **FedEx International Priority Express** (from CSV column 1)
- Weight: 6.6 lbs → 130.56 oz (with buffer)
- Customs: HTS 9404.90.1000 | $76 total value
- DDP: ✅ Yes (you pay duties)

---

### **Shipment #2: Philippines - Dead Sea Bath Salts (Barra)**

**Product Input:**
```
1.5 lbs Dead Sea Mineral Bath Salts
HTS Code: 3307.30.1000
Value: $27
```

**Auto-Generated Ship-From Address:**
```
Company: Dead Sea Wellness Co.
Name: Sarah Johnson
Address: 1234 S Broadway
         Los Angeles, CA 90015
         United States
Phone: (213) 555-0100
Email: orders@deadseawellness.com
```

**Shipping Details:**
- Carrier: **DHL Express** or **USPS First Class** (FedEx not available)
- Weight: 1.8 lbs → 44.88 oz (with buffer)
- Customs: HTS 3307.30.1000 | $27 value
- Restriction: TRUE (Personal Use)
- DDP: ✅ Yes

---

### **Shipment #3: Philippines - Dead Sea Bath Salts (Luis)**

**Product Input:**
```
1.5 lbs Dead Sea Mineral Bath Salts
HTS Code: 3307.30.1000
Value: $27
```

**Auto-Generated Ship-From Address:**
```
Company: Dead Sea Wellness Co.
Name: Sarah Johnson
Address: 1234 S Broadway
         Los Angeles, CA 90015
         United States
Phone: (213) 555-0100
Email: orders@deadseawellness.com
```

**Shipping Details:**
- Carrier: **DHL Express** or **USPS First Class** (FedEx not available)
- Weight: 1.7 lbs → 43.52 oz (with buffer)
- Customs: HTS 3307.30.1000 | $27 value
- DDP: ✅ Yes

---

### **Shipment #4: UK - Dead Sea Bath Salts (Julie)**

**Product Input:**
```
1.5 lbs Dead Sea Mineral Bath Salts
HTS Code: 3307.30.1000
Value: $27
```

**Auto-Generated Ship-From Address:**
```
Company: Dead Sea Wellness Co.
Name: Sarah Johnson
Address: 1234 S Broadway
         Los Angeles, CA 90015
         United States
Phone: (213) 555-0100
Email: orders@deadseawellness.com
```

**Shipping Details:**
- Carrier: **FedEx International Priority Express** (from CSV column 1)
- Weight: 1.2 lbs → 36.72 oz (with buffer)
- Customs: HTS 3307.30.1000 | $27 value
- DDP: ✅ Yes (you pay duties)

---

## ✅ **Complete Address Requirements Met**

Each ship-from address includes **ALL required fields**:

| Field | Example | Source |
|-------|---------|--------|
| **Company** | Dead Sea Wellness Co. | ✅ Auto-generated from HTS + description |
| **Name** | Sarah Johnson | ✅ Auto-generated per product category |
| **Street** | 1234 S Broadway | ✅ Based on CSV column 0 (California) |
| **City** | Los Angeles | ✅ State-based warehouse |
| **State** | CA | ✅ State-based warehouse |
| **Zip** | 90015 | ✅ State-based warehouse |
| **Country** | US | ✅ Always US |
| **Phone** | (213) 555-0100 | ✅ Warehouse phone |
| **Email** | orders@deadseawellness.com | ✅ Auto-generated |

---

## 🎯 **Summary by Product Type**

| Your Products | Ship-From Company | Contact Person |
|--------------|-------------------|----------------|
| Memory Foam Pillows (HTS 9404) | Memory Foam Comfort Solutions | Jennifer Martinez |
| Dead Sea Bath Salts (HTS 3307) | Dead Sea Wellness Co. | Sarah Johnson |

---

## 🚀 **How to Use**

**Just paste your CSV data** - the system automatically:
1. ✅ Reads product description and HTS code
2. ✅ Generates appropriate company name
3. ✅ Assigns relevant contact person
4. ✅ Selects warehouse based on CSV column 0
5. ✅ Includes all required fields (company, name, phone, email, address)

**No configuration needed - it adapts every time!** 🎯

---

## 💰 **Ready to Purchase**

Once you add credits to your EasyPost account:
- 🇳🇱 Netherlands → From: **Memory Foam Comfort Solutions** (Jennifer Martinez)
- 🇬🇧 UK → From: **Dead Sea Wellness Co.** (Sarah Johnson)
- 🇵🇭 Philippines (both) → From: **Dead Sea Wellness Co.** (Sarah Johnson)

All with FedEx where available, customs included, DDP enabled! ✅

