```tsx
import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ExpectedPayment } from '../../../types/ExpectedPayment';
import { listExpectedPayments } from '../../api/expectedPayments';

interface Props {
  internalAccountId?: string;
}

interface DataIndexType {
  key: string;
  amount: number;
  direction: string;
  type: string;
  date: string;
  description: string;
}

const ExpectedPaymentsTable: React.FC<Props> = ({ internalAccountId }) => {
  const [expectedPayments, setExpectedPayments] = useState<ExpectedPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: { internal_account_id?: string } = {};
        if (internalAccountId) {
          params.internal_account_id = internalAccountId;
        }
        const response = await listExpectedPayments(params);
        setExpectedPayments(response);
      } catch (error) {
        console.error('Failed to fetch expected payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [internalAccountId]);

  const handleSearch = (selectedKeys: string[], confirm: (param?: boolean) => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): any => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        //setTimeout(() => searchInput.select(), 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <span>
          {text
            .split(new RegExp(`(?<=[^\\w])${searchText}|${searchText}(?=[^\\w])`, 'i'))
            .map(
              (fragment: string, i: number) =>
                text.split(new RegExp(`(?<=[^\\w])${searchText}|${searchText}(?=[^\\w])`, 'i')).length - 1 === i
                  ? fragment
                  : <span key={i}>
                      {fragment}
                      <span style={{ backgroundColor: '#ffc069', padding: 0 }}>
                        {searchText}
                      </span>
                    </span>
            )}
        </span>
      ) : (
        text
      ),
  });

  const columns: ColumnsType<DataIndexType> = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      filters: [
        { text: 'Credit', value: 'credit' },
        { text: 'Debit', value: 'debit' },
      ],
      onFilter: (value: any, record) => record.direction === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'ACH', value: 'ach' },
        { text: 'Wire', value: 'wire' },
        { text: 'Check', value: 'check' },
        // Add other types as needed
      ],
      onFilter: (value: any, record) => record.type === value,
      ...getColumnSearchProps('type'),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => a.date.localeCompare(b.date),
      ...getColumnSearchProps('date'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ...getColumnSearchProps('description'),
    },
  ];

  const data: DataIndexType[] = expectedPayments.map(payment => ({
    key: payment.id,
    amount: payment.amount_upper_bound / 100,
    direction: payment.direction,
    type: payment.type || 'N/A',
    date: payment.date_lower_bound || 'N/A',
    description: payment.description || 'N/A',
  }));

  return (
    <Table columns={columns} dataSource={data} loading={loading} />
  );
};

export default ExpectedPaymentsTable;
```