export interface Shipment {
  id: string;
  fileNumber: string;
  houseBill: string;
  masterBill: string;
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
  "HONG KONG": "🇭🇰", "TEL AVIV": "🇮🇱", "LOS ANGELES": "🇺🇸", "HAMBURG": "🇩🇪",
  "SINGAPORE": "🇸🇬", "BEIJING": "🇨🇳", "NEW YORK": "🇺🇸", "LONDON": "🇬🇧",
  "SHANGHAI": "🇨🇳", "TOKYO": "🇯🇵", "DUBAI": "🇦🇪", "ROTTERDAM": "🇳🇱",
  "MUMBAI": "🇮🇳", "SYDNEY": "🇦🇺", "BUSAN": "🇰🇷", "ISTANBUL": "🇹🇷",
  "SAO PAULO": "🇧🇷", "VANCOUVER": "🇨🇦", "CAPE TOWN": "🇿🇦", "BANGKOK": "🇹🇭",
  "JEDDAH": "🇸🇦", "ANTWERP": "🇧🇪", "PIRAEUS": "🇬🇷", "GENOA": "🇮🇹",
  "MARSEILLE": "🇫🇷", "CHITTAGONG": "🇧🇩", "LAEM CHABANG": "🇹🇭",
  "FELIXSTOWE": "🇬🇧", "SANTOS": "🇧🇷", "HAIFA": "🇮🇱",
};

export const CITY_CODES: Record<string, string> = {
  "HONG KONG": "HKG", "TEL AVIV": "TLV", "LOS ANGELES": "LAX", "HAMBURG": "HAM",
  "SINGAPORE": "SIN", "BEIJING": "PEK", "NEW YORK": "JFK", "LONDON": "LHR",
  "SHANGHAI": "SHA", "TOKYO": "NRT", "DUBAI": "DXB", "ROTTERDAM": "RTM",
  "MUMBAI": "BOM", "SYDNEY": "SYD", "BUSAN": "PUS", "ISTANBUL": "IST",
  "SAO PAULO": "GRU", "VANCOUVER": "YVR", "CAPE TOWN": "CPT", "BANGKOK": "BKK",
  "JEDDAH": "JED", "ANTWERP": "ANR", "PIRAEUS": "PIR", "GENOA": "GOA",
  "MARSEILLE": "MRS", "CHITTAGONG": "CGP", "LAEM CHABANG": "LCB",
  "FELIXSTOWE": "FXT", "SANTOS": "SSZ", "HAIFA": "HFA",
};

export const COUNTRY_CODES: Record<string, string> = {
  "HONG KONG": "HK", "TEL AVIV": "IL", "LOS ANGELES": "US", "HAMBURG": "DE",
  "SINGAPORE": "SG", "BEIJING": "CN", "NEW YORK": "US", "LONDON": "UK",
  "SHANGHAI": "CN", "TOKYO": "JP", "DUBAI": "AE", "ROTTERDAM": "NL",
  "MUMBAI": "IN", "SYDNEY": "AU", "BUSAN": "KR", "ISTANBUL": "TR",
  "SAO PAULO": "BR", "VANCOUVER": "CA", "CAPE TOWN": "ZA", "BANGKOK": "TH",
  "JEDDAH": "SA", "ANTWERP": "BE", "PIRAEUS": "GR", "GENOA": "IT",
  "MARSEILLE": "FR", "CHITTAGONG": "BD", "LAEM CHABANG": "TH",
  "FELIXSTOWE": "UK", "SANTOS": "BR", "HAIFA": "IL",
};

