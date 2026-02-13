# Manual Testing Checklist

## Before You Start
- [ ] Backend server is running (`cd backend && npm start`)
- [ ] Frontend dev server is running (`npm run dev`)
- [ ] MongoDB is connected
- [ ] Browser DevTools open (F12)

---

## Test 1: Analytics Endpoint (Backend)

### Preparation
```bash
# Find a quiz ID with puzzle questions
# You can check in MongoDB or use an existing quiz
```

### Steps
1. [ ] Open Postman or use curl
2. [ ] Test: `GET http://localhost:5000/api/quizzes/analytics/:quizId`
3. [ ] Replace `:quizId` with actual quiz ID

### Expected Results
- [ ] ✅ Status Code: 200 OK
- [ ] ✅ Response contains `quizInfo` object
- [ ] ✅ Response contains `studentReports` array
- [ ] ✅ Response contains `sectionRankings` with mcq, audio, video, puzzle
- [ ] ✅ Response contains `sectionAverages`
- [ ] ❌ NO CastError in backend console
- [ ] ❌ NO "ObjectId failed" error

### Example Response Structure
```json
{
  "quizInfo": { "quizId": "...", "totalQuestions": 50, ... },
  "totalAttempts": 10,
  "studentReports": [...],
  "sectionRankings": {
    "mcq": [...],
    "audio": [...],
    "video": [...],
    "puzzle": [...]
  },
  "sectionAverages": { "mcq": "85.50", ... },
  "averageScore": "82.30",
  "highestScore": 95,
  "lowestScore": 65
}
```

---

## Test 2: Puzzle Images (Frontend)

### Preparation
1. [ ] Login as a student
2. [ ] Load a quiz containing Match Pieces puzzle
3. [ ] Navigate to the puzzle question

### Steps
1. [ ] Check puzzle pieces display correctly
2. [ ] Check reference image in top-right corner
3. [ ] Open browser DevTools → Network tab
4. [ ] Filter by "images"
5. [ ] Look for memory_*.png requests

### Expected Results - Visual
- [ ] ✅ All puzzle pieces show image portions
- [ ] ✅ Reference image displays full image
- [ ] ✅ No "Image Not Found" placeholders
- [ ] ✅ Images are colorful and clear
- [ ] ✅ Drag and drop works smoothly

### Expected Results - Network Tab
- [ ] ✅ All memory_*.png files: Status 200
- [ ] ✅ Image sizes reasonable (< 1MB each)
- [ ] ❌ NO 404 errors for images
- [ ] ❌ NO CORS errors

### Expected Results - Console
- [ ] ❌ NO red error messages
- [ ] ❌ NO "Failed to load image" errors
- [ ] ⚠️ Warnings are OK (deprecated baseUrl is expected)

### Test Puzzle Gameplay
- [ ] Drag pieces from left panel to grid
- [ ] Pieces snap into 3x3 grid
- [ ] Correct placements show green checkmark
- [ ] Timer counts down
- [ ] Can complete puzzle
- [ ] Completion overlay shows

---

## Test 3: Analytics UI (Frontend - Student)

### Preparation
1. [ ] Complete a quiz with puzzle questions
2. [ ] View results page

### Steps
1. [ ] Navigate to quiz results
2. [ ] Check section-wise rankings card
3. [ ] Check leaderboard section
4. [ ] Check comparative charts

### Expected Results
- [ ] ✅ Section Rankings card shows all 4 sections
- [ ] ✅ MCQ, Audio, Video, Puzzle ranks display
- [ ] ✅ Crown/Medal badges show for top 3
- [ ] ✅ Leaderboard displays top 10 students
- [ ] ✅ Bar chart shows section-wise scores
- [ ] ✅ Current student highlighted if in top 10
- [ ] ❌ NO "undefined" or "NaN" values

---

## Test 4: Analytics UI (Frontend - Teacher)

### Preparation
1. [ ] Login as a teacher
2. [ ] Navigate to Comprehensive Analytics

