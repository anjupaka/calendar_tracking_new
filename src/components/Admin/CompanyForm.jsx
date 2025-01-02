import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import "./CompanyForm.css";
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const CompanyForm = () => {
    const [companyDetails, setCompanyDetails] = useState({
        name: "",
        location: "",
        linkedInProfile: "",
        emails: "",
        phoneNumbers: "",
        comments: "",
        CommunicationPeriod: "",
    });
    const [companyList, setCompanyList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCompanyId, setCurrentCompanyId] = useState(null);

    // Fetch companies from Firestore
    useEffect(() => {
        const fetchCompanies = async () => {
            const querySnapshot = await getDocs(collection(db, "companies"));
            const companies = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCompanyList(companies);

            // Fetch CalendarEvents and delete orphaned records
            const eventsSnapshot = await getDocs(collection(db, "calendarEvents"));
            const events = eventsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            const companyNames = companies.map((company) => company.name);

            const deletePromises = events
                .filter((event) => !companyNames.includes(event.companyName))
                .map((event) => deleteDoc(doc(db, "calendarEvents", event.id)));

            await Promise.all(deletePromises);
        };

        fetchCompanies();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyDetails({ ...companyDetails, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!companyDetails.name) {
            alert("Company name is required!");
            return;
        }

        try {
            if (editMode) {
                const previousCompany = companyList.find(
                    (company) => company.id === currentCompanyId
                );

                await updateDoc(doc(db, "companies", currentCompanyId), companyDetails);

                // Update companyName in CalendarEvents
                if (previousCompany.name !== companyDetails.name) {
                    const eventsQuery = query(
                        collection(db, "calendarEvents"),
                        where("companyName", "==", previousCompany.name)
                    );
                    const eventsSnapshot = await getDocs(eventsQuery);

                    const updatePromises = eventsSnapshot.docs.map((eventDoc) =>
                        updateDoc(doc(db, "calendarEvents", eventDoc.id), {
                            companyName: companyDetails.name,
                        })
                    );

                    await Promise.all(updatePromises);
                }

                setCompanyList(
                    companyList.map((company) =>
                        company.id === currentCompanyId ? { id: currentCompanyId, ...companyDetails } : company
                    )
                );
            } else {
                const docRef = await addDoc(collection(db, "companies"), companyDetails);
                setCompanyList([...companyList, { id: docRef.id, ...companyDetails }]);
            }

            setCompanyDetails({
                name: "",
                location: "",
                linkedInProfile: "",
                emails: "",
                phoneNumbers: "",
                comments: "",
                CommunicationPeriod: "",
            });
            setOpen(false);
            setEditMode(false);
            setCurrentCompanyId(null);
        } catch (e) {
            console.error("Error saving document: ", e);
        }
    };

    const handleDelete = async (id) => {
        try {
            const deletedCompany = companyList.find((company) => company.id === id);

            await deleteDoc(doc(db, "companies", id));
            setCompanyList(companyList.filter((company) => company.id !== id));

            // Delete related CalendarEvents
            const eventsQuery = query(
                collection(db, "calendarEvents"),
                where("companyName", "==", deletedCompany.name)
            );
            const eventsSnapshot = await getDocs(eventsQuery);

            const deletePromises = eventsSnapshot.docs.map((eventDoc) =>
                deleteDoc(doc(db, "calendarEvents", eventDoc.id))
            );

            await Promise.all(deletePromises);
        } catch (e) {
            console.error("Error deleting document: ", e);
        }
    };

    const handleEdit = (company) => {
        setCompanyDetails({
            name: company.name,
            location: company.location,
            linkedInProfile: company.linkedInProfile,
            emails: company.emails,
            phoneNumbers: company.phoneNumbers,
            comments: company.comments,
            CommunicationPeriod: company.CommunicationPeriod,
        });
        setCurrentCompanyId(company.id);
        setEditMode(true);
        setOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setCurrentCompanyId(null);
        setCompanyDetails({
            name: "",
            location: "",
            linkedInProfile: "",
            emails: "",
            phoneNumbers: "",
            comments: "",
            CommunicationPeriod: "",
        });
    };

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Company Management
            </Typography>

            <Box display="flex" justifyContent="flex-initial" mb={2}>
                <Button variant="contained" color="primary" onClick={handleClickOpen}>
                    Add Company
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editMode ? "Edit Company" : "Add Company"}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={companyDetails.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        name="location"
                        value={companyDetails.location}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="LinkedIn Profile"
                        name="linkedInProfile"
                        value={companyDetails.linkedInProfile}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Emails"
                        name="emails"
                        value={companyDetails.emails}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Phone Numbers"
                        name="phoneNumbers"
                        value={companyDetails.phoneNumbers}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Comments"
                        name="comments"
                        value={companyDetails.comments}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Communication Period"
                        name="CommunicationPeriod"
                        value={companyDetails.CommunicationPeriod}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {editMode ? "Update Company" : "Add Company"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Typography variant="h6" mt={4} mb={2}>
                Company List
            </Typography>

            {companyList.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Location</strong></TableCell>
                                <TableCell><strong>LinkedIn</strong></TableCell>
                                <TableCell><strong>Emails</strong></TableCell>
                                <TableCell><strong>Phone Numbers</strong></TableCell>
                                <TableCell><strong>Comments</strong></TableCell>
                                <TableCell><strong>Communication Period</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companyList.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell>{company.name}</TableCell>
                                    <TableCell>{company.location}</TableCell>
                                    <TableCell>{company.linkedInProfile}</TableCell>
                                    <TableCell>{company.emails}</TableCell>
                                    <TableCell>{company.phoneNumbers}</TableCell>
                                    <TableCell>{company.comments}</TableCell>
                                    <TableCell>{company.CommunicationPeriod}</TableCell>
                                    <TableCell>
                                        <Box display="flex" justifyContent="space-between" gap="10px">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleEdit(company)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleDelete(company.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No companies added yet.</Typography>
            )}
        </Box>
    );
};

export default CompanyForm;
