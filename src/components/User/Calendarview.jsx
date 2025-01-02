import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendarview.css';
import { isBefore, isToday } from 'date-fns';

const CalendarInterface = () => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [newEvent, setNewEvent] = useState({ title: '', companyName: '', communicationMethod: '', date: '', time: '', note: '' });
    const [hoveredEvent, setHoveredEvent] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
    const [companies, setCompanies] = useState([]);
    const [communicationMethods, setCommunicationMethods] = useState([]);
    const db = getFirestore();

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsCollection = collection(db, 'calendarEvents');
            const snapshot = await getDocs(eventsCollection);

            const now = new Date();
            const eventsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const eventDate = new Date(`${data.date}T${data.time}`);

                let className = 'future';
                if (isBefore(eventDate, now)) {
                    className = 'overdue';
                } else if (isToday(eventDate)) {
                    className = 'due-today';
                }

                return {
                    id: doc.id,
                    title: `${data.title} - ${data.type} with ${data.companyName}`,
                    start: `${data.date}T${data.time}`,
                    className,
                    extendedProps: {
                        companyName: data.companyName,
                        type: data.type,
                        date: data.date,
                        note: data.note || '',
                    },
                };
            });

            setEvents(eventsData);
        };

        const fetchCompanies = async () => {
            const companiesCollection = collection(db, 'companies');
            const snapshot = await getDocs(companiesCollection);
            const companiesData = snapshot.docs.map(doc => doc.data().name);
            setCompanies(companiesData);
        };

        const fetchCommunicationMethods = async () => {
            const methodsCollection = collection(db, 'communicationMethods');
            const snapshot = await getDocs(methodsCollection);
            const methodsData = snapshot.docs.map(doc => doc.data().name);
            setCommunicationMethods(methodsData);
        };

        fetchEvents();
        fetchCompanies();
        fetchCommunicationMethods();
    }, [db]);

    const handleEventClick = (clickInfo) => {
        const { id } = clickInfo.event;
        if (!id) {
            alert("Event ID not found");
            return;
        }

        const clickedEvent = events.find(event => event.id === id);

        if (clickedEvent) {
            setCurrentEventId(id);
            const [date, time] = clickedEvent.start.split('T');
            setNewEvent({
                title: clickedEvent.title.split(' - ')[0],
                companyName: clickedEvent.extendedProps.companyName,
                communicationMethod: clickedEvent.extendedProps.type,
                date,
                time: time || '',
                note: clickedEvent.extendedProps.note,
            });
            setIsEdit(true);
            setIsModalOpen(true);
        } else {
            alert("Event not found in local state.");
        }
    };

    const handleDateClick = (info) => {
        setNewEvent({ title: '', companyName: '', communicationMethod: '', date: info.dateStr, time: '', note: '' });
        setIsModalOpen(true);
        setIsEdit(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setNewEvent({ ...newEvent, [name]: value });
    };

    const handleAddEvent = async () => {
        const { title, companyName, communicationMethod, date, time, note } = newEvent;
        if (title && companyName && communicationMethod && date && time) {
            const newEventData = {
                title,
                companyName,
                type: communicationMethod,
                date,
                time,
                note,
            };
            const addedDoc = await addDoc(collection(db, 'calendarEvents'), newEventData);

            setEvents([...events, {
                id: addedDoc.id,
                title: `${title} - ${communicationMethod} with ${companyName}`,
                start: `${date}T${time}`,
                className: 'future',
                extendedProps: {
                    companyName,
                    type: communicationMethod,
                    date,
                    note,
                },
            }]);

            setIsModalOpen(false);
            setNewEvent({ title: '', companyName: '', communicationMethod: '', date: '', time: '', note: '' });
        } else {
            alert('Please fill out all fields.');
        }
    };

    const handleUpdateEvent = async () => {
        const { title, companyName, communicationMethod, date, time, note } = newEvent;
        if (currentEventId && title && companyName && communicationMethod && date && time) {
            const eventDoc = doc(db, 'calendarEvents', currentEventId);
            await updateDoc(eventDoc, {
                title,
                companyName,
                type: communicationMethod,
                date,
                time,
                note,
            });

            setEvents(events.map(event =>
                event.id === currentEventId
                    ? {
                        ...event,
                        title: `${title} - ${communicationMethod} with ${companyName}`,
                        start: `${date}T${time}`,
                    }
                    : event
            ));

            setIsModalOpen(false);
            setNewEvent({ title: '', companyName: '', communicationMethod: '', date: '', time: '', note: '' });
            setIsEdit(false);
        } else {
            alert('Please fill out all fields.');
        }
    };

    const handleDeleteEvent = async () => {
        if (currentEventId) {
            await deleteDoc(doc(db, 'calendarEvents', currentEventId));

            setEvents(events.filter(event => event.id !== currentEventId));
            setIsModalOpen(false);
            setNewEvent({ title: '', companyName: '', communicationMethod: '', date: '', time: '', note: '' });
            setIsEdit(false);
        } else {
            alert("Event ID not found.");
        }
    };

    const handleEventMouseEnter = (info) => {
        const boundingRect = info.el.getBoundingClientRect();
        setHoveredEvent(info.event);
        setPopupPosition({
            x: boundingRect.left + window.scrollX + boundingRect.width / 2,
            y: boundingRect.top + window.scrollY - 10,
        });
    };

    const handleEventMouseLeave = () => {
        setHoveredEvent(null);
    };

    return (
        <div className="calendar-interface">
            <h2>Calendar Interface</h2>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                eventClick={handleEventClick}
                eventMouseEnter={handleEventMouseEnter}
                eventMouseLeave={handleEventMouseLeave}
                dateClick={handleDateClick}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
            />

            {hoveredEvent && (
                <div
                    className="popup-event-details"
                    style={{
                        position: 'absolute',
                        top: `${popupPosition.y}px`,
                        left: `${popupPosition.x}px`,
                        transform: 'translate(-50%, -100%)',
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        zIndex: 1000,
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <p><strong>Title:</strong> {hoveredEvent.title}</p>
                    <p><strong>Note:</strong> {hoveredEvent.extendedProps.note}</p>
                    <p><strong>Company:</strong> {hoveredEvent.extendedProps.companyName}</p>
                    <p><strong>Date:</strong> {hoveredEvent.extendedProps.date}</p>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEdit ? 'Edit Communication' : 'Add New Communication'}</h3>
                        <form>
                            <label>
                                Event Title:
                                <input
                                    type="text"
                                    name="title"
                                    value={newEvent.title}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <label>
                                Company Name:
                                <select
                                    name="companyName"
                                    value={newEvent.companyName}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company, idx) => (
                                        <option key={idx} value={company}>{company}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Communication Method:
                                <select
                                    name="communicationMethod"
                                    value={newEvent.communicationMethod}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Select Method</option>
                                    {communicationMethods.map((method, idx) => (
                                        <option key={idx} value={method}>{method}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Time Slot:
                                <input
                                    type="time"
                                    name="time"
                                    value={newEvent.time}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <label>
                                Note:
                                <textarea
                                    name="note"
                                    value={newEvent.note}
                                    onChange={handleFormChange}
                                ></textarea>
                            </label>
                            {isEdit ? (
                                <>
                                    <button type="button" onClick={handleUpdateEvent}>Update</button>
                                    <button type="button" onClick={handleDeleteEvent}>Delete</button>
                                </>
                            ) : (
                                <button type="button" onClick={handleAddEvent}>Save</button>
                            )}
                            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarInterface;
