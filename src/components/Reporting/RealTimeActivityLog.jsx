import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    TextField,
    Button,
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RealTimeFeed = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const eventsCollection = collection(db, 'calendarEvents');
            const snapshot = await getDocs(eventsCollection);
            const eventsData = snapshot.docs.map(doc => doc.data());
            setEvents(eventsData);
            setFilteredEvents(eventsData);

            const uniqueCompanies = Array.from(new Set(eventsData.map(event => event.companyName))).sort();
            setCompanies(uniqueCompanies);
        };

        fetchData();
    }, [db]);

    const handleFilter = () => {
        let filtered = [...events];

        if (selectedCompany) {
            filtered = filtered.filter(event => event.companyName === selectedCompany);
        }

        if (startDate) {
            filtered = filtered.filter(event => new Date(event.date) >= new Date(startDate));
        }

        if (endDate) {
            filtered = filtered.filter(event => new Date(event.date) <= new Date(endDate));
        }

        setFilteredEvents(filtered);
    };

    const clearFilters = () => {
        setSelectedCompany('');
        setStartDate('');
        setEndDate('');
        setFilteredEvents([...events]);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Real-Time Communication Feed Report', 10, 10);

        if (selectedCompany || startDate || endDate) {
            doc.text('Filters Applied:', 10, 20);
            if (selectedCompany) doc.text(`Company: ${selectedCompany}`, 10, 30);
            if (startDate) doc.text(`Start Date: ${startDate}`, 10, 40);
            if (endDate) doc.text(`End Date: ${endDate}`, 10, 50);
        } else {
            doc.text('Filters Applied: None', 10, 20);
        }

        const tableData = filteredEvents.map(event => [
            event.title || 'N/A',
            event.companyName || 'N/A',
            event.type || 'N/A',
            event.date || 'N/A',
            event.time || 'N/A',
            event.note || 'N/A',
        ]);

        doc.autoTable({
            head: [['Title', 'Company', 'Method', 'Date', 'Time', 'Notes']],
            body: tableData,
            startY: 60,
        });

        doc.save('Real_Time_Communication_Feed_Report.pdf');
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Real-Time Communication Feed
            </Typography>

            <Box mb={3}>
                <Box display="flex" gap={2} mb={2}>
                    <Select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="">Filter by Company</MenuItem>
                        {companies.map((company, index) => (
                            <MenuItem key={index} value={company}>
                                {company}
                            </MenuItem>
                        ))}
                    </Select>
                    <TextField
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Box>
                <Box display="flex" gap={2}>
                    <Button variant="contained" onClick={handleFilter}>
                        Apply Filters
                    </Button>
                    <Button variant="contained" color="secondary" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                    <Button variant="contained" color="primary" onClick={exportPDF}>
                        Export to PDF
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Notes</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEvents.map((event, index) => (
                            <TableRow key={index}>
                                <TableCell style={{ fontWeight: 'normal' }}>{event.title || 'N/A'}</TableCell>
                                <TableCell>{event.companyName || 'N/A'}</TableCell>
                                <TableCell>{event.type || 'N/A'}</TableCell>
                                <TableCell>{event.date || 'N/A'}</TableCell>
                                <TableCell>{event.time || 'N/A'}</TableCell>
                                <TableCell>{event.note || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RealTimeFeed;
