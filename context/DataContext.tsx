import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Transaction, Asset, BudgetCategory, GamificationState, IllusionType, LinkedAccount, QuantumWeaverState, AIPlan, AIQuestion, Subscription, CreditScore, UpcomingBill, SavingsGoal, MarketMover, MarketplaceProduct, FinancialGoal, AIGoalPlan, CryptoAsset, VirtualCard, PaymentOperation, AIInsight, CorporateCard, CorporateTransaction, RewardPoints, Notification, NFTAsset, RewardItem, APIStatus, CreditFactor, CorporateCardControls, Counterparty, PaymentOrder, Invoice, ComplianceCase, LedgerAccount, UserPreferences, RecurringContribution, Contribution, LinkedGoal, EIP6963ProviderDetail, CompanyProfile, RealEstateProperty, ArtPiece, AlgoStrategy, VentureStartup, WalletInfo, Recipient, Currency, SecurityProfile, PlaidMetadata } from '../types';
import { View, WeaverStage } from '../types';
// FIX: Removed import from empty mockData.ts file. All initial state will be handled within this file.

const LEVEL_NAMES = ["Financial Novice", "Budgeting Apprentice", "Savings Specialist", "Investment Adept", "Wealth Master"];
const SCORE_PER_LEVEL = 200;

// --- Generator function implementation (1/4) ---
const SECTORS = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Goods', 'Real Estate', 'Industrials', 'Utilities'];
const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f'];

const generateProsperityCompanies = (): CompanyProfile[] => {
    const companies: CompanyProfile[] = [];
    for (let i = 1; i <= 100; i++) {
        const sectorIndex = i % SECTORS.length;
        const sector = SECTORS[sectorIndex];
        const color = COLORS[sectorIndex];
        const marketCap = parseFloat((Math.random() * 500 + 1).toFixed(2)); // $1B to $500B
        const peRatio = parseFloat((Math.random() * 30 + 10).toFixed(2));
        const ytdGrowth = parseFloat((Math.random() * 50 - 10).toFixed(2)); // -10% to 40%
        
        // Define mock types based on assumption of CompanyProfile structure
        type Status = 'High Growth' | 'Stable' | 'Turnaround';
        type RiskRating = 'Low' | 'Medium' | 'High';

        let status: Status;
        let riskRating: RiskRating;

        if (ytdGrowth > 15 && peRatio < 25) {
            status = 'High Growth';
            riskRating = 'Medium';
        } else if (ytdGrowth < 0) {
            status = 'Turnaround';
            riskRating = 'High';
        } else {
            status = 'Stable';
            riskRating = 'Low';
        }

        companies.push({
            id: `comp_${i}`,
            name: `${sector} Corp ${i}`,
            ticker: `TKR${Math.floor(100 + Math.random() * 900)}`,
            sector,
            marketCap,
            peRatio,
            ytdGrowth,
            status,
            riskRating,
            color,
        } as CompanyProfile);
    }
    return companies;
};

