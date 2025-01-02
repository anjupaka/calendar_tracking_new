import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./CommunicationMethods.css";
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
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";

const CommunicationMethods = () => {
    const [methods, setMethods] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        mandatory: false,
        sequence: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [currentMethodId, setCurrentMethodId] = useState(null);
    const [open, setOpen] = useState(false);

    const fetchMethods = async () => {
        const querySnapshot = await getDocs(collection(db, "communicationMethods"));
        const fetchedMethods = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        fetchedMethods.sort((a, b) => a.sequence - b.sequence);
        setMethods(fetchedMethods);

        // Fetch CalendarEvents and delete orphaned records
        const eventsSnapshot = await getDocs(collection(db, "calendarEvents"));
        const events = eventsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const methodNames = fetchedMethods.map((method) => method.name);

        const deletePromises = events
            .filter((event) => !methodNames.includes(event.type))
            .map((event) => deleteDoc(doc(db, "calendarEvents", event.id)));

        await Promise.all(deletePromises);
    };

    const saveMethod = async () => {
        if (formData.name.trim() === "" || formData.description.trim() === "" || formData.sequence === "") {
            alert("Name, Description, and Sequence are required!");
            return;
        }

        try {
            if (editMode) {
                const previousMethod = methods.find((method) => method.id === currentMethodId);

                await updateDoc(doc(db, "communicationMethods", currentMethodId), formData);

                if (previousMethod.name !== formData.name) {
                    const eventsQuery = query(
                        collection(db, "calendarEvents"),
                        where("type", "==", previousMethod.name)
                    );
                    const eventsSnapshot = await getDocs(eventsQuery);

                    const updatePromises = eventsSnapshot.docs.map((eventDoc) =>
                        updateDoc(doc(db, "calendarEvents", eventDoc.id), {
                            type: formData.name,
                        })
                    );

                    await Promise.all(updatePromises);
                }

                setMethods(
                    methods.map((method) =>
                        method.id === currentMethodId ? { id: currentMethodId, ...formData } : method
                    )
                );
            } else {
                const docRef = await addDoc(collection(db, "communicationMethods"), formData);
                setMethods([...methods, { id: docRef.id, ...formData }]);
            }

            setFormData({
                name: "",
                description: "",
                mandatory: false,
                sequence: "",
            });
            setEditMode(false);
            setCurrentMethodId(null);
            setOpen(false);
        } catch (error) {
            console.error("Error saving method: ", error);
        }
    };

    const deleteMethod = async (id) => {
        try {
            const deletedMethod = methods.find((method) => method.id === id);

            await deleteDoc(doc(db, "communicationMethods", id));
            setMethods(methods.filter((method) => method.id !== id));

            const eventsQuery = query(
                collection(db, "calendarEvents"),
                where("type", "==", deletedMethod.name)
            );
            const eventsSnapshot = await getDocs(eventsQuery);

            const deletePromises = eventsSnapshot.docs.map((eventDoc) =>
                deleteDoc(doc(db, "calendarEvents", eventDoc.id))
            );

            await Promise.all(deletePromises);
        } catch (error) {
            console.error("Error deleting method: ", error);
        }
    };

    const editMethod = (method) => {
        setFormData({
            name: method.name,
            description: method.description,
            mandatory: method.mandatory,
            sequence: method.sequence,
        });
        setCurrentMethodId(method.id);
        setEditMode(true);
        setOpen(true);
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setCurrentMethodId(null);
        setFormData({
            name: "",
            description: "",
            mandatory: false,
            sequence: "",
        });
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3} textAlign="center">
                Communication Methods
            </Typography>

            <Button variant="contained" color="primary" onClick={handleClickOpen}>
                Add Method
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>{editMode ? "Edit Method" : "Add Method"}</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        fullWidth
                        required
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        label="Sequence"
                        name="sequence"
                        type="number"
                        value={formData.sequence}
                        onChange={(e) => setFormData({ ...formData, sequence: e.target.value })}
                        fullWidth
                        required
                    />
                    <label style={{ marginTop: "10px" }}>
                        <input
                            type="checkbox"
                            checked={formData.mandatory}
                            onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                        />
                        Mandatory
                    </label>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={saveMethod} color="primary">
                        {editMode ? "Update Method" : "Add Method"}
                    </Button>
                </DialogActions>
            </Dialog>

            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                <Table>
                    <TableHead style={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Mandatory</strong></TableCell>
                            <TableCell><strong>Sequence</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {methods.map((method) => (
                            <TableRow key={method.id}>
                                <TableCell>{method.name}</TableCell>
                                <TableCell>{method.description}</TableCell>
                                <TableCell>{method.mandatory ? "Yes" : "No"}</TableCell>
                                <TableCell>{method.sequence}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        style={{ marginRight: "10px" }}
                                        onClick={() => editMethod(method)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => deleteMethod(method.id)}
                                    >
                                        Delete
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

export default CommunicationMethods;
