# Design Document: MERN Stack Deployment & Hosting

## Overview

This design document outlines the production deployment architecture for a MERN (MongoDB/Supabase, Express, React, Node.js) stack application. The application features real-time chat functionality via Socket.io, file uploads through Cloudinary, Google OAuth authentication, and multiple frontend modules including chat, community features, and an ATS system. The deployment strategy leverages modern Platform-as-a-Service (PaaS) providers to minimize operational overhead while maintaining production-grade reliability and security.

The architecture separates frontend and backend deployments across specialized platforms: Vercel for the React/Vite frontend (providing edge CDN, automatic HTTPS, and zero-config deployments) and Railway for the Node.js/Express backend (offering simple container orchestration, environment management, and persistent connections for WebSocket support). The existing Supabase PostgreSQL database remains unchanged, eliminating migration complexity. This design prioritizes developer experience, cost efficiency, and scalability while addressing critical production concerns including secrets management, CORS configuration, real-time connection handling, and CI/CD automation.

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Vercel Edge Network"
        CDN[Vercel CDN]
        Frontend[React/Vite App]
    end
    
    subgraph "Railway Platform"
        Backend[Express API Server]
        SocketIO[Socket.io Server]
    end
    
    subgraph "External Services"
        Supabase[(Supabase PostgreSQL)]
        Cloudinary[Cloudinary Storage]
        GoogleOAuth[Google OAuth 2.0]
    end
    
    Browser --> CDN
    Mobile --> CDN
    CDN --> Frontend
    
    Frontend -->|HTTPS API Calls| Backend
    Frontend -->|WebSocket Connection| SocketIO
    
    Backend --> Supabase
    Backend --> Cloudinary
    Backend --> GoogleOAuth
    SocketIO --> Supabase
    
    style Frontend fill:#00C7B7
    style Backend fill:#7B42BC
    style Supabase fill:#3ECF8E
    style Cloudinary fill:#3448C5
```

### Deployment Flow Architecture

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub Repository
    participant Vercel as Vercel Platform
    participant Railway as Railway Platform
    participant Client as End User
    
    Dev->>GitHub: Push code to main branch
    
    GitHub->>Vercel: Webhook trigger (frontend changes)
    Vercel->>Vercel: Build React/Vite app
    Vercel->>Vercel: Deploy to edge network
    Vercel->>GitHub: Update deployment status
    
    GitHub->>Railway: Webhook trigger (backend changes)
    Railway->>Railway: Build Docker container
    Railway->>Railway: Deploy with health checks
    Railway->>GitHub: Update deployment status
    
    Client->>Vercel: Request application
    Vercel->>Client: Serve static assets
    Client->>Railway: API/WebSocket requests
    Railway->>Client: Response data
```

## Components and Interfaces

### Component 1: Frontend Deployment (Vercel)

**Purpose**: Serve the React/Vite application as static assets through a global CDN with automatic HTTPS, edge caching, and instant rollbacks.

**Interface**:
```typescript
interface VercelDeployment {
  buildCommand: string
  outputDirectory: string
  environmentVariables: EnvironmentConfig
  rewrites: RewriteRule[]
  headers: SecurityHeader[]
}

interface EnvironmentConfig {
  VITE_API_URL: string
  VITE_SOCKET_URL: string
  VITE_GOOGLE_CLIENT_ID: string
  VITE_CLOUDINARY_CLOUD_NAME: string
}
```

**Responsibilities**:
- Build and optimize React application for production
- Serve static assets via global CDN
- Handle client-side routing with SPA rewrites
- Inject environment variables at build time
- Provide automatic HTTPS certificates
- Enable preview deployments for pull requests

### Component 2: Backend Deployment (Railway)

**Purpose**: Host the Node.js/Express API server with persistent WebSocket connections, environment variable management, and container orchestration.

**Interface**:
```typescript
interface RailwayDeployment {
  startCommand: string
  buildCommand: string
  environmentVariables: BackendEnvironmentConfig
  healthCheckPath: string
  port: number
}

interface BackendEnvironmentConfig {
  NODE_ENV: string
  PORT: number
  DATABASE_URL: string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string
  FRONTEND_URL: string
  SESSION_SECRET: string
}
```

**Responsibilities**:
- Run Express server with production optimizations
- Maintain WebSocket connections for Socket.io
- Handle database connections with connection pooling
- Manage secure environment variables
- Provide application logs and metrics
- Auto-restart on crashes with health checks

### Component 3: Database Layer (Supabase)

**Purpose**: Provide managed PostgreSQL database with connection pooling, automatic backups, and built-in authentication features.

**Interface**:
```typescript
interface SupabaseConnection {
  connectionString: string
  poolSize: number
  connectionTimeout: number
  idleTimeout: number
}

interface SupabaseClient {
  url: string
  anonKey: string
  serviceRoleKey: string
}
```

**Responsibilities**:
- Store application data with ACID guarantees
- Provide connection pooling for scalability
- Handle automatic backups and point-in-time recovery
- Expose REST and GraphQL APIs (if used)

### Component 4: File Storage (Cloudinary)

**Purpose**: Handle image and file uploads with automatic optimization, transformation, and CDN delivery.

**Interface**:
```typescript
interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset?: string
  folder?: string
}

interface CloudinaryUpload {
  upload(file: Buffer, options: UploadOptions): Promise<UploadResult>
  destroy(publicId: string): Promise<DestroyResult>
}
```

**Responsibilities**:
- Accept file uploads from backend API
- Optimize images automatically
- Serve files via CDN
- Provide transformation URLs

### Component 5: Authentication (Google OAuth)

**Purpose**: Provide secure user authentication via Google OAuth 2.0 flow with JWT token management.

**Interface**:
```typescript
interface GoogleOAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
}

interface AuthenticationFlow {
  initiateOAuth(): string
  handleCallback(code: string): Promise<UserProfile>
  generateJWT(user: UserProfile): string
  verifyJWT(token: string): Promise<UserProfile>
}
```

**Responsibilities**:
- Handle OAuth 2.0 authorization flow
- Exchange authorization codes for access tokens
- Retrieve user profile information
- Generate and verify JWT tokens
- Manage session state

### Component 6: Real-Time Communication (Socket.io)

**Purpose**: Enable bidirectional real-time communication for chat features with connection management and room-based messaging.

**Interface**:
```typescript
interface SocketIOConfig {
  cors: CORSConfig
  transports: string[]
  pingTimeout: number
  pingInterval: number
}

interface SocketIOServer {
  on(event: string, handler: Function): void
  emit(event: string, data: any): void
  to(room: string): SocketIONamespace
}
```

