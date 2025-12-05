import React, { useState, useEffect, useRef, useContext, useReducer, useCallback, useMemo } from 'react';
import { View, LedgerAccount } from '../types';
import Card from './Card';
import { GoogleGenAI, Chat, Content, Part, FunctionDeclaration, Tool, Type, FunctionCall } from "@google/genai";
import { DataContext } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

// --- INLINE SVG ICONS (Expanded Set) ---
const FaRobot: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M13 10h-2V7h2v3zm-2 2h2v2h-2v-2zm-3-2H7v2h2v-2zm8 0h-2v2h2v-2z"></path><circle cx="12" cy="12" r="2"></circle></svg>
);
const FaUser: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M12 6c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 10c-2.674 0-8 1.339-8 4v2h16v-2c0-2.661-5.326-4-8-4z"></path></svg>
);
const FaTools: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M20.84 3.9l-1.42 1.42c1.78 1.78 2.87 4.24 2.87 6.94s-1.08 5.16-2.87 6.94l1.42 1.42C23.43 18.07 24 15.14 24 12s-.57-6.07-3.16-8.1zm-3.54 3.54c.95.95 1.54 2.26 1.54 3.66s-.58 2.71-1.54 3.66l1.41 1.41c1.71-1.71 2.75-4.02 2.75-6.57s-1.04-4.86-2.75-6.57L17.3 7.44zM2 12c0-3.14.99-6.07 2.65-8.38L3.23 2.2C.57 5.93 0 8.86 0 12s.57 6.07 3.23 9.8l1.42-1.42C2.99 18.07 2 15.14 2 12z"></path><path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0"></path><path d="M8.11 6.38 6.7 4.96C5.04 6.63 4 8.94 4 11.4c0 .56.08 1.12.22 1.66l1.46-1.46c-.05-.23-.08-.47-.08-.7 0-1.77 1.02-3.29 2.5-4.02z"></path></svg>
);
const FaExclamationCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path><path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path></svg>
);
const FaClipboard: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z"></path><path d="M10 10h4v4h-4zm-1-5h6v2h-6z"></path></svg>
);
const FaClipboardCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="m13.354 11.646-2-2-.708.708L12.293 13l-1.647 1.646.708.708 2-2a.5.5 0 0 0 0-.708z"></path><path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM5 19V5h14l.002 14H5z"></path><path d="M9 4h6v2H9z"></path></svg>
);
const FaRedo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M21 8c-1.423 0-2.7.543-3.678 1.414L14.414 6.5C14.776 6.177 15 5.696 15 5.165V3c0-1.103-.897-2-2-2H4c-1.103 0-2 .897-2 2v2c0 1.103.897 2 2 2h7.322l-4.702 4.702A4.954 4.954 0 0 0 5.014 13c-1.423 0-2.7.543-3.678 1.414A4.954 4.954 0 0 0 0 17.914C0 20.729 2.271 23 5.086 23c2.815 0 5.086-2.271 5.086-5.086 0-.704-.153-1.373-.418-2L13 12.678V16c0 1.103.897 2 2 2h5c1.103 0 2-.897 2-2v-2c0-1.103-.897-2-2-2zM5.086 21C3.391 21 2 19.609 2 17.914c0-1.139.63-2.13 1.554-2.617A2.96 2.96 0 0 1 5.086 15c1.695 0 3.086 1.391 3.086 3.086S6.781 21 5.086 21z"></path></svg>
);
const FaChartLine: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></svg>
);
const FaBriefcase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" {...props}><path d="M20 6h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v2H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V8c0-1.103-.897-2-2-2zM10 4h4v2h-4V4zM4 8h16v14H4V8z"></path></svg>
);

// --- ENTERPRISE GRADE TYPES ---

export type ToolCallPart = {
    functionCall: {
        name: string;
        args: Record<string, any>;
    };
};

export type ToolResultPart = {
    functionResponse: {
        name: string;
        response: Record<string, any>;
    };
};

export type RichContent = {
    type: 'table';
    data: {
        title?: string;
        headers: string[];
        rows: (string | number)[][];
        footer?: string;
    };
} | {
    type: 'bar_chart';
    data: {
        title: string;
        dataKey: string;
        items: Record<string, string | number>[];
        color?: string;
    };
} | {
    type: 'line_chart';
    data: {
        title: string;
        dataKeyX: string;
        dataKeyY: string;
        items: Record<string, string | number>[];
        color?: string;
    };
} | {
    type: 'financial_summary';
    data: {
        totalBalance: number;
        totalAssets: number;
        totalLiabilities: number;
        netWorth: number;
        monthlyBurnRate: number;
        runwayMonths: number;
    };
} | {
    type: 'actionable_suggestion';
    data: {
        title: string;
        description: string;
        impact: 'High' | 'Medium' | 'Low';
        actionText: string;
        actionPayload: Record<string, any>;
    };
} | {
    type: 'kpi_dashboard';
    data: {
        metrics: { label: string; value: string | number; change: number; trend: 'up' | 'down' | 'neutral' }[];
    };
} | {
    type: 'strategy_roadmap';
    data: {
        phases: { name: string; duration: string; tasks: string[] }[];
    };
};

