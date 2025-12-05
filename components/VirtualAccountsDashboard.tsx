
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getVirtualAccounts, deleteVirtualAccount } from '../api/virtualAccountsApi';
import { VirtualAccount } from '../types/VirtualAccount';
import { Spinner } from '../../components/Spinner';
import { ErrorMessage } from '../../components/ErrorMessage';

const VirtualAccountsDashboard: React.FC = () => {
  const [virtualAccounts, setVirtualAccounts] = useState<VirtualAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [afterCursor, setAfterCursor] = useState<string | null>(null);
  const [perPage, setPerPage] = useState<number>(10); // Example: Show 10 accounts per page

  useEffect(() => {
    const fetchVirtualAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getVirtualAccounts(afterCursor, perPage);
        if (data) {
          setVirtualAccounts(prevAccounts =>
            afterCursor ? [...prevAccounts, ...data.data] : data.data
          );
          setAfterCursor(data.after_cursor); // Assuming the API returns an "after_cursor"
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch virtual accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchVirtualAccounts();
  }, [afterCursor, perPage]); // Re-fetch when afterCursor or perPage changes

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this virtual account?")) {
      setError(null);
      try {
        await deleteVirtualAccount(id);
        setVirtualAccounts(prevAccounts =>
          prevAccounts.filter(account => account.id !== id)
        );
      } catch (err: any) {
        setError(err.message || "Failed to delete virtual account");
      }
    }
  };

  const handleLoadMore = () => {
      if (afterCursor) {
          setAfterCursor(afterCursor); //Trigger useEffect to fetch more
      }
  };

  return (
    <div>
      <h1>Virtual Accounts</h1>

      <Link to="/virtual-accounts/create">Create Virtual Account</Link>

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && virtualAccounts.length === 0 && (
        <p>No virtual accounts found.</p>
      )}


      {!loading && !error && virtualAccounts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Internal Account ID</th>
              <th>Counterparty ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {virtualAccounts.map(account => (
              <tr key={account.id}>
                <td>{account.name}</td>
                <td>{account.internal_account_id}</td>
                <td>{account.counterparty_id}</td>
                <td>
                  <Link to={`/virtual-accounts/${account.id}`}>View</Link> |
                  <Link to={`/virtual-accounts/${account.id}/edit`}>Edit</Link> |
                  <button onClick={() => handleDelete(account.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

       {!loading && !error && afterCursor && (
                <button onClick={handleLoadMore}>Load More</button>
            )}
    </div>
  );
};

export default VirtualAccountsDashboard;