/**
 * Mock BSAS (Bursa Suq Al-Sila') Client
 * Simulates commodity trading for Tawarruq transactions
 */

export type CommodityType = 'CPO' | 'PLASTIC_RESIN' | 'RBD_PALM_OLEIN'

export type CommodityPurchase = {
  commodityId: string
  commodityType: CommodityType
  quantity: number
  unitPrice: number
  totalAmount: number
  platformReference: string
  timestamp: string
  seller: string
  buyer: string
  certificateNumber: string
}

export type CommoditySale = {
  commodityId: string
  commodityType: CommodityType
  quantity: number
  unitPrice: number
  totalAmount: number
  platformReference: string
  timestamp: string
  seller: string
  buyer: string
  certificateNumber: string
}

// Commodity price ranges (MYR per MT)
const COMMODITY_PRICES: Record<CommodityType, { min: number; max: number }> = {
  CPO: { min: 3800, max: 4200 },
  PLASTIC_RESIN: { min: 4500, max: 5000 },
  RBD_PALM_OLEIN: { min: 4000, max: 4400 },
}

function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

function getRandomPrice(type: CommodityType): number {
  const { min, max } = COMMODITY_PRICES[type]
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function selectCommodityType(): CommodityType {
  const types: CommodityType[] = ['CPO', 'PLASTIC_RESIN', 'RBD_PALM_OLEIN']
  return types[Math.floor(Math.random() * types.length)]
}

/**
 * Simulates T1: Bank purchases commodity from BSAS platform
 * In real scenario, this calls BSAS API to execute purchase
 */
export async function purchaseCommodity(
  principalAmount: number,
  bankName: string = 'Agrobank'
): Promise<CommodityPurchase> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const commodityType = selectCommodityType()
  const unitPrice = getRandomPrice(commodityType)
  const quantity = Math.round((principalAmount / unitPrice) * 1000) / 1000 // MT with 3 decimal places

  const purchase: CommodityPurchase = {
    commodityId: generateId('COM'),
    commodityType,
    quantity,
    unitPrice,
    totalAmount: principalAmount,
    platformReference: generateId('BSAS'),
    timestamp: new Date().toISOString(),
    seller: 'BSAS Trading Platform',
    buyer: bankName,
    certificateNumber: generateId('CERT'),
  }

  return purchase
}

/**
 * Simulates T2: Customer sells commodity to third party broker
 * In real scenario, this calls BSAS API to execute sale
 *
 * IMPORTANT: T2 price must be different from T1 (Shariah requirement)
 * Sale happens AFTER purchase (Tartib requirement)
 */
export async function sellCommodity(
  purchase: CommodityPurchase,
  customerName: string
): Promise<CommoditySale> {
  // Simulate API delay - T2 must happen AFTER T1
  await new Promise(resolve => setTimeout(resolve, 500))

  // T2 sale price is slightly lower (customer sells at market price)
  // This represents the customer receiving cash from the sale
  const saleUnitPrice = purchase.unitPrice * 0.998 // 0.2% lower
  const saleTotalAmount = Math.round(purchase.quantity * saleUnitPrice * 100) / 100

  const sale: CommoditySale = {
    commodityId: purchase.commodityId, // Same commodity
    commodityType: purchase.commodityType,
    quantity: purchase.quantity,
    unitPrice: saleUnitPrice,
    totalAmount: saleTotalAmount,
    platformReference: generateId('BSAS'),
    timestamp: new Date().toISOString(), // Must be AFTER purchase timestamp
    seller: customerName,
    buyer: 'Third Party Broker',
    certificateNumber: generateId('CERT'),
  }

  return sale
}

/**
 * Verify certificate authenticity (mock)
 */
export async function verifyCertificate(certificateNumber: string): Promise<{
  valid: boolean
  issuer: string
  issuedAt: string
}> {
  await new Promise(resolve => setTimeout(resolve, 200))

  return {
    valid: true,
    issuer: 'Bursa Suq Al-Sila Malaysia',
    issuedAt: new Date().toISOString(),
  }
}