**Responsibilities**:
- Maintain persistent WebSocket connections
- Handle connection/disconnection events
- Manage chat rooms and namespaces
- Broadcast messages to connected clients
- Handle reconnection logic

## Data Models

### Model 1: Deployment Configuration

```typescript
interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  frontend: FrontendConfig
  backend: BackendConfig
  database: DatabaseConfig
  services: ExternalServicesConfig
}

interface FrontendConfig {
  platform: 'vercel'
  domain?: string
  buildCommand: string
  outputDirectory: string
  nodeVersion: string
  environmentVariables: Record<string, string>
}

interface BackendConfig {
  platform: 'railway'
  domain?: string
  startCommand: string
  buildCommand?: string
  nodeVersion: string
  port: number
  healthCheckPath: string
  environmentVariables: Record<string, string>
}

interface DatabaseConfig {
  provider: 'supabase'
  connectionString: string
  poolSize: number
  ssl: boolean
}

interface ExternalServicesConfig {
  cloudinary: CloudinaryConfig
  googleOAuth: GoogleOAuthConfig
}
```

**Validation Rules**:
- All environment variables must be non-empty strings
- Port must be between 1024 and 65535
- Connection pool size must be positive integer
- URLs must be valid HTTPS endpoints
- Node version must match between frontend and backend

### Model 2: Environment Variables Schema

```typescript
interface EnvironmentVariables {
  // Frontend (Vite) - Build-time variables
  VITE_API_URL: string              // Railway backend URL
  VITE_SOCKET_URL: string           // Railway WebSocket URL
  VITE_GOOGLE_CLIENT_ID: string     // Google OAuth client ID
  VITE_CLOUDINARY_CLOUD_NAME: string // Cloudinary cloud name
  
  // Backend (Express) - Runtime variables
  NODE_ENV: 'production' | 'development'
  PORT: number
  DATABASE_URL: string              // Supabase connection string
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  CLOUDINARY_CLOUD_NAME: string
  CLOUDINARY_API_KEY: string
  CLOUDINARY_API_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  JWT_SECRET: string                // For token signing
  SESSION_SECRET: string            // For session management
  FRONTEND_URL: string              // Vercel frontend URL for CORS
}
```