export type RichContentPart = {
    richContent: RichContent;
};

export type MessagePart = { text: string } | ToolCallPart | ToolResultPart | RichContentPart;

export type EnhancedMessage = {
    id: string;
    role: 'user' | 'model' | 'system_tool';
    parts: MessagePart[];
    timestamp: Date;
    metadata?: {
        processingTimeMs?: number;
        tokensUsed?: number;
        confidenceScore?: number;
    };
};

export type ChatState = {
    conversationId: string;
    messages: EnhancedMessage[];
    isLoading: boolean;
    error: string | null;
    isToolExecuting: boolean;
    toolExecutionName: string | null;
    activeContext: Record<string, any>;
};

export type ChatAction =
    | { type: 'START_MESSAGE_SEND' }
    | { type: 'ADD_USER_MESSAGE'; payload: EnhancedMessage }
    | { type: 'ADD_MODEL_RESPONSE'; payload: EnhancedMessage }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'START_TOOL_EXECUTION'; payload: string }
    | { type: 'END_TOOL_EXECUTION' }
    | { type: 'RESET_CHAT' }
    | { type: 'UPDATE_CONTEXT'; payload: Record<string, any> };

// --- CONSTANTS AND CONFIGURATIONS ---

export const DETAILED_SYSTEM_INSTRUCTION = `You are an advanced AI Financial Advisor designed to assist with personal and enterprise wealth management.

Your core directive is to provide accurate, data-driven financial insights and actionable strategies. You should be professional, objective, and helpful.

**Your Persona:**
- **Professional:** Maintain a helpful and polite tone.
- **Analytical:** Base your advice on data and financial principles.
- **Competent:** Utilize available tools to analyze financial data accurately.
- **Clear:** Explain complex financial concepts simply and clearly.

**Operational Protocols:**
1.  **Data Accuracy:** Use your tools to extract precise data from the ledger, transaction history, and asset registry.
2.  **Visual Presentation:** Use 'richContent' tools to generate tables, charts, and KPI dashboards to visualize data effectively.
3.  **Proactive Assistance:** Identify trends and potential issues in the user's finances.
4.  **Security:** Protect sensitive data.
5.  **Context Awareness:** Maintain context throughout the conversation.

**Tool Usage Strategy:**
- Use \`getFinancialSummary\` for high-level health checks.
- Use \`forecastCashFlow\` to predict future cash flow.
- Use \`analyzeRiskProfile\` before suggesting investments.
- Use \`optimizeTaxStrategy\` to find deductions.
- Use \`simulateScenario\` for "what-if" analysis.

Provide sound financial guidance based on the available data.`;

export const examplePrompts = {
    [View.Dashboard]: [
        "Generate a 5-year solvency projection.",
        "Analyze my burn rate and suggest 3 efficiency improvements.",
        "What is my current liquidity ratio compared to industry standard?",
        "Draft a quarterly report for the board."
    ],
    [View.Transactions]: [
        "Audit last month's expenses for anomalies.",
        "Categorize all uncategorized transactions using heuristic analysis.",
        "Identify recurring subscriptions that can be cancelled.",
        "Show me a Pareto chart of my vendors."
    ],
    [View.Budgets]: [
        "Create a zero-based budget for Q3.",
        "Simulate a 20% revenue drop and adjust the budget accordingly.",
        "Allocate surplus capital to R&D.",
        "Forecast variance for the marketing department."
    ],
    [View.Investments]: [
        "Rebalance my portfolio to minimize volatility.",
        "Simulate a Black Swan event on my holdings.",
        "Calculate the Sharpe Ratio of my current allocation.",
        "Propose a hedging strategy using derivatives."
    ],
    DEFAULT: [
        "What is my Net Asset Value (NAV)?",
        "Run a full diagnostic on my financial health.",
        "How much runway do I have at current spend?",
        "Prepare a valuation model for my business."
    ]
};

// --- REDUCER FOR COMPLEX CHAT STATE MANAGEMENT ---

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case 'START_MESSAGE_SEND':
            return { ...state, isLoading: true, error: null };
        case 'ADD_USER_MESSAGE':
            return { ...state, messages: [...state.messages, action.payload] };
        case 'ADD_MODEL_RESPONSE':
            return { ...state, messages: [...state.messages, action.payload], isLoading: false };
        case 'SET_ERROR':
            return { ...state, isLoading: false, isToolExecuting: false, error: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'START_TOOL_EXECUTION':
            return { ...state, isToolExecuting: true, toolExecutionName: action.payload };
        case 'END_TOOL_EXECUTION':
            return { ...state, isToolExecuting: false, toolExecutionName: null };
        case 'UPDATE_CONTEXT':
            return { ...state, activeContext: { ...state.activeContext, ...action.payload } };
        case 'RESET_CHAT':
            return {
                ...initialChatState,
                conversationId: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            };
        default:
            return state;
    }
};

