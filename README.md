# React-Based Calendar Application
A feature-rich calendar application built with React, Vite, and Material-UI, designed to track events, schedules, and communication activities.
## Features
- **Admin Dashboard**: Configure company information and communication methods.
- **User Dashboard**: Manage personal schedules, notifications, and calendar views.
- **Reporting Dashboard**: Analyze communication trends, overdue tasks, and engagement effectiveness.
- **Real-Time Updates**: Logs and tracks real-time activities.
- **Responsive Design**: Fully responsive for desktop and mobile users.
## Tech Stack
- **Frontend**: React, Material-UI
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Database**: Google Firebase Firestore Data base
- **Backend**:Node.js

  ## Folder structure
  ![image](https://github.com/user-attachments/assets/1623414e-9f5e-492f-98a7-4d2cac414830)

  ## Application Home page.
  ![image](https://github.com/user-attachments/assets/8efa2cc4-6484-4191-acaf-2d20483894a3)
  ## Admin Dashboard.
  - **Company Management**
  ![image](https://github.com/user-attachments/assets/94226eeb-9293-425a-8bf7-008bf3f48573)
  - **Communication Methods**
  ![image](https://github.com/user-attachments/assets/8df8db85-374f-46a0-87b2-81b9c3068996)
  ## User Dashboard.
  - **Dashboard**
  ![image](https://github.com/user-attachments/assets/7c60e211-1a65-48cb-923c-222de7419cc3)
   - **Dashboard Actions and features**
    1. Displays the last five communications and next scheduled communications for each company.
    2. We have a hover feature to display notes for each communication and Button to Disable or enable color coding higlights.
    3. This Dashboard is interlinked with Calendar view for single point of truth. Clicking on "Communcation performed" button navigates to calendar view for communication action.
   - **Calendar view**
   ![image](https://github.com/user-attachments/assets/607a2816-0b58-4778-a986-13ed126e874d)
    1. Calendar view consists of Month view, Week view and day view.
    2. Calendar view is used to view and manage past, current and future communications.
    3. To create a "new communication", **click on the required date and a pop up will appear to create a new communication.**
    4. To modify or delete the existing communication, **click on the existing communication, A popup will appear to edit existing communication.**
    5. Notes will appear when we hover on the existing communications in the calendar view.
   - **Notifications**
  ![image](https://github.com/user-attachments/assets/6f87d55d-5743-4bb2-b133-214aec6cf1da)
    A dedicated section displays overdue and due communications with count of Total Notifications as well as individual Notification counts.
  ## Reporting Dashboard
  This module provides actionable insights and performance metrics related to company communications.
  - **Communication Frequency**
  ![image](https://github.com/user-attachments/assets/7485eee0-ea1f-4263-a03c-2bb0b811d931)
  1. A visual representation bar chart showing the frequency of each communication method (e.g., LinkedIn Post, Email) used over a selected time frame.
  2. Users can filter by company, date range and communication method. Filtered data can be exported to Pdf.
  - **Engagement Effectiveness**
  ![image](https://github.com/user-attachments/assets/5dd2411a-664a-4f97-9e0a-c418b6dc4fad)
  1. Track and display which communication methods are most effective in terms of response or follow-up actions.
  2. Include metrics like the percentage of successful responses to emails, phone calls, or LinkedIn messages.
  3. Users can filter by company. Data can be exported to pdf.
  - **Overdue Communication Trends**
  ![image](https://github.com/user-attachments/assets/9a28deb1-5e4f-48bc-937b-4db1738673c5)
  1. A trendline showing the number of overdue communications over time, categorized by company.
  2. Users can filter by company, date range. Filtered data can be exported to Pdf.
  - **Real-Time Activity Log**
  ![image](https://github.com/user-attachments/assets/92825dad-3cb1-46ee-9b79-709629e42d9b)
  1. A live feed displaying all communication activities performed, sortable by date, user, or company.
  2. Users can filter by company, date range. Filtered data can be exported to Pdf.
  

  

  
  

    
    
 






