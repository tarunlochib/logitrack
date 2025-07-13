# Multi-Tenant Logistics SaaS App

A comprehensive logistics management system built with React, Node.js, Prisma, and PostgreSQL with multi-tenant architecture and superadmin functionality.

## Features

### 🧑‍💼 Superadmin Role
- **App Owner**: Superadmin users have complete control over the entire system
- **Transporter Management**: Create and manage multiple transporters (tenants)
- **System Overview**: View statistics across all transporters
- **User Management**: Monitor all users across the platform

### 🏢 Transporter (Tenant) Features
- **Multi-tenant Architecture**: Each transporter has isolated data
- **Admin Users**: Each transporter gets an admin user upon creation
- **Role-based Access**: ADMIN, DISPATCHER, DRIVER roles
- **Complete Logistics Management**: Vehicles, Drivers, Shipments

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### 1. Database Setup

First, set up your PostgreSQL database and update the connection string in `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/logistics_app"
JWT_SECRET="your-secret-key-here"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Set up initial data (creates default tenant and superadmin)
npm run setup

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend/react

# Install dependencies
npm install

# Create .env file
cp env.example .env

# Update the API URL in .env
VITE_API_URL=http://localhost:5000

# Start the development server
npm run dev
```

## Superadmin Access

After running the setup script, you can access the superadmin dashboard with:

- **Email**: `superadmin@logistics.com`
- **Password**: `superadmin123`

**Important**: Change the default password after first login!

## API Endpoints

### Superadmin Routes (Protected)
- `POST /api/superadmin/create-transporter` - Create new transporter
- `GET /api/superadmin/transporters` - List all transporters
- `GET /api/superadmin/transporters/:id` - Get transporter details
- `PATCH /api/superadmin/transporters/:id/status` - Update transporter status
- `GET /api/superadmin/dashboard-stats` - Get system statistics

### Authentication Routes
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Create user (SUPERADMIN only)

## User Roles

### SUPERADMIN
- Complete system access
- Can create transporters
- Can view all data across tenants
- No tenant association

### ADMIN
- Full access within their transporter
- Can manage users, vehicles, drivers, shipments
- Associated with a specific transporter

### DISPATCHER
- Can manage shipments
- Limited access to other features
- Associated with a specific transporter

### DRIVER
- View assigned shipments
- Update shipment status
- Associated with a specific transporter

## Database Schema

The application uses a multi-tenant architecture with the following key models:

- **Tenant**: Represents a transporter company
- **User**: Users with role-based access
- **Vehicle**: Transport vehicles
- **Driver**: Vehicle drivers
- **Shipment**: Logistics shipments

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend/react
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev    # Create new migration
npx prisma migrate reset  # Reset database
npx prisma studio        # Open Prisma Studio
```

### Creating Superadmin
If you need to create a superadmin user manually:

```bash
cd backend
npm run create-superadmin
```

## Deployment

### Backend Deployment
1. Set up environment variables
2. Run database migrations
3. Start the server: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Multi-tenant data isolation
- Protected API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 