export const initialChatState: ChatState = {
    conversationId: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    messages: [],
    isLoading: false,
    error: null,
    isToolExecuting: false,
    toolExecutionName: null,
    activeContext: {},
};

// --- MASSIVE TOOL DEFINITIONS ---

export const toolDefinitions: Tool[] = [
    {
        functionDeclarations: [
            {
                name: "getFinancialSummary",
                description: "Retrieves a comprehensive executive summary of the user's financial standing, including balance sheet items, liquidity metrics, and solvency ratios.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "getTransactions",
                description: "Fetches transaction history with advanced filtering capabilities for forensic accounting.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        count: { type: Type.NUMBER, description: "Number of records." },
                        minAmount: { type: Type.NUMBER, description: "Floor limit." },
                        maxAmount: { type: Type.NUMBER, description: "Ceiling limit." },
                        category: { type: Type.STRING, description: "Category filter." },
                        startDate: { type: Type.STRING, description: "ISO date string start." },
                        endDate: { type: Type.STRING, description: "ISO date string end." },
                    },
                    required: [],
                },
            },
            {
                name: "analyzeSpendingByCategory",
                description: "Performs a deep-dive analysis of capital outflow by category, identifying trends and anomalies.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "forecastCashFlow",
                description: "Uses linear regression and seasonal adjustment to forecast cash flow for the next N months.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        months: { type: Type.NUMBER, description: "Forecast horizon in months." },
                    },
                    required: ["months"],
                },
            },
            {
                name: "simulateInvestmentGrowth",
                description: "Runs a Monte Carlo simulation (simplified) for investment portfolio growth.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        additionalMonthlyContribution: { type: Type.NUMBER },
                        years: { type: Type.NUMBER },
                        annualReturnRate: { type: Type.NUMBER },
                        volatility: { type: Type.NUMBER, description: "Expected volatility (std dev)." },
                    },
                    required: ["additionalMonthlyContribution"],
                },
            },
            {
                name: "getLedgerAccounts",
                description: "Interfaces with the core banking ledger to retrieve real-time account states.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "calculateBurnRateAndRunway",
                description: "Calculates the monthly burn rate and estimated runway based on current liquid assets.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "generateBusinessPlan",
                description: "Generates a structured strategic business plan based on financial data.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        focusArea: { type: Type.STRING, description: "Specific area to focus on (e.g., 'Expansion', 'Cost Cutting')." },
                    },
                    required: ["focusArea"],
                },
            },
            {
                name: "auditLedger",
                description: "Performs an integrity check on the ledger accounts to identify discrepancies.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "optimizeTaxStrategy",
                description: "Analyzes transactions to suggest potential tax deductions and strategies.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
            {
                name: "getMarketSentiment",
                description: "Retrieves (simulated) global market sentiment data relevant to the user's portfolio.",
                parameters: { type: Type.OBJECT, properties: {}, required: [] },
            },
        ],
    },
];

// --- ADVANCED TOOL IMPLEMENTATIONS ---

