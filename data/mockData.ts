// data/mockData.ts

// Define a type for the navigation items
export interface NavItem {
  title: string;
  path: string;
  icon?: any; // Placeholder for potential icon component
}

// Function to generate a URL-friendly path from a title
const toPath = (title: string): string => {
  return '/' + title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[()&]/g, '')    // Remove parentheses and ampersands
    .replace(/-+/g, '-');     // Replace multiple hyphens with a single one
};

// Ungrouped, primary navigation items
export const primaryNavItems: NavItem[] = [
  { title: 'Dashboard', path: toPath('Dashboard') },
  { title: 'Transactions', path: toPath('Transactions') },
  { title: 'Send Money', path: toPath('Send Money') },
  { title: 'Budgets', path: toPath('Budgets') },
  { title: 'Financial Goals', path: toPath('Financial Goals') },
  { title: 'Credit Health', path: toPath('Credit Health') },
];

// Grouped navigation items for more complex sections
export const groupedNavItems: { group: string; items: NavItem[] }[] = [
  {
    group: 'Markets & Investments',
    items: [
      { title: 'Investments', path: toPath('Investments') },
      { title: 'Crypto & Web3', path: toPath('Crypto & Web3') },
      { title: 'Algo-Trading Lab', path: toPath('Algo-Trading Lab') },
      { title: 'Forex Arena', path: toPath('Forex Arena') },
      { title: 'Commodities Exchange', path: toPath('Commodities Exchange') },
      { title: 'Real Estate Empire', path: toPath('Real Estate Empire') },
      { title: 'Art & Collectibles', path: toPath('Art & Collectibles') },
      { title: 'Derivatives Desk', path: toPath('Derivatives Desk') },
      { title: 'Venture Capital Desk', path: toPath('Venture Capital Desk') },
      { title: 'Private Equity Lounge', path: toPath('Private Equity Lounge') },
    ],
  },
  {
    group: 'Wealth & Corporate',
    items: [
      { title: 'Tax Optimization', path: toPath('Tax Optimization') },
      { title: 'Legacy Builder', path: toPath('Legacy Builder') },
      { title: 'Corporate Command', path: toPath('Corporate Command') },
      { title: 'Modern Treasury', path: toPath('Modern Treasury') },
    ],
  },
  {
    group: 'Platform & Integrations',
    items: [
      { title: 'Card Programs (Marqeta)', path: toPath('Card Programs (Marqeta)') },
      { title: 'Data Network (Plaid)', path: toPath('Data Network (Plaid)') },
      { title: 'Payments (Stripe)', path: toPath('Payments (Stripe)') },
      { title: 'Single Sign-On (SSO)', path: toPath('Single Sign-On (SSO)') },
      { title: 'Open Banking', path: toPath('Open Banking') },
      { title: 'API Status', path: toPath('API Status') },
    ],
  },
  {
    group: 'Artificial Intelligence',
    items: [
      { title: 'AI Financial Advisor', path: toPath('AI Financial Advisor') },
      { title: 'Quantum Weaver AI', path: toPath('Quantum Weaver AI') },
      { title: 'Agent Marketplace', path: toPath('Agent Marketplace') },
      { title: 'AI Ad Studio', path: toPath('AI Ad Studio') },
    ],
  },
  {
    group: 'Services & Features',
    items: [
      { title: 'Card Customization', path: toPath('Card Customization') },
      { title: 'Financial Democracy', path: toPath('Financial Democracy') },
      { title: 'Concierge Service', path: toPath('Concierge Service') },
      { title: 'Philanthropy Hub', path: toPath('Philanthropy Hub') },
      { title: 'Sovereign Wealth Sim', path: toPath('Sovereign Wealth Sim') },
    ],
  },
  {
    group: 'System & Vision',
    items: [
      { title: 'Security Center', path: toPath('Security Center') },
      { title: 'Personalization', path: toPath('Personalization') },
      { title: 'The Vision', path: toPath('The Vision') },
    ],
  },
];

// Mock user profile data to make the profile section interactive
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  accountProvider: 'Google' | 'Email';
  profilePath: string;
}

export const userProfileData: UserProfile = {
  name: "James B. O'Callaghan III",
  email: "jbo3@idgaf.ai",
  // Using a placeholder avatar service that generates initials
  avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=James%20O'Callaghan",
  accountProvider: 'Google',
  profilePath: '/profile/settings', // A clickable path to user settings
};