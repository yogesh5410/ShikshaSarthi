# Testing Audio Quiz History - Debugging Guide

## Issue
Audio quiz history page shows "No Audio Quiz Attempts Yet" even after completing quizzes.

## Root Cause Analysis

The issue could be:
1. **Student ID mismatch** - Frontend sending wrong studentId
2. **Data not being saved** - API call failing silently
3. **Data saved but query not finding it** - studentId format issue

## Step-by-Step Debugging

### Step 1: Check Student Data in localStorage

Open browser console (F12) and run:
```javascript
const studentData = localStorage.getItem("student");
console.log("Student Data:", JSON.parse(studentData));
```

Look for the `studentId` field. It should be something like "STU001", NOT a MongoDB ObjectId.

### Step 2: Check if Audio Quiz is Saving

When you complete an audio quiz, check browser console for these logs:
- 🎯 Starting to save audio quiz attempt...
- 📝 Student cookie data: {...}
- ✅ Student info: {studentId: "STU001", ...}
- 📊 Quiz stats: {...}
- 📤 Sending attempt data to backend: {...}
- ✅ Audio quiz attempt saved successfully: {...}

**If you see ❌ errors**, note the error message.

### Step 3: Check Backend Logs

In the terminal where backend is running, you should see:
```
Received audio quiz attempt: { studentId: 'STU001', subject: '...', topic: '...', score: ... }
Audio quiz attempt saved successfully: <some_id>
```

### Step 4: Manually Test API

#### Create a test attempt:
```bash
curl -X POST http://localhost:5000/api/audio-questions/test-attempt \
  -H "Content-Type: application/json"
```

Expected response:
```json
{"message":"Test attempt created","id":"..."}
```

#### Fetch attempts for STU001:
```bash
curl http://localhost:5000/api/audio-questions/attempts/STU001
```

Expected response: Array of attempts or empty array `[]`

### Step 5: Check MongoDB Directly

If you have MongoDB Compass or mongo shell:
```javascript
use ShikshaSarthi  // or your database name
db.audioquizattempts.find({}).pretty()
```

This will show ALL audio quiz attempts in the database.

### Step 6: Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Complete an audio quiz
4. Look for a POST request to `/api/audio-questions/attempt`
5. Check:
   - Request payload (what's being sent)
   - Response (200 OK or error)
   - Response body (success message or error)

## Common Fixes

### Fix 1: StudentId is MongoDB ObjectId instead of "STU001"

If student data looks like:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentId": "STU001",
  ...
}
```

The code should use `student.studentId`, NOT `student._id`.

**Already fixed in AudioQuizPlayer.tsx line 208:**
```typescript
const studentId = student.studentId || student._id;
```

### Fix 2: API URL is wrong

Check `.env` file:
```
VITE_API_URL=http://localhost:5000
```

NOT:
```
VITE_API_URL=http://localhost:5000/api
```

The `/api` is already added in the route paths.

### Fix 3: Backend not running

Start backend:
```bash
cd /home/priyanshu-vishwakarma/Desktop/NNMS/ShikshaSarthi/backend
node index.js
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ Connected to MongoDB
```

### Fix 4: CORS issue

If you see CORS errors in console, the backend needs to allow your frontend origin.

Check `backend/index.js` has:
```javascript
app.use(cors());
```

## Quick Test Procedure

1. **Start Backend**: `cd backend && node index.js`
2. **Open Frontend**: Navigate to audio quiz
3. **Open Console**: Press F12
4. **Complete Quiz**: Answer all questions and finish
5. **Check Console**: Look for the 🎯 ✅ ❌ emoji logs
6. **Go to History**: Click "View History" or go to `/student/audio-quiz-history`
7. **Check if attempt appears**: Should show your recent attempt

## If Still Not Working

Add this temporary debug code to AudioQuizHistory.tsx after line 106:

```typescript
console.log("🔍 Fetching attempts for studentId:", studentId);
console.log("🔍 API URL:", `${API_URL}/audio-questions/attempts/${studentId}`);
console.log("🔍 Response data:", response.data);
```

This will show exactly what API is being called and what data is returned.

## Contact Points

- Frontend save logic: `src/pages/student/AudioQuizPlayer.tsx` line 194-325
- Backend save route: `backend/routes/audioQuestions.js` line 200-240
- Backend fetch route: `backend/routes/audioQuestions.js` line 260-275
- Database model: `backend/models/AudioQuizAttempt.js`
