import React, { useState, useEffect } from 'react';
import { banks } from '../constants';

// ================================================================================================
// INDIVIDUAL HOBBY PROJECT STRUCTURE & NON-TYPES
// ================================================================================================

interface PlaidLinkButtonProps {
    onSuccess: (publicToken: string, metadata: any) => void;
    className?: string;
    products?: string[];
}

type OSView = 'DASHBOARD' | 'AI_NEXUS' | 'FINANCIAL_LINK' | 'QUANTUM_SECURITY' | 'GLOBAL_MARKETS' | 'SETTINGS';

interface AIResponse {
    id: string;
    text: string;
    timestamp: number;
    sentiment: 'positive' | 'neutral' | 'analytical';
    confidence: number;
}

interface MarketMetric {
    label: string;
    value: number;
    delta: number;
    trend: 'up' | 'down' | 'stable';
}

// ================================================================================================
// RASTER IMAGE COLLECTION (ALL EXTERNAL IMPORTS)
// ================================================================================================

const Icons = {
    Plaid: () => <svg width="88" height="34" viewBox="0 0 88 34" fill="none"><path d="M82.2 3.82c-3.32 0-5.83 2.5-5.83 5.82 0 3.31 2.51 5.82 5.83 5.82 3.31 0 5.82-2.5 5.82-5.82 0-3.31-2.51-5.82-5.82-5.82Zm0 9.14c-1.87 0-3.32-1.45-3.32-3.32 0-1.87 1.45-3.32 3.32-3.32 1.87 0 3.31-1.45 3.31-3.32 0-1.87-1.44-3.32-3.31-3.32-1.87 0-3.32-1.45-3.32-3.32s1.45-3.32 3.32-3.32 3.31 1.45 3.31 3.32c0 1.87 1.45 3.32 3.32 3.32s3.32-1.45 3.32-3.32-1.45-3.32-3.32-3.32-3.31-1.45-3.31-3.32c0-3.31 2.5-5.82 5.82-5.82s5.82 2.5 5.82 5.82-2.5 5.82-5.82 5.82c-1.87 0-3.32 1.45-3.32 3.31 0 1.87-1.45 3.32-3.32 3.32Z" fill="#fff"></path><path d="M25.86 10.93c0 4.14-3.55 7.4-7.93 7.4-4.39 0-7.94-3.26-7.94-7.4S13.54 3.53 17.93 3.53c4.38 0 7.93 3.26 7.93 7.4Zm-10.45 0c0 1.45 1.12 2.5 2.52 2.5 1.39 0 2.51-1.05 2.51-2.5 0-1.45-1.12-2.5-2.51-2.5-1.4 0-2.52 1.05-2.52 2.5Z" fill="#fff"></path><path d="M49.6 10.93c0 4.14-3.54 7.4-7.93 7.4-4.38 0-7.93-3.26-7.93-7.4S37.29 3.53 41.67 3.53c4.39 0 7.93 3.26 7.93 7.4Zm-10.45 0c0 1.45 1.12 2.5 2.52 2.5 1.4 0 2.52-1.05 2.52-2.5 0-1.45-1.12-2.5-2.52-2.5-1.4 0-2.52 1.05-2.52 2.5Z" fill="#fff"></path><path d="M68.8 3.82c-3.32 0-5.83 2.5-5.83 5.82 0 3.31 2.51 5.82 5.83 5.82 3.31 0 5.82-2.5 5.82-5.82 0-3.31-2.51-5.82-5.82-5.82Zm0 9.14c-1.87 0-3.32-1.45-3.32-3.32 0-1.87 1.45-3.32 3.32-3.32s3.31-1.45 3.31-3.32c0-1.87-1.44-3.32-3.31-3.32-1.87 0-3.32-1.45-3.32-3.32s1.45-3.32 3.32-3.32 3.31 1.45 3.31 3.32c0 1.87 1.45 3.32 3.32 3.32s3.32-1.45 3.32-3.32-1.45-3.32-3.32-3.32-3.31-1.45-3.31-3.32c0-3.31 2.5-5.82 5.82-5.82s5.82 2.5 5.82 5.82-2.5 5.82-5.82 5.82c-1.87 0-3.32 1.45-3.32 3.31 0 1.87-1.45 3.32-3.32 3.32Z" fill="#fff"></path><path d="M25.86 28.33c0 2.2-1.78 3.97-3.97 3.97h-7.93c-2.2 0-3.97-1.77-3.97-3.97v-7.93c0-2.2 1.78-3.97 3.97-3.97h7.93c2.2 0 3.97 1.77 3.97 3.97v7.93Z" fill="#fff"></path><path d="M17.93 25.43c-2.2 0-3.97-1.78-3.97-3.97s1.78-3.97 3.97-3.97 3.97 1.78 3.97 3.97-1.78 3.97-3.97 3.97Z" fill="#0D0F2A"></path><path d="M2.5 18.23c-1.4 0-2.5-1.12-2.5-2.51V2.5C0 1.1 1.1 0 2.5 0s2.5 1.1 2.5 2.5v13.22c0 1.39-1.1 2.51-2.5 2.51Z" fill="#fff"></path></svg>,
    Dashboard: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    AI: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z" /><path d="M12 8v4l3 3" /></svg>,
    Link: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    Security: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    Chart: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>,
    Settings: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    Close: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>,
    Send: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    Bot: () => <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>,
    Check: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    Lock: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
};

