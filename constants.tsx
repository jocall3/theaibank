import React from 'react';
import { View } from './types';
import {
    Bot, FileText, Shuffle, PiggyBank, Target, Shield, TrendingUp, Gem, Code, Globe, Cuboid, Home, Palette, Percent, Rocket, Briefcase, Calculator, Scroll, Building, Landmark, Link, Users, Megaphone, Network, ShoppingBag, User, FileCog, Settings, Eye, CreditCard, Lock, Leaf
} from 'lucide-react';

export const banks = [
    { name: 'Chase', logo: <Building className="w-6 h-6 text-blue-600" />, institution_id: 'ins_1' },
    { name: 'Bank of America', logo: <Landmark className="w-6 h-6 text-red-600" />, institution_id: 'ins_2' },
    { name: 'Wells Fargo', logo: <Shield className="w-6 h-6 text-yellow-600" />, institution_id: 'ins_3' },
    { name: 'Citi', logo: <Globe className="w-6 h-6 text-blue-400" />, institution_id: 'ins_4' },
    { name: 'Capital One', logo: <CreditCard className="w-6 h-6 text-blue-800" />, institution_id: 'ins_5' },
];

export const NAV_ITEMS = [
    {
        group: 'Personal Finance',
        items: [
            { view: View.Dashboard, title: 'Dashboard', icon: Bot },
            { view: View.Transactions, title: 'Transactions', icon: FileText },
            { view: View.SendMoney, title: 'Send Money', icon: Shuffle },
            { view: View.Budgets, title: 'Budgets', icon: PiggyBank },
            { view: View.FinancialGoals, title: 'Financial Goals', icon: Target },
            { view: View.CreditHealth, title: 'Credit Health', icon: Shield },
        ]
    },
    {
        group: 'Wealth & Investing',
        items: [
            { view: View.Investments, title: 'Investments', icon: TrendingUp },
            { view: View.CryptoWeb3, title: 'Crypto & Web3', icon: Gem },
            { view: View.AlgoTradingLab, title: 'Algo-Trading Lab', icon: Code },
            { view: View.ForexArena, title: 'Forex Arena', icon: Globe },
            { view: View.CommoditiesExchange, title: 'Commodities Exchange', icon: Cuboid },
            { view: View.RealEstateEmpire, title: 'Real Estate Empire', icon: Home },
            { view: View.ArtCollectibles, title: 'Art & Collectibles', icon: Palette },
            { view: View.DerivativesDesk, title: 'Derivatives Desk', icon: Percent },
            { view: View.VentureCapital, title: 'Venture Capital', icon: Rocket },
            { view: View.PrivateEquity, title: 'Private Equity', icon: Briefcase },
            { view: View.TaxOptimization, title: 'Tax Optimization', icon: Calculator },
            { view: View.LegacyBuilder, title: 'Legacy Builder', icon: Scroll },
            { view: View.SovereignWealth, title: 'Sovereign Wealth', icon: Landmark },
        ]
    },
    {
        group: 'Corporate & Enterprise',
        items: [
            { view: View.CorporateCommand, title: 'Corporate Command', icon: Building },
            { view: View.ModernTreasury, title: 'Modern Treasury', icon: Landmark },
            { view: View.CardPrograms, title: 'Card Programs', icon: CreditCard },
            { view: View.DataNetwork, title: 'Data Network', icon: Link },
            { view: View.Payments, title: 'Payments', icon: Shuffle },
            { view: View.OpenBanking, title: 'Open Banking', icon: Link },
            { view: View.FinancialDemocracy, title: 'Financial Democracy', icon: Users },
        ]
    },
    {
        group: 'AI & Innovation',
        items: [
            { view: View.AIAdvisor, title: 'AI Advisor', icon: Bot },
            { view: View.QuantumWeaver, title: 'Quantum Weaver', icon: Network },
            { view: View.AgentMarketplace, title: 'Agent Marketplace', icon: ShoppingBag },
            { view: View.AIAdStudio, title: 'AI Ad Studio', icon: Megaphone },
        ]
    },
    {
        group: 'Services & System',
        items: [
            { view: View.ConciergeService, title: 'Concierge Service', icon: User },
            { view: View.Philanthropy, title: 'Philanthropy', icon: Leaf },
            { view: View.APIStatus, title: 'API Status', icon: FileCog },
            { view: View.SecurityCenter, title: 'Security Center', icon: Shield },
            { view: View.SSO, title: 'SSO', icon: Lock },
            { view: View.CardCustomization, title: 'Card Customization', icon: Palette },
            { view: View.Personalization, title: 'Personalization', icon: Settings },
            { view: View.TheVision, title: 'The Vision', icon: Eye },
        ]
    }
];