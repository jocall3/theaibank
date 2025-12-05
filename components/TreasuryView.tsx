
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Grid,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { striperesources } from '../../data/striperesources';
import { CodeBlock } from '../../components/CodeBlock';
import { ResourceLink } from '../../components/ResourceLink';
import { formatCurrency, formatTimestamp } from '../../utils/formatting';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import FeatureIcon from '@mui/icons-material/PlaylistAddCheck';

const financialAccount = striperesources['treasury.financial_account'];
const financingOffer = striperesources['capital.financing_offer'];
const financingSummary = striperesources['capital.financing_summary'];

const TreasuryView: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Treasury & Capital
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Manage funds, pay bills, and earn yield with a financial account built for your platform. Access fast, flexible financing with Capital.
      </Typography>

      <Grid container spacing={4}>
        {/* Financial Account Section */}
        <Grid item xs={12} lg={8}>
          <Card elevation={2}>
            <CardHeader
              title="Financial Account"
              subheader={<ResourceLink id={financialAccount.id} />}
              avatar={<AccountBalanceIcon color="primary" />}
              action={
                <Chip
                  label={financialAccount.status.toUpperCase()}
                  color={financialAccount.status === 'open' ? 'success' : 'warning'}
                  size="small"
                />
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Balance
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Cash:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(financialAccount.balance.cash.usd, 'usd')}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" color="text.secondary">
                        Inbound Pending:
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {formatCurrency(financialAccount.balance.inbound_pending.usd, 'usd')}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1" color="text.secondary">
                        Outbound Pending:
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {formatCurrency(financialAccount.balance.outbound_pending.usd, 'usd')}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Financial Addresses
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    {financialAccount.financial_addresses.map((address, index) => (
                      <Box key={index}>
                        <Typography variant="subtitle2" color="primary">ABA Details</Typography>
                        <Typography variant="body2">
                          Holder: {address.aba.account_holder_name}
                        </Typography>
                        <Typography variant="body2">
                          Bank: {address.aba.bank_name}
                        </Typography>
                        <Typography variant="body2">
                          Routing: {address.aba.routing_number} | Last4: {address.aba.account_number_last4}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Networks: {address.supported_networks.join(', ')}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <FeatureIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Active Features
                  </Typography>
                  <Box>
                    {financialAccount.active_features.map((feature) => (
                      <Chip key={feature} label={feature} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Capital Section */}
        <Grid item xs={12} lg={4}>
            <Card elevation={2}>
              <CardHeader
                title="Capital Financing"
                subheader="Access to funding"
                avatar={<MonetizationOnIcon color="primary" />}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>Active Offer</Typography>
                 <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <ResourceLink id={financingOffer.id} />
                        <Chip
                          label={financingOffer.status.toUpperCase()}
                          color={financingOffer.status === 'accepted' ? 'success' : 'default'}
                          size="small"
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                       Expires after: {formatTimestamp(financingOffer.expires_after)}
                    </Typography>
                </Paper>
                 <Typography variant="h6" gutterBottom>Financing Summary</Typography>
                 <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Advance:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(financingSummary.details.advance_amount, financingSummary.details.currency)}
                      </Typography>
                    </Box>
                     <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Fee:</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(financingSummary.details.fee_amount, financingSummary.details.currency)}
                      </Typography>
                    </Box>
                     <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Remaining:</Typography>
                      <Typography variant="body1" fontWeight="bold" color="error.main">
                        {formatCurrency(financingSummary.details.remaining_amount, financingSummary.details.currency)}
                      </Typography>
                    </Box>
                     <Divider sx={{my: 1}} />
                     <Typography variant="body2" color="text.secondary">
                       Withhold Rate: {(financingSummary.details.withhold_rate / 1000000).toFixed(2)}%
                    </Typography>
                </Paper>
              </CardContent>
            </Card>
        </Grid>

        {/* Financial Account Full JSON */}
        <Grid item xs={12}>
            <Card elevation={2}>
                 <CardHeader title="treasury.financial_account JSON" />
                 <CardContent>
                    <CodeBlock
                        language="json"
                        code={JSON.stringify(financialAccount, null, 2)}
                    />
                 </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TreasuryView;