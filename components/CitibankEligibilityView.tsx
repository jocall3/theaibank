import React, { useState, useEffect, useCallback } from 'react';
import {
  useMoneyMovement,
  RetrievePaymentInitiationTransactionBulkSourceAccountAndPayeeEligibilityResponse,
  SourceAccountAndPayee,
  PayeeSourceAccountCombinations,
  SourceAccounts,
} from '../../hooks/useMoneyMovement'; // Assuming useMoneyMovement is in a parent directory hook
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';

const CitibankEligibilityView: React.FC = () => {
  const { api, accessToken, uuid } = useMoneyMovement();
  const [eligibilityData, setEligibilityData] = useState<SourceAccountAndPayee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nextStartIndex, setNextStartIndex] = useState<string | undefined>(undefined);

  const fetchEligibility = useCallback(async (startIndex?: string) => {
    if (!api || !accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.retrievePaymentInitiationTransactionBulkSourceAccountAndPayeeEligibility(
        accessToken,
        uuid,
        startIndex
      );
      setEligibilityData(prevData => startIndex ? [...prevData, ...(response.sourceAccountAndPayee || [])] : (response.sourceAccountAndPayee || []));
      setNextStartIndex(response.nextStartIndex);
    } catch (err: any) {
      console.error("Error fetching eligibility data:", err);
      setError(err.message || "Failed to fetch eligibility data.");
    } finally {
      setLoading(false);
    }
  }, [api, accessToken, uuid]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  const handleLoadMore = () => {
    if (nextStartIndex) {
      fetchEligibility(nextStartIndex);
    }
  };

  const renderSourceAccounts = (rowData: SourceAccountAndPayee) => {
    if (!rowData.sourceAccounts || rowData.sourceAccounts.length === 0) {
      return 'N/A';
    }
    return (
      <ul>
        {rowData.sourceAccounts.map((account, index) => (
          <li key={index}>
            {account.accountNickName || account.displaySourceAccountNumber} ({account.sourceAccountCurrencyCode})
          </li>
        ))}
      </ul>
    );
  };

  const renderPayeeCombinations = (rowData: SourceAccountAndPayee) => {
    if (!rowData.payeeSourceAccountCombinations || rowData.payeeSourceAccountCombinations.length === 0) {
      return 'N/A';
    }
    return (
      <ul>
        {rowData.payeeSourceAccountCombinations.map((combination, index) => (
          <li key={index}>
            <strong>{combination.payeeNickName || combination.payeeName}</strong> ({combination.payeeAccountCurrencyCode})
            <ul>
              {combination.paymentMethods.map((method, methodIndex) => (
                <li key={methodIndex}>{method.paymentMethod}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    );
  };

  const renderPaymentMethods = (rowData: SourceAccountAndPayee) => {
    if (!rowData.sourceAccounts || rowData.sourceAccounts.length === 0) {
      return 'N/A';
    }
    const allPaymentMethods = new Set<string>();
    rowData.sourceAccounts.forEach(sourceAccount => {
      if (sourceAccount.payeeSourceAccountCombinations) {
        sourceAccount.payeeSourceAccountCombinations.forEach(combination => {
          combination.paymentMethods.forEach(method => {
            if (method.paymentMethod) {
              allPaymentMethods.add(method.paymentMethod);
            }
          });
        });
      }
    });
    return Array.from(allPaymentMethods).join(', ') || 'N/A';
  };

  const header = (
    <div className="flex flex-wrap justify-content-between align-items-center">
      <h4 className="m-0">Payment Eligibility Overview</h4>
      {loading && <ProgressSpinner style={{ width: '30px', height: '30px' }} strokeWidth="8" />}
    </div>
  );

  const footer = (
    <div className="flex justify-content-center">
      {nextStartIndex && !loading && (
        <Button label="Load More" icon="pi pi-plus" onClick={handleLoadMore} />
      )}
    </div>
  );

  return (
    <Card title="Payment Eligibility" className="m-4">
      {error && (
        <div className="p-error mb-3">
          <strong>Error:</strong> {error}
        </div>
      )}
      {!loading && eligibilityData.length === 0 && !error && (
        <div className="text-center p-4">
          No payment eligibility data found.
        </div>
      )}
      <DataTable
        value={eligibilityData}
        header={header}
        footer={footer}
        loading={loading}
        emptyMessage={!error ? "No eligibility data available." : ""}
        responsiveLayout="scroll"
        className="p-datatable-sm"
      >
        <Column field="sourceAccounts" header="Source Accounts" body={renderSourceAccounts} style={{ minWidth: '200px' }} />
        <Column field="payeeSourceAccountCombinations" header="Payee Combinations" body={renderPayeeCombinations} style={{ minWidth: '300px' }} />
        <Column field="paymentMethods" header="Available Payment Methods" body={renderPaymentMethods} style={{ minWidth: '200px' }} />
      </DataTable>
    </Card>
  );
};

export default CitibankEligibilityView;