**Validation Rules**:
- All secrets (JWT_SECRET, SESSION_SECRET, API keys) must be cryptographically random strings (minimum 32 characters)
- URLs must include protocol (https://)
- PORT must match Railway's exposed port
- NODE_ENV must be 'production' in production deployments
- FRONTEND_URL and VITE_API_URL must match actual deployment URLs

## Algorithmic Pseudocode

### Main Deployment Algorithm

```pascal
ALGORITHM deployMERNApplication(config)
INPUT: config of type DeploymentConfig
OUTPUT: deploymentResult of type DeploymentResult

BEGIN
  ASSERT config.environment IN ['development', 'staging', 'production']
  ASSERT validateEnvironmentVariables(config) = true
  
  // Step 1: Prepare deployment artifacts
  artifacts ← prepareDeploymentArtifacts(config)
  
  // Step 2: Deploy backend first (Railway)
  backendDeployment ← deployBackend(config.backend, artifacts.backend)
  ASSERT backendDeployment.status = 'healthy'
  
  // Step 3: Update frontend config with backend URL
  config.frontend.environmentVariables['VITE_API_URL'] ← backendDeployment.url
  config.frontend.environmentVariables['VITE_SOCKET_URL'] ← backendDeployment.url
  
  // Step 4: Deploy frontend (Vercel)
  frontendDeployment ← deployFrontend(config.frontend, artifacts.frontend)
  ASSERT frontendDeployment.status = 'ready'
  
  // Step 5: Update backend CORS with frontend URL
  updateBackendEnvironment('FRONTEND_URL', frontendDeployment.url)
  
  // Step 6: Verify end-to-end connectivity
  healthCheck ← verifyDeployment(frontendDeployment.url, backendDeployment.url)
  ASSERT healthCheck.frontend = true AND healthCheck.backend = true
  
  // Step 7: Run smoke tests
  smokeTests ← runSmokeTests(frontendDeployment.url)
  ASSERT smokeTests.passed = true
  
  RETURN {
    status: 'success',
    frontend: frontendDeployment,
    backend: backendDeployment,
    timestamp: now()
  }
END
```

**Preconditions:**
- config is validated and well-formed
- All required environment variables are set
- GitHub repository is accessible
- Platform credentials (Vercel, Railway) are valid
- External services (Supabase, Cloudinary, Google OAuth) are operational

**Postconditions:**
- Backend is deployed and healthy
- Frontend is deployed and accessible
- CORS is properly configured
- All health checks pass
- Deployment URLs are recorded

**Loop Invariants:** N/A (no loops in main algorithm)

### Backend Deployment Algorithm

```pascal
ALGORITHM deployBackend(backendConfig, artifacts)
INPUT: backendConfig of type BackendConfig, artifacts of type BuildArtifacts
OUTPUT: deployment of type RailwayDeployment

BEGIN
  // Step 1: Connect to Railway platform
  railway ← connectToRailway(credentials)
  
  // Step 2: Create or update service
  service ← railway.getOrCreateService('backend')
  
  // Step 3: Set environment variables
  FOR each variable IN backendConfig.environmentVariables DO
    ASSERT variable.key IS NOT empty
    ASSERT variable.value IS NOT empty
    service.setEnvironmentVariable(variable.key, variable.value)
  END FOR
  
  // Step 4: Configure service settings
  service.setStartCommand(backendConfig.startCommand)
  service.setHealthCheck(backendConfig.healthCheckPath)
  service.setPort(backendConfig.port)
  
  // Step 5: Trigger deployment from GitHub
  deployment ← service.deployFromGitHub(artifacts.commitHash)
  
  // Step 6: Wait for deployment with timeout
  timeout ← 300 // 5 minutes
  elapsed ← 0
  WHILE deployment.status NOT IN ['ready', 'failed'] AND elapsed < timeout DO
    WAIT 5 seconds
    elapsed ← elapsed + 5
    deployment ← service.getDeploymentStatus(deployment.id)
  END WHILE
  
  ASSERT deployment.status = 'ready'
  
  // Step 7: Verify health check
  healthResponse ← httpGet(deployment.url + backendConfig.healthCheckPath)
  ASSERT healthResponse.status = 200
  
  RETURN {
    id: deployment.id,
    url: deployment.url,
    status: 'healthy',
    timestamp: now()
  }
END
```

**Preconditions:**
- Railway credentials are valid
- backendConfig contains all required fields
- GitHub repository is connected to Railway
- Environment variables are validated
- Health check endpoint exists in application

**Postconditions:**
- Service is deployed and running
- All environment variables are set
- Health check returns 200 OK
- Deployment URL is accessible
- Service is ready to accept requests

**Loop Invariants:**
- elapsed time is always less than or equal to timeout
- deployment status is checked every 5 seconds
- deployment object remains valid throughout loop

### Frontend Deployment Algorithm

```pascal
ALGORITHM deployFrontend(frontendConfig, artifacts)
INPUT: frontendConfig of type FrontendConfig, artifacts of type BuildArtifacts
OUTPUT: deployment of type VercelDeployment

BEGIN
  // Step 1: Connect to Vercel platform
  vercel ← connectToVercel(credentials)
  
  // Step 2: Create or update project
  project ← vercel.getOrCreateProject('frontend')
  
  // Step 3: Set environment variables
  FOR each variable IN frontendConfig.environmentVariables DO
    ASSERT variable.key STARTS WITH 'VITE_'
    ASSERT variable.value IS NOT empty
    project.setEnvironmentVariable(variable.key, variable.value, 'production')
  END FOR
  
  // Step 4: Configure build settings
  project.setBuildCommand(frontendConfig.buildCommand)
  project.setOutputDirectory(frontendConfig.outputDirectory)
  project.setNodeVersion(frontendConfig.nodeVersion)
  
  // Step 5: Configure SPA routing
  project.addRewrite({
    source: '/(.*)',
    destination: '/index.html'
  })
  
  // Step 6: Trigger deployment from GitHub
  deployment ← project.deployFromGitHub(artifacts.commitHash)
  
  // Step 7: Wait for deployment with timeout
  timeout ← 300 // 5 minutes
  elapsed ← 0
  WHILE deployment.status NOT IN ['ready', 'error'] AND elapsed < timeout DO
    WAIT 5 seconds
    elapsed ← elapsed + 5
    deployment ← project.getDeploymentStatus(deployment.id)
  END WHILE
  
  ASSERT deployment.status = 'ready'
  
  // Step 8: Verify deployment accessibility
  response ← httpGet(deployment.url)
  ASSERT response.status = 200
  ASSERT response.headers['content-type'] CONTAINS 'text/html'
  
  RETURN {
    id: deployment.id,
    url: deployment.url,
    status: 'ready',
    timestamp: now()
  }
END
```

**Preconditions:**
- Vercel credentials are valid
- frontendConfig contains all required fields
- GitHub repository is connected to Vercel
- All VITE_ environment variables are set
- Build command produces valid output

**Postconditions:**
- Project is deployed to Vercel edge network
- All environment variables are injected at build time
- SPA routing is configured
- Deployment URL returns 200 OK
- Static assets are served via CDN

**Loop Invariants:**
- elapsed time is always less than or equal to timeout
- deployment status is checked every 5 seconds
- deployment object remains valid throughout loop

### Environment Variable Validation Algorithm

```pascal
ALGORITHM validateEnvironmentVariables(config)
INPUT: config of type DeploymentConfig
OUTPUT: isValid of type boolean

BEGIN
  requiredFrontendVars ← [
    'VITE_API_URL',
    'VITE_SOCKET_URL',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_CLOUDINARY_CLOUD_NAME'
  ]
  
  requiredBackendVars ← [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET',
    'SESSION_SECRET',
    'FRONTEND_URL'
  ]
  
  // Validate frontend variables
  FOR each varName IN requiredFrontendVars DO
    IF varName NOT IN config.frontend.environmentVariables THEN
      RETURN false
    END IF
    
    value ← config.frontend.environmentVariables[varName]
    IF value IS empty OR value IS null THEN
      RETURN false
    END IF
  END FOR
  
  // Validate backend variables
  FOR each varName IN requiredBackendVars DO
    IF varName NOT IN config.backend.environmentVariables THEN
      RETURN false
    END IF
    
    value ← config.backend.environmentVariables[varName]
    IF value IS empty OR value IS null THEN
      RETURN false
    END IF
    
    // Validate secrets have minimum length
    IF varName IN ['JWT_SECRET', 'SESSION_SECRET'] THEN
      IF length(value) < 32 THEN
        RETURN false
      END IF
    END IF
    
    // Validate URLs have proper format
    IF varName ENDS WITH '_URL' THEN
      IF NOT value STARTS WITH 'https://' THEN
        RETURN false
      END IF
    END IF
  END FOR
  
  // Validate PORT is valid number
  port ← config.backend.environmentVariables['PORT']
  IF NOT isInteger(port) OR port < 1024 OR port > 65535 THEN
    RETURN false
  END IF
  
  // All validations passed
  RETURN true
END
```

**Preconditions:**
- config parameter is provided and not null
- config.frontend and config.backend exist
- environmentVariables objects exist

**Postconditions:**
- Returns true if and only if all required variables are present and valid
- Returns false if any validation check fails
- No side effects on config parameter

**Loop Invariants:**
- All previously checked variables were valid when loop continues
- Validation state remains consistent throughout iteration

## Key Functions with Formal Specifications

### Function 1: configureCORS()

```typescript
function configureCORS(frontendURL: string): CORSOptions
```

**Preconditions:**
- frontendURL is non-empty string
- frontendURL is valid HTTPS URL
- frontendURL matches deployed Vercel domain

**Postconditions:**
- Returns valid CORSOptions object
- origin includes frontendURL
- credentials is set to true
- methods includes all required HTTP methods
- No side effects on input parameter

**Loop Invariants:** N/A (no loops)

### Function 2: configureSocketIO()

```typescript
function configureSocketIO(server: HTTPServer, corsOrigin: string): SocketIOServer
```

**Preconditions:**
- server is valid HTTP server instance
- server is listening on configured port
- corsOrigin is non-empty string
- corsOrigin is valid HTTPS URL

**Postconditions:**
- Returns configured Socket.IO server instance
- CORS is configured with corsOrigin
- transports include ['websocket', 'polling']
- pingTimeout and pingInterval are set
- Server is ready to accept connections

**Loop Invariants:** N/A (no loops)

### Function 3: initializeDatabaseConnection()

```typescript
function initializeDatabaseConnection(config: DatabaseConfig): DatabasePool
```

**Preconditions:**
- config is non-null and well-formed
- config.connectionString is valid PostgreSQL connection string
- config.poolSize is positive integer
- Database server is accessible

**Postconditions:**
- Returns active database connection pool
- Pool size matches config.poolSize
- SSL is enabled if config.ssl is true
- Connection is verified with test query
- Pool is ready to execute queries

**Loop Invariants:** N/A (no loops)

### Function 4: buildProductionAssets()

```typescript
function buildProductionAssets(buildCommand: string, outputDir: string): BuildResult
```

**Preconditions:**
- buildCommand is non-empty string
- outputDir is valid directory path
- All dependencies are installed
- Environment variables are set

**Postconditions:**
- Build completes successfully (exit code 0)
- Output directory contains built assets
- Assets are optimized for production
- Source maps are generated
- Build result contains metadata (size, duration)

**Loop Invariants:** N/A (no loops)

### Function 5: verifyDeploymentHealth()

```typescript
function verifyDeploymentHealth(frontendURL: string, backendURL: string): HealthCheckResult
```

**Preconditions:**
- frontendURL is valid HTTPS URL
- backendURL is valid HTTPS URL
- Both services are deployed

**Postconditions:**
- Returns health check result object
- frontend property is true if frontend is accessible
- backend property is true if backend health endpoint returns 200
- apiConnectivity is true if frontend can reach backend
- No side effects on deployment state

**Loop Invariants:** N/A (no loops)

## Example Usage

### Example 1: Complete Deployment Flow

```typescript
// Step 1: Prepare configuration
const config: DeploymentConfig = {
  environment: 'production',
  frontend: {
    platform: 'vercel',
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    nodeVersion: '18.x',
    environmentVariables: {
      VITE_API_URL: 'https://backend.railway.app',
      VITE_SOCKET_URL: 'https://backend.railway.app',
      VITE_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      VITE_CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
    }
  },
  backend: {
    platform: 'railway',
    startCommand: 'node server.js',
    nodeVersion: '18.x',
    port: 3000,
    healthCheckPath: '/health',
    environmentVariables: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: process.env.DATABASE_URL,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
      SESSION_SECRET: process.env.SESSION_SECRET,
      FRONTEND_URL: 'https://app.vercel.app'
    }
  },
  database: {
    provider: 'supabase',
    connectionString: process.env.DATABASE_URL,
    poolSize: 10,
    ssl: true
  },
  services: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    googleOAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'https://backend.railway.app/auth/google/callback',
      scope: ['profile', 'email']
    }
  }
}

// Step 2: Validate configuration
if (!validateEnvironmentVariables(config)) {
  throw new Error('Invalid environment variables')
}

// Step 3: Execute deployment
const result = await deployMERNApplication(config)

// Step 4: Verify deployment
console.log(`Frontend deployed to: ${result.frontend.url}`)
console.log(`Backend deployed to: ${result.backend.url}`)
console.log(`Deployment completed at: ${result.timestamp}`)
```

### Example 2: CORS Configuration

```typescript
// In Express backend (server.js or app.js)
import cors from 'cors'
import express from 'express'

const app = express()

// Configure CORS for production
const corsOptions = configureCORS(process.env.FRONTEND_URL)

app.use(cors(corsOptions))

function configureCORS(frontendURL: string): CORSOptions {
  return {
    origin: frontendURL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  }
}
```

### Example 3: Socket.IO Configuration for Railway

```typescript
import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()
const server = http.createServer(app)

// Configure Socket.IO with CORS
const io = configureSocketIO(server, process.env.FRONTEND_URL)

function configureSocketIO(server: http.Server, corsOrigin: string): Server {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })
  
  return io
}

// Start server on Railway's PORT
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Example 4: Database Connection with Supabase

```typescript
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = initializeDatabaseConnection({
  connectionString: process.env.DATABASE_URL,
  poolSize: 10,
  ssl: true
})

function initializeDatabaseConnection(config: DatabaseConfig) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })
  
  return client
}

