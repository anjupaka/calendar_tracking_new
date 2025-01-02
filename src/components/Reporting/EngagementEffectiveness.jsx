import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Box, Button, Typography, Grid, Select, MenuItem } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Chart from 'chart.js/auto';

const EngagementEffectiveness = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
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

        setFilteredEvents(filtered);
    };

    const clearFilters = () => {
        setSelectedCompany('');
        setFilteredEvents([...events]);
    };

    const engagementEffectivenessData = () => {
        const groupedData = filteredEvents.reduce((acc, event) => {
            const method = event.type;
            acc[method] = acc[method] || { total: 0, successful: 0 };
            acc[method].total += 1;
            if (event.success) { // Assuming `success` is a boolean field in the dataset
                acc[method].successful += 1;
            }
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const totalEvents = Object.values(groupedData).reduce((sum, { total }) => sum + total, 0);
        const successRates = labels.map(label => {
            const { total } = groupedData[label];
            return ((total / totalEvents) * 100).toFixed(2);
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Engagement Effectiveness (%)',
                    data: successRates,
                    backgroundColor: ['#007BFF', '#DDA0DD', '#FFC107', '#663399', '#FF8C00',  '#28A745'  ],
                },
            ],
        };
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text('Engagement Effectiveness Report', 10, 10);

        // Add filter details to the PDF
        if (selectedCompany) {
            doc.text(`Filters Applied:`, 10, 20);
            doc.text(`Company: ${selectedCompany}`, 10, 30);
        } else {
            doc.text('Filters Applied: None', 10, 20);
        }

        const tableData = Object.entries(
            filteredEvents.reduce((acc, event) => {
                const method = event.type;
                acc[method] = acc[method] || { method, total: 0 };
                acc[method].total += 1;
                return acc;
            }, {})
        ).map(([key, value]) => [
            value.method,
            ((value.total / filteredEvents.length) * 100).toFixed(2),
        ]);

        doc.autoTable({
            head: [['Method', 'Percentage (%)']],
            body: tableData,
            startY: 40,
        });

        doc.save('Engagement_Effectiveness_Report.pdf');
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Engagement Effectiveness Dashboard
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
                    <Button variant="contained" onClick={handleFilter} fullWidth>
                        Apply Filter
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" color="secondary" onClick={clearFilters} fullWidth>
                        Clear Filter
                    </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button variant="contained" color="primary" onClick={exportPDF} fullWidth>
                        Export to PDF
                    </Button>
                </Grid>
            </Grid>
            <Box style={{ maxWidth: '500px', margin: '0 auto' }}>
                <Pie
                    data={engagementEffectivenessData()}
                    options={{
                        maintainAspectRatio: true,
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                        },
                    }}
                />
            </Box>
        </Box>
    );
};

export default EngagementEffectiveness;
