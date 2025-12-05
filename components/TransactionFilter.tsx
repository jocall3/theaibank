import React, { useState } from 'react';
import './TransactionFilter.css';

interface TransactionFilterProps {
  onApplyFilters: (filters: TransactionFilters) => void;
  availableCategories?: string[];
}

export interface TransactionFilters {
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  minAmount?: number;
  maxAmount?: number;
  category?: string;
}

const defaultCategories = [
  'All', 'ATM Fee', 'Advertising', 'Air Travel', 'Alcohol & Bars', 'Allowance',
  'Amusement', 'Arts', 'Auto & Transport', 'Auto Insurance', 'Auto Payment',
  'Baby Supplies', 'Babysitter & Day Care', 'Bank Fee', 'Bills & Utilities',
  'Bonus', 'Books', 'Books & Supplies', 'Business Services', 'Buy', 'Cash & ATM',
  'Charity', 'Check', 'Child Support', 'Clothing', 'Coffee Shops', 'Credit Card Payment',
  'Dentist', 'Deposit', 'Dividend & Cap Gains', 'Doctor', 'Education', 'Electronics & Software',
  'Entertainment', 'Eye Care', 'Fast Food', 'Federal Tax', 'Fees & Charges',
  'Finance Charge', 'Financial', 'Financial Advisor', 'Food & Dining', 'Furnishings',
  'Gas & Fuel', 'Gift', 'Gifts & Donations', 'Groceries', 'Gym', 'Hair',
  'Health & Fitness', 'Health Insurance', 'Hobbies', 'Home', 'Home Improvement',
  'Home Insurance', 'Home Phone', 'Home Services', 'Home Supplies', 'Hotel',
  'Income', 'Interest Income', 'Internet', 'Investments', 'Kids', 'Kids Activities',
  'Late Fee', 'Laundry', 'Lawn & Garden', 'Legal', 'Life Insurance', 'Loan Fees and Charges',
  'Loan Insurance', 'Loan Interest', 'Loan Payment', 'Loan Principal', 'Loans',
  'Local Tax', 'Low Balance', 'Mobile Phone', 'Mortgage & Rent', 'Movies & DVDs', 'Music',
  'Newspapers & Magazines', 'Office Supplies', 'Parking', 'Paycheck', 'Personal Care',
  'Pet Food & Supplies', 'Pet Grooming', 'Pets', 'Pharmacy', 'Printing', 'Property Tax',
  'Public Transportation', 'Reimbursement', 'Rental Car & Taxi', 'Restaurants', 'Sales Tax',
  'Sell', 'Services & Parts', 'Service Fee', 'Shipping', 'Shopping', 'Spa & Massage',
  'Sporting Goods', 'Sports', 'State Tax', 'Streaming Services', 'Student Loan', 'Taxes',
  'Television', 'Toys', 'Trade Commissions', 'Transfer', 'Transfer for Cash Spending',
  'Travel', 'Tuition', 'Uncategorized', 'Utilities', 'Vacation', 'Veterinary',
  'Internet / Broadband Charges'
];

const TransactionFilter: React.FC<TransactionFilterProps> = ({ onApplyFilters, availableCategories }) => {
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('All');

  const categoriesToDisplay = availableCategories && availableCategories.length > 0
    ? ['All', ...availableCategories.filter(c => c !== 'All')]
    : defaultCategories;

  const handleApplyFilters = () => {
    const filters: TransactionFilters = {
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      category: category !== 'All' ? category : undefined,
    };
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setCategory('All');
    onApplyFilters({});
  };

  return (
    <div className="transaction-filter">
      <h3>Filter Transactions</h3>
      <div className="filter-group">
        <label htmlFor="fromDate">From Date:</label>
        <input
          type="date"
          id="fromDate"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="toDate">To Date:</label>
        <input
          type="date"
          id="toDate"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="minAmount">Min Amount:</label>
        <input
          type="number"
          id="minAmount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          placeholder="e.g. 10.00"
        />
      </div>
      <div className="filter-group">
        <label htmlFor="maxAmount">Max Amount:</label>
        <input
          type="number"
          id="maxAmount"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          placeholder="e.g. 100.00"
        />
      </div>
      <div className="filter-group">
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoriesToDisplay.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-actions">
        <button onClick={handleApplyFilters}>Apply Filters</button>
        <button onClick={handleResetFilters}>Reset Filters</button>
      </div>
    </div>
  );
};

export default TransactionFilter;