# Volleyball Scoreboard Application

## Overview

This is a full-stack volleyball scoreboard application built with React, Express, and TypeScript. The application provides a real-time scoreboard interface for volleyball matches with administrative controls and overlay capabilities for broadcast scenarios.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Development**: TSX for TypeScript execution in development

### Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **ORM**: Drizzle ORM with Zod schema validation
- **Connection**: Neon Database serverless connection
- **Migrations**: Drizzle Kit for database migrations
- **Storage Interface**: Abstracted storage layer with in-memory implementation for development

## Key Components

### Database Schema
- **Teams**: Store team information (name, location, logo)
- **Matches**: Track match state (teams, format, sets, completion status)
- **Game State**: Real-time score tracking and display options
- **Settings**: Application configuration (colors, themes, sponsor logos)

### Frontend Components
- **Scoreboard Display**: Main scoreboard view with overlay support
- **Control Panel**: Administrative interface for score management
- **Logo Upload**: Team logo management with file upload
- **Settings Modal**: Application configuration interface

### Backend Services
- **Storage Layer**: Abstracted data access with memory-based implementation
- **File Upload**: Multer-based image upload with validation
- **API Routes**: RESTful endpoints for scoreboard operations

## Data Flow

1. **Real-time Updates**: Frontend polls current match data every second using React Query
2. **Score Management**: Control panel updates scores via PATCH requests to game state endpoints
3. **Match State**: Centralized match state includes teams, current scores, set history, and display options
4. **File Handling**: Logo uploads processed through Express middleware with size and type validation

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library
- **Icons**: Lucide React icon library
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Date Utilities**: date-fns for date manipulation
- **Utilities**: clsx and tailwind-merge for conditional styling

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **File Upload**: Multer for handling multipart form data
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Validation**: Drizzle-zod for schema validation

### Development Tools
- **Build**: ESBuild for server bundling
- **Development**: TSX for TypeScript execution
- **Database**: Drizzle Kit for migrations and schema management
- **Replit Integration**: Custom Vite plugins for Replit environment

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds client application to `dist/public`
2. **Backend**: ESBuild bundles server code to `dist/index.js`
3. **Assets**: Static file serving for uploaded logos and build artifacts

### Environment Configuration
- **Development**: Uses TSX for hot reloading and Vite dev server
- **Production**: Serves pre-built static files and bundled server
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### File Structure
- **Client**: React application in `client/` directory
- **Server**: Express application in `server/` directory
- **Shared**: Common TypeScript definitions and schema in `shared/`
- **Uploads**: File upload destination for team logos

### Special Features
- **Overlay Mode**: Scoreboard can open in transparent overlay window for broadcast integration
- **Real-time Polling**: Automatic updates every second for live scoreboard display
- **Responsive Design**: Mobile-friendly interface with Tailwind responsive utilities
- **Theme Support**: CSS variable-based theming system for customization