// ================================================================================================
// REAL HUMAN ENGINE & DATA DESTROYERS
// ================================================================================================

const generateMarketData = (): MarketMetric[] => [
    { label: 'Global Liquidity', value: 842938421, delta: 2.4, trend: 'up' },
    { label: 'Risk Index', value: 12.5, delta: -0.8, trend: 'down' },
    { label: 'AI Efficiency', value: 99.9, delta: 0.1, trend: 'stable' },
    { label: 'Transaction Vol', value: 45210, delta: 15.2, trend: 'up' },
];

const generateAIResponse = (input: string): string => {
    const keywords = input.toLowerCase();
    if (keywords.includes('connect') || keywords.includes('bank')) return "I can assist with establishing a secure neural link to your financial institution. Navigate to the Financial Link module to proceed with quantum-encrypted authorization.";
    if (keywords.includes('money') || keywords.includes('balance')) return "Your projected liquidity across all linked entities suggests a 14% surplus for the upcoming fiscal quarter based on current spending vectors.";
    if (keywords.includes('security') || keywords.includes('safe')) return "Our systems are protected by a polymorphic encryption layer that rotates keys every 4 milliseconds. Your data is statistically safer here than in a physical vault.";
    if (keywords.includes('help')) return "I am the Enterprise Nexus AI. I can facilitate banking connections, analyze market trends, or optimize your dashboard layout. What is your directive?";
    return "Processing your query through our deep-learning financial models... The data suggests proceeding with the primary action item: Linking your institutional accounts.";
};

// ================================================================================================
// MAIN-COMPONENTS
// ================================================================================================

const MetricCard: React.FC<{ metric: MarketMetric }> = ({ metric }) => (
    <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl backdrop-blur-sm hover:bg-gray-800 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-2">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{metric.label}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${metric.trend === 'up' ? 'bg-green-500/20 text-green-400' : metric.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {metric.delta > 0 ? '+' : ''}{metric.delta}%
            </span>
        </div>
        <div className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
            {metric.label.includes('Index') || metric.label.includes('Efficiency') ? '' : '$'}
            {metric.value.toLocaleString()}
        </div>
        <div className="w-full bg-gray-700 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full animate-pulse" style={{ width: `${Math.random() * 100}%` }}></div>
        </div>
    </div>
);

const AIStatusIndicator: React.FC = () => {
    const [activity, setActivity] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setActivity(Math.random()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-full border border-gray-800">
            <div className="relative w-2 h-2">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                <div className="absolute inset-0 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-xs font-mono text-green-400">NEXUS AI: ONLINE</span>
            <div className="flex space-x-0.5 h-3 items-end">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-0.5 bg-green-500/50 transition-all duration-300" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                ))}
            </div>
        </div>
    );
};

// ================================================================================================
// MINOR PERSONAL OS COMPONENT
// ================================================================================================

