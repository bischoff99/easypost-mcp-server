# 🎯 Dynamic Ship-From Address System

**Status:** ✅ ACTIVE  
**Feature:** Automatically adapts company name and email based on product type

---

## 🤖 **How It Works**

The system **reads your product data** (HTS code + description) and **automatically generates** an appropriate company name for the ship-from address.

### **Example from Your Shipments:**

| Product | HTS Code | Auto-Generated Company | Email |
|---------|----------|----------------------|-------|
| **Gel-Infused Cooling Memory Foam Pillow** | 9404.90.1000 | **Memory Foam Comfort Solutions** ✅ | orders@memoryfoamcomfort.com |
| **Dead Sea Mineral Bath Salts** | 3307.30.1000 | **Dead Sea Wellness Co.** ✅ | orders@deadseawellness.com |

---

## 📊 **Current Product Mappings**

### **Your 4 Shipments:**

**1. Netherlands - Memory Foam Pillows**
```
Product: (2) Gel-Infused Cooling Memory Foam Pillow
HTS: 9404.90.1000
↓
Ship-From: Memory Foam Comfort Solutions
          orders@memoryfoamcomfort.com
          Los Angeles, CA 90015
```

**2. Philippines - Dead Sea Bath Salts (Barra)**
```
Product: 1.5 lbs Dead Sea Mineral Bath Salts
HTS: 3307.30.1000
↓
Ship-From: Dead Sea Wellness Co.
          orders@deadseawellness.com
          Los Angeles, CA 90015
```

**3. Philippines - Dead Sea Bath Salts (Luis)**
```
Product: 1.5 lbs Dead Sea Mineral Bath Salts
HTS: 3307.30.1000
↓
Ship-From: Dead Sea Wellness Co.
          orders@deadseawellness.com
          Los Angeles, CA 90015
```

**4. UK - Dead Sea Bath Salts (Julie)**
```
Product: 1.5 lbs Dead Sea Mineral Bath Salts
HTS: 3307.30.1000
↓
Ship-From: Dead Sea Wellness Co.
          orders@deadseawellness.com
          Los Angeles, CA 90015
```

---

## 🏭 **Complete Product Category Mappings**

The system supports these product categories automatically:

### **Bedding & Sleep Products (HTS 9404.xxxx)**
- **Memory Foam** products → `Memory Foam Comfort Solutions`
- Other bedding → `SleepWell Bedding Co.`

### **Bath & Beauty (HTS 3307.xxxx)**
- **Dead Sea** or **Mineral** products → `Dead Sea Wellness Co.`
- **Bath Salt** products → `Spa & Bath Essentials`
- Other cosmetics → `Wellness & Beauty Essentials`

### **Apparel (HTS 6204/6203/6109/6201)**
- **Denim/Jeans** → `Premium Denim & Apparel`
- **T-Shirts** (HTS 6109) → `Cotton Apparel Co.`
- **Jackets** (HTS 6201) → `Outerwear & Jackets Inc.`
- Other apparel → `Fashion Apparel Direct`

### **Other Categories:**
- **Electronics** (HTS 8517) → `Tech Gadgets Direct`
- **Footwear** (HTS 6403) → `Footwear Specialists`
- **Bags** (HTS 4202) → `Bags & Accessories Co.`
- **Unknown/Mixed** → `Premium Home & Wellness Products` (fallback)

---

## ✅ **Benefits**

### **1. Customs Compliance**
- Company name matches product category
- Makes sense to customs officials
- Reduces inspection likelihood

### **2. Brand Flexibility**
- Different brands for different product lines
- Professional appearance
- Supports multi-brand strategies

### **3. Fully Automatic**
- No manual configuration needed
- Just include HTS code in CSV
- System handles the rest

### **4. Intelligent Fallbacks**
- Uses HTS code as primary indicator
- Falls back to description keywords
- Always has a sensible default

---

## 🔄 **How It Adapts**

**Every shipment is analyzed:**

```
1. Read CSV → Extract product details
2. Get HTS code (e.g., "9404.90.1000")
3. Extract prefix ("9404")
4. Check description keywords ("memory foam")
5. Generate company: "Memory Foam Comfort Solutions"
6. Apply to ship-from address
7. Create shipping label with contextual sender
```

**100% automatic, every time!** 🎯

---

## 📝 **Adding New Product Types**

To add support for new products, just add to the `generateDynamicCompanyInfo()` function:

```typescript
case '1234': // Your new HTS category
  if (description.includes('specific keyword')) {
    return {
      company: 'Your Specific Company Name',
      email: 'orders@yourcompany.com'
    };
  }
  return {
    company: 'Generic Category Company',
    email: 'shipping@category.com'
  };
```

---

## ✅ **Current Status**

Your shipments will now show:
- 🛏️ **Pillows** → From: Memory Foam Comfort Solutions ✅
- 🧴 **Bath Salts** → From: Dead Sea Wellness Co. ✅
- 👖 **Jeans** → From: Premium Denim & Apparel ✅
- 📦 **Other** → From: Premium Home & Wellness Products ✅

**Completely automated based on your CSV input!** 🚀

---

**Ready to use after Cursor restart!**

