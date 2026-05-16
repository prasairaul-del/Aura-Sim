export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: "Fleet" | "Operations" | "Marketing" | "Staff" | "VIP Services";
  amount: number;
  type: "income" | "expense";
}

export interface Vehicle {
  id: string;
  model: string;
  status: "available" | "in-service" | "maintenance";
  health: number; // 0-100
  lastService: string;
  revenueGenerated: number;
  totalServiceHours: number;
  maintenanceCosts: number; // Track total maintenance costs for this vehicle
}

export interface SimulationState {
  fleet: Vehicle[];
  transactions: Transaction[];
  totalBalance: number;
  fleetHealth: number;
  operationalEfficiency: number;
  isSimulating: boolean;
  customers: Customer[];
  bookings: Booking[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: "standard" | "gold" | "platinum";
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  notes?: string;
}
