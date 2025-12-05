```typescript
import React from 'react';

// --- Icon Components (Self-contained SVGs for demonstration) ---

const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a2.83 2.83 0 0 0-2 5 4.79 4.79 0 0 1-1 3c-1.6.9-2.6 2.5-2.6 4.2 0 2.5 2.5 4.8 5.6 4.8s5.6-2.3 5.6-4.8c0-1.7-1-3.3-2.6-4.2a4.79 4.79 0 0 1-1-3c.2-1.8-1.2-5-2-5Z" />
    <path d="M12 14a2.83 2.83 0 0 0-2-5 4.79 4.79 0 0 1-1-3" />
    <path d="M12.5 2a2.5 2.5 0 0 1 0 5" />
    <path d="M12.5 14a2.5 2.5 0 0 0 0-5" />
    <path d="M6 12a1 1 0 0 0-1 1c-1.6.9-2.6 2.5-2.6 4.2" />
    <path d="M18 12a1 1 0 0 1 1 1c1.6.9 2.6 2.5 2.6 4.2" />
  </svg>
);

const ChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
);

const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);


// --- Data Types and Mock Data ---

type PredictionTrend = 'up' | 'down' | 'stable' | 'alert';

interface Prediction {
  id: string;
  title: string;
  value: string;
  trend: PredictionTrend;
  trendLabel?: string;
  description: string;
  Icon: React.ElementType;
}

const mockPredictions: Prediction[] = [
  {
    id: 'cash_forecast',
    title: '30-Day Cash Forecast',
    value: '$4.21M',
    trend: 'up',
    trendLabel: '+5.2%',
    description: 'Projected balance based on historicals and scheduled payments.',
    Icon: ChartIcon,
  },
  {
    id: 'failure_risk',
    title: 'Payment Failure Risk',
    value: 'Low',
    trend: 'stable',
    trendLabel: '0.12%',
    description: 'Probability of failures in the next ACH batch is minimal.',
    Icon: ShieldIcon,
  },
  {
    id: 'anomaly_detection',
    title: 'Anomaly Detection',
    value: '1 Flagged',
    trend: 'alert',
    trendLabel: 'Review',
    description: 'Unusual outgoing wire transfer of $150k detected.',
    Icon: AlertTriangleIcon,
  },
];


// --- Main Widget Component ---

const AIPredictionWidget: React.FC = () => {

  const getTrendColor = (trend: PredictionTrend) => {
    switch (trend) {
      case 'up': return '#10B981'; // green-500
      case 'down': return '#EF4444'; // red-500
      case 'alert': return '#F59E0B'; // amber-500
      case 'stable': return '#6B7280'; // gray-500
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (trend: PredictionTrend) => {
      switch (trend) {
          case 'up': return <ArrowUpIcon />;
          case 'down': return <ArrowDownIcon />;
          default: return null;
      }
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerTitleContainer}>
            <BrainIcon style={styles.headerIcon} />
            <h2 style={styles.headerTitle}>AI-Powered Insights</h2>
        </div>
        <button style={styles.viewAllButton}>View All</button>
      </div>

      <div style={styles.predictionsContainer}>
        {mockPredictions.map((prediction) => (
          <div key={prediction.id} style={styles.predictionItem}>
            <div style={styles.itemHeader}>
                <prediction.Icon style={{...styles.itemIcon, color: getTrendColor(prediction.trend)}}/>
                <span style={styles.itemTitle}>{prediction.title}</span>
            </div>
            <div style={styles.itemBody}>
                <p style={styles.itemValue}>{prediction.value}</p>
                {prediction.trendLabel && (
                    <div style={{ ...styles.trendBadge, color: getTrendColor(prediction.trend), backgroundColor: `${getTrendColor(prediction.trend)}1A`}}>
                       {getTrendIcon(prediction.trend)}
                       <span>{prediction.trendLabel}</span>
                    </div>
                )}
            </div>
            <p style={styles.itemDescription}>{prediction.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Styles ---

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    color: '#111827',
    border: '1px solid #E5E7EB',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '16px',
  },
  headerTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
      color: '#4B5563'
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    color: '#111827',
  },
  viewAllButton: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#3B82F6',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px 12px',
      borderRadius: '6px',
      transition: 'background-color 0.2s',
  },
  predictionsContainer: {
    display: 'grid',
    gap: '20px',
  },
  predictionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  itemIcon: {
    width: '20px',
    height: '20px',
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#4B5563',
  },
  itemBody: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '12px',
      marginTop: '4px',
  },
  itemValue: {
    fontSize: '28px',
    fontWeight: 700,
    margin: 0,
    color: '#111827',
  },
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
  },
  itemDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
    marginTop: '4px',
    lineHeight: '1.5',
  },
};

export default AIPredictionWidget;
```