import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Contexts
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';

// Layout
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

// Top-level views from /components
import AIAdStudioView from '../components/AIAdStudioView';
import { default as AIAdvisorView_legacy } from '../components/AIAdvisorView';
import AIInsights from '../components/AIInsights';
import { default as AlgoTradingLab_legacy } from '../components/AlgoTradingLab';
import APIIntegrationView from '../components/APIIntegrationView';
import ArtCollectibles from '../components/ArtCollectibles';
import BudgetsView from '../components/BudgetsView';
import CommoditiesExchange from '../components/CommoditiesExchange';
import ConciergeService from '../components/ConciergeService';
import CorporateCommandView from '../components/CorporateCommandView';
import CreditHealthView from '../components/CreditHealthView';
import CryptoView from '../components/CryptoView';
import Dashboard from '../components/Dashboard';
import DerivativesDesk from '../components/DerivativesDesk';
import FinancialDemocracyView from '../components/FinancialDemocracyView';
import FinancialGoalsView from '../components/FinancialGoalsView';
import ForexArena from '../components/ForexArena';
import GlobalMarketMap from '../components/GlobalMarketMap';
import ImpactTracker from '../components/ImpactTracker';
import InvestmentPortfolio from '../components/InvestmentPortfolio';
import InvestmentsView from '../components/InvestmentsView';
import LegacyBuilder from '../components/LegacyBuilder';
import LoginView from '../components/LoginView';
import MarketplaceView from '../components/MarketplaceView';
import MarqetaDashboardView from '../components/MarqetaDashboardView';
import { default as ModernTreasuryView_legacy } from '../components/ModernTreasuryView';
import OpenBankingView from '../components/OpenBankingView';
import PersonalizationView from '../components/PersonalizationView';
import PhilanthropyHub from '../components/PhilanthropyHub';
import PlaidDashboardView from '../components/PlaidDashboardView';
import PrivateEquityLounge from '../components/PrivateEquityLounge';
import QuantumAssets from '../components/QuantumAssets';
import QuantumWeaverView from '../components/QuantumWeaverView';
import RealEstateEmpire from '../components/RealEstateEmpire';
import SecurityView from '../components/SecurityView';
import SendMoneyView from '../components/SendMoneyView';
import SettingsView from '../components/SettingsView';
import SovereignWealth from '../components/SovereignWealth';
import SSOView from '../components/SSOView';
import StripeDashboardView from '../components/StripeDashboardView';
import TaxOptimizationChamber from '../components/TaxOptimizationChamber';
import TheVisionView from '../components/TheVisionView';
import { default as TransactionsView_legacy } from '../components/TransactionsView';
import VentureCapitalDesk from '../components/VentureCapitalDesk';
import WealthTimeline from '../components/WealthTimeline';


// A simple ErrorBoundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("ErrorBoundary caught an error", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please check the console.</h1>;
    }
    return this.props.children;
  }
}

const AppLayout = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121212', color: 'white' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <Routes>
                <Route path="/login" element={<LoginView />} />
                <Route path="/sso" element={<SSOView />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Routes from /components */}
                  <Route path="/ai-ad-studio" element={<AIAdStudioView />} />
                  <Route path="/legacy/ai-advisor" element={<AIAdvisorView_legacy />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/legacy/algo-trading-lab" element={<AlgoTradingLab_legacy />} />
                  <Route path="/api-integration" element={<APIIntegrationView />} />
                  <Route path="/art-collectibles" element={<ArtCollectibles />} />
                  <Route path="/budgets" element={<BudgetsView />} />
                  <Route path="/commodities-exchange" element={<CommoditiesExchange />} />
                  <Route path="/concierge-service" element={<ConciergeService />} />
                  <Route path="/corporate-command" element={<CorporateCommandView />} />
                  <Route path="/credit-health" element={<CreditHealthView />} />
                  <Route path="/crypto" element={<CryptoView />} />
                  <Route path="/derivatives-desk" element={<DerivativesDesk />} />
                  <Route path="/financial-democracy" element={<FinancialDemocracyView />} />
                  <Route path="/financial-goals" element={<FinancialGoalsView />} />
                  <Route path="/forex-arena" element={<ForexArena />} />
                  <Route path="/global-market-map" element={<GlobalMarketMap />} />
                  <Route path="/impact-tracker" element={<ImpactTracker />} />
                  <Route path="/investment-portfolio" element={<InvestmentPortfolio />} />
                  <Route path="/investments" element={<InvestmentsView />} />
                  <Route path="/legacy-builder" element={<LegacyBuilder />} />
                  <Route path="/marketplace" element={<MarketplaceView />} />
                  <Route path="/marqeta-dashboard" element={<MarqetaDashboardView />} />
                  <Route path="/legacy/modern-treasury" element={<ModernTreasuryView_legacy />} />
                  <Route path="/open-banking" element={<OpenBankingView />} />
                  <Route path="/personalization" element={<PersonalizationView />} />
                  <Route path="/philanthropy-hub" element={<PhilanthropyHub />} />
                  <Route path="/plaid-dashboard" element={<PlaidDashboardView />} />
                  <Route path="/private-equity-lounge" element={<PrivateEquityLounge />} />
                  <Route path="/quantum-assets" element={<QuantumAssets />} />
                  <Route path="/quantum-weaver" element={<QuantumWeaverView />} />
                  <Route path="/real-estate-empire" element={<RealEstateEmpire />} />
                  <Route path="/security" element={<SecurityView />} />
                  <Route path="/send-money" element={<SendMoneyView />} />
                  <Route path="/settings" element={<SettingsView />} />
                  <Route path="/sovereign-wealth" element={<SovereignWealth />} />
                  <Route path="/stripe-dashboard" element={<StripeDashboardView />} />
                  <Route path="/tax-optimization-chamber" element={<TaxOptimizationChamber />} />
                  <Route path="/the-vision" element={<TheVisionView />} />
                  <Route path="/legacy/transactions" element={<TransactionsView_legacy />} />
                  <Route path="/venture-capital-desk" element={<VentureCapitalDesk />} />
                  <Route path="/wealth-timeline" element={<WealthTimeline />} />

          
                  {/* Fallback route */}
                  <Route path="*" element={<Dashboard />} />
                </Route>
              </Routes>
            </Router>
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;