// Helper to generate a basic shipment quickly
function gen(
  id: string, fileNumber: string, houseBill: string, clientRef: string, opened: string,
  mode: "Air" | "Ocean" | "Rail", origin: string, destination: string,
  shipper: string, consignee: string, exceptions: number, invoiceCount: number,
  containerCount: number, etd: string, atd: string | null, eta: string, ata: string | null,
  lastEvent: string, pr: boolean, pu: boolean, cu: boolean, pod: boolean, tags: string[],
): Shipment {
  const completedAll = lastEvent === "Delivered";
  const inTransit = lastEvent === "In Transit";
  return {
    id, fileNumber, houseBill, masterBill: `M: ${houseBill.slice(0,3)}${id.padStart(3,'0')}`,
    clientRef, opened, transportMode: mode, origin, destination,
    shipper, consignee, exceptions, invoiceCount, containerCount, legs: null, etd, atd, eta, ata,
    lastEvent, pickupRequest: pr, pickup: pu, customs: cu, pod,
    tags, remarks: [], invoices: [],
    containers: containerCount > 0
      ? Array.from({ length: containerCount }, (_, i) => ({ id: `CNTR${id}${i}`, type: i % 2 === 0 ? "40HC" : "20GP" }))
      : [],
    statusSteps: [
      { label: "Order Accepted", completed: true, active: false },
      { label: "Pickup", completed: pu, active: !pu && pr },
      { label: "Departed", completed: !!atd, active: inTransit },
      { label: "Arrived", completed: !!ata, active: false },
      { label: "Delivered", completed: completedAll, active: false },
    ],
    events: [
      { title: "Booking Confirmed", type: "PICKUP", description: "Shipment booked", location: origin, date: opened.split(" ")[0], completed: true },
      ...(pu ? [{ title: "Cargo Picked Up", type: "PICKUP" as const, description: "Picked up from shipper", location: origin, date: etd.split(" ")[0], completed: true }] : []),
      ...(atd ? [{ title: "Departed Origin", type: "DEPARTURE" as const, description: `Departed ${origin}`, location: origin, date: atd.split(" ")[0], completed: true }] : []),
      ...(ata ? [{ title: "Arrived at Dest", type: "ARRIVAL" as const, description: `Arrived at ${destination}`, location: destination, date: ata.split(" ")[0], completed: true }] : []),
      ...(completedAll ? [{ title: "Delivered", type: "DELIVERY" as const, description: "Delivered to consignee", location: destination, date: ata?.split(" ")[0] || "", completed: true }] : []),
    ],
  };
}

