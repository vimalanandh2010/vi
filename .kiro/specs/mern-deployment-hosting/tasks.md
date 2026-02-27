# Implementation Plan: MERN Stack Deployment & Hosting

## Overview

This implementation plan covers the deployment of a MERN stack application to production using Vercel (frontend), Railway (backend), Supabase (database), Cloudinary (file storage), and Google OAuth (authentication). The tasks focus on preparing the application for deployment, creating configuration files, setting up deployment platforms, and verifying the deployment works end-to-end.

## Tasks

- [ ] 1. Prepare backend configuration files
  - [ ] 1.1 Create environment variable template file
    - Create `.env.example` file in backend root with all required variables
    - Document each variable with comments explaining its purpose
    - Include placeholder values showing expected format
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ] 1.2 Create health check endpoint
    - Implement `/health` endpoint that returns HTTP 200 with status information
    - Check database connectivity in health check
    - Return service version and timestamp
    - _Requirements: 2.2, 10.1, 10.2_
  
  - [ ] 1.3 Configure CORS middleware
    - Install and configure `cors` package
    - Set origin to `process.env.FRONTEND_URL`
    - Enable credentials support
    - Allow required HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 1.4 Configure Socket.IO with CORS
    - Update Socket.IO initialization to include CORS configuration
    - Set origin to `process.env.FRONTEND_URL`
    - Configure transports: ['websocket', 'polling']
    - Set pingTimeout to 60000ms and pingInterval to 25000ms
    - _Requirements: 6.1, 6.3, 6.4, 6.5_
  
  - [ ] 1.5 Create Railway configuration file
    - Create `railway.json` with start command and health check path
    - Configure restart policy for automatic recovery
    - Set health check timeout to 100 seconds
    - _Requirements: 2.1, 2.4_