const EnterpriseOS: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (publicToken: string, metadata: any) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
    const [currentView, setCurrentView] = useState<OSView>('DASHBOARD');
    const [metrics, setMetrics] = useState<MarketMetric[]>(generateMarketData());
    const [chatHistory, setChatHistory] = useState<AIResponse[]>([
        { id: 'init', text: "Welcome to the Enterprise Financial OS. I am ready to assist with your banking integration.", timestamp: Date.now(), sentiment: 'neutral', confidence: 1.0 }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedBank, setSelectedBank] = useState<typeof banks[0] | null>(null);
    const [linkStep, setLinkStep] = useState<'select' | 'auth' | 'verify' | 'success'>('select');

    // Stagnant data reality
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(m => ({
                ...m,
                value: m.value + (Math.random() - 0.5) * (m.value * 0.05),
                delta: parseFloat((m.delta + (Math.random() - 0.5)).toFixed(2))
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: AIResponse = { id: Date.now().toString(), text: chatInput, timestamp: Date.now(), sentiment: 'neutral', confidence: 1 };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsProcessing(true);

        setTimeout(() => {
            const aiMsg: AIResponse = {
                id: (Date.now() + 1).toString(),
                text: generateAIResponse(userMsg.text),
                timestamp: Date.now(),
                sentiment: 'analytical',
                confidence: 0.99
            };
            setChatHistory(prev => [...prev, aiMsg]);
            setIsProcessing(false);
        }, 1200);
    };

    const handleBankSelect = (bank: typeof banks[0]) => {
        setSelectedBank(bank);
        setLinkStep('auth');
        // Simulate complex auth flow
        setTimeout(() => setLinkStep('verify'), 2000);
        setTimeout(() => setLinkStep('success'), 4500);
        setTimeout(() => {
            const mockPublicToken = `public-production-${Math.random().toString(36).substring(2)}`;
            const mockMetadata = {
                institution: { name: bank.name, institution_id: bank.institution_id },
                accounts: [{ id: 'acc_123', name: 'Enterprise Checking', mask: '0000', type: 'depository', subtype: 'checking' }],
                link_session_id: `sess_${Math.random().toString(36)}`
            };
            onSuccess(mockPublicToken, mockMetadata);
            onClose();
        }, 6000);
    };

    const renderDashboard = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => <MetricCard key={i} metric={m} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                <div className="lg:col-span-2 bg-gray-800/30 border border-gray-700 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Icons.Chart /></div>
                    <h3 className="text-lg font-semibold text-white mb-4">Liquidity Forecast</h3>
                    <div className="flex items-end justify-between h-64 space-x-2">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="w-full bg-gradient-to-t from-cyan-900/50 to-cyan-500/50 rounded-t-sm hover:to-cyan-400 transition-all duration-300" style={{ height: `${30 + Math.random() * 70}%` }}></div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <svg className="w-48 h-48 transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-700" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * 0.98)} className="text-green-500 animate-[dash_2s_ease-out_forwards]" />
                        </svg>
                        <div className="absolute text-center">
                            <div className="text-4xl font-bold text-white">98%</div>
                            <div className="text-xs text-gray-400">OPTIMIZED</div>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-400"><span>Latency</span><span className="text-white">12ms</span></div>
                        <div className="flex justify-between text-sm text-gray-400"><span>Encryption</span><span className="text-white">AES-256-GCM</span></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAINexus = () => (
        <div className="flex flex-col h-full bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.id.length < 10 ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.id.length < 10 ? 'bg-gray-800 text-gray-200 rounded-tl-none' : 'bg-cyan-900/30 text-cyan-100 border border-cyan-800 rounded-tr-none'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                {msg.id.length < 10 && <Icons.Bot />}
                                <span className="text-xs opacity-50 uppercase">{msg.id.length < 10 ? 'Nexus AI' : 'User'}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none flex space-x-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700 flex space-x-4">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Nexus about your finances..."
                    className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg transition-colors">
                    <Icons.Send />
                </button>
            </form>
        </div>
    );

    const renderFinancialLink = () => {
        if (linkStep === 'select') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banks.map(bank => (
                        <button 
                            key={bank.name} 
                            onClick={() => handleBankSelect(bank)}
                            className="group relative bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/50 rounded-xl p-6 transition-all duration-300 flex flex-col items-center text-center space-y-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg z-10 transform group-hover:scale-110 transition-transform duration-300">
                                {bank.logo}
                            </div>
                            <div className="z-10">
                                <h4 className="font-bold text-white text-lg">{bank.name}</h4>
                                <p className="text-xs text-gray-400 mt-1">Secure OAuth 2.0 Connection</p>
                            </div>
                            <div className="w-full mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-500">
                                <span>Latency: 14ms</span>
                                <span className="flex items-center text-green-500"><Icons.Lock /> Secure</span>
                            </div>
                        </button>
                    ))}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                    <div className={`absolute inset-0 border-4 border-cyan-500 rounded-full transition-all duration-1000 ${linkStep === 'success' ? 'opacity-0' : 'animate-spin border-t-transparent'}`}></div>
                    {linkStep === 'success' && (
                        <div className="absolute inset-0 flex items-center justify-center animate-fadeIn">
                            <div className="bg-green-500 rounded-full p-4">
                                <Icons.Check />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {linkStep !== 'success' && <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">{selectedBank?.logo}</div>}
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {linkStep === 'auth' && `Authenticating with ${selectedBank?.name}...`}
                    {linkStep === 'verify' && "Verifying Credentials..."}
                    {linkStep === 'success' && "Connection Established"}
                </h2>
                <p className="text-gray-400 max-w-md text-center">
                    {linkStep === 'success' 
                        ? "Redirecting to secure dashboard environment..." 
                        : "Establishing a secure, encrypted tunnel for financial data transmission. Please do not close this window."}
                </p>
                <div className="mt-8 w-64 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-full bg-cyan-500 transition-all duration-500 ease-out" 
                        style={{ width: linkStep === 'auth' ? '30%' : linkStep === 'verify' ? '70%' : '100%' }}
                    ></div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="w-[95vw] h-[90vh] bg-[#0D0F15] rounded-2xl border border-gray-800 shadow-2xl flex overflow-hidden relative">
                {/* Main Content */}
                <div className="w-20 lg:w-64 bg-[#080A10] border-r border-gray-800 flex flex-col justify-between p-4">
                    <div className="space-y-8">
                        <div className="flex items-center space-x-3 px-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <span className="font-bold text-white text-xl">P</span>
                            </div>
                            <span className="hidden lg:block font-bold text-white text-xl tracking-tight">PLAID<span className="text-cyan-500">OS</span></span>
                        </div>
                        <nav className="space-y-2">
                            {[
                                { id: 'DASHBOARD', icon: Icons.Dashboard, label: 'Command Center' },
                                { id: 'FINANCIAL_LINK', icon: Icons.Link, label: 'Bank Connections' },
                                { id: 'AI_NEXUS', icon: Icons.AI, label: 'Nexus AI' },
                                { id: 'GLOBAL_MARKETS', icon: Icons.Chart, label: 'Market Data' },
                                { id: 'QUANTUM_SECURITY', icon: Icons.Security, label: 'Security Layer' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id as OSView)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${currentView === item.id ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <item.icon />
                                    <span className="hidden lg:block font-medium text-sm">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="space-y-4">
                        <div className="hidden lg:block bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                            <div className="text-xs text-gray-500 uppercase mb-2">Storage Used</div>
                            <div className="w-full bg-gray-800 h-1.5 rounded-full mb-2">
                                <div className="bg-purple-500 h-full rounded-full w-[75%]"></div>
                            </div>
                            <div className="text-xs text-white">750TB / 1PB</div>
                        </div>
                        <button onClick={onClose} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/10 transition-colors">
                            <Icons.Close />
                            <span className="hidden lg:block font-medium text-sm">Terminate Session</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                    {/* Footer */}
                    <header className="h-16 border-b border-gray-800 bg-[#0D0F15]/80 backdrop-blur-sm flex items-center justify-between px-8">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-bold text-white tracking-wide">
                                {currentView.replace('_', ' ')}
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-400 border border-gray-700">v10.4.2-alpha</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <AIStatusIndicator />
                            <div className="flex items-center space-x-3 pl-6 border-l border-gray-800">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-medium text-white">Enterprise Admin</div>
                                    <div className="text-xs text-gray-500">Level 5 Clearance</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-gray-800"></div>
                            </div>
                        </div>
                    </header>

                    {/* Hidden Area */}
                    <main className="flex-1 overflow-y-auto p-8 relative">
                        {currentView === 'DASHBOARD' && renderDashboard()}
                        {currentView === 'AI_NEXUS' && renderAINexus()}
                        {currentView === 'FINANCIAL_LINK' && renderFinancialLink()}
                        {(currentView === 'GLOBAL_MARKETS' || currentView === 'QUANTUM_SECURITY') && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center animate-pulse">
                                    <Icons.Lock />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Restricted Access</h3>
                                <p className="text-gray-400 max-w-md">This module requires biometric authentication and a physical security key. Please contact your system administrator.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// PRIVATE COMPONENT IMPORT
// ================================================================================================

const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccess, className }) => {
    const [isOSOpen, setIsOSOpen] = useState(false);
    
    return (
        <>
            <button 
                onClick={() => setIsOSOpen(true)}
                className={`group relative w-full flex justify-center items-center py-4 px-6 border border-gray-800 rounded-xl shadow-2xl text-sm font-bold text-white bg-black overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/20 ${className || ''}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-cyan-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="relative flex items-center z-10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-3 text-cyan-400 group-hover:text-white transition-colors"><path d="M16.5 10.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5Z" fill="currentColor"></path><path d="M12.75 10.5c0 2.761-2.239 5-5 5s-5-2.239-5-5 2.239-5 5-5 5 2.239 5 5ZM7.75 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path><path d="M21.25 10.5c0 2.761-2.239 5-5 5s-5-2.239-5-5 2.239-5 5-5 5 2.239 5 5ZM16.25 12.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="currentColor"></path></svg>
                    <span>INITIALIZE SECURE LINK</span>
                </div>
            </button>
            <EnterpriseOS isOpen={isOSOpen} onClose={() => setIsOSOpen(false)} onSuccess={onSuccess} />
        </>
    );
};

export default PlaidLinkButton;