// Example query
async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) throw error
  return data
}
```

### Example 5: Vercel Configuration File

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Example 6: Railway Configuration File

```json
// railway.json (optional - Railway auto-detects most settings)
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Environment Variable Completeness

*For any* deployment configuration, all required environment variables must be present and non-empty.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 2: CORS Origin Consistency

*For any* deployment, the frontend URL in the backend CORS configuration must match the actual frontend deployment URL.

**Validates: Requirements 4.1**

### Property 3: Secure Secrets

*For any* deployment, all secret values (JWT_SECRET, SESSION_SECRET) must have a minimum length of 32 characters and be cryptographically random.

**Validates: Requirements 3.4**

### Property 4: URL HTTPS Enforcement

*For any* environment variable ending with "_URL", the value must start with "https://".

**Validates: Requirements 3.5, 9.1, 9.2**

### Property 5: Health Check Availability

*For any* healthy backend deployment, the health check endpoint must return HTTP 200.

**Validates: Requirements 2.2, 10.1**

### Property 6: Database Connection Pool Limit

*For any* deployment at any point in time, the number of active database connections must not exceed the configured pool size.

**Validates: Requirements 5.2, 17.1**

### Property 7: Socket.IO Transport Support

*For any* WebSocket server configuration, both 'websocket' and 'polling' transports must be included.

**Validates: Requirements 6.1**

### Property 8: Build Artifact Integrity

*For any* successful frontend build, the output directory must contain a valid index.html file.

**Validates: Requirements 12.1, 12.3, 12.4**

### Property 9: JWT Token Expiration

*For any* generated JWT access token, the expiration time must be set to 15 minutes from creation.

**Validates: Requirements 8.4**

### Property 10: Refresh Token Expiration

*For any* generated refresh token, the expiration time must be set to 7 days from creation.

**Validates: Requirements 8.5**

### Property 11: Protected Endpoint Authentication

*For any* request to a protected API endpoint without a valid JWT token, the backend must reject the request with an authentication error.

**Validates: Requirements 8.7**

### Property 12: File Upload Validation

*For any* file upload request, the backend must validate file type and size before sending to the storage service.

**Validates: Requirements 7.5, 14.5**

### Property 13: File Upload URL Response

*For any* successful file upload, the storage service must return a valid CDN URL.

**Validates: Requirements 7.3**

### Property 14: Input Validation Rejection

*For any* API request with invalid input data, the backend must return HTTP 400 with descriptive error messages.

**Validates: Requirements 14.1, 14.4**

### Property 15: HTML Input Sanitization

*For any* user input containing HTML, the backend must sanitize it to prevent XSS attacks.

**Validates: Requirements 14.2**

### Property 16: Parameterized Query Usage

*For any* database query, the backend must use parameterized queries to prevent SQL injection.

**Validates: Requirements 14.3**

### Property 17: Error Logging Completeness

*For any* API error, the backend must log the error with stack trace and request context.

