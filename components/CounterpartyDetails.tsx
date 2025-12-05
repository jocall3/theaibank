import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty, ExternalAccount, Transaction, ErrorMessage, AccountDetail } from '../../../types/moderntreasury';
import { getCounterparty, listExternalAccounts, listTransactions } from '../../../services/api';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface CounterpartyDetailsProps {
  counterpartyId?: string; // Optional prop if routing isn't used
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  const { id: routeCounterpartyId } = useParams<{ id: string }>();
  const counterpartyId = propCounterpartyId || routeCounterpartyId;

  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!counterpartyId) {
      setError({ errors: { message: 'Counterparty ID is missing.', code: 'parameter_missing' } });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cp, accountsResponse, transactionsResponse] = await Promise.all([
          getCounterparty(counterpartyId),
          listExternalAccounts({ counterparty_id: counterpartyId }),
          listTransactions({ counterparty_id: counterpartyId, per_page: 5 }), // Fetch latest 5 transactions
        ]);

        setCounterparty(cp);
        setExternalAccounts(accountsResponse as ExternalAccount[]);
        setTransactions(transactionsResponse as Transaction[]);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data || { errors: { message: 'An unknown error occurred.', code: 'runtime_error' } });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [counterpartyId]);

  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  if (error || !counterparty) {
    const message = error?.errors?.message || 'Counterparty not found.';
    return <Alert variant="danger">Error: {message}</Alert>;
  }

  const renderDetailItem = (label: string, value: string | boolean | number | null | undefined) => {
    if (value === null || value === undefined) return null;

    let displayValue: React.ReactNode;
    if (typeof value === 'boolean') {
      displayValue = <Badge bg={value ? 'success' : 'danger'}>{value.toString()}</Badge>;
    } else {
      displayValue = value.toString();
    }

    return (
      <ListGroup.Item className="d-flex justify-content-between align-items-center">
        {label}
        <span className="fw-bold">{displayValue}</span>
      </ListGroup.Item>
    );
  };

  const renderAccountDetails = (details: AccountDetail[]) => (
    <ListGroup variant="flush">
      {details.map((detail, index) => (
        <ListGroup.Item key={index}>
          <div><strong>Type:</strong> {detail.account_number_type}</div>
          <div><strong>Account Number:</strong> {detail.account_number_safe} (****{detail.account_number_safe.slice(-4)})</div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );

  const renderExternalAccount = (account: ExternalAccount) => {
    // Determine the name based on available fields
    const accountName = account.name || account.party_name || 'Unnamed Account';
    const primaryDetail = account.account_details?.[0];

    return (
      <Card key={account.id} className="mb-3">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>{accountName}</strong>
          <Badge bg="secondary">{account.account_type}</Badge>
        </Card.Header>
        <Card.Body>
          <p className="mb-1">
            <strong>Party Type:</strong> {account.party_type}
          </p>
          <p className="mb-1">
            <strong>Verification Status:</strong> <Badge bg={account.verification_status === 'verified' ? 'success' : 'warning'}>{account.verification_status}</Badge>
          </p>

          {primaryDetail && (
            <>
              <h6>Primary Details</h6>
              <p className="mb-1">
                <strong>Account Number:</strong> {'***' + primaryDetail.account_number_safe.slice(-4)} ({primaryDetail.account_number_type})
              </p>
            </>
          )}

          {account.routing_details.length > 0 && (
            <>
              <h6 className="mt-3">Routing Details</h6>
              <ListGroup variant="flush">
                {account.routing_details.map((rd, idx) => (
                  <ListGroup.Item key={idx}>
                    {rd.routing_number_type}: {rd.routing_number} (Type: {rd.payment_type || 'N/A'})
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderTransaction = (tx: Transaction) => (
    <ListGroup.Item key={tx.id} className="d-flex justify-content-between align-items-center">
      <div>
        <strong>{tx.vendor_description || tx.type}</strong>
        <br />
        <small className="text-muted">ID: {tx.id.substring(0, 8)}...</small>
      </div>
      <div>
        <Badge bg={tx.direction === 'credit' ? 'primary' : 'secondary'} className="me-2">
          {tx.direction}
        </Badge>
        <span className={tx.direction === 'credit' ? 'text-success' : 'text-danger'}>
          {formatCurrency(tx.amount, tx.currency)}
        </span>
      </div>
    </ListGroup.Item>
  );

  return (
    <div>
      <h1 className="mb-4">Counterparty: {counterparty.name}</h1>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k!)} className="mb-3">
        <Tab eventKey="details" title="Details">
          <Card>
            <Card.Header>General Information</Card.Header>
            <ListGroup variant="flush">
              {renderDetailItem('ID', counterparty.id)}
              {renderDetailItem('Email', counterparty.email)}
              {renderDetailItem('Tax Payer ID', counterparty.taxpayer_identifier)}
              {renderDetailItem('Remittance Advice Sent?', counterparty.send_remittance_advice)}
              {renderDetailItem('Live Mode', counterparty.live_mode)}
              {renderDetailItem('Created At', formatDate(counterparty.created_at))}
              {renderDetailItem('Updated At', formatDate(counterparty.updated_at))}
              {counterparty.discarded_at && renderDetailItem('Discarded At', formatDate(counterparty.discarded_at))}
            </ListGroup>

            {Object.keys(counterparty.metadata).length > 0 && (
              <>
                <Card.Header className="mt-3">Metadata</Card.Header>
                <ListGroup variant="flush">
                  {Object.entries(counterparty.metadata).map(([key, value]) => (
                    <ListGroup.Item key={key} className="d-flex justify-content-between align-items-center">
                      {key}
                      <span className="fw-bold">{value}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </>
            )}
          </Card>
        </Tab>

        <Tab eventKey="accounts" title={`External Accounts (${externalAccounts.length})`}>
          {externalAccounts.length > 0 ? (
            externalAccounts.map(renderExternalAccount)
          ) : (
            <Alert variant="info">No external accounts associated with this counterparty.</Alert>
          )}
        </Tab>

        <Tab eventKey="transactions" title={`Recent Transactions (${transactions.length})`}>
          <Card>
            <Card.Header>Last 5 Transactions</Card.Header>
            <ListGroup variant="flush">
              {transactions.length > 0 ? (
                transactions.map(renderTransaction)
              ) : (
                <ListGroup.Item>No recent transactions found.</ListGroup.Item>
              )}
            </ListGroup>
            {/* Ideally link to a full transaction history view filtered by counterparty */}
            {transactions.length > 0 && (
              <Card.Footer>
                <Button variant="outline-primary" size="sm" as={Link} to={`/transactions?counterparty_id=${counterpartyId}`}>
                  View All Transactions
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Tab>

        <Tab eventKey="actions" title="Actions">
          <Card>
            <Card.Body>
              <Button variant="primary" className="me-2" disabled>
                Edit Counterparty (Coming Soon)
              </Button>
              <Button variant="outline-warning" className="me-2" disabled>
                Collect Account Details (Coming Soon)
              </Button>
              <Button variant="danger" disabled>
                Delete Counterparty (Coming Soon)
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default CounterpartyDetails;
```