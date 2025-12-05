import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { useMoneyMovement } from '../../contexts/CitibankAPIProvider';

// --- API Logger (Singleton Pattern) ---
// In a real app, this would be in its own file (e.g., 'src/services/apiLogger.ts')
// It's included here to fulfill the single-file requirement.
// NOTE: To make this work project-wide, the API client's request method must be
// modified to call `apiLogger.addLog`. This file includes a new `SecurityAPI`
// client that demonstrates this integration.

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: Method;
  path: string;
  status: number | 'Error';
  response?: any;
  requestBody?: any;
}

type Listener = (logs: ApiLogEntry[]) => void;

class ApiLogger {
  private logEntries: ApiLogEntry[] = [];
  private listeners: Set<Listener> = new Set();
  private readonly MAX_LOG_SIZE = 50;

  public addLog(entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) {
    const newEntry: ApiLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.logEntries.unshift(newEntry); // Add to the top

    // Keep the log size manageable
    if (this.logEntries.length > this.MAX_LOG_SIZE) {
      this.logEntries.pop();
    }

    this.notifyListeners();
  }

  public getLogs(): ApiLogEntry[] {
    return [...this.logEntries];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Return an unsubscribe function
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getLogs()));
  }
}

export const apiLogger = new ApiLogger();

// --- Custom Hook for API Log ---
const useApiLog = () => {
  const [logs, setLogs] = useState<ApiLogEntry[]>(apiLogger.getLogs());

  useEffect(() => {
    const unsubscribe = apiLogger.subscribe(setLogs);
    return unsubscribe; // Cleanup on unmount
  }, []);

  return logs;
};


// --- Security API Client ---
// Based on the SecurityE2EKeyExchangePreLogin_Partner_OpenAPI spec.

const API_BASE_URL = 'https://sandbox.apihub.citi.com/gcb/api';

export interface GetEncryptionKeyResponse {
  modulus: string;
  exponent: string;
  keyIdentifier?: string;
}

class SecurityAPI {
  private baseURL: string;
  private client_id: string;

  constructor(baseURL: string, client_id: string) {
    this.baseURL = baseURL;
    this.client_id = client_id;
  }

  private async request<T>(
    method: Method,
    path: string,
    accessToken: string,
    uuid: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        uuid: uuid,
        Accept: 'application/json',
        client_id: this.client_id,
        'Content-Type': 'application/json',
      },
      data: body,
    };

    try {
      const response = await axios(config);
      apiLogger.addLog({
        method,
        path,
        status: response.status,
        requestBody: body,
        response: response.data,
      });
      return response.data;
    } catch (error: any) {
      const status = axios.isAxiosError(error) && error.response ? error.response.status : 'Error';
      const responseData = axios.isAxiosError(error) && error.response ? error.response.data : { message: error.message };
      apiLogger.addLog({
        method,
        path,
        status,
        requestBody: body,
        response: responseData,
      });
      console.error(`API Error: ${status} - ${JSON.stringify(responseData)}`);
      throw new Error(JSON.stringify(responseData));
    }
  }

  public async getPublicKeyPreLogin(
    accessToken: string,
    uuid: string
  ): Promise<GetEncryptionKeyResponse> {
    // The path from the spec is just '/', which is unusual.
    // A more likely path would be something like this, based on common patterns.
    const path = '/v1/prelogin/security/e2eKey';
    return this.request<GetEncryptionKeyResponse>('GET', path, accessToken, uuid);
  }
}

// --- Developer Tools View Component ---

