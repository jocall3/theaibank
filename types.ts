export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'scheduled_expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  carbonFootprint?: number;
  isScheduled?: boolean;
  scheduledRule?: any;
}

export interface Asset {
  name: string;
  value: number;
  color: string;
  esgRating?: number;
  description?: string;
  performanceYTD?: number;
  id?: string;
  category?: string;
  lastUpdated?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  chartData?: { name: string; value: number }[];
}

export interface BudgetCategory {
    id: string;
    name: string;
    limit: number;
    spent: number;
    color: string;
}

export interface GamificationState {
    score: number;
    level: number;
    levelName: string;
    progress: number;
    credits: number;
}

export interface AIPlanStep {
    title: string;
    description: string;
    timeline: string;
    category?: string;
}

export interface AIPlan {
    title: string;
    summary: string;
    steps: AIPlanStep[];
    monthlyContribution?: number;
    feasibilitySummary?: string;
    actionableSteps?: string[];
}

export type IllusionType = 'none' | 'aurora';

export interface LinkedAccount {
  id: string;
  name: string;
  mask: string;
  institution?: string;
  balance?: number;
  type?: string;
  subtype?: string;
  status?: 'active' | 'error' | 'disconnected';
  lastUpdated?: string;
}

export const View = {
  Dashboard: 'Dashboard',
  Transactions: 'Transactions',
  SendMoney: 'Send Money',
  Budgets: 'Budgets',
  FinancialGoals: 'Financial Goals',
  CreditHealth: 'Credit Health',
  Investments: 'Investments',
  CryptoWeb3: 'Crypto & Web3',
  AlgoTradingLab: 'Algo-Trading Lab',
  ForexArena: 'Forex Arena',
  CommoditiesExchange: 'Commodities Exchange',
  RealEstateEmpire: 'Real Estate Empire',
  ArtCollectibles: 'Art & Collectibles',
  DerivativesDesk: 'Derivatives Desk',
  VentureCapital: 'Venture Capital',
  PrivateEquity: 'Private Equity',
  TaxOptimization: 'Tax Optimization',
  LegacyBuilder: 'Legacy Builder',
  CorporateCommand: 'Corporate Command',
  ModernTreasury: 'Modern Treasury',
  CardPrograms: 'Card Programs',
  DataNetwork: 'Data Network',
  Payments: 'Payments',
  SSO: 'SSO',
  AIAdvisor: 'AI Advisor',
  QuantumWeaver: 'Quantum Weaver',
  AgentMarketplace: 'Agent Marketplace',
  AIAdStudio: 'AI Ad Studio',
  CardCustomization: 'Card Customization',
  FinancialDemocracy: 'Financial Democracy',
  OpenBanking: 'Open Banking',
  APIStatus: 'API Status',
  ConciergeService: 'Concierge Service',
  Philanthropy: 'Philanthropy',
  SovereignWealth: 'Sovereign Wealth',
  SecurityCenter: 'Security Center',
  Personalization: 'Personalization',
  TheVision: 'The Vision',
  Settings: 'Settings'
} as const;

export type View = typeof View[keyof typeof View];

export const WeaverStage = {
  initial: 'initial',
  analyzing: 'analyzing',
  planning: 'planning',
  complete: 'complete',
  error: 'error'
} as const;

export type WeaverStage = typeof WeaverStage[keyof typeof WeaverStage];

export type QuantumWeaverState = any;
export type AIQuestion = any;
export type Subscription = any;
export type CreditScore = { score: number; history: { date: string; score: number }[] };
export type UpcomingBill = any;
export type SavingsGoal = any;
export type MarketMover = any;
export type MarketplaceProduct = any;
export type FinancialGoal = any;
export type AIGoalPlan = any;
export type CryptoAsset = any;
export type VirtualCard = any;
export type PaymentOperation = any;
export type CorporateCard = any;
export type CorporateTransaction = any;
export type RewardPoints = any;
export type Notification = any;
export type NFTAsset = any;
export type RewardItem = any;
export type APIStatus = any;
export type CreditFactor = { id: string; name: string; status: 'Good' | 'Fair' | 'Poor'; impact: string; };
export type CorporateCardControls = any;
export type Counterparty = any;
export type PaymentOrder = any;
export type Invoice = any;
export type ComplianceCase = any;
export type LedgerAccount = any;
export type UserPreferences = any;
export type RecurringContribution = any;
export type Contribution = any;
export type LinkedGoal = any;
export type EIP6963ProviderDetail = any;
export type CompanyProfile = any;
export type RealEstateProperty = any;
export type ArtPiece = any;
export type AlgoStrategy = any;
export type VentureStartup = any;
export type DetectedSubscription = any;
export type StripeBalance = any;
export type StripeCharge = any;
export type LoginActivity = any;
export type Device = any;
export type DataSharingPolicy = any;
export type TransactionRule = any;
export type ThreatAlert = any;
export type AuditLogEntry = any;
export type APIKey = any;
export type TrustedContact = any;
export type SecurityAwarenessModule = any;
export type SecurityScoreMetric = any;
export type MarqetaCardProgram = any;
export type MarqetaCardholder = any;