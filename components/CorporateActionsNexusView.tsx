```tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Container, Grid, Paper, ThemeProvider, createTheme } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import axios from 'axios';

// Define the types for the data
interface CorporateActionEvent {
    id: string;
    eventCode: string;
    description: string;
    status: string;
    recordDate: string;
    effectiveDate: string;
    [key: string]: any; // Allow for other properties
}

// Define the tab content interfaces
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

// Define the theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Example primary color
        },
    },
});

const CorporateActionsNexusView: React.FC = () => {
    const [value, setValue] = useState(0);
    const [activeEvents, setActiveEvents] = useState<CorporateActionEvent[]>([]);
    const [pendingEvents, setPendingEvents] = useState<CorporateActionEvent[]>([]);
    const [historicalEvents, setHistoricalEvents] = useState<CorporateActionEvent[]>([]);
    const [loading, setLoading] = useState(true); // Loading state

    // Define columns for each tab's DataGrid (can be customized per tab)
    const activeColumns: GridColDef[] = [
        { field: 'eventCode', headerName: 'Event Code', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'recordDate', headerName: 'Record Date', width: 150 },
        { field: 'effectiveDate', headerName: 'Effective Date', width: 150 },
        // Add more columns as needed, e.g., security, details, etc.
    ];

    const pendingColumns: GridColDef[] = [
        { field: 'eventCode', headerName: 'Event Code', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'recordDate', headerName: 'Record Date', width: 150 },
        { field: 'effectiveDate', headerName: 'Effective Date', width: 150 },
        // Columns specific to pending events
    ];

    const historicalColumns: GridColDef[] = [
        { field: 'eventCode', headerName: 'Event Code', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'recordDate', headerName: 'Record Date', width: 150 },
        { field: 'effectiveDate', headerName: 'Effective Date', width: 150 },
        // Columns specific to historical events
    ];

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Mock data retrieval (replace with actual API calls)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching data

            try {
                // Replace with your actual API endpoints
                const [activeResponse, pendingResponse, historicalResponse] = await Promise.all([
                    axios.get<CorporateActionEvent[]>('/api/activeEvents'),
                    axios.get<CorporateActionEvent[]>('/api/pendingEvents'),
                    axios.get<CorporateActionEvent[]>('/api/historicalEvents'),
                ]);

                setActiveEvents(activeResponse.data);
                setPendingEvents(pendingResponse.data);
                setHistoricalEvents(historicalResponse.data);

            } catch (error) {
                console.error("Error fetching data:", error);
                // Optionally, set error state here to display error message
            } finally {
                setLoading(false); // Set loading to false after fetching (or error)
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on component mount


    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="xl">
                <Typography variant="h4" component="h1" gutterBottom>
                    Automated Corporate Actions
                </Typography>
                <Box sx={{ bgcolor: 'background.paper' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="corporate actions tabs"
                    >
                        <Tab label="Active Events" {...a11yProps(0)} />
                        <Tab label="Pending Events" {...a11yProps(1)} />
                        <Tab label="Historical Events" {...a11yProps(2)} />
                    </Tabs>

                    <TabPanel value={value} index={0}>
                         {loading ? (
                            <Typography>Loading Active Events...</Typography>
                        ) : (
                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={activeEvents}
                                    columns={activeColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    checkboxSelection
                                    disableSelectionOnClick
                                />
                            </div>
                        )}
                    </TabPanel>

                    <TabPanel value={value} index={1}>
                        {loading ? (
                            <Typography>Loading Pending Events...</Typography>
                        ) : (
                           <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={pendingEvents}
                                    columns={pendingColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    checkboxSelection
                                    disableSelectionOnClick
                                />
                            </div>
                        )}
                    </TabPanel>

                    <TabPanel value={value} index={2}>
                       {loading ? (
                            <Typography>Loading Historical Events...</Typography>
                        ) : (
                            <div style={{ height: 500, width: '100%' }}>
                                <DataGrid
                                    rows={historicalEvents}
                                    columns={historicalColumns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    checkboxSelection
                                    disableSelectionOnClick
                                />
                            </div>
                        )}
                    </TabPanel>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default CorporateActionsNexusView;
```