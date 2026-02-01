## Packages
recharts | For analytics charts (pie, bar, line)
date-fns | For date manipulation and formatting
react-day-picker | For the calendar component (dependency of shadcn calendar)
framer-motion | For smooth animations and transitions

## Notes
The application uses session-based authentication via /api/auth endpoints.
Protected routes require the user to be logged in.
Indian holidays are not hardcoded in the backend but should be visually indicated or handled if possible (frontend-only logic for now).
Attendance marking is batch-based per day.