### Steps
1. [ ] Enter quiz ID with puzzle questions
2. [ ] Click "Load Analytics"
3. [ ] Check all tabs and sections

### Expected Results

#### Quiz Info Section
- [ ] ✅ Quiz title displays
- [ ] ✅ Total students count correct
- [ ] ✅ Average, highest, lowest scores shown

#### Student Performance Table
- [ ] ✅ All students listed
- [ ] ✅ Correct/Incorrect/Unattempted counts
- [ ] ✅ Percentage calculated correctly
- [ ] ✅ Color-coded badges (Green/Blue/Yellow/Red)

#### Performance Distribution Chart
- [ ] ✅ Pie chart renders
- [ ] ✅ Shows 4 categories (0-25%, 26-50%, 51-75%, 76-100%)
- [ ] ✅ Percentages add up to 100%

#### Section-wise Class Performance
- [ ] ✅ Bar chart displays
- [ ] ✅ Shows MCQ, Audio, Video, Puzzle averages
- [ ] ✅ Only shows sections with questions

#### Section-wise Leaderboards Tabs
- [ ] ✅ MCQ tab shows MCQ leaderboard
- [ ] ✅ Audio tab shows Audio leaderboard
- [ ] ✅ Video tab shows Video leaderboard
- [ ] ✅ Puzzle tab shows Puzzle leaderboard
- [ ] ✅ Each tab shows top 10 students
- [ ] ✅ Crown/Medal badges for top 3

#### Overall Performance Radar Chart
- [ ] ✅ Radar chart renders
- [ ] ✅ Shows 5 axes (MCQ, Audio, Video, Puzzle, Overall)
- [ ] ✅ Blue filled area shows class average

---

## Test 5: Error Handling

### Test 5A: Fallback Image
**Purpose:** Verify fallback mechanism works

1. [ ] Stop frontend dev server
2. [ ] Temporarily rename `public/images/memory_1.png`
3. [ ] Restart frontend
4. [ ] Load puzzle question

**Expected:**
- [ ] ✅ Fallback placeholder displays (cyan/white)
- [ ] ✅ Puzzle still playable
- [ ] ❌ NO JavaScript errors in console
- [ ] ❌ NO broken image icons

5. [ ] Restore original filename
6. [ ] Refresh page
7. [ ] Images should load normally again

### Test 5B: Invalid Quiz ID
**Purpose:** Verify graceful error handling

1. [ ] In teacher analytics, enter invalid quiz ID
2. [ ] Click "Load Analytics"

**Expected:**
- [ ] ✅ Error message displays
- [ ] ✅ "Quiz not found" or similar
- [ ] ❌ NO app crash
- [ ] ❌ NO blank screen

### Test 5C: Network Error
**Purpose:** Verify app handles network issues

1. [ ] Open Network tab in DevTools
2. [ ] Switch to "Offline" mode
3. [ ] Try to load analytics

**Expected:**
- [ ] ✅ Error message displays
- [ ] ✅ "Network error" or similar
- [ ] ❌ NO infinite loading spinner
- [ ] ❌ NO app crash

---

## Test 6: Cross-Browser Testing

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Edge (if on Windows)

### For Each Browser
1. [ ] Load puzzle question
2. [ ] Verify images display
3. [ ] Test drag and drop
4. [ ] Check console for errors
5. [ ] Load analytics page
6. [ ] Verify charts render

---

## Test 7: Mobile/Responsive Testing

### Devices to Test
- [ ] Mobile phone (actual device or DevTools mobile view)
- [ ] Tablet (iPad or DevTools tablet view)

### For Each Device
1. [ ] Load puzzle question
2. [ ] Verify layout is responsive
3. [ ] Test touch drag and drop
4. [ ] Check images scale properly
5. [ ] Load analytics page
6. [ ] Verify charts are readable

---

## Test 8: Performance Testing

### Load Time
1. [ ] Open DevTools → Network tab
2. [ ] Clear cache (Ctrl+Shift+R)
3. [ ] Load puzzle question
4. [ ] Note load time