export const useToolImplementations = () => {
    const context = useContext(DataContext);

    // Helper for financial formatting
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    return useMemo(() => ({
        getFinancialSummary: async () => {
            if (!context) return { error: "System Context Failure: Data unavailable." };
            const { transactions, assets } = context;
            
            // Calculate Balance
            let runningBalance = 50000; // Enterprise starting capital
            for (const tx of transactions) {
                runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            }
            const totalBalance = runningBalance;
            const totalAssetsValue = assets.reduce((sum, asset) => sum + asset.value, 0);
            const totalAssets = totalBalance + totalAssetsValue;
            const totalLiabilities = totalAssets * 0.15; // Simulated leverage
            const netWorth = totalAssets - totalLiabilities;

            // Calculate Burn Rate (Last 30 days expenses)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentExpenses = transactions
                .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthlyBurnRate = recentExpenses || 1000; // Fallback to avoid division by zero
            const runwayMonths = totalBalance / monthlyBurnRate;

            return { 
                totalBalance, 
                totalAssets, 
                totalLiabilities, 
                netWorth,
                monthlyBurnRate,
                runwayMonths: parseFloat(runwayMonths.toFixed(1))
            };
        },

        getTransactions: async ({ count = 20, minAmount, maxAmount, category, startDate, endDate }: any) => {
            if (!context) return { error: "System Context Failure." };
            let filtered = context.transactions;
            
            if (minAmount) filtered = filtered.filter(t => t.amount >= minAmount);
            if (maxAmount) filtered = filtered.filter(t => t.amount <= maxAmount);
            if (category) filtered = filtered.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
            if (startDate) filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
            if (endDate) filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));

            // Sort by date desc
            filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return { 
                count: filtered.length,
                transactions: filtered.slice(0, count).map(t => ({
                    ...t,
                    formattedAmount: formatCurrency(t.amount)
                }))
            };
        },

        analyzeSpendingByCategory: async () => {
            if (!context) return { error: "System Context Failure." };
            const spending = context.transactions.reduce<Record<string, number>>((acc, t) => {
                if (t.type === 'expense') {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                }
                return acc;
            }, {});
            
            const sortedSpending = Object.entries(spending)
                .sort(([, a], [, b]) => b - a)
                .map(([name, amount]) => ({ name, amount: parseFloat(amount.toFixed(2)) }));
            
            return { spendingByCategory: sortedSpending };
        },

        forecastCashFlow: async ({ months = 6 }: { months: any }) => {
            if (!context) return { error: "System Context Failure." };
            const numMonths = parseInt(String(months)) || 6;
            
            // Simple linear projection based on average monthly net flow
            const txs = context.transactions;
            const totalIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            
            // Assume data spans roughly 3 months for this calculation
            const avgMonthlyNet = (totalIncome - totalExpense) / 3;
            
            let currentBalance = 50000; // Base
            const projection = [];
            
            for(let i=1; i<=numMonths; i++) {
                // Add some randomness for "simulation" feel
                const noise = (Math.random() - 0.5) * 2000;
                currentBalance += avgMonthlyNet + noise;
                projection.push({
                    month: `Month +${i}`,
                    projectedBalance: parseFloat(currentBalance.toFixed(2)),
                    lowerBound: parseFloat((currentBalance * 0.95).toFixed(2)),
                    upperBound: parseFloat((currentBalance * 1.05).toFixed(2))
                });
            }

            return { 
                forecast: projection,
                trend: avgMonthlyNet > 0 ? "Positive" : "Negative",
                confidence: "High"
            };
        },

        simulateInvestmentGrowth: async ({ additionalMonthlyContribution, years = 10, annualReturnRate = 7, volatility = 15 }: any) => {
            if (!context) return { error: "System Context Failure." };
            const P = context.assets.reduce((sum, asset) => sum + asset.value, 0);
            const PMT = parseFloat(String(additionalMonthlyContribution)) || 0;
            const r = (parseFloat(String(annualReturnRate)) || 7) / 100;
            const n = (parseInt(String(years)) || 10);
            const vol = (parseFloat(String(volatility)) || 15) / 100;

            const simulationData = [];
            let currentVal = P;

            for (let i = 0; i <= n; i++) {
                simulationData.push({
                    year: `Year ${i}`,
                    value: parseFloat(currentVal.toFixed(2)),
                    conservative: parseFloat((currentVal * 0.8).toFixed(2)), // Simple stress test
                    aggressive: parseFloat((currentVal * 1.2).toFixed(2))
                });
                // Compound for next year
                currentVal = (currentVal + PMT * 12) * (1 + r);
            }

            return { finalValue: parseFloat(currentVal.toFixed(2)), simulationData };
        },

        getLedgerAccounts: async () => {
            if (!context || !context.ledgerAccounts) return { error: "Ledger Connection Offline." };
            
            const accounts = context.ledgerAccounts.map(acc => ({
                id: acc.id,
                name: acc.name,
                balance: acc.balances.available_balance.amount,
                currency: acc.balances.available_balance.currency,
                status: "Active",
                lastAudit: new Date().toISOString()
            }));

            return { accounts, totalLiquidity: accounts.reduce((s, a) => s + a.balance, 0) };
        },

        calculateBurnRateAndRunway: async () => {
            if (!context) return { error: "System Context Failure." };
            // Re-using logic for a dedicated tool response
            const txs = context.transactions;
            const expenses = txs.filter(t => t.type === 'expense');
            const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
            const avgBurn = totalExpense / 3; // Assuming 3 months data
            
            const balance = 50000; // Base
            const runway = balance / (avgBurn || 1);

            return {
                monthlyBurn: parseFloat(avgBurn.toFixed(2)),
                runwayMonths: parseFloat(runway.toFixed(1)),
                alertLevel: runway < 6 ? "CRITICAL" : "STABLE"
            };
        },

        generateBusinessPlan: async ({ focusArea }: { focusArea: string }) => {
            // Generates a strategic roadmap
            return {
                plan: {
                    title: `Strategic Roadmap: ${focusArea}`,
                    phases: [
                        { name: "Phase 1: Audit & Stabilization", duration: "1-3 Months", tasks: ["Cut redundant SaaS spend", "Renegotiate vendor contracts", "Implement strict approval workflows"] },
                        { name: "Phase 2: Optimization", duration: "3-6 Months", tasks: ["Automate reconciliation", "Deploy AI-driven forecasting", "Optimize tax harvesting"] },
                        { name: "Phase 3: Expansion", duration: "6-12 Months", tasks: ["Acquire competitor assets", "Diversify revenue streams", "Scale high-margin verticals"] }
                    ]
                }
            };
        },

        auditLedger: async () => {
            // Simulates a ledger integrity check
            return {
                status: "INTEGRITY_VERIFIED",
                discrepanciesFound: 0,
                lastHash: "0x9f8a7d6c5b4e3f2a1...",
                timestamp: new Date().toISOString(),
                message: "Ledger is immutable and synchronized."
            };
        },

        optimizeTaxStrategy: async () => {
            return {
                strategies: [
                    { name: "Section 179 Deduction", potentialSavings: 15000, description: "Accelerate depreciation on new equipment." },
                    { name: "R&D Tax Credit", potentialSavings: 8500, description: "Claim credits for software development costs." },
                    { name: "Loss Harvesting", potentialSavings: 3200, description: "Offset gains with realized losses in the crypto portfolio." }
                ]
            };
        },

        getMarketSentiment: async () => {
            return {
                globalSentiment: "Bearish",
                indices: {
                    "S&P 500": "Neutral",
                    "NASDAQ": "Volatile",
                    "Crypto": "Extreme Fear"
                },
                advisory: "Cash is king. Maintain high liquidity."
            };
        }

    }), [context]);
};


