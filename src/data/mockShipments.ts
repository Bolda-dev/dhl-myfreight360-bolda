export interface Shipment {
  id: string;
  fileNumber: string;
  houseBill: string;
  clientRef: string;
  opened: string;
  transportMode: "Air" | "Ocean" | "Rail";
  origin: string;
  destination: string;
  shipper: string;
  consignee: string;
  exceptions: number;
  invoiceCount: number;
  containerCount: number;
  legs: number | null;
  etd: string;
  atd: string | null;
  eta: string;
  ata: string | null;
  lastEvent: string;
  pickupRequest: boolean;
  pickup: boolean;
  customs: boolean;
  pod: boolean;
  tags: string[];
  remarks: Remark[];
  invoices: Invoice[];
  containers: Container[];
  statusSteps: StatusStep[];
  events: ShipmentEvent[];
}

export interface Remark {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface ShipmentEvent {
  title: string;
  type: "PICKUP" | "DEPARTURE" | "ARRIVAL" | "CUSTOMS" | "DELIVERY" | "IN_TRANSIT";
  description: string;
  location: string;
  date: string;
  completed: boolean;
}

export interface Invoice {
  number: string;
  date: string;
  amount: number;
  currency: string;
  status: "PAID" | "ISSUED" | "OVERDUE";
  description: string;
}

export interface Container {
  id: string;
  type: string;
}

export interface StatusStep {
  label: string;
  completed: boolean;
  active: boolean;
  date?: string;
  location?: string;
  description?: string;
}

export const AVAILABLE_TAGS = [
  "Urgent", "Priority", "Fragile", "Hazardous", "Perishable",
  "Temperature Controlled", "Oversized", "High Value", "Documents Required",
  "VIP Client", "Bonded", "Re-export", "Sample", "Return Shipment",
];

export const CITY_FLAGS: Record<string, string> = {
  "HONG KONG": "🇭🇰",
  "TEL AVIV": "🇮🇱",
  "LOS ANGELES": "🇺🇸",
  "HAMBURG": "🇩🇪",
  "SINGAPORE": "🇸🇬",
  "BEIJING": "🇨🇳",
  "NEW YORK": "🇺🇸",
  "LONDON": "🇬🇧",
};

export const mockShipments: Shipment[] = [
  {
    id: "1",
    fileNumber: "s457567567",
    houseBill: "8XG8943",
    clientRef: "345345345-345634",
    opened: "9/21/2025 06:54 AM",
    transportMode: "Air",
    origin: "HONG KONG",
    destination: "TEL AVIV",
    shipper: "MELLANOX TECHNOLOGIES LTD",
    consignee: "MELLANOX TECHNOLOGIES LTD",
    exceptions: 0,
    invoiceCount: 3,
    containerCount: 0,
    legs: null,
    etd: "9/21/2025 07:00 AM",
    atd: "9/21/2025 06:45 AM",
    eta: "9/21/2025 06:00 PM",
    ata: "9/21/2025 05:30 PM",
    lastEvent: "Delivered",
    pickupRequest: true,
    pickup: true,
    customs: true,
    pod: true,
    tags: ["Priority", "VIP Client"],
    remarks: [
      { id: "r1", author: "Sarah Cohen", text: "Client requested early morning delivery", date: "Sep 20, 08:00 AM" },
      { id: "r2", author: "David Levi", text: "Customs cleared without issues", date: "Sep 21, 06:15 PM" },
    ],
    invoices: [
      { number: "INV-2025-001", date: "9/21/2025 10:00 AM", amount: 1160.90, currency: "USD", status: "PAID", description: "Freight charges" },
      { number: "INV-2025-002", date: "9/21/2025 12:00 PM", amount: 250.00, currency: "USD", status: "PAID", description: "Customs brokerage" },
      { number: "INV-2025-003", date: "9/21/2025 02:00 PM", amount: 125.50, currency: "USD", status: "ISSUED", description: "Storage fees" },
    ],
    containers: [],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false, date: "Sep 20, 10:00 AM", location: "Hong Kong", description: "Shipment order confirmed" },
      { label: "Pickup", completed: true, active: false, date: "Sep 20, 02:00 PM", location: "Hong Kong Warehouse", description: "Cargo picked up" },
      { label: "Departed", completed: true, active: false, date: "Sep 21, 06:45 AM", location: "HKG Airport", description: "Flight departed" },
      { label: "Arrived", completed: true, active: false, date: "Sep 21, 05:30 PM", location: "TLV Airport", description: "Flight arrived" },
      { label: "Delivered", completed: true, active: false, date: "Sep 21, 07:00 PM", location: "Tel Aviv", description: "Delivered to consignee" },
    ],
    events: [
      { title: "Cargo Picked Up", type: "PICKUP", description: "Cargo collected from shipper premises", location: "Hong Kong", date: "Sep 19, 12:05 PM", completed: true },
      { title: "Departed Origin", type: "DEPARTURE", description: "Flight departed from Hong Kong", location: "Hong Kong", date: "Sep 21, 06:45 AM", completed: true },
      { title: "Arrived at Destination", type: "ARRIVAL", description: "Flight arrived at Tel Aviv", location: "Tel Aviv", date: "Sep 21, 05:30 PM", completed: true },
      { title: "Customs Cleared", type: "CUSTOMS", description: "Shipment cleared customs", location: "Tel Aviv", date: "Sep 21, 06:00 PM", completed: true },
      { title: "Delivered", type: "DELIVERY", description: "Delivered to consignee", location: "Tel Aviv", date: "Sep 21, 07:00 PM", completed: true },
    ],
  },
  {
    id: "2",
    fileNumber: "s456856867567",
    houseBill: "8XG8944",
    clientRef: "234232-345634",
    opened: "9/20/2025 08:30 AM",
    transportMode: "Air",
    origin: "TEL AVIV",
    destination: "LOS ANGELES",
    shipper: "TECH SOLUTIONS INC",
    consignee: "AMERICAN TECH CORP",
    exceptions: 1,
    invoiceCount: 2,
    containerCount: 0,
    legs: null,
    etd: "9/22/2025 09:15 AM",
    atd: "9/22/2025 10:30 AM",
    eta: "9/22/2025 08:45 PM",
    ata: "9/23/2025 02:15 AM",
    lastEvent: "Delivered",
    pickupRequest: true,
    pickup: true,
    customs: true,
    pod: true,
    tags: ["Fragile", "High Value"],
    remarks: [
      { id: "r3", author: "Mike Ross", text: "Handle with care - electronic components", date: "Sep 20, 09:00 AM" },
    ],
    invoices: [
      { number: "INV-2025-004", date: "9/22/2025 09:00 AM", amount: 2340.00, currency: "USD", status: "PAID", description: "Air freight" },
      { number: "INV-2025-005", date: "9/22/2025 11:00 AM", amount: 180.00, currency: "USD", status: "ISSUED", description: "Handling fees" },
    ],
    containers: [],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false },
      { label: "Pickup", completed: true, active: true, date: "Sep 22, 10:30 AM", location: "Tel Aviv", description: "Cargo collected" },
      { label: "Departed", completed: true, active: false },
      { label: "Arrived", completed: true, active: false },
      { label: "Delivered", completed: true, active: false },
    ],
    events: [
      { title: "Cargo Picked Up", type: "PICKUP", description: "Cargo collected from warehouse", location: "Tel Aviv", date: "Sep 22, 10:30 AM", completed: true },
      { title: "Departed Origin", type: "DEPARTURE", description: "Flight departed from Tel Aviv", location: "Tel Aviv", date: "Sep 22, 10:30 AM", completed: true },
      { title: "Arrived at Destination", type: "ARRIVAL", description: "Flight arrived at Los Angeles", location: "Los Angeles", date: "Sep 23, 02:15 AM", completed: true },
      { title: "Delivered", type: "DELIVERY", description: "Delivered to consignee", location: "Los Angeles", date: "Sep 23, 10:00 AM", completed: true },
    ],
  },
  {
    id: "3",
    fileNumber: "s997567645",
    houseBill: "8XG8945",
    clientRef: "99976865-345634",
    opened: "9/19/2025 11:15 AM",
    transportMode: "Ocean",
    origin: "HAMBURG",
    destination: "SINGAPORE",
    shipper: "GERMAN AUTOMOTIVE GMBH",
    consignee: "ASIA PACIFIC MOTORS",
    exceptions: 0,
    invoiceCount: 4,
    containerCount: 2,
    legs: null,
    etd: "9/23/2025 02:30 PM",
    atd: null,
    eta: "10/24/2025 06:15 AM",
    ata: null,
    lastEvent: "Pickup Scheduled",
    pickupRequest: true,
    pickup: false,
    customs: false,
    pod: false,
    tags: ["Oversized"],
    remarks: [],
    invoices: [
      { number: "INV-2025-006", date: "9/19/2025 10:00 AM", amount: 4500.00, currency: "USD", status: "ISSUED", description: "Ocean freight" },
      { number: "INV-2025-007", date: "9/19/2025 10:30 AM", amount: 800.00, currency: "EUR", status: "ISSUED", description: "Container handling" },
      { number: "INV-2025-008", date: "9/19/2025 11:00 AM", amount: 350.00, currency: "USD", status: "ISSUED", description: "Documentation" },
      { number: "INV-2025-009", date: "9/19/2025 11:30 AM", amount: 220.00, currency: "EUR", status: "ISSUED", description: "Insurance" },
    ],
    containers: [
      { id: "MSCU1234567", type: "40HC" },
      { id: "MSCU7654321", type: "40HC" },
    ],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false, date: "Sep 19, 11:15 AM", location: "Hamburg", description: "Booking confirmed" },
      { label: "Pickup", completed: false, active: true, date: "Sep 23, 02:30 PM", location: "Hamburg Port", description: "Pickup scheduled" },
      { label: "Departed", completed: false, active: false },
      { label: "Arrived", completed: false, active: false },
      { label: "Delivered", completed: false, active: false },
    ],
    events: [
      { title: "Booking Confirmed", type: "PICKUP", description: "Ocean freight booking confirmed", location: "Hamburg", date: "Sep 19, 11:15 AM", completed: true },
      { title: "Pickup Scheduled", type: "PICKUP", description: "Container pickup scheduled at port", location: "Hamburg Port", date: "Sep 23, 02:30 PM", completed: false },
    ],
  },
  {
    id: "4",
    fileNumber: "s4575675234",
    houseBill: "8XG8948",
    clientRef: "11234323-345634",
    opened: "9/16/2025 07:30 AM",
    transportMode: "Rail",
    origin: "BEIJING",
    destination: "HAMBURG",
    shipper: "BEIJING MACHINERY INC",
    consignee: "GERMAN INDUSTRIAL GMBH",
    exceptions: 2,
    invoiceCount: 5,
    containerCount: 3,
    legs: null,
    etd: "9/19/2025 05:00 AM",
    atd: "9/19/2025 07:15 AM",
    eta: "10/2/2025 12:00 PM",
    ata: null,
    lastEvent: "In Transit",
    pickupRequest: true,
    pickup: true,
    customs: false,
    pod: false,
    tags: ["Hazardous", "Documents Required"],
    remarks: [
      { id: "r4", author: "Anna Schmidt", text: "Special handling required for hazardous materials", date: "Sep 16, 08:00 AM" },
      { id: "r5", author: "Chen Wei", text: "All export documents submitted", date: "Sep 17, 10:00 AM" },
      { id: "r6", author: "Anna Schmidt", text: "Border crossing delay expected at Alashankou", date: "Sep 22, 03:00 PM" },
    ],
    invoices: [
      { number: "INV-2025-010", date: "9/16/2025 08:00 AM", amount: 6200.00, currency: "USD", status: "PAID", description: "Rail freight" },
      { number: "INV-2025-011", date: "9/16/2025 09:00 AM", amount: 450.00, currency: "USD", status: "PAID", description: "Container loading" },
      { number: "INV-2025-012", date: "9/16/2025 10:00 AM", amount: 320.00, currency: "EUR", status: "ISSUED", description: "Border crossing fees" },
      { number: "INV-2025-013", date: "9/16/2025 11:00 AM", amount: 175.00, currency: "USD", status: "ISSUED", description: "Documentation" },
      { number: "INV-2025-014", date: "9/16/2025 12:00 PM", amount: 280.00, currency: "EUR", status: "OVERDUE", description: "Insurance premium" },
    ],
    containers: [
      { id: "TCKU9876543", type: "40GP" },
      { id: "TCKU1239876", type: "40GP" },
      { id: "TCKU5556789", type: "20GP" },
    ],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false },
      { label: "Pickup", completed: true, active: false },
      { label: "Departed", completed: true, active: true, date: "Sep 19, 07:15 AM", location: "Beijing Rail Terminal", description: "Train departed" },
      { label: "Arrived", completed: false, active: false },
      { label: "Delivered", completed: false, active: false },
    ],
    events: [
      { title: "Cargo Picked Up", type: "PICKUP", description: "Cargo loaded onto rail containers", location: "Beijing", date: "Sep 18, 03:00 PM", completed: true },
      { title: "Departed Origin", type: "DEPARTURE", description: "Train departed Beijing terminal", location: "Beijing Rail Terminal", date: "Sep 19, 07:15 AM", completed: true },
      { title: "Border Crossing", type: "IN_TRANSIT", description: "Crossed China-Kazakhstan border", location: "Alashankou", date: "Sep 22, 11:00 AM", completed: true },
      { title: "In Transit", type: "IN_TRANSIT", description: "Train in transit through Central Asia", location: "Kazakhstan", date: "Sep 25, 08:00 AM", completed: false },
    ],
  },
  {
    id: "5",
    fileNumber: "s978978978",
    houseBill: "8XG8949",
    clientRef: "cc45665-345634",
    opened: "9/15/2025 11:20 AM",
    transportMode: "Air",
    origin: "NEW YORK",
    destination: "LONDON",
    shipper: "US ELECTRONICS CORP",
    consignee: "UK TECH DISTRIBUTORS",
    exceptions: 0,
    invoiceCount: 2,
    containerCount: 0,
    legs: null,
    etd: "9/18/2025 02:00 PM",
    atd: "9/18/2025 01:45 PM",
    eta: "9/18/2025 05:30 PM",
    ata: "9/18/2025 05:15 PM",
    lastEvent: "Delivered",
    pickupRequest: true,
    pickup: true,
    customs: true,
    pod: true,
    tags: [],
    remarks: [
      { id: "r7", author: "James Brown", text: "Standard delivery, no special requirements", date: "Sep 15, 12:00 PM" },
    ],
    invoices: [
      { number: "INV-2025-015", date: "9/15/2025 12:00 PM", amount: 1850.00, currency: "USD", status: "PAID", description: "Air freight charges" },
      { number: "INV-2025-016", date: "9/15/2025 01:00 PM", amount: 195.00, currency: "GBP", status: "PAID", description: "UK customs clearance" },
    ],
    containers: [],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false },
      { label: "Pickup", completed: true, active: false },
      { label: "Departed", completed: true, active: false },
      { label: "Arrived", completed: true, active: false },
      { label: "Delivered", completed: true, active: false, date: "Sep 18, 07:00 PM", location: "London", description: "Delivered to consignee" },
    ],
    events: [
      { title: "Cargo Picked Up", type: "PICKUP", description: "Cargo collected from shipper", location: "New York", date: "Sep 17, 09:00 AM", completed: true },
      { title: "Departed Origin", type: "DEPARTURE", description: "Flight departed JFK", location: "New York", date: "Sep 18, 01:45 PM", completed: true },
      { title: "Arrived at Destination", type: "ARRIVAL", description: "Flight arrived at Heathrow", location: "London", date: "Sep 18, 05:15 PM", completed: true },
      { title: "Customs Cleared", type: "CUSTOMS", description: "UK customs clearance completed", location: "London", date: "Sep 18, 06:30 PM", completed: true },
      { title: "Delivered", type: "DELIVERY", description: "Delivered to consignee", location: "London", date: "Sep 18, 07:00 PM", completed: true },
    ],
  },
];