**Validates: Requirements 16.3, 20.2**

### Property 18: Retry with Exponential Backoff

*For any* failed operation with retry logic (database connection, file upload), retries must occur with exponentially increasing delays.

**Validates: Requirements 5.5, 7.6, 16.4**

### Property 19: Error Message Security

*For any* error response, the backend must never expose sensitive information (secrets, credentials, internal paths) in error messages.

**Validates: Requirements 16.6**

### Property 20: Request Logging Completeness

*For any* API request, the backend must log the HTTP method, path, status code, and response time.

**Validates: Requirements 20.1**

### Property 21: WebSocket Event Logging

*For any* WebSocket connection or disconnection event, the backend must log the event with relevant context.

**Validates: Requirements 20.3**

### Property 22: Room-Based Message Isolation

*For any* message sent to a Socket.IO room, only clients that are members of that room must receive the message.

**Validates: Requirements 6.6**

### Property 23: WebSocket Authentication

*For any* WebSocket connection attempt with an invalid JWT token, the server must reject the connection.

**Validates: Requirements 6.2**

### Property 24: Environment Variable Injection

*For any* frontend build, all VITE_ prefixed environment variables must be injected into the built artifacts.

**Validates: Requirements 1.5**

## Error Handling

### Error Scenario 1: Build Failure

**Condition**: Frontend or backend build command exits with non-zero status code

**Response**: 
- Capture build logs and error output
- Halt deployment process immediately
- Preserve previous successful deployment
- Send notification with error details

**Recovery**:
- Review build logs to identify issue
- Fix code or configuration issue
- Commit fix and trigger new deployment
- Previous deployment remains active during recovery

### Error Scenario 2: Environment Variable Missing

**Condition**: Required environment variable is not set or is empty

**Response**:
- Fail deployment validation before build starts
- List all missing variables in error message
- Prevent deployment from proceeding
- No changes to production environment

**Recovery**:
- Set missing environment variables in platform dashboard
- Verify all required variables are present
- Trigger new deployment

### Error Scenario 3: Health Check Failure

**Condition**: Backend health check endpoint returns non-200 status or times out

**Response**:
- Mark deployment as unhealthy
- Keep previous deployment active (if exists)
- Retry health check up to 3 times with exponential backoff
- Alert monitoring system

**Recovery**:
- Check application logs for startup errors
- Verify database connectivity
- Verify all external services are accessible
- Fix underlying issue and redeploy

### Error Scenario 4: CORS Configuration Mismatch

**Condition**: Frontend cannot make requests to backend due to CORS errors

**Response**:
- Browser console shows CORS error
- API requests fail with network error
- Application functionality is broken

**Recovery**:
- Verify FRONTEND_URL environment variable matches actual frontend URL
- Update backend CORS configuration
- Redeploy backend with correct CORS settings
- Clear browser cache and test

### Error Scenario 5: Socket.IO Connection Failure

**Condition**: WebSocket connection cannot be established or drops frequently

**Response**:
- Socket.IO falls back to polling transport
- Real-time features experience delays
- Connection errors logged in browser console

**Recovery**:
- Verify Socket.IO CORS configuration includes frontend URL
- Check Railway logs for WebSocket errors
- Verify transports include both 'websocket' and 'polling'
- Ensure Railway service supports WebSocket connections
- Test connection with Socket.IO client debugging enabled

### Error Scenario 6: Database Connection Pool Exhaustion

**Condition**: All database connections in pool are in use, new requests wait or timeout

**Response**:
- API requests slow down significantly
- Some requests timeout with database connection errors
- Application logs show pool exhaustion warnings

**Recovery**:
- Increase database connection pool size
- Optimize slow queries to release connections faster
- Implement connection timeout and retry logic
- Monitor connection usage patterns
- Consider database scaling if needed

### Error Scenario 7: Cloudinary Upload Failure

**Condition**: File upload to Cloudinary fails due to invalid credentials or quota exceeded

**Response**:
- Upload endpoint returns 500 error
- Error message indicates Cloudinary API failure
- User sees upload failed message

**Recovery**:
- Verify Cloudinary API credentials are correct
- Check Cloudinary account quota and limits
- Implement retry logic with exponential backoff
- Provide user-friendly error message
- Log error details for debugging

### Error Scenario 8: Google OAuth Callback Failure

**Condition**: OAuth callback fails due to invalid redirect URI or credentials

**Response**:
- User redirected to error page after Google login
- OAuth error message displayed
- Authentication fails

**Recovery**:
- Verify Google OAuth redirect URI matches backend URL + '/auth/google/callback'
- Update Google Cloud Console with correct redirect URI
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Test OAuth flow in incognito mode
- Check backend logs for detailed error messages

## Testing Strategy

### Unit Testing Approach

**Scope**: Test individual functions and modules in isolation

**Key Test Cases**:
1. Environment variable validation logic
2. CORS configuration generation
3. Socket.IO configuration setup
4. Database connection initialization
5. JWT token generation and verification
6. File upload handling
7. OAuth callback processing

**Coverage Goals**: Minimum 80% code coverage for business logic

**Tools**: Jest for JavaScript/TypeScript testing

**Example Test**:
```typescript
describe('configureCORS', () => {
  it('should return valid CORS options with frontend URL', () => {
    const frontendURL = 'https://app.vercel.app'
    const options = configureCORS(frontendURL)
    
    expect(options.origin).toBe(frontendURL)
    expect(options.credentials).toBe(true)
    expect(options.methods).toContain('GET')
    expect(options.methods).toContain('POST')
  })
  
  it('should throw error for invalid URL', () => {
    expect(() => configureCORS('')).toThrow()
    expect(() => configureCORS('not-a-url')).toThrow()
  })
})
```

### Property-Based Testing Approach

**Scope**: Test deployment properties hold true across various inputs and scenarios

**Property Test Library**: fast-check (for JavaScript/TypeScript)

**Key Properties to Test**:
1. Environment variable validation always rejects incomplete configurations
2. CORS configuration always includes frontend URL in origin
3. Database pool never exceeds configured maximum connections
4. All deployment URLs always use HTTPS protocol
5. Health check always returns 200 when service is healthy

