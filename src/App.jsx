import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
    Drawer,
    List,
    ListItem,
    ListItemText,
    Collapse,
    Typography,
    Box,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import CommunicationMethods from "./components/Admin/CommunicationMethods";
import CompanyForm from "./components/Admin/CompanyForm";
import Dashboard from "./components/User/Dashboard";
import Calendarview from "./components/User/Calendarview";
import Notifications from "./components/User/Notifications";
import CommunicationFrequency from "./components/Reporting/CommunicationFrequency";
import EngagementEffectiveness from "./components/Reporting/EngagementEffectiveness";
import OverdueTrends from "./components/Reporting/OverdueTrends";
import RealTimeActivityLog from "./components/Reporting/RealTimeActivityLog";



import './App.css';

const App = () => {
    const [isAdminSubmenuOpen, setIsAdminSubmenuOpen] = useState(false);
    const [isUserSubmenuOpen, setIsUserSubmenuOpen] = useState(false);
    const [isReportingSubmenuOpen, setIsReportingSubmenuOpen] = useState(false);

    return (
        <Router>
            <div className="app-container">
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    anchor="left"
                    className="drawer"
                >
                    <div className="drawer-header">
                        <Typography variant="h6" className="drawer-title">
                            ENTNT Calendar App
                        </Typography>
                    </div>
                    <List>
                        {/* Home */}
                        <ListItem button component={Link} to="/">
                            <ListItemText primary="Home" />
                        </ListItem>

                        {/* Admin Dashboard */}
                        <ListItem button onClick={() => setIsAdminSubmenuOpen(!isAdminSubmenuOpen)}>
                            <ListItemText primary="Admin Dashboard" />
                            {isAdminSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={isAdminSubmenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button component={Link} to="/companyManagement" className="nested">
                                    <ListItemText primary="Company Management" />
                                </ListItem>
                                <ListItem button component={Link} to="/communicationMethods" className="nested">
                                    <ListItemText primary="Communication Methods" />
                                </ListItem>
                            </List>
                        </Collapse>

                        {/* User Dashboard */}
                        <ListItem button onClick={() => setIsUserSubmenuOpen(!isUserSubmenuOpen)}>
                            <ListItemText primary="User Dashboard" />
                            {isUserSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={isUserSubmenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button component={Link} to="/user/Dashboard" className="nested">
                                    <ListItemText primary="Dashboard" />
                                </ListItem>
                                <ListItem button component={Link} to="/user/Calendarview" className="nested">
                                    <ListItemText primary="Calendar View" />
                                </ListItem>
                                <ListItem button component={Link} to="/user/Notifications" className="nested">
                                    <ListItemText primary="Notifications" />
                                </ListItem>
                               
                            </List>
                        </Collapse>
                        <ListItem button onClick={() => setIsReportingSubmenuOpen(!isReportingSubmenuOpen)}>
                            <ListItemText primary="Reporting Dashboard" />
                            {isReportingSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={isReportingSubmenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItem button component={Link} to="/Reporting/CommunicationFrequency" className="nested">
                                    <ListItemText primary="CommunicationFrequency" />
                                </ListItem>
                                <ListItem button component={Link} to="/Reporting/EngagementEffectiveness" className="nested">
                                    <ListItemText primary="EngagementEffectiveness" />
                                </ListItem>
                                <ListItem button component={Link} to="/Reporting/OverdueTrends" className="nested">
                                    <ListItemText primary="OverdueTrends" />
                                </ListItem>
                                <ListItem button component={Link} to="/Reporting/RealTimeActivityLog" className="nested">
                                    <ListItemText primary="RealTimeActivityLog" />
                                </ListItem>
                            </List>
                        </Collapse>




                    </List>
                </Drawer>

                {/* Main Content */}
                <main className="main-content">
                    <Routes>
                        {/* Home */}
                        <Route path="/" element={<Typography variant="h4" font-weight= "bold">Welcome to the Communication Tracking Calendar App</Typography>} />

                        {/* Admin Routes */}
                        <Route path="/companyManagement" element={<CompanyForm />} />
                        <Route path="/communicationMethods" element={<CommunicationMethods />} />

                        {/* User Routes */}
                        <Route path="/user/Dashboard" element={<Dashboard />} />
                        <Route path="/user/Calendarview" element={<Calendarview />} />
                        <Route path="/user/Notifications" element={<Notifications />} />

                        {/* Reporting Routes */}
                        <Route path="/Reporting/CommunicationFrequency" element={<CommunicationFrequency />} />
                        <Route path="/Reporting/EngagementEffectiveness" element={<EngagementEffectiveness />} />
                        <Route path="/Reporting/OverdueTrends" element={<OverdueTrends />} />
                        <Route path="/Reporting/RealTimeActivityLog" element={<RealTimeActivityLog />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
