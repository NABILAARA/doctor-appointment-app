# Work Breakdown Structure

## Milestones

### Milestone 1: Project Setup and Configuration
- **Status:** done
- **Priority:** medium
- **Due:** 2026-06-08

1. Install required tools and software: 
Node.js. 
MongoDB. 
Vite or Create React App

2. Create project folders and files: 
Client folders. 
Server folders. 

3. Install Packages: 
 Frontend npm Packages
Axios.
React-Router –dom.
Bootstrap.
React-Bootstrap.
React-icons.
 Backend npm Packages
Express.
Mongoose.
Cors.
.env.
bcrypt.
jsonwebtoken.
multer.
nodemon.


### Milestone 2: Backend Development
- **Status:** done
- **Priority:** medium
- **Due:** 2026-06-08

Setup Express Server
Create express server for handling API requests.
Create index.js file in the server (backend folder).
Create a .env file and define port number to access it globally.
Configure the server by adding cors and body-parser (express.json).

User Authentication:
Create routes and middleware for user registration, login, and logout.
Set up authentication middleware using JWT to protect routes that require user authentication.
Implement password hashing using bcrypt for secure login.

Define API Routes:
Create separate route files for different API functionalities such as users, doctors, appointments, and authentication.
Define the necessary routes for:
User registration and login
Listing approved doctors
Applying as a doctor
Booking appointments
Managing appointments (approve/reject)
Implement route handlers using Express.js to handle requests and interact with the database.

Implement Data Models:
Define Mongoose schemas for different data entities such as users, doctors, and appointments.
Create corresponding Mongoose models to interact with the MongoDB database.
Implement CRUD operations (Create, Read, Update, Delete) for each model to perform database operations.

User Authentication:
Create routes and middleware for user registration, login, and logout.
Set up authentication middleware to protect appointment booking, doctor dashboard, and admin routes.

Error Handling:
Implement error handling middleware to catch and handle any errors that occur during API requests.
Return appropriate error responses with relevant error messages and HTTP status codes.

### Milestone 3: Database Integration
- **Status:** done
- **Priority:** medium
- **Due:** 2026-06-09

1. Configure MongoDB:
Install Mongoose to interact with MongoDB database.
Create database connection using MongoDB URI in the .env file.
Create Schemas & Models for users, doctors, and appointments.

2. Connect Database to Backend:
Make sure the database is connected before performing any actions through the backend.
Import the database connection file inside index.js.
Call the connection function before starting the server.
Ensure the server runs only after successful database connection.

3. Configure Schema:
Configure the Schemas for MongoDB database to store data in a structured pattern.
Use the ER diagram to design relationships between collections.
The schemas for the application include:
User Schema – stores user details like name, email, password, phone, role, and notifications.
Doctor Schema – stores doctor profile details such as userId reference, specialization, experience, fees, timings, and status.
Appointment Schema – stores appointment details including user reference, doctor reference, date, document, and status.
These schemas establish relationships between users, doctors, and appointments for proper data management in the application.



### Milestone 4: Frontend Development
- **Status:** done
- **Priority:** medium
- **Due:** 2026-06-10

1. Setup React Application: 
• Create React application. 
• Configure Routing. 
• Install required libraries. 

2. Design UI components: 
• Create Components. 
• Implement layout and styling. 
• Add navigation. 

3. Implement frontend logic: 
• Integration with API endpoints. 
• Implement data binding. 
•Handle authentication



### Milestone 5: Project Implementation
- **Status:** done
- **Priority:** medium
- **Due:** 2026-06-10

Finally, after completing the backend and frontend development of the Doctor Booking Application, we run the entire project to test its working process and identify any bugs or errors.