interface IDataContext {
  transactions: Transaction[];
  assets: Asset[];
  impactInvestments: Asset[];
  budgets: BudgetCategory[];
  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void;
  gamification: GamificationState;
  impactData: {
    treesPlanted: number;
    spendingForNextTree: number;
    progressToNextTree: number;
  };
  customBackgroundUrl: string | null;
  setCustomBackgroundUrl: (url: string) => void;
  addTransaction: (tx: Transaction) => void;
  activeIllusion: IllusionType;
  setActiveIllusion: (illusion: IllusionType) => void;
  linkedAccounts: LinkedAccount[];
  unlinkAccount: (id: string) => void;
  handlePlaidSuccess: (publicToken: string, metadata: PlaidMetadata) => void;
  weaverState: QuantumWeaverState;
  pitchBusinessPlan: (plan: string) => Promise<void>;
  simulateTestPass: () => Promise<void>;
  subscriptions: Subscription[];
  creditScore: CreditScore;
  upcomingBills: UpcomingBill[];
  savingsGoals: SavingsGoal[];
  marketMovers: MarketMover[];
  financialGoals: FinancialGoal[];
  addFinancialGoal: (goalData: Omit<FinancialGoal, 'id' | 'plan' | 'currentAmount' | 'contributions' | 'recurringContributions' | 'linkedGoals' | 'status'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  generateGoalPlan: (goalId: string) => Promise<void>;
  cryptoAssets: CryptoAsset[];
  paymentOperations: PaymentOperation[];
  walletInfo: WalletInfo | null;
  virtualCard: VirtualCard | null;
  connectWallet: (providerDetail: EIP6963ProviderDetail) => Promise<void>;
  disconnectWallet: () => void;
  detectedProviders: EIP6963ProviderDetail[];
  issueCard: () => void;
  buyCrypto: (usdAmount: number, cryptoTicker: string) => void;
  aiInsights: AIInsight[];
  isInsightsLoading: boolean;
  corporateCards: CorporateCard[];
  corporateTransactions: CorporateTransaction[];
  toggleCorporateCardFreeze: (cardId: string) => void;
  updateCorporateCard: (cardId: string, newControls: CorporateCardControls, newFrozenState: boolean) => void;
  rewardPoints: RewardPoints;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  isImportingData: boolean;
  nftAssets: NFTAsset[];
  mintNFT: (name: string, imageUrl: string) => void;
  mintToken: (name: string, ticker: string, amount: number) => void;
  initiatePayment: (details: Omit<PaymentOperation, 'id' | 'status' | 'date'>) => void;
  rewardItems: RewardItem[];
  redeemReward: (item: RewardItem) => boolean;
  apiStatus: APIStatus[];
  creditFactors: CreditFactor[];
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string) => void;
  modernTreasuryApiKey: string | null;
  setModernTreasuryApiKey: (key: string) => void;
  modernTreasuryOrganizationId: string | null;
  setModernTreasuryOrganizationId: (id: string) => void;
  // FIX: Add missing API key properties for Plaid, Stripe, and Marqeta dashboards.
  plaidApiKey: string | null;
  setPlaidApiKey: (key: string) => void;
  stripeApiKey: string | null;
  setStripeApiKey: (key: string) => void;
  marqetaApiKey: string | null;
  setMarqetaApiKey: (key: string) => void;
  counterparties: Counterparty[];
  addCounterparty: (data: { name: string, email: string, accountNumber: string, routingNumber: string }) => Promise<void>;
  paymentOrders: PaymentOrder[];
  invoices: Invoice[];
  complianceCases: ComplianceCase[];
  userPreferences: UserPreferences;
  fetchRecipients: () => Promise<Recipient[]>;
  fetchCurrencies: () => Promise<Currency[]>;
  getUserSecurityProfile: () => Promise<SecurityProfile>;
  ledgerAccounts: LedgerAccount[];
  fetchLedgerAccounts: () => Promise<void>;
  isLedgerAccountsLoading: boolean;
  ledgerAccountsError: string | null;
  activeView: View;
  setActiveView: (view: View) => void;
  // Financial Goals Extended Methods
  addContributionToGoal: (goalId: string, amount: number) => void;
  addRecurringContributionToGoal: (goalId: string, contribution: Omit<RecurringContribution, 'id'>) => void;
  updateRecurringContributionInGoal: (goalId: string, contributionId: string, updates: Partial<RecurringContribution>) => void;
  deleteRecurringContributionFromGoal: (goalId: string, contributionId: string) => void;
  updateFinancialGoal: (goalId: string, updates: { targetAmount?: number; targetDate?: string; monthlyContribution?: number }) => void;
  linkGoals: (sourceGoalId: string, targetGoalId: string, relationshipType: LinkedGoal['relationshipType'], triggerAmount?: number) => void;
  unlinkGoals: (sourceGoalId: string, targetGoalId: string) => void;

  // New Prosperity View Data (2/4)
  prosperityCompanies: CompanyProfile[];
  realEstatePortfolio: RealEstateProperty[];
  artCollection: ArtPiece[];
  activeAlgoStrategies: AlgoStrategy[];
  venturePortfolio: VentureStartup[];
  
  // New Sacred Handlers (4/4)
  investInStartup: (id: string, amount: number) => void;
  purchaseRealEstate: (id: string) => void;
  executeTrade: (symbol: string, type: 'BUY' | 'SELL', amount: number) => void;
}

export const DataContext = createContext<IDataContext | undefined>(undefined);

// FIX: Add monthsBetween function to be available in this context.
const monthsBetween = (date1: Date, date2: Date): number => {
    let months;
    months = (date2.getFullYear() - date1.getFullYear()) * 12;
    months -= date1.getMonth();
    months += date2.getMonth();
    if (months < 0 || (months === 0 && date2.getDate() < date1.getDate())) return 0;
    return months;
};