**Expected:**
- [ ] ✅ Page loads < 3 seconds
- [ ] ✅ Images load progressively
- [ ] ✅ No significant lag

### Memory Usage
1. [ ] Open DevTools → Performance/Memory tab
2. [ ] Record while playing puzzle
3. [ ] Complete puzzle
4. [ ] Check memory usage

**Expected:**
- [ ] ✅ No memory leaks
- [ ] ✅ Smooth gameplay (60fps)
- [ ] ✅ No freezing or stuttering

---

## Test 9: Data Accuracy

### Verify Calculations
1. [ ] Complete a quiz with known scores
2. [ ] Manually calculate section-wise scores
3. [ ] Compare with displayed results

**Check:**
- [ ] ✅ MCQ score matches manual calculation
- [ ] ✅ Audio score matches manual calculation
- [ ] ✅ Video score matches manual calculation
- [ ] ✅ Puzzle score matches manual calculation
- [ ] ✅ Overall percentage correct

### Verify Rankings
1. [ ] Check teacher analytics leaderboard
2. [ ] Verify students are ranked correctly
3. [ ] Compare section rankings

**Check:**
- [ ] ✅ Top student in MCQ tab has highest MCQ score
- [ ] ✅ Rankings match score order
- [ ] ✅ Ties handled correctly

---

## Test 10: Edge Cases

### Empty Quiz
1. [ ] Load analytics for quiz with no submissions

**Expected:**
- [ ] ✅ Shows "No students attempted" message
- [ ] ✅ Charts show empty state
- [ ] ❌ NO division by zero errors

### Single Student
1. [ ] Load analytics for quiz with 1 student

**Expected:**
- [ ] ✅ Shows that 1 student
- [ ] ✅ Ranks show #1 / 1
- [ ] ✅ Charts render correctly

### All Wrong Answers
1. [ ] Student gets 0% on a quiz
2. [ ] View results

**Expected:**
- [ ] ✅ Shows 0% correctly
- [ ] ✅ Red badge indicates poor performance
- [ ] ✅ Still shows in rankings (last place)

### All Correct Answers
1. [ ] Student gets 100% on a quiz
2. [ ] View results

**Expected:**
- [ ] ✅ Shows 100% correctly
- [ ] ✅ Green badge indicates excellent performance
- [ ] ✅ Shows #1 rank (if highest)

---

## Post-Testing

### If All Tests Pass ✅
- [ ] Document any minor issues found
- [ ] Note any performance concerns
- [ ] Update this checklist with any missing tests
- [ ] Mark as READY FOR PRODUCTION

### If Tests Fail ❌
- [ ] Document exact error messages
- [ ] Note steps to reproduce
- [ ] Check browser console for errors
- [ ] Check backend logs for errors
- [ ] File bug report with details

---

## Sign-Off

### Tester Information
- **Name:** _________________________
- **Date:** _________________________
- **Environment:** _________________________

### Test Results
- **Tests Passed:** _____ / _____
- **Tests Failed:** _____ / _____
- **Overall Status:** ☐ PASS  ☐ FAIL  ☐ NEEDS WORK

### Notes
```
[Add any additional observations or concerns here]




```

### Approval
- [ ] Ready for production deployment
- [ ] Requires additional fixes
- [ ] Needs further testing

**Signature:** _________________________
**Date:** _________________________

---

## Quick Command Reference

### Start Services
```bash
# Backend
cd backend && npm start

# Frontend
npm run dev

# MongoDB (if not running)
sudo systemctl start mongod
```

### Check Logs
```bash
# Backend logs
cd backend && npm start | tee backend.log

# Check for errors
grep -i error backend.log
```

### Test URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Analytics: http://localhost:5000/api/quizzes/analytics/:quizId

### Browser DevTools
- Open: F12 or Ctrl+Shift+I
- Console: Shows JavaScript errors
- Network: Shows HTTP requests and image loading
- Elements: Inspect HTML/CSS

---

**Checklist Version:** 1.0
**Last Updated:** February 13, 2026
