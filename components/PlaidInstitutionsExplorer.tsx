import React, { useState, useCallback, useEffect } from 'react';
import {
  InstitutionsSearchRequest,
  InstitutionsSearchResponse,
  InstitutionsGetByIdRequest,
  InstitutionsGetByIdResponse,
  Institution,
  PlaidError,
  InstitutionStatus,
  Products,
  CountryCode,
} from 'plaid'; // Assuming 'plaid' is the SDK package name
import { PlaidClient } from '../../lib/plaidClient'; // Adjust path as necessary
import { useDebounce } from '../../hooks/useDebounce'; // Assuming a custom hook for debouncing

// --- Types ---

interface InstitutionDetail extends Institution {
  request_id: string;
}

interface PlaidInstitutionsExplorerProps {
  client: PlaidClient;
}

// --- Constants & Helpers ---

const PRODUCT_LABELS: Record<Products, string> = {
  assets: 'Assets',
  auth: 'Auth',
  balance: 'Balance',
  identity: 'Identity',
  investments: 'Investments',
  liabilities: 'Liabilities',
  payment_initiation: 'Payment Initiation',
  transactions: 'Transactions',
  transfer: 'Transfer',
  signal: 'Signal',
  income_verification: 'Income Verification',
  deposit_switch: 'Deposit Switch',
  standing_orders: 'Standing Orders',
  cra: 'CRA',
  statements: 'Statements',
  recurring_transactions: 'Recurring Transactions',
  tax_documents: 'Tax Documents',
  employment: 'Employment',
  credit_details: 'Credit Details',
  // Add other products if necessary
};

const STATUS_COLORS: Record<InstitutionStatus['status'], string> = {
  HEALTHY: 'bg-green-100 text-green-800',
  DEGRADED: 'bg-yellow-100 text-yellow-800',
  DOWN: 'bg-red-100 text-red-800',
};

const getStatusColor = (status: InstitutionStatus['status']): string => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

const formatProductStatus = (status: InstitutionStatus | undefined): string => {
  if (!status) return 'N/A';
  const color = getStatusColor(status.status);
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
      {status.status}
    </span>
  );
};

// --- Components ---

const InstitutionCard: React.FC<{ institution: Institution; onClick: (id: string) => void }> = ({ institution, onClick }) => (
  <li
    className="p-4 border-b cursor-pointer hover:bg-gray-50 transition duration-150 ease-in-out"
    onClick={() => onClick(institution.institution_id)}
  >
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-900">{institution.name}</h3>
      <span className="text-sm text-gray-500">{institution.institution_id}</span>
    </div>
    <div className="mt-1 flex flex-wrap gap-2">
      {institution.products.map(product => (
        <span key={product} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {PRODUCT_LABELS[product as Products] || product}
        </span>
      ))}
    </div>
  </li>
);