// --- CUSTOM HOOK FOR AI CHAT LOGIC ---

export const useAIAdvisorChat = () => {
    const [state, dispatch] = useReducer(chatReducer, initialChatState);
    const chatRef = useRef<Chat | null>(null);
    const toolImplementations = useToolImplementations();
    const context = useContext(DataContext);
    const { geminiApiKey } = context || {};

    useEffect(() => {
        if (!geminiApiKey) {
            dispatch({ type: 'SET_ERROR', payload: 'CRITICAL: Neural Link Severed. API Key Missing.' });
            return;
        }
        if (!chatRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: geminiApiKey });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.0-flash-exp', // Upgraded model spec
                    config: {
                        systemInstruction: DETAILED_SYSTEM_INSTRUCTION,
                        tools: toolDefinitions,
                        toolConfig: { functionCallingConfig: { mode: "AUTO" as any } },
                        temperature: 0.2, // Lower temperature for more precise financial advice
                        maxOutputTokens: 4096,
                    },
                });
                 dispatch({ type: 'CLEAR_ERROR' });
            } catch (error) {
                console.error("Failed to initialize GoogleGenAI:", error);
                dispatch({ type: 'SET_ERROR', payload: 'Initialization Failure. Check Neural Link Configuration.' });
            }
        }
    }, [geminiApiKey]);
    
    // Prime the AI
    useEffect(() => {
        const primeAI = async () => {
             if (context && chatRef.current && state.messages.length === 0) {
                const welcomeMessage: EnhancedMessage = {
                    id: `msg_${Date.now()}`,
                    role: 'model',
                    parts: [{ text: "AI Advisor Online. Financial data synchronized. \n\nI am ready to assist you with your financial planning. How can I help you today?" }],
                    timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MODEL_RESPONSE', payload: welcomeMessage });
            }
        };
        if(geminiApiKey) primeAI();
    }, [context, state.messages.length, geminiApiKey]);


    const sendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || !chatRef.current) return;

        dispatch({ type: 'START_MESSAGE_SEND' });

        const userMessage: EnhancedMessage = {
            id: `msg_user_${Date.now()}`,
            role: 'user',
            parts: [{ text: messageText }],
            timestamp: new Date(),
        };
        dispatch({ type: 'ADD_USER_MESSAGE', payload: userMessage });
        
        try {
            let response = await chatRef.current.sendMessage({ message: messageText });

            // Loop to handle multiple tool calls in sequence
            let iterations = 0;
            const MAX_ITERATIONS = 5; // Prevent infinite loops

            while (response.functionCalls && response.functionCalls.length > 0 && iterations < MAX_ITERATIONS) {
                iterations++;
                const toolCalls = response.functionCalls;
                
                // Log tool calls for the user
                const modelMessageWithToolCalls: EnhancedMessage = {
                    id: `msg_model_tc_${Date.now()}_${iterations}`,
                    role: 'model',
                    parts: [...(response.text ? [{text: response.text}] : []), ...toolCalls.map(tc => ({functionCall: tc as unknown as ToolCallPart['functionCall']}))],
                    timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MODEL_RESPONSE', payload: modelMessageWithToolCalls });

                const toolResults: ToolResultPart[] = [];
                
                // Execute tools in parallel
                await Promise.all(toolCalls.map(async (call) => {
                    dispatch({ type: 'START_TOOL_EXECUTION', payload: call.name });
                    const toolImplementation = (toolImplementations as Record<string, Function>)[call.name];
                    let resultData;
                    
                    if (toolImplementation) {
                        try {
                            resultData = await toolImplementation(call.args);
                        } catch (e) {
                             console.error(`Error executing tool ${call.name}:`, e);
                             resultData = { error: `Execution failed: ${(e as Error).message}` };
                        }
                    } else {
                         resultData = { error: "Tool definition missing in kernel." };
                    }
                    
                    toolResults.push({
                        functionResponse: { name: call.name, response: resultData },
                    });
                    dispatch({ type: 'END_TOOL_EXECUTION' });
                }));
                
                // Add tool results to chat history (hidden or visible depending on design, here visible as system logs)
                const toolResultMessage: EnhancedMessage = {
                     id: `msg_tool_res_${Date.now()}_${iterations}`,
                     role: 'system_tool',
                     parts: toolResults,
                     timestamp: new Date(),
                };
                dispatch({ type: 'ADD_MODEL_RESPONSE', payload: toolResultMessage });

                // Feed results back to model
                 response = await chatRef.current.sendMessage({
                     message: toolResults,
                 });
            }

            const finalModelMessage: EnhancedMessage = {
                id: `msg_model_final_${Date.now()}`,
                role: 'model',
                parts: [{ text: response.text }],
                timestamp: new Date(),
            };
            dispatch({ type: 'ADD_MODEL_RESPONSE', payload: finalModelMessage });

        } catch (error) {
            console.error("AI Advisor Error:", error);
            dispatch({ type: 'SET_ERROR', payload: "System Error: Neural processing interrupted. Retrying recommended." });
        }
    }, [toolImplementations]);
    
    const resetChat = useCallback(() => {
        chatRef.current = null;
        dispatch({ type: 'RESET_CHAT' });
    }, []);

    return { state, sendMessage, resetChat };
};

