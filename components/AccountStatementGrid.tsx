import React, { useState, useMemo } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { Box, Chip, Typography } from '@mui/material';
import { StatementLine } from '../../types/StatementTypes';

// Assuming External codes are available or imported from a JSON schema translation
// For simplicity, we define a lookup function here. In a real project, this would be imported
// from a generated file or integrated via a schema library.

// Placeholder for external code lookups
const getExternalCodeDescription = (code: string, type: 'status' | 'purpose' | 'reason' | 'charge') => {
  const codes: { [key: string]: { [key: string]: string } } = {
    status: {
      BOOK: 'Booked',
      PDNG: 'Pending',
      CANC: 'Cancelled',
      REJT: 'Rejected',
    },
    purpose: {
      CASH: 'Cash Management',
      TRAD: 'Trade Payment',
      SALA: 'Salary Payment',
      SUPP: 'Supplier Payment',
    },
    reason: {
      CUST: 'Customer Decision',
      DUPL: 'Duplicate Payment',
      FRAD: 'Fraudulent Transaction',
      FOCR: 'Cancellation Requested',
    },
    charge: {
      COMM: 'Commission',
      BRKF: 'Brokerage Fee',
      TELE: 'Telecommunication Charge',
      INVS: 'Investigation Fee',
    },
  };
  return codes[type]?.[code] || code;
};

interface AccountStatementGridProps {
  statementLines: StatementLine[];
}

const renderAmountCell = (params: GridRenderCellParams<StatementLine, string>) => {
  const isCredit = params.row.CdtDbtInd === 'CRDT';
  const color = isCredit ? 'success' : 'error';
  const sign = isCredit ? '+' : '-';
  const amount = params.value;

  return (
    <Chip
      label={`${sign} ${amount}`}
      color={color}
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  );
};

const renderStatusCell = (params: GridRenderCellParams<StatementLine, string>) => {
  const code = params.value;
  const description = getExternalCodeDescription(code as string, 'status');
  const color = code === 'BOOK' ? 'primary' : code === 'PDNG' ? 'warning' : 'default';

  return <Chip label={description} size="small" color={color} />;
};

const renderNarrativeCell = (params: GridRenderCellParams<StatementLine, string>) => (
  <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
    <Typography variant="body2">{params.value}</Typography>
  </Box>
);

const AccountStatementGrid: React.FC<AccountStatementGridProps> = ({ statementLines }) => {
  const [pageSize, setPageSize] = useState(10);

  const columns: GridColDef<StatementLine>[] = useMemo(() => [
    { 
      field: 'BookgDt', 
      headerName: 'Booking Date', 
      width: 130, 
      valueGetter: (params: GridValueGetterParams) => new Date(params.row.BookgDt).toLocaleDateString(),
    },
    { 
      field: 'ValDt', 
      headerName: 'Value Date', 
      width: 130, 
      valueGetter: (params: GridValueGetterParams) => new Date(params.row.ValDt).toLocaleDateString(),
    },
    {
      field: 'Amt',
      headerName: 'Amount',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: renderAmountCell,
      valueFormatter: (params) => `${params.value?.Ccy} ${params.value?.Value.toFixed(2)}`,
    },
    {
      field: 'Sts',
      headerName: 'Status',
      width: 120,
      renderCell: renderStatusCell,
      valueGetter: (params: GridValueGetterParams) => params.row.Sts.Cd,
    },
    {
      field: 'BkTxCd',
      headerName: 'Bank Transaction Code',
      width: 180,
      valueGetter: (params: GridValueGetterParams) => {
        const cd = params.row.BkTxCd;
        return `${cd.Prtry.Domn} / ${cd.Prtry.Fmly} / ${cd.Prtry.SubFmly}`;
      },
    },
    {
      field: 'Purp',
      headerName: 'Purpose',
      width: 150,
      valueGetter: (params: GridValueGetterParams) => {
        const code = params.row.Purp?.Cd;
        return code ? getExternalCodeDescription(code, 'purpose') : 'N/A';
      },
    },
    {
      field: 'RmtInf',
      headerName: 'Remittance Information',
      flex: 1,
      minWidth: 200,
      renderCell: renderNarrativeCell,
      valueGetter: (params: GridValueGetterParams) => params.row.RmtInf?.Ustrd || 'N/A',
    },
    {
      field: 'NtryRef',
      headerName: 'Entry Reference',
      width: 250,
      valueGetter: (params: GridValueGetterParams) => params.row.NtryRef,
    },
    {
      field: 'AddtlNtryInf',
      headerName: 'Additional Information',
      width: 150,
      renderCell: renderNarrativeCell,
      valueGetter: (params: GridValueGetterParams) => params.row.AddtlNtryInf || 'N/A',
    },
  ], []);

  return (
    <Box sx={{ height: 600, width: '100%', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Transaction Details
      </Typography>
      <DataGrid
        rows={statementLines.map((line, index) => ({ id: index, ...line }))}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 25]}
        pagination
        autoHeight
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
        }}
      />
    </Box>
  );
};

export default AccountStatementGrid;