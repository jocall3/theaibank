
import React, { useContext, useState, useMemo } from 'react';
import Card from './Card';
import type { AIInsight } from '../types';
import { DataContext } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, LineChart, Line, CartesianGrid } from 'recharts';

// --- GEIN-Enhanced Component Ecosystem for Hyper-Scale AI-Driven Trading ---

// Expanded AIInsight type to represent a deeply interconnected, multi-faceted data structure.
interface EnhancedAIInsight extends AIInsight {
    confidenceScore: number;
    actionable: boolean;
    actionType?: 'rebalance_portfolio' | 'set_stop_loss' | 'execute_trade' | 'liquidity_provision';
    details?: {
        asset?: string;
        currentAllocation?: number;
        suggestedAllocation?: number;
        currentPrice?: number;
        suggestedStopLoss?: number;
        tradeType?: 'buy' | 'sell';
        quantity?: number;
        targetPool?: string;
    };
    tags: string[];
    // --- GEIN (Generative Edge & Intelligence Nexus) Implementation ---
    geinFactor: number; // Proprietary metric for insight quality and uniqueness.
    correlationId: string; // Links related insights across different models/timeframes.
    sourceModel: string; // The specific AI model that generated the insight.
    timeToLive: number; // Validity period of the insight in seconds.
    riskAnalysis: {
        volatilityIndex: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
    backtestData: { name: string; value: number }[];
    alternativeActions: {
        actionType: string;
        rationale: string;
        confidence: number;
    }[];
}

// --- Self-Contained SVG Icons for a Richer UI without external dependencies ---

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5.2a1 1 0 01-1.17.986l-3.2-1.1a1 1 0 00-1.26.95l.5 3.5a1 1 0 01-.45.95l-2.7 2.1a1 1 0 00-.55 1.34l3.2 5.9a1 1 0 01.05.52 1 1 0 01-1.6 1.04l-1.4-1.4a1 1 0 00-1.4 1.4l1.4 1.4a3 3 0 004.2 0l9.4-9.4a1 1 0 01-.1-1.5l-5.9-3.2a1 1 0 01-.5-.05l-3.5-.5a1 1 0 00-.95 1.26l1.1 3.2A1 1 0 018.8 11V2a1 1 0 011.3-.954z" clipRule="evenodd" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- Enhanced Urgency Indicator with Labels ---

const UrgencyIndicator: React.FC<{ urgency: 'low' | 'medium' | 'high' }> = ({ urgency }) => {
    const urgencyConfig = useMemo(() => ({
        low: { class: 'bg-blue-500', label: 'Low' },
        medium: { class: 'bg-yellow-500', label: 'Medium' },
        high: { class: 'bg-red-500', label: 'High' },
    }), []);
    
    return (
        <div className="absolute top-3 right-3 flex items-center text-xs font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${urgencyConfig[urgency].class} mr-2`}></span>
            <span className="text-gray-400">{urgencyConfig[urgency].label} Urgency</span>
        </div>
    );
};

// --- Self-Contained "App-in-App" Action Modal with Multi-Tab Analysis ---

const ActionModal: React.FC<{ insight: EnhancedAIInsight; onClose: () => void }> = ({ insight, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'backtest' | 'alternatives'>('overview');

    const handleExecute = () => {
        setIsLoading(true);
        console.log(`Executing HFT action: ${insight.actionType} for insight ${insight.id} with details:`, insight.details);
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1500);
    };

    const renderOverview = () => {
        switch (insight.actionType) {
            case 'rebalance_portfolio':
                return (
                    <>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">Rebalance: {insight.details?.asset}</h4>
                        <p className="text-sm text-gray-400 mb-4">Adjust allocation from {insight.details?.currentAllocation}% to {insight.details?.suggestedAllocation}%. This is a high-conviction trade based on predictive market analytics.</p>
                        <div className="space-y-2">
                            <label htmlFor="allocation" className="block text-sm font-medium text-gray-300">New Allocation (%)</label>
                            <input type="range" id="allocation" min="0" max="100" defaultValue={insight.details?.suggestedAllocation} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </>
                );
            case 'set_stop_loss':
                return (
                    <>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">Set Stop-Loss: {insight.details?.asset}</h4>
                        <p className="text-sm text-gray-400 mb-4">Current Price: ${insight.details?.currentPrice?.toFixed(2)}. The AI suggests a new stop-loss to mitigate downside risk from volatility spikes.</p>
                        <div className="space-y-2">
                            <label htmlFor="stoploss" className="block text-sm font-medium text-gray-300">Stop-Loss Price ($)</label>
                            <input type="number" id="stoploss" defaultValue={insight.details?.suggestedStopLoss} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                    </>
                );
            case 'liquidity_provision':
                 return (
                    <>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">Provide Liquidity: {insight.details?.asset}</h4>
                        <p className="text-sm text-gray-400 mb-4">Provide liquidity to the {insight.details?.targetPool} pool to capture yield. AI predicts favorable fee generation over the next 24 hours.</p>
                        <div className="space-y-2">
                            <label htmlFor="lp_allocation" className="block text-sm font-medium text-gray-300">Portfolio Allocation for LP (%)</label>
                            <input type="number" id="lp_allocation" defaultValue={insight.details?.suggestedAllocation} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-100 focus:ring-cyan-500 focus:border-cyan-500" />
                        </div>
                    </>
                );
            default:
                return <p className="text-gray-300">Action form for "{insight.actionType}" is not implemented.</p>;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'risk': return (
                <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3">GEIN Risk Analysis</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="flex justify-between p-2 bg-gray-900/50 rounded-md"><span>Volatility Index:</span><span className="font-mono text-yellow-400">{insight.riskAnalysis.volatilityIndex}</span></li>
                        <li className="flex justify-between p-2 bg-gray-900/50 rounded-md"><span>Sharpe Ratio (Projected):</span><span className="font-mono text-green-400">{insight.riskAnalysis.sharpeRatio}</span></li>
                        <li className="flex justify-between p-2 bg-gray-900/50 rounded-md"><span>Max Drawdown (Backtested):</span><span className="font-mono text-red-400">{insight.riskAnalysis.maxDrawdown.toFixed(2)}%</span></li>
                    </ul>
                </div>
            );
            case 'backtest': return (
                <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3">6-Month Backtest Performance</h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={insight.backtestData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#374151' }} />
                                <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
            case 'alternatives': return (
                <div>
                    <h4 className="text-lg font-semibold text-gray-100 mb-3">Alternative AI-Considered Actions</h4>
                    <div className="space-y-3">
                        {insight.alternativeActions.map((alt, i) => (
                            <div key={i} className="p-3 bg-gray-900/50 rounded-md">
                                <div className="flex justify-between items-center font-semibold">
                                    <span className="text-gray-200">{alt.actionType}</span>
                                    <span className="text-xs text-gray-400">Confidence: {(alt.confidence * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{alt.rationale}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
            default: return null;
        }
    };

    const TabButton: React.FC<{ tab: 'overview' | 'risk' | 'backtest' | 'alternatives', children: React.ReactNode }> = ({ tab, children }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>{children}</button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-400 flex items-center"><BoltIcon /> Actionable Insight</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><CloseIcon /></button>
                </div>
                <div className="border-b border-gray-700 -mx-6 px-3 mb-4"><div className="flex space-x-2">
                    <TabButton tab="overview">Overview</TabButton>
                    <TabButton tab="risk">Risk Analysis</TabButton>
                    <TabButton tab="backtest">Backtest</TabButton>
                    <TabButton tab="alternatives">Alternatives</TabButton>
                </div></div>
                <div className="mb-6 min-h-[150px]">{renderTabContent()}</div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleExecute} disabled={isLoading} className="px-4 py-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed flex items-center">
                        {isLoading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Executing...</>) : 'Execute Trade'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Modular Insight Card Component ---

const InsightCard: React.FC<{ insight: EnhancedAIInsight; onAction: (insight: EnhancedAIInsight) => void }> = ({ insight, onAction }) => {
    const confidenceColor = useMemo(() => {
        if (insight.confidenceScore > 0.9) return 'text-green-400';
        if (insight.confidenceScore > 0.75) return 'text-yellow-400';
        return 'text-orange-400';
    }, [insight.confidenceScore]);

    return (
        <div className="relative p-4 bg-gray-800/60 rounded-lg border border-gray-700/80 hover:border-cyan-500/70 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10">
            <UrgencyIndicator urgency={insight.urgency} />
            <h4 className="font-bold text-gray-100 pr-24">{insight.title}</h4>
            <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <div className="flex flex-wrap gap-2">{insight.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-700 rounded-full capitalize">{tag}</span>)}</div>
                <div className="flex items-center space-x-3">
                    <span className="font-semibold text-cyan-300" title="Generative Edge & Intelligence Nexus Factor">GEIN: {insight.geinFactor.toFixed(2)}</span>
                    <span className={`font-semibold ${confidenceColor}`}>Confidence: {(insight.confidenceScore * 100).toFixed(0)}%</span>
                </div>
            </div>

            {insight.chartData && insight.chartData.length > 0 && (
                <div className="mt-4 h-32 pr-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insight.chartData} layout="vertical" margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" width={90} style={{ textTransform: 'capitalize' }} />
                            <Tooltip cursor={{ fill: 'rgba(100,116,139,0.15)' }} contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: '#374151', fontSize: '12px', borderRadius: '0.5rem' }} formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)]} labelFormatter={(label) => <span className="font-bold capitalize">{label}</span>} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>{insight.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#22d3ee'} />)}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {insight.actionable && (
                <div className="mt-4 pt-3 border-t border-gray-700/80 flex justify-end">
                    <button onClick={() => onAction(insight)} className="flex items-center px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-transform duration-200 hover:scale-105">
                        <BoltIcon />Take Action
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main AIInsights Component with State Management and Data Simulation ---

const AIInsights: React.FC = () => {
    const context = useContext(DataContext);
    const [activeInsight, setActiveInsight] = useState<EnhancedAIInsight | null>(null);

    if (!context) throw new Error("AIInsights must be within a DataProvider");
    
    const enhancedInsights: EnhancedAIInsight[] = useMemo(() => (context.aiInsights || []).map((insight, index) => {
        const base = {
            ...insight,
            confidenceScore: [0.95, 0.82, 0.76, 0.91][index % 4] || 0.88,
            actionable: [true, false, true, true][index % 4] || false,
            geinFactor: parseFloat((Math.random() * (1.5 - 0.8) + 0.8).toFixed(2)),
            correlationId: `corr-${(12345 * (index + 1)).toString(16)}`,
            sourceModel: ['Gemini-3.0-Ultra', 'Athena-HFT-v2', 'Prometheus-Quant-v4.1'][index % 3],
            timeToLive: [3600, 900, 14400][index % 3],
            riskAnalysis: {
                volatilityIndex: parseFloat((Math.random() * (0.8 - 0.2) + 0.2).toFixed(3)),
                sharpeRatio: parseFloat((Math.random() * (2.5 - 0.5) + 0.5).toFixed(2)),
                maxDrawdown: parseFloat((Math.random() * (15 - 5) + 5).toFixed(2)),
            },
            backtestData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].reduce((acc, month, i) => {
                const prevValue = i > 0 ? acc[i-1].value : 1000;
                acc.push({ name: month, value: Math.round(prevValue + (Math.random() - 0.45) * 500) });
                return acc;
            }, [] as {name: string, value: number}[]),
            alternativeActions: [
                { actionType: 'Hold Position', rationale: 'Wait for market confirmation signal.', confidence: 0.65 },
                { actionType: 'Partial Sell (25%)', rationale: 'De-risk portfolio while maintaining upside exposure.', confidence: 0.72 },
            ],
        };

        const actionType = ['rebalance_portfolio', undefined, 'set_stop_loss', 'liquidity_provision'][index % 4];
        let details;
        switch (actionType) {
            case 'rebalance_portfolio': details = { asset: 'TECH', currentAllocation: 25, suggestedAllocation: 35 }; break;
            case 'set_stop_loss': details = { asset: 'CRYPTO', currentPrice: 45000, suggestedStopLoss: 42500 }; break;
            case 'liquidity_provision': details = { asset: 'ETH/USDC', targetPool: 'Uniswap V3', suggestedAllocation: 5 }; break;
            default: details = undefined;
        }

        return {
            ...base,
            actionType,
            details,
            tags: [['alpha', 'growth'], ['volatility', 'risk'], ['hedging'], ['yield', 'defi']][index % 4] || ['general'],
        };
    }), [context.aiInsights]);

    const handleActionClick = (insight: EnhancedAIInsight) => setActiveInsight(insight);
    const handleCloseModal = () => setActiveInsight(null);

    return (
        <>
            <Card title="AI Co-Pilot: GEIN-Powered Insights" className="h-full flex flex-col" isLoading={context.isInsightsLoading}>
                <div className="flex-grow space-y-4 overflow-y-auto h-0 pr-2">
                    {enhancedInsights.length > 0 ? (
                        enhancedInsights.map(insight => <InsightCard key={insight.id} insight={insight} onAction={handleActionClick} />)
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-gray-400">
                            <div>
                                <p>No active insights from AI Co-Pilot.</p>
                                <p className="text-sm">System is monitoring markets in real-time...</p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
            {activeInsight && <ActionModal insight={activeInsight} onClose={handleCloseModal} />}
        </>
    );
};

export default AIInsights;