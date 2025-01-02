import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Box,
    Button,
    Typography,
} from '@mui/material';
import { isToday, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css";

const Dashboard = () => {
    const [companies, setCompanies] = useState([]);
    const [overrideColor, setOverrideColor] = useState({});
    const db = getFirestore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            const eventsCollection = collection(db, 'calendarEvents');
            const snapshot = await getDocs(eventsCollection);
            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const groupedCompanies = events.reduce((acc, event) => {
                const { companyName, date, time, type, title, note } = event;
                const eventDate = new Date(`${date}T${time}`);

                if (!acc[companyName]) {
                    acc[companyName] = { lastFive: [], nextScheduled: [] };
                }

                const communication = { type, date, time, title, note };

                if (isBefore(eventDate, new Date())) {
                    acc[companyName].lastFive.push(communication);
                    acc[companyName].lastFive.sort((a, b) => new Date(b.date) - new Date(a.date));
                    acc[companyName].lastFive = acc[companyName].lastFive.slice(0, 5);
                } else {
                    acc[companyName].nextScheduled.push(communication);
                    acc[companyName].nextScheduled.sort((a, b) => new Date(a.date) - new Date(b.date));
                }

                return acc;
            }, {});

            setCompanies(
                Object.entries(groupedCompanies).map(([companyName, data]) => ({
                    companyName,
                    ...data,
                }))
            );
        };

        fetchCompanies();
    }, [db]);

    const toggleOverride = (companyName) => {
        setOverrideColor(prev => ({
            ...prev,
            [companyName]: !prev[companyName],
        }));
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center" color="#007BFF">
                Dashboard
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/user/Calendarview')}
                style={{ marginBottom: '20px', float: 'right' }}
            >
                Communication Performed
            </Button>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Company Name</strong></TableCell>
                            <TableCell><strong>Last Five Communications</strong></TableCell>
                            <TableCell><strong>Next Scheduled Communication</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companies.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.companyName}</TableCell>
                                <TableCell>
                                    {row.lastFive.length > 0 ? (
                                        row.lastFive.map((comm, idx) => (
                                            <Tooltip key={idx} title={comm.note || "No additional notes"} arrow>
                                                <Box
                                                    mb={1}
                                                    p={1}
                                                    borderRadius={1}
                                                    bgcolor={overrideColor[row.companyName] ? '#ffffff' : '#ff9e91'}
                                                >
                                                    {`${comm.type} on ${comm.date} at ${comm.time}`}
                                                </Box>
                                            </Tooltip>
                                        ))
                                    ) : (
                                        <Typography variant="body2">No recent communications</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {row.nextScheduled.length > 0 ? (
                                        row.nextScheduled.map((comm, idx) => {
                                            const eventDate = new Date(`${comm.date}T${comm.time}`);
                                            const isFutureToday = isAfter(eventDate, new Date()) && isToday(eventDate);

                                            return (
                                                <Tooltip key={idx} title={comm.note || "No additional notes"} arrow>
                                                    <Box
                                                        mb={1}
                                                        p={1}
                                                        borderRadius={1}
                                                        bgcolor={
                                                            overrideColor[row.companyName]
                                                                ? '#ffffff'
                                                                : isFutureToday
                                                                    ? '#ffff9f' // Yellow for today's future communication
                                                                    : '#99edc3' // Green for future communications beyond today
                                                        }
                                                    >
                                                        {`${comm.type} on ${comm.date} at ${comm.time}`}
                                                    </Box>
                                                </Tooltip>
                                            );
                                        })
                                    ) : (
                                        <Typography variant="body2">No upcoming communications</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color={overrideColor[row.companyName] ? "secondary" : "primary"}
                                        onClick={() => toggleOverride(row.companyName)}
                                    >
                                        {overrideColor[row.companyName] ? "Enable Highlight" : "Disable Highlight"}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Dashboard;
