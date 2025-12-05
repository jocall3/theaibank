import React, { useState, useEffect, useCallback } from 'react';
import {
  useMoneyMovement,
  RetrieveUnmaskedAccountDataRequest,
  RetrieveUnmaskedAccountDataResponse,
  AccountInfo,
  ErrorResponse // Assuming ErrorResponse is exported from the SDK file
} from '../../citibank/sdk'; // Adjust path based on actual file structure

interface CitibankUnmaskedDataViewProps {
  accountIdsToUnmask: string[]; // The account IDs for which to retrieve unmasked data
  onClose?: () => void; // Optional callback to close the view
}

// CRITICAL: In a real production application, this password would NEVER be hardcoded
// or checked client-side. It must be handled via a secure backend authentication service,
// possibly involving multi-factor authentication (MFA) for sensitive operations.
const SECURE_PASSWORD = 'mySecurePassword123!'; 

const CitibankUnmaskedDataView: React.FC<CitibankUnmaskedDataViewProps> = ({ accountIdsToUnmask, onClose }) => {
  const { api, accessToken, uuid, generateNewUuid } = useMoneyMovement();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [unmaskedData, setUnmaskedData] = useState<RetrieveUnmaskedAccountDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthenticate = useCallback(() => {
    // CRITICAL: This is a client-side mock for demonstration purposes ONLY.
    // Replace this with a secure backend authentication call in a production environment.
    if (passwordInput === SECURE_PASSWORD) {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Authentication failed. Please check your password.');
      setIsAuthenticated(false);
    }
    setPasswordInput(''); // Clear password input after attempt
  }, [passwordInput]);

  const fetchUnmaskedAccountData = useCallback(async () => {
    if (!api || !accessToken || !isAuthenticated || accountIdsToUnmask.length === 0) {
      // If not authenticated, or no API/token, or no accounts to unmask, do nothing.
      return;
    }

    setIsLoading(true);
    setError(null);
    setUnmaskedData(null); // Clear previous data

    try {
      const requestBody: RetrieveUnmaskedAccountDataRequest = {
        accountInfo: accountIdsToUnmask.map(id => ({ accountId: id })),
      };

      // Generate a new UUID for this sensitive request to ensure uniqueness per transaction
      generateNewUuid(); 
      const response = await api.retrieveUnmaskedAccountData(accessToken, uuid, requestBody);
      setUnmaskedData(response);
    } catch (err: any) {
      console.error('Failed to retrieve unmasked account data:', err);
      let errorMessage = 'An unexpected error occurred while fetching unmasked data.';
      // Attempt to parse a structured error response if available
      try {
        const errorResponse: ErrorResponse = JSON.parse(err.message);
        errorMessage = errorResponse.details || errorResponse.code || errorMessage;
      } catch {
        // If parsing fails, use the raw error message
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api, accessToken, uuid, generateNewUuid, isAuthenticated, accountIdsToUnmask]);

  // Effect to trigger data fetching once authenticated and if accounts are provided
  useEffect(() => {
    if (isAuthenticated && accountIdsToUnmask.length > 0) {
      fetchUnmaskedAccountData();
    }
  }, [isAuthenticated, accountIdsToUnmask, fetchUnmaskedAccountData]);

  // Render re-authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="citibank-unmasked-data-view-auth">
        <h3>Re-authenticate to view sensitive account numbers</h3>
        <p>Please enter your password to securely access this information.</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Enter password"
          aria-label="Password for re-authentication"
          autoComplete="current-password" // Hint for browser autofill
          style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button 
          onClick={handleAuthenticate} 
          disabled={!passwordInput.trim()}
          style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Authenticate
        </button>
        {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        {onClose && (
          <button 
            onClick={onClose} 
            style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  // Render unmasked data view if authenticated
  return (
    <div className="citibank-unmasked-data-view">
      <h3>Unmasked Account Numbers</h3>
      {isLoading && <p>Loading unmasked account numbers...</p>}
      {error && <p className="error-message" style={{ color: 'red' }}>Error: {error}</p>}
      {unmaskedData && unmaskedData.accounts && unmaskedData.accounts.length > 0 ? (
        <div className="account-list" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          {unmaskedData.accounts.map((account) => (
            <div key={account.accountId} className="account-item" style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #ddd' }}>
              <p style={{ margin: '0' }}><strong>Account ID:</strong> {account.accountId}</p>
              <p style={{ margin: '0', fontWeight: 'bold' }}><strong>Unmasked Number:</strong> <span className="sensitive-data" style={{ color: '#d9534f' }}>{account.unmaskedAccountNumber}</span></p>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && !error && <p>No unmasked account data available for the selected accounts.</p>
      )}
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ marginTop: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Close
        </button>
      )}
    </div>
  );
};

export default CitibankUnmaskedDataView;