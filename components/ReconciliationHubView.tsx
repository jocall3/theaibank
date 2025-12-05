import React, { useState, useCallback, useMemo } from 'react';

// --- Types based on OpenAPI Spec (Simplified for UI Rendering) ---

interface Transaction {
  id: string;
  amount: number; // smallest currency unit
  currency: string;
  direction: 'credit' | 'debit';
  vendor_description: string;
  as_of_date: string; // YYYY-MM-DD
  posted: boolean;
  reconciled: boolean;
}

interface ExpectedPayment {
  id: string;
  amount_lower_bound: number;
  amount_upper_bound: number;
  currency: string;
  direction: 'credit' | 'debit';
  description: string | null;
  status: 'unreconciled' | 'reconciled' | 'archived';
}

interface ReconciliationItem {
    id: string;
    type: 'transaction' | 'expected_payment';
    details: Transaction | ExpectedPayment;
    reconciledToId?: string;
}

interface MatchSuggestion {
    transactionId: string;
    expectedPaymentId: string;
    score: number; // 0 to 1
    reason: string;
    aiGenerated: boolean;
}

// --- Mock Data and Hooks ---

const mockTransactions: ReconciliationItem[] = [
    { id: 'tx_1', type: 'transaction', details: { id: 'tx_1', amount: 10000, currency: 'USD', direction: 'credit', vendor_description: 'Acme Corp Payout', posted: true, reconciled: false } },
    { id: 'tx_2', type: 'transaction', details: { id: 'tx_2', amount: 5500, currency: 'USD', direction: 'debit', vendor_description: 'AWS Monthly Bill', posted: true, reconciled: false } },
    { id: 'tx_3', type: 'transaction', details: { id: 'tx_3', amount: 10000, currency: 'USD', direction: 'credit', vendor_description: 'Acme Corp Payout (Duplicate Amount)', posted: true, reconciled: false } },
];

const mockExpectedPayments: ReconciliationItem[] = [
    { id: 'ep_a', type: 'expected_payment', details: { id: 'ep_a', amount_lower_bound: 9900, amount_upper_bound: 10100, currency: 'USD', direction: 'credit', description: 'Monthly subscription from Acme', status: 'unreconciled' } },
    { id: 'ep_b', type: 'expected_payment', details: { id: 'ep_b', amount_lower_bound: 5000, amount_upper_bound: 6000, currency: 'USD', direction: 'debit', description: 'Expected AWS Fee', status: 'unreconciled' } },
    { id: 'ep_c', type: 'expected_payment', details: { id: 'ep_c', amount_lower_bound: 15000, amount_upper_bound: 15000, currency: 'USD', direction: 'credit', description: 'Large Client Deposit', status: 'unreconciled' } },
];

const mockSuggestions: MatchSuggestion[] = [
    { transactionId: 'tx_1', expectedPaymentId: 'ep_a', score: 0.95, reason: 'Exact Amount Match within range, close description match.', aiGenerated: true },
    { transactionId: 'tx_3', expectedPaymentId: 'ep_a', score: 0.80, reason: 'Exact Amount Match, timing slightly off.', aiGenerated: true },
    { transactionId: 'tx_2', expectedPaymentId: 'ep_b', score: 0.99, reason: 'Exact Amount and Direction Match.', aiGenerated: true },
];


/**
 * Simulate fetching and managing reconciliation data state.
 * In a real application, this would involve fetching from endpoints like:
 * - GET /api/transactions?reconciled=false
 * - GET /api/expected_payments?status=unreconciled
 * - GET /api/simulations/reconciliation_suggestions (mocked endpoint for AI assistance)
 */
const useReconciliationData = () => {
    const [transactions, setTransactions] = useState(mockTransactions);
    const [expectedPayments, setExpectedPayments] = useState(mockExpectedPayments);
    const [suggestions, setSuggestions] = useState(mockSuggestions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simulate API call to mark items as reconciled
    const reconcileItems = useCallback((txId: string, epId: string) => {
        setLoading(true);
        // Simulate API latency
        setTimeout(() => {
            setTransactions(prev => prev.filter(item => item.id !== txId));
            setExpectedPayments(prev => prev.filter(item => item.id !== epId));
            
            // Remove related suggestions
            setSuggestions(prev => prev.filter(s => s.transactionId !== txId && s.expectedPaymentId !== epId));

            // In a real scenario, this would involve calling PATCH endpoints
            // E.g., PATCH /api/transactions/{txId} { reconciled: true }
            // and PATCH /api/expected_payments/{epId} { status: 'reconciled' }

            console.log(`Reconciled Transaction ${txId} with Expected Payment ${epId}`);
            setLoading(false);
        }, 500);
    }, []);

    return {
        transactions,
        expectedPayments,
        suggestions,
        loading,
        error,
        reconcileItems,
    };
};

// --- UI Components ---

interface ItemCardProps {
    item: ReconciliationItem;
    isSelected: boolean;
    onSelect: (id: string) => void;
    matchScore?: number;
    isSuggestedMatch: boolean;
}

const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents/smallest unit
};

