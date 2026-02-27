# Postman Test Examples for Job Portal API

## 1. SIGNUP - POST `/api/auth/signup`

**URL:** `http://localhost:5000/api/auth/signup`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (Raw JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "9876543210",
  "experienceLevel": "fresher",
  "agreeToContact": true,
  "role": "seeker"
}
```

**Expected Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "role": "seeker"
  }
}
```

**Error Response (400) - Missing Fields:**
```json
{
  "errors": [
    {
      "msg": "Please include a valid email",
      "path": "email",
      "location": "body"
    },
    {
      "msg": "Password is required",
      "path": "password",
      "location": "body"
    }
  ]
}
```

---

## 2. LOGIN - POST `/api/auth/login`

**URL:** `http://localhost:5000/api/auth/login`

**Method:** POST

**Headers:**
```
Content-Type: application/json
```

**Body (Raw JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "role": "seeker"
  }
}
```

**Error Response (400) - Invalid Credentials:**
```json
{
  "message": "Invalid Credentials"
}
```

---

## 3. GET JOBS - GET `/api/jobs`

**URL:** `http://localhost:5000/api/jobs`

**Method:** GET

**Headers:**
```
Content-Type: application/json
```

**Expected Response (200):**
Array of job objects

---

## WHERE THE VALIDATION HAPPENS

**File:** `d:/job portal/backend/routes/authRoutes.js`

**SIGNUP Validation (Lines 23-26):**
```javascript
router.post('/signup', [
    check('firstName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phoneNumber', 'Phone number must be at least 10 digits').isLength({ min: 10 })
], async (req, res) => {
```

**LOGIN Validation (Lines 97-99):**
```javascript
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
```

---

## COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| "Please include a valid email" | Email field missing or invalid format | Add valid email in body: `"email": "user@example.com"` |
| "Password is required" | Password field missing | Add password field: `"password": "password123"` |
| "Name is required" | firstName missing | Add firstName field: `"firstName": "John"` |
| "Phone number must be at least 10 digits" | Phone too short | Use 10+ digit number: `"phoneNumber": "9876543210"` |

---

## QUICK CHECKLIST FOR POSTMAN

✅ Set method to **POST**
✅ Use **http://localhost:5000/api/auth/signup** or **login**
✅ Go to **Body** tab
✅ Select **raw**
✅ Select **JSON** from dropdown
✅ Paste the JSON with all required fields
✅ Click **Send**
