```tsx
import React from 'react';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Import widgets from other modules
import { AccountBalanceWidget } from '../../account/components/AccountBalanceWidget';
import { TransactionListWidget } from '../../transaction/components/TransactionListWidget';
import { CounterpartySummaryWidget } from '../../counterparty/components/CounterpartySummaryWidget';
import { PaymentOrderCalendarWidget } from '../../paymentOrder/components/PaymentOrderCalendarWidget';
import { Alert } from '@mui/material';

export const MainDashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ padding: theme.spacing(2) }}>

      {/* Row 1: Alerts and Summary */}
      <Grid item xs={12}>
        <Alert severity="info">
          Welcome to your Modern Treasury Dashboard! You can customize this view
          to display the information that is most relevant to you.
        </Alert>
      </Grid>

      {/* Row 2: Widgets */}
      <Grid item xs={12} md={6}>
        <AccountBalanceWidget />
      </Grid>

      <Grid item xs={12} md={6}>
        <CounterpartySummaryWidget />
      </Grid>

      {/* Row 3: More Widgets */}
      <Grid item xs={12} md={6}>
        <TransactionListWidget />
      </Grid>

      <Grid item xs={12} md={6}>
        <PaymentOrderCalendarWidget />
      </Grid>

      {/* Future Rows:  Additional widgets can be added here */}

    </Grid>
  );
};
```