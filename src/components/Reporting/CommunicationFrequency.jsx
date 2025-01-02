import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Box, Button, Typography, Grid, Select, MenuItem, TextField } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Chart from 'chart.js/auto';

const ReportingAnalytics = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [methods, setMethods] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedMethod, setSelectedMethod] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const db = getFirestore();

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsCollection = collection(db, 'calendarEvents');
            const snapshot = await getDocs(eventsCollection);
            const eventsData = snapshot.docs.map(doc => doc.data());
            setEvents(eventsData);
            setFilteredEvents(eventsData);

            const uniqueCompanies = Array.from(new Set(eventsData.map(event => event.companyName))).sort();
            setCompanies(uniqueCompanies);

            const uniqueMethods = Array.from(new Set(eventsData.map(event => event.type))).sort();
            setMethods(uniqueMethods);
        };

        fetchEvents();
    }, [db]);

    const handleFilter = () => {
        let filtered = [...events];

        if (selectedCompany) {
            filtered = filtered.filter(event => event.companyName === selectedCompany);
        }

        if (selectedMethod) {
            filtered = filtered.filter(event => event.type === selectedMethod);
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
        setSelectedMethod('');
        setStartDate('');
        setEndDate('');
        setFilteredEvents([...events]);
    };

    const communicationFrequencyData = () => {
        const groupedData = filteredEvents.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {});

        return {
            labels: Object.keys(groupedData),
            datasets: [
                {
                    label: 'Communication Frequency',
                    data: Object.values(groupedData),
                    backgroundColor: ['#007BFF', '#28A745', '#FFC107', '#DC3545'],
                },
            ],
        };
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Communication Frequency Report', 10, 10);

        // Add filter details to the PDF
        if (selectedCompany || selectedMethod || startDate || endDate) {
            doc.text('Filters Applied:', 10, 20);
            if (selectedCompany) doc.text(`Company: ${selectedCompany}`, 10, 30);
            if (selectedMethod) doc.text(`Method: ${selectedMethod}`, 10, 40);
            if (startDate) doc.text(`Start Date: ${startDate}`, 10, 50);
            if (endDate) doc.text(`End Date: ${endDate}`, 10, 60);
        }

        const tableData = Object.entries(
            filteredEvents.reduce((acc, event) => {
                const key = `${event.companyName}-${event.type}`;
                acc[key] = acc[key] || { companyName: event.companyName, method: event.type, count: 0 };
                acc[key].count += 1;
                return acc;
            }, {})
        ).map(([key, value]) => [value.companyName, value.method, value.count]);

        doc.autoTable({
            head: [['Company Name', 'Communication Method', 'Count']],
            body: tableData,
            startY: 70,
        });

        doc.save('Communication_Frequency_Report.pdf');
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Communication Frequency Report
            </Typography>
            <Grid container spacing={2} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        value={selectedCompany}
                        onChange={e => setSelectedCompany(e.target.value)}
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
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        value={selectedMethod}
                        onChange={e => setSelectedMethod(e.target.value)}
                        displayEmpty
                        fullWidth
                    >
                        <MenuItem value="">Filter by Method</MenuItem>
                        {methods.map((method, index) => (
                            <MenuItem key={index} value={method}>
                                {method}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" onClick={handleFilter} fullWidth>
                        Apply Filters
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" color="secondary" onClick={clearFilters} fullWidth>
                        Clear Filters
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" color="primary" onClick={exportPDF} fullWidth>
                        Export to PDF
                    </Button>
                </Grid>
            </Grid>
            <Box style={{ maxWidth: '750px', margin: '0 auto' }}>
                <Bar
                    data={communicationFrequencyData()}
                    options={{
                        maintainAspectRatio: true,
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                        },
                        scales: {
                            x: { title: { display: true, text: 'Communication Methods' } },
                            y: { title: { display: true, text: 'Frequency' } },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default ReportingAnalytics;
