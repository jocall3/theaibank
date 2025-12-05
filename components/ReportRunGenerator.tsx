
import React, { useState } from 'react';
import {
  reportingReportRunCreate,
  reportingReportRunRetrieve,
} from '@/lib/api/stripeNexus/reporting';
import { useAuth } from '@/contexts/AuthContext';
import {
  ReportingReportRun,
  ReportingReportRunCreateParams,
  ReportingReportRunRetrieveParams,
} from '@/lib/api/stripeNexus/reporting/reporting.types';
import { Loading } from '@/components/Loading';
import { DownloadLink } from '@/components/DownloadLink';

interface ReportRunGeneratorProps {
  onReportRunCreated?: (reportRun: ReportingReportRun) => void;
}

export const ReportRunGenerator: React.FC<ReportRunGeneratorProps> = ({
  onReportRunCreated,
}) => {
  const { user } = useAuth();
  const [reportRunParams, setReportRunParams] = useState<
    ReportingReportRunCreateParams
  >({
    report_type: 'balance.summary.1',
    parameters: {
      interval_start: Math.floor(Date.now() / 1000) - 86400, // Yesterday
      interval_end: Math.floor(Date.now() / 1000), // Today
    },
  });

  const [reportRun, setReportRun] = useState<ReportingReportRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParamChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'interval_start' || name === 'interval_end') {
      const parsedValue = parseInt(value, 10);
      setReportRunParams((prevParams) => ({
        ...prevParams,
        parameters: {
          ...prevParams.parameters,
          [name]: isNaN(parsedValue) ? null : parsedValue,
        },
      }));
    } else if (name === 'report_type') {
        setReportRunParams(prevParams => ({
            ...prevParams,
            report_type: value,
        }));
    }
  };

  const handleCreateReportRun = async () => {
    if (!user) {
      setError('Please sign in to create a report run.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await reportingReportRunCreate(reportRunParams);
      setReportRun(data);
      onReportRunCreated?.(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to create report run.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveReportRun = async () => {
      if (!reportRun?.id || !user) {
          setError('Please create a report run first.');
          return;
      }

      setLoading(true);
      setError(null);

      try {
          const params: ReportingReportRunRetrieveParams = {
              report_run_id: reportRun.id,
          };

          const data = await reportingReportRunRetrieve(params);
          setReportRun(data);
      } catch (err: any) {
          setError(err?.message || 'Failed to retrieve report run.');
      } finally {
          setLoading(false);
      }
  }

  const isLoading = loading; // Use a single isLoading state

  return (
    <div>
      <h2>Create Report Run</h2>

      <label htmlFor="report_type">Report Type:</label>
      <select
        id="report_type"
        name="report_type"
        value={reportRunParams.report_type}
        onChange={handleParamChange}
        disabled={isLoading}
      >
        <option value="balance.summary.1">Balance Summary</option>
        {/* Add other report types as needed */}
      </select>
      <br />
      <label htmlFor="interval_start">Interval Start (Timestamp):</label>
      <input
        type="number"
        id="interval_start"
        name="interval_start"
        value={reportRunParams.parameters?.interval_start || ''}
        onChange={handleParamChange}
        disabled={isLoading}
      />
      <br />
      <label htmlFor="interval_end">Interval End (Timestamp):</label>
      <input
        type="number"
        id="interval_end"
        name="interval_end"
        value={reportRunParams.parameters?.interval_end || ''}
        onChange={handleParamChange}
        disabled={isLoading}
      />
      <br />
      <button onClick={handleCreateReportRun} disabled={isLoading}>
        {isLoading ? <Loading /> : 'Create Report Run'}
      </button>
      <br />
      {reportRun?.id && (
        <button onClick={handleRetrieveReportRun} disabled={isLoading}>
           {isLoading ? <Loading /> : 'Check Status'}
        </button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {reportRun?.result?.url && (
        <DownloadLink url={reportRun.result.url} filename="report.csv" />
      )}
      {reportRun?.status === 'failed' && (
        <p style={{ color: 'red' }}>Report Run Failed.  Check Parameters.</p>
      )}
    </div>
  );
};