**Example Property Test**:
```typescript
import fc from 'fast-check'

describe('validateEnvironmentVariables property tests', () => {
  it('should reject any config with missing required variables', () => {
    fc.assert(
      fc.property(
        fc.record({
          frontend: fc.record({
            environmentVariables: fc.dictionary(fc.string(), fc.string())
          }),
          backend: fc.record({
            environmentVariables: fc.dictionary(fc.string(), fc.string())
          })
        }),
        (config) => {
          // If any required variable is missing, validation should fail
          const requiredVars = ['VITE_API_URL', 'NODE_ENV', 'DATABASE_URL']
          const hasAllVars = requiredVars.every(v => 
            config.frontend.environmentVariables[v] || 
            config.backend.environmentVariables[v]
          )
          
          if (!hasAllVars) {
            expect(validateEnvironmentVariables(config)).toBe(false)
          }
        }
      )
    )
  })
  
  it('should always enforce HTTPS for URLs', () => {
    fc.assert(
      fc.property(
        fc.webUrl(),
        (url) => {
          const config = createConfigWithURL(url)
          const isValid = validateEnvironmentVariables(config)
          
          // If URL doesn't start with https://, validation should fail
          if (!url.startsWith('https://')) {
            expect(isValid).toBe(false)
          }
        }
      )
    )
  })
})
```

### Integration Testing Approach

**Scope**: Test interactions between components and external services

**Key Integration Tests**:
1. Frontend can successfully call backend API endpoints
2. Backend can connect to Supabase database
3. Backend can upload files to Cloudinary
4. Backend can complete Google OAuth flow
5. Socket.IO connections work between frontend and backend
6. CORS allows cross-origin requests from frontend to backend

**Test Environment**: Use staging environment with test credentials

**Example Integration Test**:
```typescript
describe('Deployment Integration Tests', () => {
  it('should allow frontend to call backend API', async () => {
    const frontendURL = process.env.FRONTEND_URL
    const backendURL = process.env.BACKEND_URL
    
    // Simulate frontend making API call
    const response = await fetch(`${backendURL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': frontendURL
      }
    })
    
    expect(response.status).toBe(200)
    expect(response.headers.get('access-control-allow-origin')).toBe(frontendURL)
  })
  
  it('should establish Socket.IO connection', async () => {
    const backendURL = process.env.BACKEND_URL
    const socket = io(backendURL, {
      transports: ['websocket', 'polling']
    })
    
    await new Promise((resolve) => {
      socket.on('connect', () => {
        expect(socket.connected).toBe(true)
        socket.disconnect()
        resolve()
      })
    })
  })
  
  it('should connect to Supabase database', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

### Smoke Testing Approach

**Scope**: Quick verification that deployment is functional after going live

**Key Smoke Tests**:
1. Frontend loads successfully (200 OK)
2. Backend health check returns 200 OK
3. Database connection is active
4. Socket.IO connection can be established
5. Static assets load from CDN
6. HTTPS certificates are valid

**Execution**: Run automatically after each deployment

**Example Smoke Test Script**:
```bash
#!/bin/bash

FRONTEND_URL="https://app.vercel.app"
BACKEND_URL="https://backend.railway.app"

echo "Running smoke tests..."

# Test 1: Frontend loads
echo "Testing frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
if [ $FRONTEND_STATUS -eq 200 ]; then
  echo "✓ Frontend is accessible"
else
  echo "✗ Frontend failed (status: $FRONTEND_STATUS)"
  exit 1
fi

# Test 2: Backend health check
echo "Testing backend health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/health)
if [ $BACKEND_STATUS -eq 200 ]; then
  echo "✓ Backend health check passed"
else
  echo "✗ Backend health check failed (status: $BACKEND_STATUS)"
  exit 1
fi

# Test 3: HTTPS certificate
echo "Testing HTTPS certificate..."
CERT_VALID=$(curl -s -o /dev/null -w "%{ssl_verify_result}" $FRONTEND_URL)
if [ $CERT_VALID -eq 0 ]; then
  echo "✓ HTTPS certificate is valid"
else
  echo "✗ HTTPS certificate is invalid"
  exit 1
fi

echo "All smoke tests passed!"
```

## Performance Considerations

### Frontend Performance

**Optimization Strategies**:
1. Code splitting: Split React application into smaller chunks loaded on demand
2. Tree shaking: Remove unused code during build process
3. Asset optimization: Compress images, minify CSS/JS
4. CDN caching: Leverage Vercel's edge network for fast global delivery
5. Lazy loading: Load components and routes only when needed
6. Bundle analysis: Monitor bundle size and identify optimization opportunities

**Vite Configuration**:
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          socketio: ['socket.io-client']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
})
```

**Performance Targets**:
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Backend Performance

**Optimization Strategies**:
1. Connection pooling: Reuse database connections to reduce overhead
2. Response caching: Cache frequently accessed data with Redis (optional)
3. Compression: Enable gzip/brotli compression for API responses
4. Query optimization: Use indexes and optimize database queries
5. Rate limiting: Prevent abuse and ensure fair resource usage
6. Async processing: Handle long-running tasks asynchronously

**Express Configuration**:
```typescript
import express from 'express'
import compression from 'compression'
import helmet from 'helmet'

const app = express()

// Enable compression
app.use(compression())

// Security headers
app.use(helmet())

// Request size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connection pooling for Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
})
```

**Performance Targets**:
- API response time (p95): < 200ms
- Database query time (p95): < 100ms
- WebSocket latency: < 50ms
- Concurrent connections: Support 1000+ simultaneous users

### Database Performance

**Optimization Strategies**:
1. Indexing: Create indexes on frequently queried columns
2. Connection pooling: Configure appropriate pool size (10-20 connections)
3. Query optimization: Use EXPLAIN to analyze and optimize slow queries
4. Read replicas: Use Supabase read replicas for read-heavy workloads (if available)

**Supabase Configuration**:
```typescript
const poolConfig = {
  max: 10,                    // Maximum pool size
  min: 2,                     // Minimum pool size
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000 // Timeout connection attempts after 2s
}
```

### Socket.IO Performance

**Optimization Strategies**:
1. Use WebSocket transport when possible (lower latency than polling)
2. Implement room-based messaging to reduce broadcast overhead
3. Enable compression for Socket.IO messages
4. Set appropriate ping/pong timeouts

**Socket.IO Configuration**:
```typescript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  perMessageDeflate: {
    threshold: 1024 // Compress messages larger than 1KB
  }
})
```

## Security Considerations

### Secrets Management

**Strategy**: Store all sensitive credentials as environment variables, never commit to version control

**Implementation**:
1. Use platform-specific environment variable management (Vercel/Railway dashboards)
2. Rotate secrets regularly (JWT_SECRET, SESSION_SECRET, API keys)
3. Use different credentials for development, staging, and production
4. Implement secret scanning in CI/CD pipeline

**Environment Variable Security Checklist**:
- [ ] All secrets are stored as environment variables
- [ ] .env files are in .gitignore
- [ ] Production secrets are different from development
- [ ] Secrets have minimum 32 character length
- [ ] Secrets are rotated every 90 days
- [ ] Access to production secrets is restricted

### CORS Security

**Strategy**: Restrict CORS to only allow requests from trusted frontend domain

**Implementation**:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Only allow specific domain
  credentials: true,                 // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}

app.use(cors(corsOptions))
```

