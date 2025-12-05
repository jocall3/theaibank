```typescript
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { listIncomingPaymentDetails } from '../../api/incomingPaymentDetails'; // Adjust path as needed

interface IncomingPaymentDetail {
  id: string;
  amount: number;
  currency: string;
  direction: string;
  status: string;
  as_of_date: string;
  // ... other properties as needed
}

const IncomingPaymentDetailList = () => {
  const [rows, setRows] = useState<IncomingPaymentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIncomingPaymentDetails = async () => {
      try {
        const response = await listIncomingPaymentDetails({}); // Pass any necessary params
        if (response && Array.isArray(response)) {
          setRows(response);
        } else {
          console.error('Invalid response from API:', response);
          setRows([]);
        }
      } catch (error) {
        console.error('Failed to fetch incoming payment details:', error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingPaymentDetails();
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 150, valueGetter: (params: GridValueGetterParams) => params.row.amount / 100 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    { field: 'direction', headerName: 'Direction', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'as_of_date', headerName: 'As Of Date', width: 150 },
    // ... other columns as needed
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
      />
    </div>
  );
};

export default IncomingPaymentDetailList;
```