const ItemCard: React.FC<ItemCardProps> = ({ item, isSelected, onSelect, matchScore, isSuggestedMatch }) => {
    const isTx = item.type === 'transaction';
    const details = item.details as (Transaction | ExpectedPayment);
    
    let amountText;
    let descriptionText;

    if (isTx) {
        amountText = formatAmount((details as Transaction).amount, details.currency);
        descriptionText = (details as Transaction).vendor_description;
    } else {
        const epDetails = details as ExpectedPayment;
        if (epDetails.amount_lower_bound === epDetails.amount_upper_bound) {
            amountText = formatAmount(epDetails.amount_lower_bound, details.currency);
        } else {
            amountText = `${formatAmount(epDetails.amount_lower_bound, details.currency)} - ${formatAmount(epDetails.amount_upper_bound, details.currency)}`;
        }
        descriptionText = epDetails.description || 'N/A';
    }

    const cardClass = useMemo(() => {
        let base = 'p-3 my-2 border rounded shadow-sm cursor-pointer transition duration-150 ';
        if (isSelected) {
            base += 'ring-2 ring-blue-500 bg-blue-50 border-blue-500';
        } else if (isSuggestedMatch) {
            base += 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100';
        } else {
            base += 'border-gray-200 hover:bg-gray-50';
        }
        return base;
    }, [isSelected, isSuggestedMatch]);
    
    return (
        <div 
            className={cardClass}
            onClick={() => onSelect(item.id)}
        >
            <div className="flex justify-between items-center text-sm font-semibold">
                <span className={`px-2 py-0.5 rounded text-xs text-white ${isTx ? 'bg-green-600' : 'bg-indigo-600'}`}>
                    {isTx ? 'TRANSACTION' : 'EXPECTED PAYMENT'}
                </span>
                {matchScore !== undefined && (
                    <span className="text-sm font-bold text-yellow-700">
                        Match Score: {(matchScore * 100).toFixed(1)}%
                    </span>
                )}
            </div>
            <div className="mt-2 text-lg font-mono text-gray-800">
                {amountText} <span className="text-xs text-gray-500">({details.currency})</span>
            </div>
            <p className="text-xs text-gray-600 truncate">{descriptionText}</p>
        </div>
    );
};

// --- Main View Component ---