**Security Checklist**:
- [ ] CORS origin is set to specific domain (not '*')
- [ ] Credentials are only enabled when necessary
- [ ] Allowed methods are restricted to required ones
- [ ] Preflight requests are handled correctly

### Authentication Security

**Strategy**: Use secure JWT tokens with appropriate expiration and refresh logic

**Implementation**:
```typescript
import jwt from 'jsonwebtoken'

function generateAccessToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  )
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  )
}

function verifyToken(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as JWTPayload)
    })
  })
}
```

**Security Checklist**:
- [ ] JWT secret is cryptographically random (32+ characters)
- [ ] Access tokens have short expiration (15 minutes)
- [ ] Refresh tokens are stored securely (httpOnly cookies)
- [ ] Token verification is performed on all protected routes
- [ ] Failed authentication attempts are logged

### HTTPS Enforcement

**Strategy**: All traffic must use HTTPS, no HTTP allowed

**Implementation**:
- Vercel provides automatic HTTPS with Let's Encrypt certificates
- Railway provides automatic HTTPS for all services
- Redirect HTTP to HTTPS in Express middleware (if needed)

```typescript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`)
  } else {
    next()
  }
})
```

**Security Checklist**:
- [ ] All deployment URLs use HTTPS
- [ ] HTTP requests are redirected to HTTPS
- [ ] SSL certificates are valid and auto-renewing
- [ ] HSTS header is set

### Input Validation

**Strategy**: Validate and sanitize all user inputs to prevent injection attacks

**Implementation**:
```typescript
import { body, validationResult } from 'express-validator'

app.post('/api/users',
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3, max: 20 }).trim().escape(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // Process valid input
  }
)
```

**Security Checklist**:
- [ ] All user inputs are validated
- [ ] SQL injection is prevented (use parameterized queries)
- [ ] XSS is prevented (sanitize HTML inputs)
- [ ] File uploads are validated (type, size, content)
- [ ] Rate limiting is implemented

### Security Headers

**Strategy**: Set security headers to protect against common web vulnerabilities

**Implementation**:
```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

**Security Checklist**:
- [ ] Content-Security-Policy header is set
- [ ] X-Frame-Options is set to DENY or SAMEORIGIN
- [ ] X-Content-Type-Options is set to nosniff
- [ ] Strict-Transport-Security (HSTS) is enabled
- [ ] X-XSS-Protection is enabled

## Dependencies

### Frontend Dependencies

**Core Dependencies**:
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.x
- socket.io-client: ^4.x
- axios or fetch: For API calls

**Build Tools**:
- vite: ^5.x
- @vitejs/plugin-react: ^4.x
- typescript: ^5.x (if using TypeScript)

**Development Dependencies**:
- @types/react: ^18.x
- @types/react-dom: ^18.x
- eslint: ^8.x
- prettier: ^3.x

### Backend Dependencies

**Core Dependencies**:
- express: ^4.18.0
- socket.io: ^4.x
- @supabase/supabase-js: ^2.x
- cloudinary: ^1.x
- cors: ^2.8.5
- helmet: ^7.x
- compression: ^1.7.4
- dotenv: ^16.x

**Authentication**:
- jsonwebtoken: ^9.x
- passport: ^0.6.x
- passport-google-oauth20: ^2.x
- express-session: ^1.17.x

**Validation**:
- express-validator: ^7.x

**Development Dependencies**:
- nodemon: ^3.x
- typescript: ^5.x (if using TypeScript)
- @types/express: ^4.x
- @types/node: ^20.x
- eslint: ^8.x
- prettier: ^3.x

### Platform Services

**Vercel**:
- Account: Free tier supports hobby projects
- CLI: vercel (npm package for local testing)
- Integration: GitHub app for automatic deployments

**Railway**:
- Account: Free tier with $5 monthly credit
- CLI: railway (npm package for local development)
- Integration: GitHub app for automatic deployments

**Supabase**:
- Account: Free tier with 500MB database
- Client library: @supabase/supabase-js
- Connection: PostgreSQL connection string

**Cloudinary**:
- Account: Free tier with 25GB storage
- SDK: cloudinary npm package
- API: REST API for uploads

**Google OAuth**:
- Google Cloud Console project
- OAuth 2.0 credentials (Client ID and Secret)
- Authorized redirect URIs configured

### External Services Configuration

**Supabase Setup**:
1. Create project in Supabase dashboard
2. Copy project URL and API keys
3. Set up database schema and tables
4. Configure Row Level Security (RLS) policies
5. Enable realtime features if needed

**Cloudinary Setup**:
1. Create account at cloudinary.com
2. Copy cloud name, API key, and API secret
3. Configure upload presets (optional)
4. Set up folder structure (optional)

**Google OAuth Setup**:
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - Development: http://localhost:3000/auth/google/callback
   - Production: https://your-backend.railway.app/auth/google/callback
5. Copy Client ID and Client Secret

## Deployment Checklist

### Pre-Deployment

- [ ] All code is committed and pushed to GitHub
- [ ] Environment variables are documented
- [ ] .gitignore includes .env files
- [ ] Dependencies are up to date
- [ ] Tests are passing locally
- [ ] Build succeeds locally

### Vercel Deployment

- [ ] Create Vercel account and connect GitHub
- [ ] Import frontend repository
- [ ] Configure build settings (build command, output directory)
- [ ] Set environment variables (VITE_* variables)
- [ ] Trigger initial deployment
- [ ] Verify deployment is accessible
- [ ] Configure custom domain (optional)
- [ ] Enable automatic deployments from main branch

### Railway Deployment

- [ ] Create Railway account and connect GitHub
- [ ] Create new project and service
- [ ] Import backend repository
- [ ] Configure start command
- [ ] Set environment variables (all backend variables)
- [ ] Trigger initial deployment
- [ ] Verify health check passes
- [ ] Test API endpoints
- [ ] Configure custom domain (optional)
- [ ] Enable automatic deployments from main branch

### Post-Deployment