const CitibankDeveloperToolsView: React.FC = () => {
  const { accessToken, uuid } = useMoneyMovement();
  const logs = useApiLog();

  const [publicKey, setPublicKey] = useState<GetEncryptionKeyResponse | null>(null);
  const [isLoadingKey, setIsLoadingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);

  const handleFetchPublicKey = useCallback(async () => {
    if (!accessToken) {
      setKeyError('Access Token is not available. Please authenticate first.');
      return;
    }
    setIsLoadingKey(true);
    setKeyError(null);
    setPublicKey(null);

    try {
      const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || 'YOUR_CLIENT_ID';
      const securityApi = new SecurityAPI(API_BASE_URL, CLIENT_ID);
      const keyData = await securityApi.getPublicKeyPreLogin(accessToken, uuid);
      setPublicKey(keyData);
    } catch (error: any) {
      setKeyError(`Failed to fetch public key: ${error.message}`);
    } finally {
      setIsLoadingKey(false);
    }
  }, [accessToken, uuid]);

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      backgroundColor: '#f4f7f9',
      color: '#333',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      height: 'calc(100vh - 40px)',
      maxHeight: '90vh',
    },
    section: {
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    title: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#003b71',
      borderBottom: '2px solid #e0e0e0',
      paddingBottom: '10px',
      marginBottom: '15px',
    },
    button: {
      backgroundColor: '#00529b',
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1em',
      fontWeight: 'bold',
      alignSelf: 'flex-start',
      transition: 'background-color 0.2s',
    },
    pre: {
      backgroundColor: '#2d2d2d',
      color: '#f8f8f2',
      padding: '15px',
      borderRadius: '5px',
      overflowX: 'auto',
      fontSize: '0.9em',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      marginTop: '15px',
      flex: 1,
    },
    error: {
      color: '#d9534f',
      backgroundColor: '#f2dede',
      border: '1px solid #ebccd1',
      padding: '10px',
      borderRadius: '5px',
      marginTop: '15px',
    },
    logContainer: {
      flex: 1,
      overflowY: 'auto',
      border: '1px solid #ccc',
      borderRadius: '5px',
      marginTop: '10px',
    },
    logItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 12px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      fontSize: '0.9em',
    },
    logItemSelected: {
      backgroundColor: '#e7f3ff',
    },
    logMethod: {
      fontWeight: 'bold',
      minWidth: '60px',
    },
    logPath: {
      flex: 1,
      marginLeft: '10px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    logStatus: {
      fontWeight: 'bold',
      marginLeft: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
    },
    logDetailContainer: {
      gridColumn: '1 / -1', // Span both columns
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #ccc',
      marginBottom: '10px',
    },
    tab: {
      padding: '10px 15px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      borderBottom: '3px solid transparent',
    },
    tabActive: {
      borderBottom: '3px solid #00529b',
      fontWeight: 'bold',
    },
  };

  const getStatusColor = (status: number | 'Error') => {
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return '#28a745'; // Green
      if (status >= 400 && status < 500) return '#dc3545'; // Red
      if (status >= 500) return '#ffc107'; // Yellow/Orange
    }
    return '#6c757d'; // Gray for Error or other
  };

  const LogDetailView = ({ log }: { log: ApiLogEntry }) => {
    const [activeTab, setActiveTab] = useState<'response' | 'request'>('response');

    if (!log) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.title}>Log Details</h3>
        <div>
          <strong>ID:</strong> {log.id}<br />
          <strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}<br />
          <strong>Request:</strong> {log.method} {log.path}<br />
          <strong>Status:</strong> <span style={{...styles.logStatus, color: 'white', backgroundColor: getStatusColor(log.status)}}>{log.status}</span>
        </div>
        <div style={styles.tabs}>
            <button
                style={{...styles.tab, ...(activeTab === 'response' ? styles.tabActive : {})}}
                onClick={() => setActiveTab('response')}
            >
                Response
            </button>
            <button
                style={{...styles.tab, ...(activeTab === 'request' ? styles.tabActive : {})}}
                onClick={() => setActiveTab('request')}
            >
                Request Body
            </button>
        </div>
        {activeTab === 'response' && (
            <pre style={styles.pre}>
                {JSON.stringify(log.response, null, 2) || 'No response body.'}
            </pre>
        )}
        {activeTab === 'request' && (
            <pre style={styles.pre}>
                {JSON.stringify(log.requestBody, null, 2) || 'No request body.'}
            </pre>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h2 style={styles.title}>Pre-Login Encryption Key</h2>
        <p>Fetch the public key used for encrypting sensitive data during pre-login flows.</p>
        <button style={styles.button} onClick={handleFetchPublicKey} disabled={isLoadingKey}>
          {isLoadingKey ? 'Fetching...' : 'Fetch Public Key'}
        </button>
        {keyError && <div style={styles.error}>{keyError}</div>}
        {publicKey && (
          <div style={{display: 'flex', flexDirection: 'column', flex: 1, marginTop: '15px'}}>
            <h3 style={{ marginTop: '0' }}>Key Details:</h3>
            <pre style={styles.pre}>
              {JSON.stringify(publicKey, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <h2 style={styles.title}>Recent API Call Log</h2>
        <p>A list of the most recent API calls made by the application. Click an item to see details.</p>
        <div style={styles.logContainer}>
          {logs.length === 0 ? (
            <p style={{ padding: '10px', color: '#888' }}>No API calls logged yet.</p>
          ) : (
            logs.map(log => (
              <div
                key={log.id}
                style={{...styles.logItem, ...(selectedLog?.id === log.id ? styles.logItemSelected : {})}}
                onClick={() => setSelectedLog(log)}
              >
                <span style={{...styles.logMethod, color: getStatusColor(log.status)}}>{log.method}</span>
                <span style={styles.logPath} title={log.path}>{log.path}</span>
                <span style={{...styles.logStatus, color: 'white', backgroundColor: getStatusColor(log.status)}}>
                  {log.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedLog && (
        <div style={styles.logDetailContainer}>
            <LogDetailView log={selectedLog} />
        </div>
      )}
    </div>
  );
};

export default CitibankDeveloperToolsView;