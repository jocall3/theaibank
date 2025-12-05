
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery } from '@tanstack/react-query';
import { getVirtualAccounts, deleteVirtualAccount } from '../api/virtualAccountsApi'; // Adjust the path
import { VirtualAccount } from '../types/virtualAccount'; // Adjust the path

interface VirtualAccountsTableProps {
  onEdit: (virtualAccount: VirtualAccount) => void;
  onDelete: (id: string) => void;
}

const VirtualAccountsTable: React.FC<VirtualAccountsTableProps> = ({ onEdit, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error, refetch } = useQuery(
    ['virtualAccounts', page, rowsPerPage],
    () => getVirtualAccounts({ afterCursor: page * rowsPerPage, perPage: rowsPerPage }),
    {
      keepPreviousData: true,
    }
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    // Refetch data when page or rowsPerPage changes
    refetch();
  }, [page, rowsPerPage, refetch]);


  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error fetching data: {JSON.stringify(error)}</Typography>;
  }

  const handleEditClick = (virtualAccount: VirtualAccount) => {
    onEdit(virtualAccount);
  };

  const handleDeleteClick = async (id: string) => {
    try {
      await deleteVirtualAccount(id);
      refetch(); // Refetch data after successful deletion
      onDelete(id); // Optionally, perform additional actions after deletion
    } catch (deleteError) {
      console.error("Error deleting virtual account:", deleteError);
      // Handle error, perhaps show a notification to the user
    }
  };
  const virtualAccounts = data?.data || []; // Access the 'data' property

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="virtual accounts table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Internal Account ID</TableCell>
            <TableCell>Counterparty ID</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {virtualAccounts.map((row) => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>{row.internal_account_id}</TableCell>
              <TableCell>{row.counterparty_id}</TableCell>
              <TableCell align="right">
                <IconButton aria-label="edit" onClick={() => handleEditClick(row)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={() => handleDeleteClick(row.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
       <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data?.count || 0} // Assuming your API returns a total count
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};

export default VirtualAccountsTable;