const ReconciliationHubView: React.FC = () => {
    const { transactions, expectedPayments, suggestions, loading, reconcileItems } = useReconciliationData();
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
    const [selectedEpId, setSelectedEpId] = useState<string | null>(null);

    const availableTransactions = transactions.filter(t => !t.reconciledToId);
    const availableExpectedPayments = expectedPayments.filter(ep => !ep.reconciledToId);

    const handleSelect = (id: string, type: 'transaction' | 'expected_payment') => {
        if (type === 'transaction') {
            setSelectedTxId(prev => prev === id ? null : id);
            setSelectedEpId(null); // Clear EP selection on new TX selection
        } else {
            setSelectedEpId(prev => prev === id ? null : id);
            setSelectedTxId(null); // Clear TX selection on new EP selection
        }
    };

    const handleMatch = useCallback(() => {
        if (selectedTxId && selectedEpId && !loading) {
            reconcileItems(selectedTxId, selectedEpId);
            setSelectedTxId(null);
            setSelectedEpId(null);
        }
    }, [selectedTxId, selectedEpId, loading, reconcileItems]);

    // Derived State: Suggestions related to currently selected item (if only one selected)
    const activeSuggestions = useMemo(() => {
        if (selectedTxId) {
            return suggestions.filter(s => s.transactionId === selectedTxId);
        }
        if (selectedEpId) {
            return suggestions.filter(s => s.expectedPaymentId === selectedEpId);
        }
        return mockSuggestions; // Default: show all high-scoring suggestions if nothing selected
    }, [selectedTxId, selectedEpId, suggestions]);

    // Handle suggestion clicks: automatically select both sides
    const handleSuggestionClick = useCallback((txId: string, epId: string) => {
        setSelectedTxId(txId);
        setSelectedEpId(epId);
    }, []);

    const selectedTx = transactions.find(t => t.id === selectedTxId);
    const selectedEp = expectedPayments.find(ep => ep.id === selectedEpId);

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Reconciliation Hub</h1>
                <p className="text-gray-500">Match transactions to expected payments. {availableTransactions.length + availableExpectedPayments.length} items awaiting action.</p>
            </header>

            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <p className="text-xl font-semibold text-blue-600">Processing Reconciliation...</p>
                </div>
            )}
            
            <div className="grid grid-cols-12 gap-6">
                
                {/* 1. Unreconciled Transactions */}
                <div className="col-span-4 bg-white p-4 shadow rounded-lg h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Unreconciled Transactions ({availableTransactions.length})
                    </h2>
                    {availableTransactions.map(item => {
                        const isSuggestedMatch = activeSuggestions.some(s => s.transactionId === item.id);
                        
                        // Find the highest score if this is part of the suggestion group
                        const score = isSuggestedMatch 
                            ? activeSuggestions.find(s => s.transactionId === item.id)?.score 
                            : undefined;

                        return (
                            <ItemCard
                                key={item.id}
                                item={item}
                                isSelected={selectedTxId === item.id}
                                onSelect={() => handleSelect(item.id, 'transaction')}
                                isSuggestedMatch={isSuggestedMatch}
                                matchScore={score}
                            />
                        );
                    })}
                    {availableTransactions.length === 0 && (
                        <p className="text-center text-gray-500 mt-10">No pending transactions found.</p>
                    )}
                </div>

                {/* 2. Reconciliation Action Area */}
                <div className="col-span-4 flex flex-col justify-center items-center h-[80vh]">
                    <div className="w-full max-w-sm p-6 bg-white shadow-xl rounded-lg border border-gray-200">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">Manual Reconciliation</h2>
                        
                        <div className="space-y-4">
                            <div className={`p-3 rounded border ${selectedTx ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-100'}`}>
                                <p className="text-xs font-medium text-gray-600">Selected Transaction</p>
                                <p className="font-mono text-sm break-words">{selectedTx ? selectedTx.id : 'None selected'}</p>
                            </div>
                            
                            <div className={`p-3 rounded border ${selectedEp ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-100'}`}>
                                <p className="text-xs font-medium text-gray-600">Selected Expected Payment</p>
                                <p className="font-mono text-sm break-words">{selectedEp ? selectedEp.id : 'None selected'}</p>
                            </div>
                        </div>

                        {selectedTx && selectedEp && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                <p className="font-semibold">Match Check:</p>
                                <ul className="list-disc list-inside text-xs mt-1">
                                    <li>Amount Match: {((selectedTx.details as Transaction).amount >= (selectedEp.details as ExpectedPayment).amount_lower_bound && (selectedTx.details as Transaction).amount <= (selectedEp.details as ExpectedPayment).amount_upper_bound) ? '✅ Yes' : '❌ No'}</li>
                                    <li>Currency Match: {(selectedTx.details.currency === selectedEp.details.currency) ? '✅ Yes' : '❌ No'}</li>
                                    <li>Direction Match: {(selectedTx.details.direction === selectedEp.details.direction) ? '✅ Yes' : '❌ No'}</li>
                                </ul>
                            </div>
                        )}


                        <button
                            onClick={handleMatch}
                            disabled={!selectedTxId || !selectedEpId || loading}
                            className={`w-full mt-6 py-2 px-4 rounded font-semibold transition ${
                                selectedTxId && selectedEpId && !loading
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {loading ? 'Reconciling...' : 'Confirm Match'}
                        </button>
                    </div>
                    
                    {/* AI Suggestions Panel */}
                    <div className="mt-8 w-full max-w-sm">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                            AI-Assisted Suggestions ({activeSuggestions.length})
                        </h3>
                        {activeSuggestions.length > 0 ? (
                            <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-300 rounded shadow-md h-40 overflow-y-auto">
                                {activeSuggestions.map(s => {
                                    const tx = transactions.find(t => t.id === s.transactionId);
                                    const ep = expectedPayments.find(e => e.id === s.expectedPaymentId);
                                    
                                    if (!tx || !ep) return null;

                                    return (
                                        <div 
                                            key={`${s.transactionId}-${s.expectedPaymentId}`}
                                            className="p-2 border border-dashed border-yellow-400 bg-white rounded cursor-pointer hover:bg-yellow-100 transition"
                                            onClick={() => handleSuggestionClick(s.transactionId, s.expectedPaymentId)}
                                        >
                                            <p className="text-sm font-medium">
                                                TX: {formatAmount((tx.details as Transaction).amount, tx.details.currency)} ➡️ EP: {ep.id}
                                            </p>
                                            <p className="text-xs text-gray-500">Score: {(s.score * 100).toFixed(1)}% | {s.reason}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center p-4">No AI suggestions available for selected item.</p>
                        )}
                    </div>
                </div>

                {/* 3. Unreconciled Expected Payments */}
                <div className="col-span-4 bg-white p-4 shadow rounded-lg h-[80vh] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        Unreconciled Expected Payments ({availableExpectedPayments.length})
                    </h2>
                    {availableExpectedPayments.map(item => {
                        const isSuggestedMatch = activeSuggestions.some(s => s.expectedPaymentId === item.id);
                         const score = isSuggestedMatch 
                            ? activeSuggestions.find(s => s.expectedPaymentId === item.id)?.score 
                            : undefined;

                        return (
                            <ItemCard
                                key={item.id}
                                item={item}
                                isSelected={selectedEpId === item.id}
                                onSelect={() => handleSelect(item.id, 'expected_payment')}
                                isSuggestedMatch={isSuggestedMatch}
                                matchScore={score}
                            />
                        );
                    })}
                     {availableExpectedPayments.length === 0 && (
                        <p className="text-center text-gray-500 mt-10">No pending expected payments found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReconciliationHubView;