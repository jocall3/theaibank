```typescript
import React, { useState, useEffect, useCallback } from 'react';

// Assuming these are custom components created for the project
import PageHeader from '../components/common/PageHeader';
import AccountList from '../components/accounts/AccountList';
import AccountDetails from '../components/accounts/AccountDetails';
import TransactionTable from '../components/transactions/TransactionTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import MainLayout from '../layouts/MainLayout';

// Assuming a service layer exists to abstract API calls
import { getCustomerAccounts, getCustomerAccountTransactions } from '../services/api/finicityApiService';

// Assuming types are generated or defined from the OpenAPI specification
import { CustomerAccount, Transaction, PagedTransactions } from '../types/finicity';

/**
 * AccountsView
 * 
 * The main view for displaying and managing a customer's financial accounts.
 * It fetches a list of accounts for a given customer and displays details
 * and transactions for the selected account.
 */
const AccountsView: React.FC = () => {
    // State for accounts data, loading, and errors
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);

    // State for the currently selected account
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);

    // State for transactions of the selected account
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);
    
    // State for transaction pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false);
    
    // Hardcoded customerId for demonstration purposes. In a real app,
    // this would come from auth context, URL params, or state management.
    const customerId = '1005061234';
    const TRANSACTIONS_PER_PAGE = 25;

    // Effect to fetch the list of accounts on component mount
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!customerId) return;
            setIsLoadingAccounts(true);
            setAccountsError(null);
            try {
                const response = await getCustomerAccounts(customerId);
                setAccounts(response.accounts);
                // Automatically select the first account if available
                if (response.accounts && response.accounts.length > 0) {
                    setSelectedAccount(response.accounts[0]);
                }
            } catch (error) {
                console.error("Failed to fetch accounts:", error);
                setAccountsError("Could not load accounts. Please try again later.");
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        fetchAccounts();
    }, [customerId]);

    // Callback to fetch transactions for a specific account and page
    const fetchTransactions = useCallback(async (accountId: string, page: number, isLoadMore: boolean = false) => {
        setIsLoadingTransactions(true);
        setTransactionsError(null);

        // Define a date range for transactions (e.g., last 180 days)
        const toDate = Math.floor(Date.now() / 1000);
        const fromDate = toDate - (180 * 24 * 60 * 60); // 180 days ago in seconds

        try {
            const response: PagedTransactions = await getCustomerAccountTransactions(customerId, accountId, {
                fromDate,
                toDate,
                start: page,
                limit: TRANSACTIONS_PER_PAGE,
                sort: 'desc'
            });

            setTransactions(prev => isLoadMore ? [...prev, ...response.transactions] : response.transactions);
            const totalFetched = (page - 1) * TRANSACTIONS_PER_PAGE + response.displaying;
            setHasMoreTransactions(totalFetched < response.found);
        } catch (error) {
            console.error(`Failed to fetch transactions for account ${accountId}:`, error);
            setTransactionsError("Could not load transactions. Please try again later.");
            setTransactions([]);
        } finally {
            setIsLoadingTransactions(false);
        }
    }, [customerId]);

    // Effect to trigger transaction fetch when the selected account changes
    useEffect(() => {
        if (selectedAccount?.id) {
            // Reset state for the new account
            setCurrentPage(1);
            setTransactions([]);
            setHasMoreTransactions(false);
            fetchTransactions(selectedAccount.id, 1, false);
        }
    }, [selectedAccount, fetchTransactions]);

    // Handler for selecting a different account from the list
    const handleSelectAccount = (account: CustomerAccount) => {
        if (account.id !== selectedAccount?.id) {
            setSelectedAccount(account);
        }
    };

    // Handler for loading more transactions
    const handleLoadMoreTransactions = () => {
        if (selectedAccount && hasMoreTransactions && !isLoadingTransactions) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchTransactions(selectedAccount.id, nextPage, true);
        }
    };
    
    // Handler for the "Add New Account" button click
    const handleAddAccountClick = () => {
        // This would typically trigger a flow like Finicity Connect
        console.log("Trigger 'Add New Account' flow...");
        alert("This would launch the account connection flow.");
    };

    const renderContent = () => {
        if (isLoadingAccounts) {
            return <LoadingSpinner text="Loading your accounts..." />;
        }
        if (accountsError) {
            return <ErrorMessage message={accountsError} onRetry={() => window.location.reload()} />;
        }
        if (accounts.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h2 className="text-xl font-semibold text-gray-700">No Accounts Found</h2>
                    <p className="text-gray-500 mt-2">Get started by linking a new financial account.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-full">
                {/* Account List Sidebar */}
                <aside className="md:col-span-1 lg:col-span-1 bg-gray-50 p-4 rounded-lg overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Accounts</h2>
                    <AccountList
                        accounts={accounts}
                        selectedAccountId={selectedAccount?.id}
                        onSelectAccount={handleSelectAccount}
                    />
                </aside>

                {/* Main Content Area for Details and Transactions */}
                <main className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-lg shadow-sm overflow-y-auto">
                    {selectedAccount ? (
                        <>
                            <AccountDetails account={selectedAccount} />
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h3>
                                { (isLoadingTransactions && transactions.length === 0) ? (
                                    <LoadingSpinner text="Fetching transactions..."/>
                                ) : transactionsError ? (
                                    <ErrorMessage message={transactionsError} onRetry={() => fetchTransactions(selectedAccount.id, 1, false)} />
                                ) : (
                                    <TransactionTable
                                        transactions={transactions}
                                        isLoading={isLoadingTransactions}
                                        hasMore={hasMoreTransactions}
                                        onLoadMore={handleLoadMoreTransactions}
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Select an account to view its details and transaction history.</p>
                        </div>
                    )}
                </main>
            </div>
        );
    };

    return (
        <MainLayout>
            <PageHeader
                title="Accounts Overview"
                subtitle="View and manage your connected financial accounts."
                buttonText="Link New Account"
                onButtonClick={handleAddAccountClick}
            />
            <div className="mt-6 flex-grow">
                {renderContent()}
            </div>
        </MainLayout>
    );
};

export default AccountsView;
```