// FIX: Add generateSimpleUUID function for creating new goal IDs.
const generateSimpleUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const COST_PER_TREE = 250;

  // FIX: Initialize state with empty arrays or default objects instead of using mock data from a removed file.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets] = useState<Asset[]>([]);
  const [impactInvestments] = useState<Asset[]>([]);
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [treesPlanted, setTreesPlanted] = useState<number>(12);
  const [spendingForNextTree, setSpendingForNextTree] = useState<number>(170);
  const [gamification, setGamification] = useState<GamificationState>({
      score: 450,
      level: 3,
      levelName: "Savings Specialist",
      progress: 25,
      credits: 225,
  });
  const [customBackgroundUrl, setCustomBackgroundUrlState] = useState<string | null>(() => {
      return localStorage.getItem('customBackgroundUrl');
  });
  const [activeIllusion, setActiveIllusionState] = useState<IllusionType>(
    () => (localStorage.getItem('activeIllusion') as IllusionType) || 'none'
  );
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [weaverState, setWeaverState] = useState<QuantumWeaverState>({
      stage: WeaverStage.Pitch,
      businessPlan: '',
      feedback: '',
      questions: [],
      loanAmount: 0,
      coachingPlan: null,
      error: null,
  });
  const [subscriptions] = useState<Subscription[]>([]);
  const [creditScore] = useState<CreditScore>({ score: 750, change: 5, rating: 'Good' });
  const [upcomingBills] = useState<UpcomingBill[]>([]);
  const [savingsGoals] = useState<SavingsGoal[]>([]);
  const [marketMovers] = useState<MarketMover[]>([]);
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([]);
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([]);
  const [paymentOperations, setPaymentOperations] = useState<PaymentOperation[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [virtualCard, setVirtualCard] = useState<VirtualCard | null>(null);
  const [detectedProviders, setDetectedProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [corporateCards, setCorporateCards] = useState<CorporateCard[]>([]);
  const [corporateTransactions] = useState<CorporateTransaction[]>([]);
  const [rewardPoints, setRewardPoints] = useState<RewardPoints>({ balance: 5280, lastEarned: 150, lastRedeemed: 500, currency: 'SP' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isImportingData, setIsImportingData] = useState(false);
  const [nftAssets, setNftAssets] = useState<NFTAsset[]>([]);
  const [rewardItems] = useState<RewardItem[]>([]);
  const [apiStatus, setApiStatus] = useState<APIStatus[]>([
    { provider: 'Plaid', status: 'Operational', responseTime: 120 },
    { provider: 'Stripe', status: 'Operational', responseTime: 90 },
    { provider: 'Marqeta', status: 'Operational', responseTime: 150 },
    { provider: 'Modern Treasury', status: 'Operational', responseTime: 180 },
    { provider: 'Google Gemini', status: 'Operational', responseTime: 250 },
  ]);
  const [creditFactors] = useState<CreditFactor[]>([]);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string | null>(() => localStorage.getItem('geminiApiKey'));
  const [modernTreasuryApiKey, setModernTreasuryApiKeyState] = useState<string | null>(() => localStorage.getItem('modernTreasuryApiKey'));
  const [modernTreasuryOrganizationId, setModernTreasuryOrganizationIdState] = useState<string | null>(() => localStorage.getItem('modernTreasuryOrganizationId'));
  // FIX: Add state and setters for new API keys
  const [plaidApiKey, setPlaidApiKeyState] = useState<string | null>(() => localStorage.getItem('plaidApiKey'));
  const [stripeApiKey, setStripeApiKeyState] = useState<string | null>(() => localStorage.getItem('stripeApiKey'));
  const [marqetaApiKey, setMarqetaApiKeyState] = useState<string | null>(() => localStorage.getItem('marqetaApiKey'));
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [paymentOrders] = useState<PaymentOrder[]>([]);
  const [invoices] = useState<Invoice[]>([]);
  const [complianceCases] = useState<ComplianceCase[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [isLedgerAccountsLoading, setIsLedgerAccountsLoading] = useState(false);
  const [ledgerAccountsError, setLedgerAccountsError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>(View.Dashboard);

  // New States for Prosperity Views (3/4)
  const [prosperityCompanies] = useState<CompanyProfile[]>(generateProsperityCompanies());
  const [realEstatePortfolio, setRealEstatePortfolio] = useState<RealEstateProperty[]>([]);
  const [artCollection] = useState<ArtPiece[]>([]);
  const [activeAlgoStrategies] = useState<AlgoStrategy[]>([]);
  const [venturePortfolio, setVenturePortfolio] = useState<VentureStartup[]>([]);


  const setGeminiApiKey = (key: string) => {
      localStorage.setItem('geminiApiKey', key);
      setGeminiApiKeyState(key);
  };

  const setModernTreasuryApiKey = (key: string) => {
      localStorage.setItem('modernTreasuryApiKey', key);
      setModernTreasuryApiKeyState(key);
  };

  const setModernTreasuryOrganizationId = (id: string) => {
      localStorage.setItem('modernTreasuryOrganizationId', id);
      setModernTreasuryOrganizationIdState(id);
  };

    // FIX: Add setters for new API keys
    const setPlaidApiKey = (key: string) => {
        localStorage.setItem('plaidApiKey', key);
        setPlaidApiKeyState(key);
    };
    const setStripeApiKey = (key: string) => {
        localStorage.setItem('stripeApiKey', key);
        setStripeApiKeyState(key);
    };
    const setMarqetaApiKey = (key: string) => {
        localStorage.setItem('marqetaApiKey', key);
        setMarqetaApiKeyState(key);
    };

    const addTransaction = useCallback((tx: Transaction) => {
        setTransactions(prev => [tx, ...prev]);
        if (tx.type === 'expense') {
            setSpendingForNextTree(prev => {
                const newSpending = prev + tx.amount;
                if (newSpending >= COST_PER_TREE) {
                    setTreesPlanted(p => p + 1);
                    return newSpending - COST_PER_TREE;
                }
                return newSpending;
            });
            setBudgets(prevBudgets =>
                prevBudgets.map(b =>
                    b.name.toLowerCase() === tx.category.toLowerCase()
                        ? { ...b, spent: b.spent + tx.amount }
                        : b
                )
            );
        }
        setGamification(prev => {
            const newScore = prev.score + (tx.type === 'income' ? 10 : -2);
            const newLevel = Math.floor(newScore / SCORE_PER_LEVEL) + 1;
            return {
                ...prev,
                score: newScore,
                level: newLevel,
                levelName: LEVEL_NAMES[Math.min(newLevel - 1, LEVEL_NAMES.length - 1)],
                progress: (newScore % SCORE_PER_LEVEL) / (SCORE_PER_LEVEL / 100)
            }
        });
    }, []);

  const setCustomBackgroundUrl = (url: string) => {
      localStorage.setItem('customBackgroundUrl', url);
      setCustomBackgroundUrlState(url);
      if(url) setActiveIllusion('none');
  };

  const setActiveIllusion = (illusion: IllusionType) => {
      localStorage.setItem('activeIllusion', illusion);
      setActiveIllusionState(illusion);
      if(illusion !== 'none') setCustomBackgroundUrl(null);
  };
  
  const unlinkAccount = (id: string) => {
    setLinkedAccounts(prev => prev.filter(acc => acc.id !== id));
  };
  
  const handlePlaidSuccess = (publicToken: string, metadata: PlaidMetadata) => {
      console.log("Plaid Success:", { publicToken, metadata });
      const newAccount: LinkedAccount = {
          id: metadata.accounts[0].id,
          name: metadata.institution.name,
          mask: metadata.accounts[0].mask,
      };
      setLinkedAccounts(prev => [...prev, newAccount]);
      setIsImportingData(true);
      setTimeout(() => {
          // Simulate importing some transactions for the new account
          const newTransactions: Transaction[] = [
              { id: `plaid_tx_${Date.now()}_1`, type: 'expense', category: 'Shopping', description: `Purchase at ${metadata.institution.name} Partner`, amount: Math.random() * 100, date: new Date().toISOString().split('T')[0]},
              { id: `plaid_tx_${Date.now()}_2`, type: 'expense', category: 'Dining', description: 'Restaurant near linked bank', amount: Math.random() * 50, date: new Date(Date.now() - 86400000).toISOString().split('T')[0]},
          ];
          newTransactions.forEach(addTransaction);
          setIsImportingData(false);
          setNotifications(prev => [{id: `notif_${Date.now()}`, message: `${metadata.institution.name} has been successfully linked and initial transactions imported.`, timestamp: 'Just now', read: false, view: View.Transactions}, ...prev]);
      }, 3000);
  };
  
  const pitchBusinessPlan = async (plan: string) => {
      setWeaverState(prev => ({ ...prev, stage: WeaverStage.Analysis, businessPlan: plan, error: null }));
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const prompt = `Analyze the following business plan. Provide concise, critical feedback (2-3 sentences), 3-5 challenging questions for the founder, and a suggested loan amount. Format the response as a JSON object with keys: "feedback", "questions" (an array of strings), and "loanAmount" (a number). Plan: ${plan}`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' }
          });
          
          const result = JSON.parse(response.text);
          const coachingPlan: AIPlan = {
              title: "Founder's Initial Coaching Plan",
              summary: "A 3-step plan to refine your vision and validate your market assumptions.",
              steps: [
                  { title: "Market Validation Sprint", description: "Conduct 20 customer interviews to validate the core problem and your proposed solution.", timeline: "2 Weeks" },
                  { title: "Financial Model Draft", description: "Create a basic financial model projecting revenue, costs, and cash flow for the first 12 months.", timeline: "1 Week" },
                  { title: "Competitive Analysis Deep Dive", description: "Identify your top 3 competitors and map their strengths, weaknesses, and market positioning.", timeline: "1 Week" }
              ]
          };
          setWeaverState(prev => ({
              ...prev,
              stage: WeaverStage.Test,
              feedback: result.feedback,
              questions: result.questions.map((q: string, i: number) => ({ id: `q${i}`, question: q, category: 'General' })),
              loanAmount: result.loanAmount,
              coachingPlan: coachingPlan,
          }));
      } catch (err) {
          console.error("Quantum Weaver error:", err);
          setWeaverState(prev => ({ ...prev, stage: WeaverStage.Error, error: "Failed to analyze the business plan. The AI may be offline or the plan is too complex." }));
      }
  };

  const simulateTestPass = async () => {
    setWeaverState(prev => ({ ...prev, stage: WeaverStage.FinalReview }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setWeaverState(prev => ({ ...prev, stage: WeaverStage.Approved }));
  };
  
  // EIP-6963 Wallet Detection
  useEffect(() => {
    function onAnnounceProvider(event: any) {
      setDetectedProviders(prev => {
          if (prev.some(p => p.info.uuid === event.detail.info.uuid)) return prev;
          return [...prev, event.detail];
      });
    }
    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
    };
  }, []);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
        const accounts = await providerDetail.provider.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts.length > 0) {
            const balanceHex = await providerDetail.provider.request({ method: 'eth_getBalance', params: [accounts[0], 'latest'] }) as string;
            setWalletInfo({
                address: accounts[0],
                balance: parseInt(balanceHex, 16) / 1e18
            });
        }
    } catch (error) {
        console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => setWalletInfo(null);
  
  const issueCard = () => {
      setVirtualCard({
          cardNumber: `4242 4242 4242 ${Math.floor(1000 + Math.random() * 9000)}`,
          cvv: `${Math.floor(100 + Math.random() * 900)}`,
          expiry: `12/${new Date().getFullYear() + 4 - 2000}`,
          holderName: 'The Visionary'
      });
  };

  const buyCrypto = (usdAmount: number, cryptoTicker: string) => {
      const price = cryptoAssets.find(c => c.ticker === cryptoTicker)?.value || 3000;
      const amountBought = usdAmount / price;
      setCryptoAssets(prev => prev.map(c => c.ticker === cryptoTicker ? {...c, amount: c.amount + amountBought} : c));
      addTransaction({id: `crypto_buy_${Date.now()}`, type: 'expense', category: 'Investment', description: `Bought ${cryptoTicker}`, amount: usdAmount, date: new Date().toISOString().split('T')[0]});
  };

  const generateDashboardInsights = useCallback(async () => {
      if (!geminiApiKey) {
          setAiInsights([
              { id: '1', title: 'Setup Required', description: 'Please set your Gemini API key in the API Status view to receive personalized insights.', urgency: 'high' },
          ]);
          return;
      }
      setIsInsightsLoading(true);
      try {
          const ai = new GoogleGenAI({apiKey: geminiApiKey});
          const transactionSummary = transactions.slice(0, 10).map(t => `${t.description}: $${t.amount.toFixed(2)}`).join(', ');
          const prompt = `Based on these recent transactions, provide 2 concise, actionable financial insights. One should identify a potential saving opportunity, and the other should highlight a spending trend. Format as a JSON array of objects, each with "id", "title", "description", and "urgency" ('low', 'medium', or 'high'). Transactions: ${transactionSummary}`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { responseMimeType: "application/json" }
          });

          setAiInsights(JSON.parse(response.text));

      } catch (err) {
          console.error("Error generating insights:", err);
          setAiInsights([{ id: 'err1', title: 'Insight Error', description: 'Could not generate AI insights at this time.', urgency: 'medium' }]);
      } finally {
          setIsInsightsLoading(false);
      }
  }, [transactions, geminiApiKey]);

  useEffect(() => {
    // Generate insights only if there are transactions to analyze
    if (transactions.length > 0) {
        generateDashboardInsights();
    }
  }, [generateDashboardInsights, transactions.length]);
  
    const toggleCorporateCardFreeze = (cardId: string) => {
        setCorporateCards(prev => prev.map(c => c.id === cardId ? { ...c, frozen: !c.frozen } : c));
    };

    const updateCorporateCard = (cardId: string, newControls: CorporateCardControls, newFrozenState: boolean) => {
        setCorporateCards(prev => prev.map(c => c.id === cardId ? { ...c, controls: newControls, frozen: newFrozenState } : c));
    };

    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const mintNFT = (name: string, imageUrl: string) => {
        const newNft: NFTAsset = {
            id: `nft_${Date.now()}`,
            name,
            imageUrl,
            contractAddress: `0x${[...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
        };
        setNftAssets(prev => [newNft, ...prev]);
    };

    const mintToken = (name: string, ticker: string, amount: number) => {
        const newCrypto: CryptoAsset = {
            ticker,
            name,
            value: 0, // Should fetch price, but for mock, let's assume it's a new token
            amount: amount,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        setCryptoAssets(prev => [...prev, newCrypto]);
    };
    
    const initiatePayment = (details: Omit<PaymentOperation, 'id' | 'status' | 'date'>) => {
        const newOp: PaymentOperation = {
            ...details,
            id: `op_${Date.now()}`,
            status: 'Processing',
            date: new Date().toISOString().split('T')[0]
        };
        setPaymentOperations(prev => [newOp, ...prev]);
        setTimeout(() => {
            setPaymentOperations(prev => prev.map(op => op.id === newOp.id ? {...op, status: 'Completed'} : op));
        }, 3000);
    };

    const redeemReward = (item: RewardItem): boolean => {
        if (rewardPoints.balance >= item.cost) {
            setRewardPoints(prev => ({ ...prev, balance: prev.balance - item.cost, lastRedeemed: item.cost }));
            return true;
        }
        return false;
    };

    const addCounterparty = async (data: { name: string, email: string, accountNumber: string, routingNumber: string }) => {
        const newCounterparty: Counterparty = {
            id: `cprty_${Date.now()}`,
            name: data.name,
            email: data.email,
            send_remittance_advice: true,
            created_at: new Date().toISOString(),
            accounts: [{
                id: `cprty_acc_${Date.now()}`,
                party_name: data.name,
                account_details: [{ account_number_safe: data.accountNumber.slice(-4) }],
            }]
        };
        setCounterparties(prev => [...prev, newCounterparty]);
    };
    
  const fetchRecipients = async () => Promise.resolve<Recipient[]>([]);
  const fetchCurrencies = async () => Promise.resolve<Currency[]>([]);
  const getUserSecurityProfile = async () => Promise.resolve<SecurityProfile>({} as SecurityProfile);

  const fetchLedgerAccounts = async () => {
    if (!modernTreasuryApiKey || !modernTreasuryOrganizationId) return;

    setIsLedgerAccountsLoading(true);
    setLedgerAccountsError(null);

    try {
        const response = await fetch(
            'https://try.readme.io/https://app.moderntreasury.com/api/ledgers?per_page=25',
            {
                headers: {
                    // NOTE: 'Access-Control-Allow-Origin' is a response header set by the server.
                    // Adding it here as a request header will not resolve the CORS issue,
                    // as the browser security model requires the server to grant permission.
                    'Access-Control-Allow-Origin': '*',
                    Authorization: `Basic ${btoa(
                        (modernTreasuryApiKey || '') + ':'
                    )}`,
                    'Modern-Treasury-Organization-Id': modernTreasuryOrganizationId || '',
                },
            }
        );

        if (!response.ok) {
            // Check for specific CORS error in the browser, but throw a generic error here.
            // The browser console will show the detailed CORS error.
            throw new Error(`Failed to fetch ledger accounts. Status: ${response.status}. Please check browser console for CORS policy errors.`);
        }

        const data = await response.json();
        setLedgerAccounts(data.data || data); 
    } catch (err: any) {
        // The browser will throw a TypeError for network errors, including CORS failures.
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
             setLedgerAccountsError("A network error occurred. This is likely due to a CORS policy blocking the request from the browser. Please check the browser's developer console for more details.");
        } else {
            setLedgerAccountsError(err.message);
        }
    } finally {
        setIsLedgerAccountsLoading(false);
    }
  };


  // FIX: This implementation was incorrect. The component creates a full FinancialGoal object. This implementation simplifies the logic and makes it consistent with other `add` functions in the context.
  const addFinancialGoal = (goalData: Omit<FinancialGoal, 'id' | 'plan' | 'currentAmount' | 'contributions' | 'recurringContributions' | 'linkedGoals' | 'status'>) => {
    const newGoal: FinancialGoal = {
        ...goalData,
        id: generateSimpleUUID(),
        currentAmount: 0,
        plan: null,
        contributions: [],
        recurringContributions: [],
        linkedGoals: [],
        status: 'needs_attention',
    };
    setFinancialGoals(prev => [...prev, newGoal]);
  };
  
  const generateGoalPlan = async (goalId: string) => {
    // This is where you would call the Gemini API
    console.log(`Generating AI plan for goal ${goalId}...`);
    // Mocking the AI plan generation for now
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFinancialGoals(prev => prev.map(g => {
        if (g.id === goalId) {
            const monthsRemaining = monthsBetween(new Date(), new Date(g.targetDate));
            const requiredMonthly = (g.targetAmount - g.currentAmount) / (monthsRemaining > 0 ? monthsRemaining : 1);
            return {
                ...g,
                plan: {
                    feasibilitySummary: "Based on your current financial situation, this goal is achievable with consistent contributions.",
                    monthlyContribution: Math.max(50, Math.ceil(requiredMonthly / 50) * 50), // round to nearest 50
                    actionableSteps: [
                        `Automate a monthly contribution of $${Math.ceil(requiredMonthly / 50) * 50}.`,
                        "Review your 'Dining' budget to find an extra $50/month.",
                        "Consider a high-yield savings account to accelerate progress."
                    ],
                    steps: [
                        { title: "Automate Savings", description: `Set up an automatic monthly transfer of $${Math.ceil(requiredMonthly / 50) * 50}.`, category: 'Savings' },
                        { title: "Budget Review", description: "Analyze your 'Dining' and 'Shopping' budgets to find potential savings.", category: 'Budgeting' },
                        { title: "Explore HYSA", description: "Research and open a High-Yield Savings Account to maximize interest.", category: 'Investing' }
                    ]
                }
            };
        }
        return g;
    }));
  };
  
  const contributeToGoal = (goalId: string, amount: number) => {
    setFinancialGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    ));
  };
  
    // Extended Financial Goals Methods
    const addContributionToGoal = (goalId: string, amount: number) => {
        const newContribution: Contribution = {
            id: `contrib_${Date.now()}`,
            amount: amount,
            date: new Date().toISOString(),
            type: 'manual'
        };
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    currentAmount: g.currentAmount + amount,
                    contributions: g.contributions ? [...g.contributions, newContribution] : [newContribution]
                };
            }
            return g;
        }));
    };

    const addRecurringContributionToGoal = (goalId: string, contribution: Omit<RecurringContribution, 'id'>) => {
        const newRecurring: RecurringContribution = {
            ...contribution,
            id: `rec_${Date.now()}`
        };
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    recurringContributions: g.recurringContributions ? [...g.recurringContributions, newRecurring] : [newRecurring]
                };
            }
            return g;
        }));
    };

    const updateRecurringContributionInGoal = (goalId: string, contributionId: string, updates: Partial<RecurringContribution>) => {
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    recurringContributions: g.recurringContributions?.map(rc => 
                        rc.id === contributionId ? { ...rc, ...updates } : rc
                    )
                };
            }
            return g;
        }));
    };

    const deleteRecurringContributionFromGoal = (goalId: string, contributionId: string) => {
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                return {
                    ...g,
                    recurringContributions: g.recurringContributions?.filter(rc => rc.id !== contributionId)
                };
            }
            return g;
        }));
    };
    
    const updateFinancialGoal = (goalId: string, updates: { targetAmount?: number; targetDate?: string; monthlyContribution?: number }) => {
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                const newGoal = {...g};
                if(updates.targetAmount) newGoal.targetAmount = updates.targetAmount;
                if(updates.targetDate) newGoal.targetDate = updates.targetDate;
                if(updates.monthlyContribution && newGoal.plan) {
                    newGoal.plan.monthlyContribution = updates.monthlyContribution;
                }
                return newGoal;
            }
            return g;
        }));
    };

    const linkGoals = (sourceGoalId: string, targetGoalId: string, relationshipType: LinkedGoal['relationshipType'], triggerAmount?: number) => {
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === sourceGoalId) {
                const newLink: LinkedGoal = { id: targetGoalId, relationshipType, triggerAmount };
                return {
                    ...g,
                    linkedGoals: g.linkedGoals ? [...g.linkedGoals, newLink] : [newLink]
                };
            }
            return g;
        }));
    };

    const unlinkGoals = (sourceGoalId: string, targetGoalId: string) => {
        setFinancialGoals(prev => prev.map(g => {
            if (g.id === sourceGoalId) {
                return {
                    ...g,
                    linkedGoals: g.linkedGoals?.filter(link => link.id !== targetGoalId)
                };
            }
            return g;
        }));
    };

    // New Sacred Handlers implementations (4/4)

    const investInStartup = (id: string, amount: number) => {
        console.log(`Simulating investment of $${amount} into startup ID: ${id}`);
        
        const newVenture: VentureStartup = {
            id: `venture_${Date.now()}`,
            name: `Startup X (ID: ${id})`,
            stage: 'Seed',
            valuation: amount * 10,
            investmentAmount: amount,
            equity: 0.02 + Math.random() * 0.05,
            status: 'Active',
        } as VentureStartup; 
        
        setVenturePortfolio(prev => [...prev, newVenture]);
        
        addTransaction({ 
            id: `invest_${Date.now()}`, 
            type: 'expense', 
            category: 'Venture Capital', 
            description: `Investment in Startup ${id}`, 
            amount: amount, 
            date: new Date().toISOString().split('T')[0] 
        });
        setNotifications(prev => [{id: `notif_vc_${Date.now()}`, message: `Successfully invested $${amount} in Startup X.`, timestamp: 'Just now', read: false, view: View.Prosperity}, ...prev]);
    };

    const purchaseRealEstate = (id: string) => {
        console.log(`Simulating purchase of real estate ID: ${id}`);
        
        const price = 450000 + Math.random() * 600000;
        const mockProperty: RealEstateProperty = {
            id: `property_${Date.now()}`,
            address: `456 Infinity Loop, Block ${id}`,
            purchasePrice: price,
            currentValue: price * (1 + Math.random() * 0.1),
            type: 'Commercial',
            yield: 0.03 + Math.random() * 0.03,
            location: 'Digital District',
            status: 'Owned',
        } as RealEstateProperty;
        
        setRealEstatePortfolio(prev => [...prev, mockProperty]);

        addTransaction({ 
            id: `re_purchase_${Date.now()}`, 
            type: 'expense', 
            category: 'Real Estate', 
            description: `Real Estate Acquisition: Block ${id}`, 
            amount: price, 
            date: new Date().toISOString().split('T')[0] 
        });
        setNotifications(prev => [{id: `notif_re_${Date.now()}`, message: `Real Estate property ${id} acquired successfully.`, timestamp: 'Just now', read: false, view: View.Prosperity}, ...prev]);
    };
    
    const executeTrade = (symbol: string, type: 'BUY' | 'SELL', amount: number) => {
        console.log(`Executing ${type} trade for ${amount} units of ${symbol}`);

        const mockPrice = 150; // Mock price per unit
        const totalAmount = amount * mockPrice;

        if (type === 'BUY') {
            addTransaction({ 
                id: `trade_${Date.now()}_buy`, 
                type: 'expense', 
                category: 'Investment', 
                description: `Trade: Buy ${amount.toFixed(2)} units of ${symbol}`, 
                amount: totalAmount, 
                date: new Date().toISOString().split('T')[0] 
            });
        } else {
            addTransaction({ 
                id: `trade_${Date.now()}_sell`, 
                type: 'income', 
                category: 'Investment', 
                description: `Trade: Sell ${amount.toFixed(2)} units of ${symbol}`, 
                amount: totalAmount * 1.05, // Simulate small profit
                date: new Date().toISOString().split('T')[0] 
            });
        }
        
        setNotifications(prev => [{id: `notif_trade_${Date.now()}`, message: `${type} order for ${symbol} executed successfully.`, timestamp: 'Just now', read: false, view: View.Assets}, ...prev]);
    };


    const value: IDataContext = {
        transactions,
        assets,
        impactInvestments,
        budgets,
        addBudget: (budget) => {
            const newBudget: BudgetCategory = { ...budget, id: `budget_${Date.now()}`, spent: 0, color: `#${Math.floor(Math.random()*16777215).toString(16)}` };
            setBudgets(prev => [...prev, newBudget]);
        },
        gamification,
        impactData: {
            treesPlanted,
            spendingForNextTree,
            progressToNextTree: (spendingForNextTree / COST_PER_TREE) * 100
        },
        customBackgroundUrl,
        setCustomBackgroundUrl,
        addTransaction,
        activeIllusion,
        setActiveIllusion,
        linkedAccounts,
        unlinkAccount,
        handlePlaidSuccess,
        weaverState,
        pitchBusinessPlan,
        simulateTestPass,
        subscriptions,
        creditScore,
        upcomingBills,
        savingsGoals,
        marketMovers,
        financialGoals,
        // FIX: This implementation was incorrect and caused a type error. It is now corrected to properly create a new FinancialGoal object.
        addFinancialGoal,
        contributeToGoal,
        generateGoalPlan,
        cryptoAssets,
        paymentOperations,
        walletInfo,
        virtualCard,
        connectWallet,
        disconnectWallet,
        detectedProviders,
        issueCard,
        buyCrypto,
        aiInsights,
        isInsightsLoading,
        corporateCards,
        corporateTransactions,
        toggleCorporateCardFreeze,
        updateCorporateCard,
        rewardPoints,
        notifications,
        markNotificationRead,
        isImportingData,
        nftAssets,
        mintNFT,
        mintToken,
        initiatePayment,
        rewardItems,
        redeemReward,
        apiStatus,
        creditFactors,
        geminiApiKey,
        setGeminiApiKey,
        modernTreasuryApiKey,
        setModernTreasuryApiKey,
        modernTreasuryOrganizationId,
        setModernTreasuryOrganizationId,
        plaidApiKey,
        setPlaidApiKey,
        stripeApiKey,
        setStripeApiKey,
        marqetaApiKey,
        setMarqetaApiKey,
        counterparties,
        addCounterparty,
        paymentOrders,
        invoices,
        complianceCases,
        userPreferences,
        fetchRecipients,
        fetchCurrencies,
        getUserSecurityProfile,
        ledgerAccounts,
        fetchLedgerAccounts,
        isLedgerAccountsLoading,
        ledgerAccountsError,
        activeView,
        setActiveView,
        addContributionToGoal,
        addRecurringContributionToGoal,
        updateRecurringContributionInGoal,
        deleteRecurringContributionFromGoal,
        updateFinancialGoal,
        linkGoals,
        unlinkGoals,
        // Prosperity View Data
        prosperityCompanies,
        realEstatePortfolio,
        artCollection,
        activeAlgoStrategies,
        venturePortfolio,

        // Handlers
        investInStartup,
        purchaseRealEstate,
        executeTrade,
    };
    
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};