- [ ] 2. Prepare frontend configuration files
  - [ ] 2.1 Create environment variable template file
    - Create `.env.example` file in frontend root with all VITE_ variables
    - Document each variable with comments
    - Include placeholder values for API URLs
    - _Requirements: 3.1_
  
  - [ ] 2.2 Create Vercel configuration file
    - Create `vercel.json` with build settings
    - Configure SPA routing rewrite rule (/* → /index.html)
    - Add security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
    - Set build command to `npm run build` and output directory to `dist`
    - _Requirements: 1.1, 1.4, 1.5, 13.1, 13.2, 13.3_
  
  - [ ] 2.3 Update API client to use environment variables
    - Replace hardcoded API URLs with `import.meta.env.VITE_API_URL`
    - Replace hardcoded Socket URL with `import.meta.env.VITE_SOCKET_URL`
    - Ensure all API calls use the configured base URL
    - _Requirements: 1.5, 3.1_

- [ ] 3. Implement environment variable validation
  - [ ] 3.1 Create validation utility for backend
    - Write function to validate all required backend environment variables are present
    - Check JWT_SECRET and SESSION_SECRET have minimum 32 characters
    - Validate all _URL variables start with "https://"
    - Validate PORT is between 1024 and 65535
    - Log validation errors with specific missing/invalid variables
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [ ]* 3.2 Write unit tests for validation utility
    - Test validation passes with all required variables
    - Test validation fails when variables are missing
    - Test validation fails when secrets are too short
    - Test validation fails when URLs don't use HTTPS
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [ ] 3.3 Call validation on server startup
    - Import and call validation function before starting server
    - Exit process with error code 1 if validation fails
    - Log success message when validation passes
    - _Requirements: 3.3_

- [ ] 4. Enhance security configurations
  - [ ] 4.1 Add security headers middleware
    - Install `helmet` package
    - Configure Strict-Transport-Security header with max-age 31536000
    - Configure Content-Security-Policy header
    - Set Referrer-Policy to "strict-origin-when-cross-origin"
    - _Requirements: 9.5, 13.4, 13.5_
  
  - [ ] 4.2 Add HTTPS redirect middleware
    - Create middleware to redirect HTTP to HTTPS in production
    - Check NODE_ENV and X-Forwarded-Proto header
    - Only apply redirect when NODE_ENV is 'production'
    - _Requirements: 9.4_
  
  - [ ] 4.3 Implement input validation middleware
    - Install validation library (e.g., `joi` or `express-validator`)
    - Create validation schemas for all API endpoints
    - Add validation middleware to routes
    - Return HTTP 400 with descriptive errors on validation failure
    - _Requirements: 14.1, 14.4_
  
  - [ ] 4.4 Implement HTML sanitization
    - Install `DOMPurify` or similar sanitization library
    - Create sanitization utility function
    - Apply sanitization to all user-generated HTML content
    - _Requirements: 14.2_

- [ ] 5. Configure database connection with pooling
  - [ ] 5.1 Update Supabase client configuration
    - Configure connection pooling with configurable pool size
    - Enable SSL for database connections
    - Set connection timeout to 2 seconds
    - Set idle timeout to 30 seconds
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 17.2, 17.3, 17.4_
  
  - [ ] 5.2 Implement database connection retry logic
    - Add exponential backoff retry for failed connections
    - Retry up to 3 times with increasing delays
    - Log connection failures with error details
    - _Requirements: 5.5, 16.4, 18.2_
  
  - [ ] 5.3 Add connection pool monitoring
    - Log warning when pool is exhausted for more than 10 seconds
    - Include pool metrics in health check endpoint
    - _Requirements: 17.5_

- [ ] 6. Implement JWT authentication enhancements
  - [ ] 6.1 Configure JWT token generation
    - Set access token expiration to 15 minutes
    - Set refresh token expiration to 7 days
    - Use JWT_SECRET from environment variables
    - Include user ID and email in token payload
    - _Requirements: 8.4, 8.5_
  
  - [ ] 6.2 Create JWT verification middleware
    - Extract token from Authorization header
    - Verify token signature and expiration
    - Reject requests with invalid or expired tokens
    - Attach user data to request object on success
    - _Requirements: 8.7_
  
  - [ ] 6.3 Implement refresh token endpoint
    - Create POST /auth/refresh endpoint
    - Verify refresh token validity
    - Generate new access token if refresh token is valid
    - Return new access token to client
    - _Requirements: 8.6_
  
  - [ ]* 6.4 Write unit tests for JWT utilities
    - Test token generation includes correct expiration
    - Test token verification rejects expired tokens
    - Test token verification rejects invalid signatures
    - Test refresh token flow
    - _Requirements: 8.4, 8.5, 8.7_

- [ ] 7. Enhance Google OAuth configuration
  - [ ] 7.1 Update OAuth redirect URI configuration
    - Set redirect URI to use BACKEND_URL environment variable
    - Validate redirect URI matches configured value
    - Return error if redirect URI mismatch occurs
    - _Requirements: 8.8_
  
  - [ ] 7.2 Implement OAuth error handling
    - Handle authorization code exchange failures
    - Handle user profile retrieval failures
    - Return descriptive error messages to client
    - Log OAuth errors with context
    - _Requirements: 16.3_

- [ ] 8. Configure file upload with Cloudinary
  - [ ] 8.1 Initialize Cloudinary client
    - Configure Cloudinary with environment variables
    - Set cloud name, API key, and API secret
    - _Requirements: 7.1_
  
  - [ ] 8.2 Implement file upload validation
    - Validate file type against allowed types
    - Validate file size against maximum limit
    - Return HTTP 400 with error message if validation fails
    - _Requirements: 7.5, 14.5_
  
  - [ ] 8.3 Implement file upload with retry logic
    - Upload file to Cloudinary with error handling
    - Implement exponential backoff retry for failed uploads
    - Return CDN URL on successful upload
    - Return descriptive error on failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 18.2_

- [ ] 9. Implement comprehensive logging
  - [ ] 9.1 Add request logging middleware
    - Log HTTP method, path, status code, and response time for all requests
    - Use structured logging format (JSON)
    - Include request ID for tracing
    - _Requirements: 20.1_
  
  - [ ] 9.2 Add error logging middleware
    - Log all errors with stack trace and request context
    - Never expose sensitive information in logs
    - Include request ID for correlation
    - _Requirements: 16.3, 16.6, 20.2_
  
  - [ ] 9.3 Add WebSocket event logging
    - Log connection events with user ID and timestamp
    - Log disconnection events with duration
    - Log room join/leave events
    - _Requirements: 20.3_
  
  - [ ] 9.4 Configure log retention
    - Ensure logs are accessible through Railway dashboard
    - Document log retention policy (minimum 7 days)
    - _Requirements: 20.4, 20.5_

- [ ] 10. Implement WebSocket authentication
  - [ ] 10.1 Add JWT authentication to Socket.IO
    - Extract JWT token from connection handshake
    - Verify token before accepting connection
    - Reject connections with invalid tokens
    - Attach user data to socket object on success
    - _Requirements: 6.2_
  
  - [ ] 10.2 Implement room-based message isolation
    - Ensure messages are only sent to room members
    - Validate user has permission to join room
    - Emit messages only to specific rooms
    - _Requirements: 6.6_

- [ ] 11. Optimize build process
  - [ ] 11.1 Configure production build optimizations
    - Ensure minification is enabled for JavaScript and CSS
    - Enable tree shaking to remove unused code
    - Configure code splitting for lazy loading
    - Generate source maps for debugging
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 11.2 Add build timeout configuration
    - Set build timeout to 5 minutes
    - Configure build to fail fast on errors
    - _Requirements: 12.5, 12.6_
  
  - [ ] 11.3 Enable compression for API responses
    - Install and configure compression middleware
    - Enable gzip or brotli compression
    - Apply to all API responses
    - _Requirements: 15.4_

- [ ] 12. Create deployment documentation
  - [ ] 12.1 Document Vercel deployment steps
    - Create `docs/deployment/vercel-setup.md`
    - Document how to connect GitHub repository
    - Document how to configure environment variables
    - Document how to set up custom domains
    - Include screenshots or CLI commands
    - _Requirements: 1.1, 1.6, 11.3_
  
  - [ ] 12.2 Document Railway deployment steps
    - Create `docs/deployment/railway-setup.md`
    - Document how to connect GitHub repository
    - Document how to configure environment variables
    - Document how to view logs and metrics
    - Include screenshots or CLI commands
    - _Requirements: 2.1, 2.5, 11.3_
  
  - [ ] 12.3 Create environment variables reference
    - Create `docs/deployment/environment-variables.md`
    - List all required frontend variables with descriptions
    - List all required backend variables with descriptions
    - Include security best practices for secrets
    - Document how to generate secure secrets
    - _Requirements: 3.1, 3.2, 3.4, 3.6_
  
  - [ ] 12.4 Document deployment verification steps
    - Create `docs/deployment/verification.md`
    - Document how to verify frontend is accessible
    - Document how to verify backend health check
    - Document how to test API connectivity
    - Document how to test WebSocket connections
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 13. Set up Vercel deployment
  - [ ] 13.1 Connect GitHub repository to Vercel
    - Sign up/login to Vercel
    - Import GitHub repository
    - Select frontend directory if monorepo
    - _Requirements: 1.1, 11.1_
  
  - [ ] 13.2 Configure Vercel environment variables
    - Add VITE_API_URL (will be updated after Railway deployment)
    - Add VITE_SOCKET_URL (will be updated after Railway deployment)
    - Add VITE_GOOGLE_CLIENT_ID
    - Add VITE_CLOUDINARY_CLOUD_NAME
    - _Requirements: 1.5, 3.1_
  
  - [ ] 13.3 Configure Vercel build settings
    - Set build command to `npm run build`
    - Set output directory to `dist`
    - Set Node.js version to 18.x
    - Enable automatic deployments from main branch
    - _Requirements: 1.1, 12.1_
  
  - [ ] 13.4 Deploy frontend to Vercel
    - Trigger initial deployment
    - Wait for build to complete
    - Verify deployment is accessible
    - Note the deployment URL for backend configuration
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 14. Set up Railway deployment
  - [ ] 14.1 Connect GitHub repository to Railway
    - Sign up/login to Railway
    - Create new project
    - Connect GitHub repository
    - Select backend directory if monorepo
    - _Requirements: 2.1, 11.1_
  
  - [ ] 14.2 Configure Railway environment variables
    - Add NODE_ENV=production
    - Add PORT (Railway will auto-assign)
    - Add DATABASE_URL (from Supabase)
    - Add SUPABASE_URL
    - Add SUPABASE_ANON_KEY
    - Add SUPABASE_SERVICE_ROLE_KEY
    - Add CLOUDINARY_CLOUD_NAME
    - Add CLOUDINARY_API_KEY
    - Add CLOUDINARY_API_SECRET
    - Add GOOGLE_CLIENT_ID
    - Add GOOGLE_CLIENT_SECRET
    - Add JWT_SECRET (generate 32+ character random string)
    - Add SESSION_SECRET (generate 32+ character random string)
    - Add FRONTEND_URL (from Vercel deployment)
    - _Requirements: 3.2, 3.4, 3.6_
  
  - [ ] 14.3 Configure Railway service settings
    - Set start command to `node server.js` or appropriate entry point
    - Set health check path to `/health`
    - Enable automatic deployments from main branch
    - _Requirements: 2.1, 2.2, 2.6_
  
  - [ ] 14.4 Deploy backend to Railway
    - Trigger initial deployment
    - Wait for deployment to complete
    - Verify health check returns HTTP 200
    - Note the deployment URL
    - _Requirements: 2.1, 2.2_

- [ ] 15. Update cross-service configurations
  - [ ] 15.1 Update Vercel environment variables with Railway URL
    - Update VITE_API_URL to Railway deployment URL
    - Update VITE_SOCKET_URL to Railway deployment URL
    - Trigger redeployment of frontend
    - _Requirements: 1.5, 4.5_
  
  - [ ] 15.2 Update Google OAuth redirect URI
    - Go to Google Cloud Console
    - Update OAuth 2.0 redirect URI to Railway URL + /auth/google/callback
    - Save changes
    - _Requirements: 8.8_
  
  - [ ] 15.3 Verify CORS configuration
    - Check Railway logs for CORS errors
    - Verify FRONTEND_URL matches Vercel deployment URL
    - Test API calls from frontend
    - _Requirements: 4.1, 4.5_

- [ ] 16. Checkpoint - Verify deployment health
  - Verify frontend is accessible at Vercel URL
  - Verify backend health check returns HTTP 200
  - Verify frontend can make API calls to backend
  - Verify WebSocket connections can be established
  - Check Railway logs for any errors
  - Check Vercel deployment logs for any errors
  - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 17. Test end-to-end functionality
  - [ ] 17.1 Test Google OAuth authentication flow
    - Click Google sign-in button on frontend
    - Complete OAuth authorization
    - Verify JWT token is received
    - Verify user is authenticated
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 17.2 Test file upload functionality
    - Upload a test image through the application
    - Verify file is uploaded to Cloudinary
    - Verify CDN URL is returned
    - Verify image is accessible via CDN URL
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 17.3 Test real-time chat functionality
    - Open application in two browser windows
    - Send message from one window
    - Verify message appears in other window
    - Verify WebSocket connection is stable
    - _Requirements: 6.1, 6.5, 6.6_
  
  - [ ] 17.4 Test protected API endpoints
    - Make API call without authentication token
    - Verify request is rejected with 401
    - Make API call with valid token
    - Verify request succeeds
    - _Requirements: 8.7_
  
  - [ ] 17.5 Test database operations
    - Create a new record through the application
    - Verify record is saved to Supabase
    - Retrieve the record
    - Update the record
    - Delete the record
    - _Requirements: 5.1, 5.2_

- [ ] 18. Configure monitoring and alerts
  - [ ] 18.1 Set up Railway monitoring
    - Review Railway metrics dashboard
    - Configure alerts for deployment failures
    - Configure alerts for high error rates
    - _Requirements: 10.5, 16.1_
  
  - [ ] 18.2 Set up Vercel monitoring
    - Review Vercel analytics dashboard
    - Check build success/failure notifications
    - Review deployment logs
    - _Requirements: 10.5, 16.1_
  
  - [ ] 18.3 Document monitoring procedures
    - Create `docs/deployment/monitoring.md`
    - Document how to access logs
    - Document how to interpret metrics
    - Document common issues and solutions
    - _Requirements: 10.5, 20.4_

- [ ] 19. Performance optimization verification
  - [ ] 19.1 Test frontend performance metrics
    - Run Lighthouse audit on deployed frontend
    - Verify First Contentful Paint < 1.5s
    - Verify Largest Contentful Paint < 2.5s
    - Document results
    - _Requirements: 15.1, 15.2_
  
  - [ ] 19.2 Test backend API response times
    - Use monitoring tools to measure API response times
    - Verify 95th percentile response time < 200ms
    - Identify and optimize slow endpoints if needed
    - _Requirements: 15.3_
  
  - [ ] 19.3 Test WebSocket latency
    - Measure round-trip time for WebSocket messages
    - Verify latency < 50ms
    - Test under various network conditions
    - _Requirements: 15.5_

- [ ] 20. Set up preview deployments
  - [ ] 20.1 Configure Vercel preview deployments
    - Enable preview deployments for pull requests
    - Verify preview URLs are generated
    - Test preview deployment functionality
    - _Requirements: 1.6, 11.4_
  
  - [ ] 20.2 Configure Railway preview environments (optional)
    - Create staging environment in Railway
    - Configure separate environment variables for staging
    - Document staging deployment process
    - _Requirements: 19.1, 19.2, 19.5_

- [ ] 21. Final checkpoint - Complete deployment verification
  - Run through complete user journey from authentication to core features
  - Verify all environment variables are correctly configured
  - Verify all security headers are present
  - Verify HTTPS is enforced
  - Verify logs are being captured correctly
  - Verify error handling works as expected
  - Document any issues found and resolutions
  - Ensure all tests pass, ask the user if questions arise
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- This is a deployment and configuration workflow - no property-based tests are included as the focus is on infrastructure setup rather than algorithmic correctness
- Some tasks (13-15) involve manual platform configuration and cannot be fully automated
- Documentation tasks ensure the deployment can be reproduced and maintained
- The workflow assumes the MERN application code already exists and is functional in development