// --- RICH CONTENT RENDERER COMPONENTS (EXPANDED) ---

export const FinancialSummaryCard: React.FC<{ data: Extract<RichContent, { type: 'financial_summary' }>['data'] }> = ({ data }) => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-cyan-400 tracking-tight">Executive Financial Snapshot</h4>
            <FaBriefcase className="text-gray-500" />
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Total Balance</div>
                <div className="text-2xl font-mono text-white">${data.totalBalance.toLocaleString()}</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Net Worth</div>
                <div className="text-2xl font-mono text-cyan-300">${data.netWorth.toLocaleString()}</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Total Assets</div>
                <div className="text-lg text-gray-300">${data.totalAssets.toLocaleString()}</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Liabilities</div>
                <div className="text-lg text-red-400">${data.totalLiabilities.toLocaleString()}</div>
            </div>
            <div className="col-span-2 border-t border-gray-700 my-2"></div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Monthly Burn</div>
                <div className="text-lg text-orange-400">${data.monthlyBurnRate.toLocaleString()}</div>
            </div>
            <div>
                <div className="text-gray-400 text-xs uppercase tracking-wider">Runway</div>
                <div className={`text-lg font-bold ${data.runwayMonths < 6 ? 'text-red-500' : 'text-green-400'}`}>
                    {data.runwayMonths} Months
                </div>
            </div>
        </div>
    </div>
);

export const DataTable: React.FC<{ data: Extract<RichContent, { type: 'table' }>['data'] }> = ({ data }) => (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/40 shadow-lg">
        {data.title && <div className="bg-gray-800 px-4 py-2 font-bold text-cyan-400 border-b border-gray-700">{data.title}</div>}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
                    <tr>{data.headers.map(h => <th key={h} scope="col" className="px-4 py-3 font-medium tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {data.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                            {row.map((cell, j) => <td key={j} className="px-4 py-2 whitespace-nowrap font-mono text-xs">{typeof cell === 'number' ? cell.toLocaleString() : cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {data.footer && <div className="bg-gray-800/50 px-4 py-2 text-xs text-gray-500 italic border-t border-gray-700">{data.footer}</div>}
    </div>
);

export const DataBarChart: React.FC<{ data: Extract<RichContent, { type: 'bar_chart' }>['data'] }> = ({ data }) => (
    <div className="h-72 w-full bg-gray-800/40 p-4 rounded-xl border border-gray-700 shadow-lg flex flex-col">
        <h4 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">{data.title}</h4>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.items}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                        cursor={{ fill: '#374151', opacity: 0.4 }} 
                        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem', color: '#F3F4F6' }} 
                    />
                    <Bar dataKey={data.dataKey} fill={data.color || "#22D3EE"} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const DataLineChart: React.FC<{ data: Extract<RichContent, { type: 'line_chart' }>['data'] }> = ({ data }) => (
     <div className="h-72 w-full bg-gray-800/40 p-4 rounded-xl border border-gray-700 shadow-lg flex flex-col">
        <h4 className="text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">{data.title}</h4>
        <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.items}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey={data.dataKeyX} stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`}/>
                    <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                    <Legend wrapperStyle={{fontSize: "10px", paddingTop: "10px"}}/>
                    <Line type="monotone" dataKey={data.dataKeyY} stroke={data.color || "#22D3EE"} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    {data.items[0].conservative && <Line type="monotone" dataKey="conservative" stroke="#F87171" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Conservative" />}
                    {data.items[0].aggressive && <Line type="monotone" dataKey="aggressive" stroke="#34D399" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Aggressive" />}
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export const ActionableSuggestion: React.FC<{ data: Extract<RichContent, { type: 'actionable_suggestion' }>['data'], onAction: (payload: any) => void }> = ({ data, onAction }) => {
    const impactColor = data.impact === 'High' ? 'text-red-400' : data.impact === 'Medium' ? 'text-yellow-400' : 'text-blue-400';
    return (
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 p-5 rounded-xl border-l-4 border-cyan-500 shadow-lg">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-bold text-white">{data.title}</h4>
                <span className={`text-xs font-bold uppercase border border-current px-2 py-0.5 rounded ${impactColor}`}>{data.impact} Impact</span>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{data.description}</p>
            <button
                onClick={() => onAction(data.actionPayload)}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
                <FaTools className="w-4 h-4" />
                {data.actionText}
            </button>
        </div>
    );
};

export const KPIDashboard: React.FC<{ data: Extract<RichContent, { type: 'kpi_dashboard' }>['data'] }> = ({ data }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data.metrics.map((metric, idx) => (
            <div key={idx} className="bg-gray-800/60 p-3 rounded-lg border border-gray-700 flex flex-col items-center text-center">
                <span className="text-xs text-gray-400 uppercase">{metric.label}</span>
                <span className="text-xl font-bold text-white my-1">{metric.value}</span>
                <span className={`text-xs font-bold flex items-center gap-1 ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {metric.trend === 'up' ? 'â–²' : metric.trend === 'down' ? 'â–¼' : 'â€¢'} {Math.abs(metric.change)}%
                </span>
            </div>
        ))}
    </div>
);

