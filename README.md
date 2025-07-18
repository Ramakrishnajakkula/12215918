# URL Shortener Microservice

A Node.js microservice for creating short URLs with analytics tracking and custom shortcode support.

## Features

- **URL Shortening**: Convert long URLs into short, manageable links
- **Custom Shortcodes**: Support for user-defined shortcodes
- **Analytics Tracking**: Detailed click analytics with timestamp, IP, user agent, and referrer
- **Expiry Management**: Configurable URL expiration times
- **Comprehensive Logging**: Extensive logging integration with external API calls
- **MongoDB Integration**: Persistent storage with MongoDB Atlas
- **RESTful API**: Clean REST endpoints for all operations

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB Atlas Account** (connection string already configured)
- **Internet Connection** (for logging API calls and MongoDB Atlas)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   ```bash
   # Create .env file if you want to customize settings
   echo "PORT=3000" > .env
   echo "BASE_URL=http://localhost:3000" >> .env
   ```

## How to Run

### Development Mode

```bash
# Start the server
npm start
```

### Alternative Running Methods

```bash
# Using Node directly
node server.js

# Using nodemon for development (if installed globally)
nodemon server.js
```

### Expected Output

When the server starts successfully, you should see:

```
Server running on port 3000
MongoDB connected successfully
Health check endpoint available at: http://localhost:3000/health
```

## API Endpoints

### 1. Create Short URL

```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://example.com/very/long/url",
  "validity": 30,
  "shortcode": "custom123"
}
```

### 2. Redirect to Original URL

```http
GET /:shortcode
```

### 3. Get URL Statistics

```http
GET /shorturls/:shortcode
```

## Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### Create Short URL

```bash
curl -X POST http://localhost:3000/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.google.com",
    "validity": 60
  }'
```

### Access Short URL

```bash
curl -L http://localhost:3000/{shortcode}
```

### Get Statistics

```bash
curl http://localhost:3000/shorturls/{shortcode}
```

## Project Structure

```
frontend/
├── src/
│   ├── app.js                 # Main application entry point
│   ├── middleware/
│   │   └── logger.js          # Logging middleware
│   ├── models/
│   │   ├── url.model.js       # URL schema
│   │   └── analytics.model.js # Analytics schema
│   ├── controllers/
│   │   └── url.controller.js  # Request handlers
│   ├── services/
│   │   ├── url.service.js     # URL business logic
│   │   └── analytics.service.js # Analytics logic
│   ├── routes/
│   │   └── url.routes.js      # Route definitions
│   ├── utils/
│   │   ├── validation.js      # Input validation
│   │   └── shortcode.js       # Shortcode generation
│   └── config/
│       └── database.js        # MongoDB configuration
├── server.js                  # Server startup file
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **axios**: HTTP client for logging
- **nanoid**: Unique ID generation
- **validator**: Input validation
- **moment**: Date manipulation

## Environment Variables

| Variable      | Default               | Description               |
| ------------- | --------------------- | ------------------------- |
| `PORT`        | 3000                  | Server port               |
| `BASE_URL`    | http://localhost:3000 | Base URL for short links  |
| `MONGODB_URI` | (configured)          | MongoDB connection string |

## Logging

This application implements comprehensive logging with:

- **60+ log points** throughout the application
- **External API integration** for log delivery
- **Multiple log levels**: debug, info, warn, error
- **Structured logging** with context and metadata

## Error Handling

The API returns structured error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "timestamp": "2025-07-14T10:30:00.000Z"
  }
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**

   ```bash
   # Kill process on port 3000
   npx kill-port 3000
   ```

2. **MongoDB connection failed**

   - Check internet connection
   - Verify MongoDB Atlas cluster is running

3. **Dependencies not installed**
   ```bash
   # Clear cache and reinstall
   npm cache clean --force
   npm install
   ```

## Development

### Adding New Features

1. Create feature branch
2. Implement changes following existing patterns
3. Ensure logging integration
4. Test thoroughly
5. Submit pull request

### Code Style

- No comments in source code (as per requirements)
- Consistent error handling
- Comprehensive logging
- Clean, readable code structure

## License

This project is part of an assignment for URL shortening microservice implementation.
