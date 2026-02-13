# Timeout Auto-Submit Fix

## Problem
When a student's quiz timer expired and the quiz auto-submitted, the answers were not being evaluated correctly, resulting in a score of 0/0 or 0/total.

## Root Cause
This was a **React closure issue**. When the timer interval was set up in the `useEffect` hook, it captured the `handleSubmitQuiz` function with the current state values (`answers` and `questions`). However, when the timer expired later, the closure still referenced the old state values instead of the current ones.

Here's what happened:
1. Quiz starts → `answers` state is `[]`
2. Timer interval is created → captures current `answers` (empty array)
3. Student answers questions → `answers` state updates to `[{...}, {...}]`
4. Timer expires → interval callback executes with the OLD captured `answers` (still empty `[]`)
5. Submission happens with empty answers → Score calculated as 0

## Solution
We implemented a **ref-based solution** to ensure the submission function always has access to the latest state values:

### Changes Made to `AdvancedQuizPlayer.tsx`

1. **Added refs to track current state:**
```typescript
const answersRef = useRef<Answer[]>([]);
const questionsRef = useRef<QuestionData[]>([]);
```

2. **Keep refs in sync with state:**
```typescript
useEffect(() => {
  answersRef.current = answers;
}, [answers]);

useEffect(() => {
  questionsRef.current = questions;
}, [questions]);
```

3. **Modified `handleSubmitQuiz` to use refs:**
```typescript
const handleSubmitQuiz = async (timeUp: boolean = false) => {
  // Use refs to get the latest state values
  const currentAnswers = answersRef.current;
  const currentQuestions = questionsRef.current;
  
  // Rest of the submission logic uses currentAnswers and currentQuestions
  // instead of the state variables directly
```

## Why This Works
- **Refs persist across renders** and don't trigger re-renders when updated
- **Refs are mutable** and always contain the latest value
- When the timer callback executes, it calls `handleSubmitQuiz()` which then reads the **current** values from the refs
- This ensures the submission always uses the most up-to-date answers, regardless of when the function was created

## Testing
To verify this fix works:

1. **Start an advanced quiz** as a student
2. **Answer some questions** (e.g., 3 out of 5 correctly)
3. **Let the timer expire** instead of clicking submit
4. **Verify the results** show the correct score (e.g., 3/5) not 0/5

### Expected Behavior After Fix
- ✅ Auto-submit on timeout evaluates all answered questions
- ✅ Score is calculated correctly (e.g., 3/5, 60%)
- ✅ Backend receives the evaluated answers
- ✅ StudentReport is saved with correct score

### What Was Broken Before
- ❌ Auto-submit on timeout showed 0/5 or 0 score
- ❌ Answers appeared not to be evaluated
- ❌ Backend received empty or incorrect answer data

## Related Code
- Frontend: `/src/pages/student/AdvancedQuizPlayer.tsx`
- Backend: `/backend/routes/quiz.js` (submit-advanced endpoint)
- Model: `/backend/models/StudentReport.js`

## Date Fixed
February 14, 2026
