import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
  Box,
  Typography,
  Badge,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';

const Notifications = () => {
  const [overdue, setOverdue] = useState([]);
  const [dueToday, setDueToday] = useState([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const db = getFirestore();

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'calendarEvents');
      const snapshot = await getDocs(eventsCollection);

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const eventDateTime = new Date(`${data.date}T${data.time}`);
        return {
          id: doc.id,
          title: data.title,
          type: data.type,
          date: data.date,
          time: data.time,
          companyName: data.companyName,
          note: data.note || '',
          eventDateTime,
        };
      });

      const overdueEvents = eventsData.filter(event => event.eventDateTime < now);
      const todayFutureEvents = eventsData.filter(
        event => event.date === today && event.eventDateTime >= now
      );

      setOverdue(overdueEvents);
      setDueToday(todayFutureEvents);
      setOverdueCount(overdueEvents.length);
      setDueTodayCount(todayFutureEvents.length);
    };

    fetchEvents();
  }, [db]);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
          {/* Notifications Icon */}
          <Box
              display="flex"
              justifyContent="center"
              mb={3}
              sx={{
                  backgroundColor: '#007BFF',
                  color: '#fff',
                  borderRadius: '50px',
                  padding: '10px 20px',
                  display: 'Inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '16px',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                  cursor: 'default', // Prevent pointer click effect
              }}
          >
              <NotificationsIcon />
              Notifications
              <Badge
                  badgeContent={overdueCount + dueTodayCount}
                  color="error"
                  sx={{
                      '& .MuiBadge-badge': {
                          right: -10,
                          top: -15,
                          fontSize: '20px',
                          minWidth: '20px',
                          height: '30px',
                          borderRadius: '80%',
                      },
                  }}
              />
          </Box>


      {/* Badges for Overdue and Due Today Counts */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box
          sx={{
            backgroundColor: '#ffe6e6',
            borderRadius: '8px',
            padding: '15px 20px',
            display: 'initial',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '40%',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" color="#d32f2f">
            Overdue Communications
          </Typography>
          <Badge
            badgeContent={overdueCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '18px',
                minWidth: '30px',
                height: '30px',
                borderRadius: '50%',
              },
            }}
          />
        </Box>
        <Box
          sx={{
            backgroundColor: '#fff9c4',
            borderRadius: '8px',
            padding: '15px 20px',
            display: 'intial',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '40%',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h6" color="#bb8d4e">
            Due Today
          </Typography>
          <Badge
            badgeContent={dueTodayCount}
            color="warning"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '18px',
                minWidth: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#fbc02d',
                color: '#000',
              },
            }}
          />
        </Box>
      </Box>

      {/* Overdue Communications */}
      <Box mb={3}>
        <Typography variant="h5" color="#d32f2f" gutterBottom>
          Overdue Communications
        </Typography>
        {overdue.length > 0 ? (
          overdue.map(event => (
            <Card key={event.id} sx={{ backgroundColor: '#ffe6e6', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" color="#1976d2">
                  {event.companyName}
                </Typography>
                <Typography variant="body2" color="#1976d2">
                  Last communication: {event.date} at {event.time}
                </Typography>
                <Typography variant="body2" color="#d32f2f">
                  {Math.ceil((new Date() - event.eventDateTime) / (1000 * 60 * 60 * 24))} days overdue
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No overdue communications.
          </Typography>
        )}
      </Box>

      {/* Due Today Communications */}
      <Box>
        <Typography variant="h5" color="#bb8d4e" gutterBottom>
          Due Today
        </Typography>
        {dueToday.length > 0 ? (
          dueToday.map(event => (
            <Card key={event.id} sx={{ backgroundColor: '#fff9c4', mb: 2 }}>
              <CardContent>
                <Typography variant="h6" color="#1976d2">
                  {event.companyName}
                </Typography>
                <Typography variant="body2" color="#bb8d4e">
                  Scheduled communication: {event.date} at {event.time}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No communications scheduled for today.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Notifications;