- [ ] Update backend FRONTEND_URL with Vercel URL
- [ ] Update frontend VITE_API_URL with Railway URL
- [ ] Redeploy both services with updated URLs
- [ ] Test end-to-end functionality
- [ ] Verify CORS is working
- [ ] Test Socket.IO connections
- [ ] Test file uploads to Cloudinary
- [ ] Test Google OAuth flow
- [ ] Run smoke tests
- [ ] Monitor logs for errors
- [ ] Set up monitoring and alerts (optional)

### Monitoring Setup (Optional)

- [ ] Configure Vercel Analytics
- [ ] Configure Railway metrics dashboard
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Set up log aggregation (if needed)
- [ ] Configure alerting for critical errors

## Configuration Files Reference

### Frontend: vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Backend: railway.json (Optional)

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Backend: package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Frontend: package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Environment Variables Template

**Frontend (.env.example)**:
```bash
# API Configuration
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
```

**Backend (.env.example)**:
```bash
# Environment
NODE_ENV=production

# Server Configuration
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
SESSION_SECRET=your-session-secret-min-32-chars

# CORS
FRONTEND_URL=https://your-app.vercel.app
```

## CI/CD Pipeline

### Automatic Deployment Flow

```mermaid
graph LR
    A[Push to GitHub] --> B{Branch?}
    B -->|main| C[Deploy to Production]
    B -->|develop| D[Deploy to Staging]
    B -->|feature/*| E[Deploy Preview]
    
    C --> F[Run Tests]
    D --> F
    E --> F
    
    F --> G{Tests Pass?}
    G -->|Yes| H[Deploy]
    G -->|No| I[Fail Deployment]
    
    H --> J[Health Check]
    J --> K{Healthy?}
    K -->|Yes| L[Success]
    K -->|No| M[Rollback]
```

### GitHub Actions Workflow (Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run tests
        run: cd frontend && npm test
      - name: Build
        run: cd frontend && npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test
      - name: Lint
        run: cd backend && npm run lint

  deploy:
    needs: [test-frontend, test-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy notification
        run: echo "Deploying to production..."
      # Vercel and Railway handle deployment automatically via their GitHub integrations
```

## Troubleshooting Guide

### Issue: Frontend Cannot Connect to Backend

**Symptoms**:
- API calls fail with network errors
- CORS errors in browser console
- 404 or 502 errors

**Solutions**:
1. Verify VITE_API_URL matches Railway backend URL
2. Check backend FRONTEND_URL matches Vercel frontend URL
3. Verify CORS configuration includes frontend URL
4. Check Railway service is running and healthy
5. Test backend health endpoint directly

### Issue: Socket.IO Connection Fails

**Symptoms**:
- WebSocket connection errors
- Chat features not working
- Connection timeout errors

**Solutions**:
1. Verify Socket.IO CORS includes frontend URL
2. Check transports include both 'websocket' and 'polling'
3. Verify Railway service supports WebSocket connections
4. Test with polling transport only to isolate issue
5. Check Railway logs for connection errors

### Issue: Environment Variables Not Loading

**Symptoms**:
- Application crashes on startup
- "undefined" errors for environment variables
- Features not working

**Solutions**:
1. Verify all required variables are set in platform dashboard
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding new variables
4. Verify .env.example is up to date
5. Check for typos in variable names

### Issue: Build Fails

**Symptoms**:
- Deployment fails during build step
- Build errors in logs
- Dependencies not found

**Solutions**:
1. Verify package.json has correct dependencies
2. Check Node version matches between local and platform
3. Clear build cache and retry
4. Verify build command is correct
5. Check for syntax errors in code

### Issue: Database Connection Fails

**Symptoms**:
- API returns 500 errors
- "Connection refused" errors
- Database timeout errors

**Solutions**:
1. Verify DATABASE_URL is correct
2. Check Supabase project is active
3. Verify connection pool settings
4. Check network connectivity from Railway to Supabase
5. Test connection string locally

### Issue: Google OAuth Fails

**Symptoms**:
- OAuth redirect fails
- "Invalid redirect URI" error
- Authentication doesn't complete

**Solutions**:
1. Verify redirect URI in Google Console matches backend URL + '/auth/google/callback'
2. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
3. Verify OAuth consent screen is configured
4. Test in incognito mode to rule out cookie issues
5. Check backend logs for detailed error messages

### Issue: File Upload Fails

**Symptoms**:
- Upload returns error
- Files not appearing in Cloudinary
- Timeout errors

**Solutions**:
1. Verify Cloudinary credentials are correct
2. Check file size limits
3. Verify upload preset configuration (if used)
4. Check Cloudinary account quota
5. Test upload with smaller file

## Maintenance and Updates

### Regular Maintenance Tasks

**Weekly**:
- Review application logs for errors
- Check uptime and performance metrics
- Monitor resource usage (bandwidth, storage)

**Monthly**:
- Update dependencies to latest stable versions
- Review and rotate secrets if needed
- Check for security advisories
- Review and optimize database queries
- Analyze bundle size and performance metrics

**Quarterly**:
- Conduct security audit
- Review and update documentation
- Evaluate platform costs and optimization opportunities
- Test disaster recovery procedures

### Updating Dependencies

```bash
# Frontend
cd frontend
npm outdated
npm update
npm audit fix

# Backend
cd backend
npm outdated
npm update
npm audit fix

# Test after updates
npm test
npm run build
```

### Scaling Considerations

**When to Scale**:
- Response times consistently exceed targets
- Database connection pool frequently exhausted
- CPU/memory usage consistently high
- User growth exceeds current capacity

**Scaling Options**:

**Vercel**:
- Automatic edge caching and CDN
- Scales automatically with traffic
- Upgrade to Pro plan for higher limits

**Railway**:
- Vertical scaling: Increase CPU/memory allocation
- Horizontal scaling: Add more service instances (Pro plan)
- Database scaling: Upgrade Supabase plan

**Supabase**:
- Upgrade to Pro plan for more connections
- Enable read replicas for read-heavy workloads
- Optimize queries and add indexes

## Conclusion

This design document provides a comprehensive blueprint for deploying a MERN stack application to production using Vercel (frontend), Railway (backend), and Supabase (database). The architecture prioritizes developer experience, security, and scalability while minimizing operational complexity through managed platform services.

Key implementation priorities:
1. Secure environment variable management across all platforms
2. Proper CORS and Socket.IO configuration for cross-origin communication
3. Comprehensive testing strategy including unit, integration, and smoke tests
4. Performance optimization for both frontend and backend
5. Security best practices including HTTPS, authentication, and input validation

The deployment process is designed to be automated through GitHub integration, enabling continuous deployment with minimal manual intervention. Regular maintenance and monitoring ensure the application remains secure, performant, and reliable in production.