const originalShipments: Shipment[] = [
  {
    id: "1",
    fileNumber: "s457567567",
    houseBill: "8XG8943",
    masterBill: "M: 001299-AX",
    clientRef: "345345345-345634",
    opened: "9/21/2025 06:54 AM",
    transportMode: "Air",
    origin: "HONG KONG",
    destination: "TEL AVIV",
    shipper: "MELLANOX TECHNOLOGIES LTD",
    consignee: "MELLANOX TECHNOLOGIES LTD",
    exceptions: 0, invoiceCount: 3, containerCount: 0, legs: null,
    etd: "9/21/2025 07:00 AM", atd: "9/21/2025 06:45 AM", eta: "9/21/2025 06:00 PM", ata: "9/21/2025 05:30 PM",
    lastEvent: "Delivered", pickupRequest: true, pickup: true, customs: true, pod: true,
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
    masterBill: "M: 445611-ZY",
    clientRef: "234232-345634",
    opened: "9/20/2025 08:30 AM",
    transportMode: "Air",
    origin: "TEL AVIV",
    destination: "LOS ANGELES",
    shipper: "TECH SOLUTIONS INC",
    consignee: "AMERICAN TECH CORP",
    exceptions: 1, invoiceCount: 2, containerCount: 0, legs: null,
    etd: "9/22/2025 09:15 AM", atd: "9/22/2025 10:30 AM", eta: "9/22/2025 08:45 PM", ata: "9/23/2025 02:15 AM",
    lastEvent: "Delivered", pickupRequest: true, pickup: true, customs: true, pod: true,
    tags: ["Fragile", "High Value"],
    remarks: [{ id: "r3", author: "Mike Ross", text: "Handle with care - electronic components", date: "Sep 20, 09:00 AM" }],
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
    masterBill: "M: 223399-BJ",
    clientRef: "99976865-345634",
    opened: "9/19/2025 11:15 AM",
    transportMode: "Ocean",
    origin: "HAMBURG",
    destination: "SINGAPORE",
    shipper: "GERMAN AUTOMOTIVE GMBH",
    consignee: "ASIA PACIFIC MOTORS",
    exceptions: 0, invoiceCount: 4, containerCount: 2, legs: null,
    etd: "9/23/2025 02:30 PM", atd: null, eta: "10/24/2025 06:15 AM", ata: null,
    lastEvent: "Pickup Scheduled", pickupRequest: true, pickup: false, customs: false, pod: false,
    tags: ["Oversized"],
    remarks: [],
    invoices: [
      { number: "INV-2025-006", date: "9/19/2025 10:00 AM", amount: 4500.00, currency: "USD", status: "ISSUED", description: "Ocean freight" },
      { number: "INV-2025-007", date: "9/19/2025 10:30 AM", amount: 800.00, currency: "EUR", status: "ISSUED", description: "Container handling" },
      { number: "INV-2025-008", date: "9/19/2025 11:00 AM", amount: 350.00, currency: "USD", status: "ISSUED", description: "Documentation" },
      { number: "INV-2025-009", date: "9/19/2025 11:30 AM", amount: 220.00, currency: "EUR", status: "ISSUED", description: "Insurance" },
    ],
    containers: [{ id: "MSCU1234567", type: "40HC" }, { id: "MSCU7654321", type: "40HC" }],
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
    masterBill: "M: 887766-CM",
    clientRef: "11234323-345634",
    opened: "9/16/2025 07:30 AM",
    transportMode: "Rail",
    origin: "BEIJING",
    destination: "HAMBURG",
    shipper: "BEIJING MACHINERY INC",
    consignee: "GERMAN INDUSTRIAL GMBH",
    exceptions: 2, invoiceCount: 5, containerCount: 3, legs: null,
    etd: "9/19/2025 05:00 AM", atd: "9/19/2025 07:15 AM", eta: "10/2/2025 12:00 PM", ata: null,
    lastEvent: "In Transit", pickupRequest: true, pickup: true, customs: false, pod: false,
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
    containers: [{ id: "TCKU9876543", type: "40GP" }, { id: "TCKU1239876", type: "40GP" }, { id: "TCKU5556789", type: "20GP" }],
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
    exceptions: 0, invoiceCount: 2, containerCount: 0, legs: null,
    etd: "9/18/2025 02:00 PM", atd: "9/18/2025 01:45 PM", eta: "9/18/2025 05:30 PM", ata: "9/18/2025 05:15 PM",
    lastEvent: "Delivered", pickupRequest: true, pickup: true, customs: true, pod: true,
    tags: [],
    remarks: [{ id: "r7", author: "James Brown", text: "Standard delivery, no special requirements", date: "Sep 15, 12:00 PM" }],
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

// Generate 30 additional shipments
const additionalShipments: Shipment[] = [
  gen("6","s112233001","9AB1001","CLI-60001","9/22/2025 09:10 AM","Ocean","SHANGHAI","ROTTERDAM","SHANGHAI TEXTILES CO","EURO FASHION GROUP",0,2,2,"9/25/2025 06:00 AM","9/25/2025 06:30 AM","10/20/2025 08:00 AM",null,"In Transit",true,true,false,false,["Priority"]),
  gen("7","s112233002","9AB1002","CLI-60002","9/20/2025 02:15 PM","Air","TOKYO","NEW YORK","NIPPON ELECTRONICS","ATLANTIC IMPORTS LLC",0,1,0,"9/22/2025 11:00 AM","9/22/2025 11:20 AM","9/22/2025 10:00 PM","9/22/2025 09:45 PM","Delivered",true,true,true,true,[]),
  gen("8","s112233003","9AB1003","CLI-60003","9/18/2025 07:45 AM","Ocean","DUBAI","MUMBAI","GULF TRADING FZE","INDIA IMPORTS PVT LTD",1,3,1,"9/21/2025 04:00 PM",null,"10/1/2025 09:00 AM",null,"Pickup Scheduled",true,false,false,false,["Temperature Controlled"]),
  gen("9","s112233004","9AB1004","CLI-60004","9/17/2025 10:30 AM","Rail","HAMBURG","BEIJING","BOSCH LOGISTICS GMBH","CHINA MACHINERY CORP",0,2,2,"9/20/2025 08:00 AM","9/20/2025 08:30 AM","10/5/2025 02:00 PM",null,"In Transit",true,true,false,false,["Documents Required"]),
  gen("10","s112233005","9AB1005","CLI-60005","9/23/2025 01:00 PM","Air","SINGAPORE","SYDNEY","SEA LOGISTICS PTE","AUSSIE IMPORTS PTY",0,1,0,"9/24/2025 06:00 AM","9/24/2025 06:15 AM","9/24/2025 02:30 PM","9/24/2025 02:20 PM","Delivered",true,true,true,true,["VIP Client"]),
  gen("11","s112233006","9AB1006","CLI-60006","9/19/2025 08:00 AM","Ocean","BUSAN","LOS ANGELES","KOREAN AUTO PARTS CO","PACIFIC MOTORS INC",2,4,3,"9/23/2025 10:00 AM","9/23/2025 10:30 AM","10/15/2025 07:00 AM",null,"In Transit",true,true,false,false,["Oversized","High Value"]),
  gen("12","s112233007","9AB1007","CLI-60007","9/21/2025 03:30 PM","Air","LONDON","DUBAI","BRITISH PHARMA LTD","GULF HEALTH FZE",0,2,0,"9/23/2025 09:00 AM","9/23/2025 08:50 AM","9/23/2025 06:00 PM","9/23/2025 05:45 PM","Delivered",true,true,true,true,["Perishable","Temperature Controlled"]),
  gen("13","s112233008","9AB1008","CLI-60008","9/16/2025 11:45 AM","Ocean","ISTANBUL","SAO PAULO","TURKISH CERAMICS AS","BRAZIL DECOR LTDA",1,3,2,"9/20/2025 02:00 PM","9/20/2025 03:00 PM","10/18/2025 11:00 AM",null,"In Transit",true,true,false,false,["Fragile"]),
  gen("14","s112233009","9AB1009","CLI-60009","9/22/2025 06:00 AM","Air","TEL AVIV","SINGAPORE","ISRAELTECH LTD","SG INNOVATIONS PTE",0,1,0,"9/24/2025 01:00 PM","9/24/2025 01:10 PM","9/25/2025 05:00 AM","9/25/2025 04:50 AM","Delivered",true,true,true,true,["Urgent"]),
  gen("15","s112233010","9AB1010","CLI-60010","9/15/2025 09:20 AM","Rail","BEIJING","HAMBURG","CHINA STEEL CORP","GERMAN METALS AG",0,3,4,"9/18/2025 06:00 AM","9/18/2025 06:45 AM","10/3/2025 10:00 AM",null,"In Transit",true,true,false,false,["Hazardous"]),
  gen("16","s112233011","9AB1011","CLI-60011","9/23/2025 04:15 PM","Air","VANCOUVER","TOKYO","CANADIAN LUMBER INC","JAPAN CONSTRUCTION CO",0,2,0,"9/25/2025 08:00 AM",null,"9/25/2025 04:00 PM",null,"Pickup Scheduled",true,false,false,false,["Oversized"]),
  gen("17","s112233012","9AB1012","CLI-60012","9/14/2025 07:00 AM","Ocean","ROTTERDAM","SHANGHAI","DUTCH CHEMICALS BV","EAST CHINA CHEMICAL",0,2,1,"9/18/2025 12:00 PM","9/18/2025 12:30 PM","10/16/2025 09:00 AM",null,"In Transit",true,true,false,false,["Hazardous","Documents Required"]),
  gen("18","s112233013","9AB1013","CLI-60013","9/20/2025 12:00 PM","Air","MUMBAI","LONDON","TATA EXPORTS LTD","UK TRADE PARTNERS",1,2,0,"9/22/2025 03:00 AM","9/22/2025 03:15 AM","9/22/2025 09:00 AM","9/22/2025 08:50 AM","Delivered",true,true,true,true,["Sample"]),
  gen("19","s112233014","9AB1014","CLI-60014","9/18/2025 02:30 PM","Ocean","CAPE TOWN","ROTTERDAM","SA WINES EXPORT","EUROPEAN DISTRIBUTORS BV",0,3,2,"9/22/2025 11:00 AM","9/22/2025 11:30 AM","10/12/2025 06:00 AM",null,"In Transit",true,true,false,false,["Temperature Controlled","Perishable"]),
  gen("20","s112233015","9AB1015","CLI-60015","9/21/2025 10:00 AM","Air","HONG KONG","TOKYO","HK FASHION GROUP","JAPAN RETAIL CORP",0,1,0,"9/23/2025 07:00 AM","9/23/2025 07:10 AM","9/23/2025 12:00 PM","9/23/2025 11:50 AM","Delivered",true,true,true,true,[]),
  gen("21","s112233016","9AB1016","CLI-60016","9/19/2025 05:30 PM","Rail","SHANGHAI","HAMBURG","YANGTZE MACHINERY","WEST EURO MACHINES GMBH",0,2,2,"9/22/2025 09:00 AM","9/22/2025 09:30 AM","10/7/2025 08:00 AM",null,"In Transit",true,true,false,false,["High Value"]),
  gen("22","s112233017","9AB1017","CLI-60017","9/22/2025 08:45 AM","Ocean","SINGAPORE","JEDDAH","ASEAN FOOD PTE","SAUDI FOOD IMPORTS",0,2,1,"9/26/2025 03:00 PM",null,"10/10/2025 11:00 AM",null,"Pickup Scheduled",true,false,false,false,["Perishable"]),
  gen("23","s112233018","9AB1018","CLI-60018","9/17/2025 01:00 PM","Air","NEW YORK","TEL AVIV","AMERICAN DEFENSE INC","RAFAEL SYSTEMS LTD",0,1,0,"9/19/2025 10:00 AM","9/19/2025 10:05 AM","9/19/2025 11:00 PM","9/19/2025 10:50 PM","Delivered",true,true,true,true,["Priority","VIP Client"]),
  gen("24","s112233019","9AB1019","CLI-60019","9/16/2025 09:15 AM","Ocean","ANTWERP","BANGKOK","BELGIUM CHOCO NV","THAI CONFECTIONERY CO",1,3,1,"9/20/2025 07:00 AM","9/20/2025 07:15 AM","10/14/2025 04:00 PM",null,"In Transit",true,true,false,false,["Temperature Controlled"]),
  gen("25","s112233020","9AB1020","CLI-60020","9/23/2025 11:30 AM","Air","DUBAI","LONDON","EMIRATES LOGISTICS","BRITISH IMPORT HOUSE",0,2,0,"9/25/2025 02:00 PM",null,"9/25/2025 07:00 PM",null,"Pickup Scheduled",true,false,false,false,[]),
  gen("26","s112233021","9AB1021","CLI-60021","9/14/2025 06:00 AM","Ocean","LOS ANGELES","SHANGHAI","US AGRI EXPORTS","CHINA FOOD IMPORTS CO",0,4,3,"9/18/2025 05:00 AM","9/18/2025 05:30 AM","10/8/2025 09:00 AM",null,"In Transit",true,true,false,false,["Perishable","Bonded"]),
  gen("27","s112233022","9AB1022","CLI-60022","9/20/2025 03:00 PM","Air","HAMBURG","NEW YORK","LUFTHANSA CARGO","FEDEX SUPPLY CHAIN",0,1,0,"9/22/2025 12:00 PM","9/22/2025 12:10 PM","9/22/2025 04:00 PM","9/22/2025 03:50 PM","Delivered",true,true,true,true,["Urgent"]),
  gen("28","s112233023","9AB1023","CLI-60023","9/15/2025 08:30 AM","Rail","ISTANBUL","BEIJING","TURKISH MINERALS AS","CHINA RESOURCES LTD",2,3,2,"9/19/2025 07:00 AM","9/19/2025 07:30 AM","10/6/2025 11:00 AM",null,"In Transit",true,true,false,false,["Hazardous"]),
  gen("29","s112233024","9AB1024","CLI-60024","9/22/2025 07:00 AM","Ocean","PIRAEUS","MUMBAI","GREEK OLIVE OIL CO","INDIA GOURMET IMPORTS",0,2,1,"9/26/2025 08:00 AM",null,"10/15/2025 06:00 PM",null,"Pickup Scheduled",true,false,false,false,["Perishable"]),
  gen("30","s112233025","9AB1025","CLI-60025","9/18/2025 04:00 PM","Air","SYDNEY","SINGAPORE","KANGAROO TECH PTY","SG DIGITAL PTE",0,1,0,"9/20/2025 09:00 AM","9/20/2025 09:10 AM","9/20/2025 03:00 PM","9/20/2025 02:55 PM","Delivered",true,true,true,true,["Return Shipment"]),
  gen("31","s112233026","9AB1026","CLI-60026","9/13/2025 10:00 AM","Ocean","GENOA","SANTOS","ITALIAN MARBLE SRL","BRAZIL CONSTRUCTION SA",0,3,2,"9/17/2025 02:00 PM","9/17/2025 02:30 PM","10/9/2025 10:00 AM",null,"In Transit",true,true,false,false,["Fragile","Oversized"]),
  gen("32","s112233027","9AB1027","CLI-60027","9/21/2025 01:15 PM","Air","TOKYO","LONDON","SONY LOGISTICS JP","UK ELECTRONICS DIST",0,2,0,"9/23/2025 05:00 AM","9/23/2025 05:10 AM","9/23/2025 12:00 PM","9/23/2025 11:55 AM","Delivered",true,true,true,true,["High Value","Fragile"]),
  gen("33","s112233028","9AB1028","CLI-60028","9/19/2025 06:30 AM","Rail","HAMBURG","SHANGHAI","SIEMENS LOGISTICS","CHINA ELECTRIC CORP",0,2,3,"9/22/2025 04:00 AM","9/22/2025 04:30 AM","10/8/2025 01:00 PM",null,"In Transit",true,true,false,false,["Documents Required"]),
  gen("34","s112233029","9AB1029","CLI-60029","9/23/2025 09:00 AM","Ocean","MARSEILLE","CHITTAGONG","FRENCH TEXTILES SA","BANGLADESH GARMENTS LTD",1,2,1,"9/27/2025 10:00 AM",null,"10/22/2025 07:00 AM",null,"Pickup Scheduled",true,false,false,false,[]),
  gen("35","s112233030","9AB1030","CLI-60030","9/17/2025 12:30 PM","Air","BEIJING","DUBAI","AIR CHINA CARGO","DUBAI ELECTRONICS FZE",0,1,0,"9/19/2025 11:00 PM","9/19/2025 11:15 PM","9/20/2025 05:00 AM","9/20/2025 04:50 AM","Delivered",true,true,true,true,["VIP Client"]),
];

export const mockShipments: Shipment[] = [...originalShipments, ...additionalShipments];
