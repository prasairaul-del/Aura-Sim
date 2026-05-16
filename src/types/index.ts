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
}

export interface SimulationState {
  fleet: Vehicle[];
  transactions: Transaction[];
  totalBalance: number;
  fleetHealth: number;
  operationalEfficiency: number;
  isSimulating: boolean;
}
