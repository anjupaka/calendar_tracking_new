import React, { useState, useEffect } from 'react';
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const CommunicationLogger = () => {
    const [companies, setCompanies] = useState([]);
    const [communicationMethods, setCommunicationMethods] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [communicationType, setCommunicationType] = useState('');
    const [communicationDate, setCommunicationDate] = useState('');
    const [notes, setNotes] = useState('');
    const [highlightReset, setHighlightReset] = useState(false);

    // Fetch company list from Firebase
    useEffect(() => {
        const fetchCompanies = async () => {
            const querySnapshot = await getDocs(collection(db, 'companies'));
            const companyData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
            }));
            setCompanies(companyData);
        };

        fetchCompanies();
    }, []);

    // Fetch communication types from Firebase
    useEffect(() => {
        const fetchCommunicationMethods = async () => {
            const querySnapshot = await getDocs(collection(db, 'CommunicationMethods'));
            const methodsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
            }));
            setCommunicationMethods(methodsData);
        };

        fetchCommunicationMethods();
    }, []);

    // Handle company selection changes
    const handleSelectCompanies = (companyName, isSelected) => {
        if (isSelected) {
            setSelectedCompanies((prevState) => [...prevState, companyName]);
        } else {
            setSelectedCompanies((prevState) =>
                prevState.filter((company) => company !== companyName)
            );
        }
    };

    // Handle communication type selection
    const handleSelectCommunicationType = (type) => {
        setCommunicationType(type);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!communicationType || !selectedCompanies.length || !communicationDate) {
            alert('Please fill out all required fields.');
            return;
        }

        setHighlightReset(true);

        const newCommunication = {
            selectedCompanies,
            communicationType,
            communicationDate,
            notes,
        };

        await addDoc(collection(db, 'CommunicationAction'), newCommunication);

        setCommunicationType('');
        setCommunicationDate('');
        setNotes('');
        setSelectedCompanies([]);
        setHighlightReset(false);
    };

    return (
        <div>
            <h2>Log Communication Performed</h2>

            {/* Company List (Checkboxes) */}
            <div>
                <h3>Select Companies:</h3>
                {companies.length > 0 ? (
                    companies.map((company) => (
                        <div key={company.id}>
                            <input
                                type="checkbox"
                                id={company.id}
                                value={company.name}
                                onChange={(e) =>
                                    handleSelectCompanies(company.name, e.target.checked)
                                }
                            />
                            <label htmlFor={company.id}>{company.name}</label>
                        </div>
                    ))
                ) : (
                    <p>Loading companies...</p>
                )}
            </div>

            {/* Communication Type (Dropdown) */}
            <div>
                <label htmlFor="communicationMethods">Type of Communication:</label>
                <select
                    id={communicationMethods.id}
                    value={communicationMethods.name}
                    onChange={(e) => handleSelectCommunicationType(e.target.value)}
                >
                    <option value="">Select Type</option>
                    {communicationMethods.length > 0 ? (
                        communicationMethods.map((method) => (
                            <option key={method.id} value={method.name}>
                                {method.name}
                            </option>
                        ))
                    ) : (
                        <option>Loading communication types...</option>
                    )}
                </select>
            </div>

            {/* Communication Date */}
            <div>
                <label htmlFor="communicationDate">Date of Communication:</label>
                <input
                    type="date"
                    id="communicationDate"
                    value={communicationDate}
                    onChange={(e) => setCommunicationDate(e.target.value)}
                />
            </div>

            {/* Notes */}
            <div>
                <label htmlFor="notes">Add Notes:</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>

            {/* Submit Button */}
            <div>
                <button onClick={handleSubmit}>Log Communication</button>
            </div>

            {/* Confirmation message for reset action */}
            {highlightReset && <p>Highlights have been reset for the selected companies.</p>}
        </div>
    );
};

export default CommunicationLogger;
