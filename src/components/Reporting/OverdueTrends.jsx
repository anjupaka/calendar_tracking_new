import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Grid, Select, MenuItem, TextField, Button } from '@mui/material';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Chart from 'chart.js/auto';

const OverdueTrends = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
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
        };

        fetchEvents();
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

    const overdueTrendsData = () => {
        const overdueEvents = filteredEvents.filter(event => {
            const eventDate = new Date(`${event.date}T${event.time}`);
            return eventDate < new Date();
        });

        const groupedData = overdueEvents.reduce((acc, event) => {
            const company = event.companyName || 'Unknown Company';
            const date = event.date;
            acc[company] = acc[company] || {};
            acc[company][date] = (acc[company][date] || 0) + 1;
            return acc;
        }, {});

        const labels = Array.from(new Set(overdueEvents.map(event => event.date))).sort();

        const datasets = Object.keys(groupedData).map((company, index) => {
            const data = labels.map(date => groupedData[company][date] || 0);
            const colors = ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#17A2B8'];
            return {
                label: company,
                data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length],
                fill: false,
                tension: 0.4, // Adds smooth curves to the lines
                pointRadius: 2,
                pointHoverRadius: 7,
                borderWidth: 1, // Makes the chart lines narrower
            };
        });

        return {
            labels,
            datasets,
        };
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Overdue Communication Trends Report', 10, 10);

        // Add filter details to the PDF
        if (selectedCompany || startDate || endDate) {
            doc.text('Filters Applied:', 10, 20);
            if (selectedCompany) doc.text(`Company: ${selectedCompany}`, 10, 30);
            if (startDate) doc.text(`Start Date: ${startDate}`, 10, 40);
            if (endDate) doc.text(`End Date: ${endDate}`, 10, 50);
        } else {
            doc.text('Filters Applied: None', 10, 20);
        }

        const tableData = Object.entries(
            filteredEvents.reduce((acc, event) => {
                const company = event.companyName || 'Unknown Company';
                acc[company] = (acc[company] || 0) + 1;
                return acc;
            }, {})
        ).map(([company, count]) => [company, count]);

        doc.autoTable({
            head: [['Company Name', 'Overdue Count']],
            body: tableData,
            startY: 60,
        });

        doc.save('Overdue_Communication_Trends_Report.pdf');
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Overdue Communication Trends
            </Typography>
            <Grid container spacing={2} mb={3} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
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
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        label="Start Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <TextField
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        label="End Date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} justifyContent="center" mb={3}>
                <Grid item>
                    <Button variant="contained" onClick={handleFilter} style={{ marginRight: '10px' }}>
                        Apply Filters
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="secondary" onClick={clearFilters} style={{ marginRight: '10px' }}>
                        Clear Filters
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="primary" onClick={exportPDF}>
                        Export to PDF
                    </Button>
                </Grid>
            </Grid>
            <Grid container justifyContent="center" mb={3}>
                <Grid item xs={12} sm={10} md={8}>
                    <Line
                        data={overdueTrendsData()}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                            },
                            scales: {
                                x: { title: { display: true, text: 'Date' } },
                                y: {
                                    title: { display: true, text: 'Overdue Count' },
                                    ticks: {
                                        stepSize: 1, // Ensure y-axis increments by 1
                                    },
                                },
                            },
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default OverdueTrends;