const InstitutionDetailView: React.FC<{ detail: InstitutionDetail }> = ({ detail }) => {
  const { institution, request_id } = detail;

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4">{institution.name}</h2>
      <p className="text-sm text-gray-500 mb-4">Request ID: {request_id}</p>

      <div className="space-y-4">
        <DetailSection title="General Information">
          <DetailItem label="Institution ID">{institution.institution_id}</DetailItem>
          <DetailItem label="OAuth Support">{institution.oauth ? 'Yes' : 'No'}</DetailItem>
          <DetailItem label="Country Codes">{institution.country_codes.join(', ')}</DetailItem>
          {institution.url && <DetailItem label="Website">{institution.url}</DetailItem>}
        </DetailSection>

        <DetailSection title="Supported Products">
          <div className="flex flex-wrap gap-2">
            {institution.products.map(product => (
              <span key={product} className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {PRODUCT_LABELS[product as Products] || product}
              </span>
            ))}
          </div>
        </DetailSection>

        {institution.status && (
          <DetailSection title="Health Status">
            <div className="space-y-2">
              {Object.entries(institution.status).map(([key, statusObj]) => {
                if (key === 'last_status_change') return null;
                const productKey = key as keyof typeof institution.status;
                const status = institution.status?.[productKey];

                if (status && typeof status === 'object' && 'status' in status) {
                  return (
                    <div key={key} className="flex justify-between items-center border-b last:border-b-0 py-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                      {formatProductStatus(status)}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </DetailSection>
        )}

        {(institution.routing_numbers?.length || institution.dtc_numbers?.length) && (
          <DetailSection title="Identifiers">
            {institution.routing_numbers?.length > 0 && (
              <DetailItem label="Routing Numbers">{institution.routing_numbers.join(', ')}</DetailItem>
            )}
            {institution.dtc_numbers?.length > 0 && (
              <DetailItem label="DTC Numbers">{institution.dtc_numbers.join(', ')}</DetailItem>
            )}
          </DetailSection>
        )}
      </div>
    </div>
  );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border p-4 rounded-md bg-gray-50">
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    {children}
  </div>
);

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <p className="text-sm text-gray-700">
    <span className="font-medium text-gray-600">{label}:</span> {children}
  </p>
);

// --- Main Component ---

export const PlaidInstitutionsExplorer: React.FC<PlaidInstitutionsExplorerProps> = ({ client }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalInstitutions, setTotalInstitutions] = useState(0);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // 1. Search Institutions
  const searchInstitutions = useCallback(async (query: string) => {
    if (!query) {
      setInstitutions([]);
      setTotalInstitutions(0);
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedInstitution(null);

    try {
      const request: InstitutionsSearchRequest = {
        query,
        products: [Products.Transactions, Products.Auth, Products.Balance], // Common products for search
        country_codes: [CountryCode.Us], // Limit to US for simplicity
      };

      const response: InstitutionsSearchResponse = await client.institutionsSearch(request);
      setInstitutions(response.institutions);
      setTotalInstitutions(response.total);
    } catch (err) {
      const plaidError = err as PlaidError;
      setError(`Search failed: ${plaidError.error_message || 'Unknown error'}`);
      setInstitutions([]);
      setTotalInstitutions(0);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    searchInstitutions(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchInstitutions]);

  // 2. Get Institution Details by ID
  const fetchInstitutionDetails = useCallback(async (institutionId: string) => {
    setLoading(true);
    setError(null);
    setSelectedInstitution(null);

    try {
      const request: InstitutionsGetByIdRequest = {
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
        options: {
          include_optional_metadata: true,
          include_status: true,
        }
      };

      const response: InstitutionsGetByIdResponse = await client.institutionsGetById(request);
      setSelectedInstitution({
        ...response.institution,
        request_id: response.request_id,
      });
    } catch (err) {
      const plaidError = err as PlaidError;
      setError(`Failed to retrieve details: ${plaidError.error_message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const handleInstitutionClick = (id: string) => {
    fetchInstitutionDetails(id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Plaid Institutions Explorer</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search institutions by name (e.g., 'Bank of America')"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Search Results */}
        <div className="lg:col-span-1 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">
              Search Results
              {searchTerm && ` (${totalInstitutions} found)`}
            </h2>
          </div>
          <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {loading && searchTerm && (
              <li className="p-4 text-center text-gray-500">Loading...</li>
            )}
            {!loading && institutions.length === 0 && searchTerm && (
              <li className="p-4 text-center text-gray-500">No institutions found matching "{searchTerm}".</li>
            )}
            {!loading && institutions.map(inst => (
              <InstitutionCard
                key={inst.institution_id}
                institution={inst}
                onClick={handleInstitutionClick}
              />
            ))}
            {!searchTerm && (
              <li className="p-4 text-center text-gray-500">Start typing to search for institutions.</li>
            )}
          </ul>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2">
          {loading && !selectedInstitution && searchTerm && (
            <div className="p-6 text-center bg-white shadow-lg rounded-lg">
              Fetching institution details...
            </div>
          )}
          {selectedInstitution ? (
            <InstitutionDetailView detail={selectedInstitution} />
          ) : (
            !loading && (
              <div className="p-6 text-center bg-white shadow-lg rounded-lg">
                Select an institution from the list to view details.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// Note: The `useDebounce` hook is assumed to exist in `../../hooks/useDebounce`.
// If it doesn't exist, you would need to define it here or create the file.
// Example implementation of useDebounce for completeness:
/*
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
*/
// Also, ensure `PlaidClient` is correctly implemented in `../../lib/plaidClient`.
// It should wrap the Plaid SDK client and handle authentication.