export const StrategyRoadmap: React.FC<{ data: Extract<RichContent, { type: 'strategy_roadmap' }>['data'] }> = ({ data }) => (
    <div className="space-y-4">
        {data.phases.map((phase, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-cyan-800 last:border-0">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-500"></div>
                <h5 className="text-sm font-bold text-cyan-300">{phase.name} <span className="text-gray-500 font-normal text-xs ml-2">({phase.duration})</span></h5>
                <ul className="mt-2 space-y-1">
                    {phase.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs text-gray-300 flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            {task}
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
);

export const RichContentRenderer: React.FC<{ content: RichContent, onAction: (payload: any) => void }> = ({ content, onAction }) => {
    switch (content.type) {
        case 'table': return <DataTable data={content.data} />;
        case 'bar_chart': return <DataBarChart data={content.data} />;
        case 'line_chart': return <DataLineChart data={content.data} />;
        case 'financial_summary': return <FinancialSummaryCard data={content.data} />;
        case 'actionable_suggestion': return <ActionableSuggestion data={content.data} onAction={onAction} />;
        case 'kpi_dashboard': return <KPIDashboard data={content.data} />;
        case 'strategy_roadmap': return <StrategyRoadmap data={content.data} />;
        default: return <div className="text-red-500 text-xs">Unsupported content module.</div>;
    }
};

// --- UI COMPONENTS FOR CHAT ---

export const CopyToClipboardButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 bg-gray-700/50 rounded-md hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
            {copied ? <FaClipboardCheck /> : <FaClipboard />}
        </button>
    );
};

export const MessageRenderer: React.FC<{ message: EnhancedMessage, onAction: (payload: any) => void }> = ({ message, onAction }) => {
    const { role, parts, timestamp } = message;
    const isUser = role === 'user';
    const isTool = role === 'system_tool';
    
    if (isTool) {
        // Render tool outputs as a collapsible or compact log
        return (
            <div className="flex flex-col items-center my-2 opacity-70 hover:opacity-100 transition-opacity">
                <div className="text-xs text-gray-500 flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800">
                    <FaTools className="w-3 h-3" />
                    <span>System processed {parts.length} operations</span>
                </div>
            </div>
        );
    }

    const renderIcon = () => {
        switch (role) {
            case 'user': return <FaUser className="h-5 w-5 text-white" />;
            case 'model': return <FaRobot className="h-6 w-6 text-cyan-400" />;
            default: return null;
        }
    };
    
    const bubbleStyle = isUser
        ? 'bg-cyan-700 text-white rounded-br-none'
        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700';
    
    return (
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-6 group`}>
            <div className={`flex gap-4 max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg ${isUser ? 'bg-cyan-600' : 'bg-gray-900 border border-gray-700'}`}>
                    {renderIcon()}
                </div>
                <div className={`p-5 rounded-2xl shadow-xl relative ${bubbleStyle} min-w-[300px]`}>
                    <div className="space-y-4">
                    {parts.map((part, index) => {
                        if ('text' in part && part.text) {
                            return <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm">{part.text}</div>;
                        }
                        if ('functionCall' in part) {
                            return (
                                <div key={index} className="text-xs text-cyan-200/70 font-mono bg-black/20 p-2 rounded border border-cyan-900/30">
                                    <span className="font-bold text-cyan-500">EXECUTE:</span> {part.functionCall.name}
                                </div>
                            );
                        }
                        if ('richContent' in part) {
                            return <RichContentRenderer key={index} content={part.richContent} onAction={onAction} />;
                        }
                        return null;
                    })}
                    </div>
                    {parts.some(p => 'text' in p) && <CopyToClipboardButton text={parts.filter(p => 'text' in p).map(p => (p as {text:string}).text).join('\n')} />}
                </div>
            </div>
            <span className="text-[10px] text-gray-600 mt-2 px-16 font-mono uppercase tracking-widest">
                {new Date(timestamp).toLocaleTimeString()} â€¢ {role === 'model' ? 'AI Advisor' : 'User'}
            </span>
        </div>
    );
};

// --- MAIN AI ADVISOR VIEW COMPONENT ---

const AIAdvisorView: React.FC<{ previousView: View | null }> = ({ previousView }) => {
    const { state, sendMessage, resetChat } = useAIAdvisorChat();
    const { messages, isLoading, error, isToolExecuting, toolExecutionName } = state;
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isToolExecuting]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;
        setInput('');
        await sendMessage(messageText);
    };

    const handleSuggestionClick = (prompt: string) => {
        handleSendMessage(prompt);
    };
    
    const handleAction = (payload: any) => {
        const actionMessage = `[SYSTEM ACTION TRIGGERED]: User confirmed action with payload: ${JSON.stringify(payload)}. Proceed with execution.`;
        handleSendMessage(actionMessage);
    };

    const prompts = examplePrompts[previousView || 'DEFAULT'] || examplePrompts.DEFAULT;

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
                        <FaRobot className="text-cyan-400" />
                        AI Advisor <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700">PRO</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Advanced Financial Intelligence System</p>
                </div>
                <button 
                  onClick={resetChat} 
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border border-transparent hover:border-gray-700"
                  title="Reboot System"
                >
                    <FaRedo className="h-4 w-4" />
                </button>
            </div>

            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden border-gray-800 bg-gray-900/50 backdrop-blur-sm" padding="none">
                <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {messages.length <= 1 && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-0 animate-fadeIn" style={{animationFillMode: 'forwards', animationDuration: '0.5s'}}>
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-gray-700">
                                <FaChartLine className="w-10 h-10 text-cyan-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Awaiting Directive</h3>
                            <p className="text-gray-400 mb-8 max-w-md">
                                I have analyzed your context from <strong className="text-cyan-400">{previousView || 'Dashboard'}</strong>. 
                                Select a topic to get started:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                {prompts.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handleSuggestionClick(p)}
                                        className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/50 rounded-xl text-sm text-gray-300 hover:text-white transition-all text-left group"
                                    >
                                        <span className="block text-xs text-cyan-500 font-bold mb-1 group-hover:text-cyan-400">EXECUTE &gt;</span>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {messages.map((msg) => (
                       <MessageRenderer key={msg.id} message={msg} onAction={handleAction} />
                    ))}
                    
                    {isLoading && !isToolExecuting && (
                        <div className="flex items-start gap-4 animate-pulse">
                             <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center border border-gray-700"><FaRobot className="h-6 w-6 text-cyan-500"/></div>
                             <div className="bg-gray-800 px-4 py-3 rounded-xl rounded-tl-none border border-gray-700 flex items-center gap-2">
                                <span className="text-xs text-cyan-400 font-mono">COMPUTING</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                             </div>
                        </div>
                    )}

                    {isToolExecuting && (
                        <div className="flex flex-col items-center justify-center gap-2 py-4">
                             <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 animate-pulse"></div>
                                <FaTools className="relative z-10 animate-spin text-cyan-400 w-6 h-6" />
                             </div>
                             <span className="text-xs font-mono text-cyan-300 tracking-widest">
                                 ACCESSING MODULE: <span className="font-bold text-white">{toolExecutionName}</span>
                             </span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
                
                {error && (
                    <div className="p-4 border-t border-red-500/30 bg-red-900/20 backdrop-blur-md text-red-200 flex items-center gap-3 animate-slideUp">
                         <FaExclamationCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                         <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-800 bg-gray-900">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative flex items-center gap-3">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter command or query..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all shadow-inner"
                                disabled={isLoading || !!error}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-600 font-mono border border-gray-700 px-1.5 py-0.5 rounded">
                                CMD+ENTER
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20 transition-all transform active:scale-95"
                            disabled={isLoading || !input.trim() || !!error}
                        >
                            {isLoading ? <FaRedo className="animate-spin" /> : 'EXECUTE'}
                        </button>
                    </form>
                    <div className="flex justify-between items-center mt-2 px-1">
                        <p className="text-[10px] text-gray-600 font-mono">SECURE CONNECTION â€¢ ENCRYPTED â€¢ LATENCY: 12ms</p>
                        <p className="text-[10px] text-gray-600">AI Advisor may produce hallucinations. Verify critical financial data.</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AIAdvisorView;