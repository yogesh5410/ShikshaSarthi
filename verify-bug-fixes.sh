#!/bin/bash

# Analytics and Puzzle Bugs - Testing Script
# Run this script to verify all bug fixes

echo "=================================================="
echo "  ShikshaSarthi Bug Fix Verification"
echo "  Date: $(date)"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "=================================================="
echo "  STEP 1: Backend Syntax Validation"
echo "=================================================="
echo ""

# Check backend files exist
if [ ! -f "backend/routes/quiz.js" ]; then
    print_result 1 "backend/routes/quiz.js exists"
    echo -e "${RED}Error: backend/routes/quiz.js not found${NC}"
    exit 1
else
    print_result 0 "backend/routes/quiz.js exists"
fi

# Validate backend syntax
echo ""
echo "Checking backend/routes/quiz.js syntax..."
cd backend
node -c routes/quiz.js 2>&1
if [ $? -eq 0 ]; then
    print_result 0 "quiz.js syntax is valid"
else
    print_result 1 "quiz.js syntax is valid"
fi

node -c routes/report.js 2>&1
if [ $? -eq 0 ]; then
    print_result 0 "report.js syntax is valid"
else
    print_result 1 "report.js syntax is valid"
fi

cd ..

echo ""
echo "=================================================="
echo "  STEP 2: Frontend File Validation"
echo "=================================================="
echo ""

# Check frontend files
FILES=(
    "src/components/puzzles/EmbeddableMatchPieces.tsx"
    "src/pages/student/AdvancedQuizPlayer.tsx"
    "src/pages/student/AdvancedQuizResults.tsx"
    "src/pages/teacher/QuizAnalytics.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        print_result 0 "$file exists"
    else
        print_result 1 "$file exists"
    fi
done

echo ""
echo "=================================================="
echo "  STEP 3: Image Files Validation"
echo "=================================================="
echo ""

# Check if images directory exists
if [ -d "public/images" ]; then
    print_result 0 "public/images directory exists"
    
    # Count memory images
    IMAGE_COUNT=$(ls -1 public/images/memory_*.png 2>/dev/null | wc -l)
    echo "   Found $IMAGE_COUNT memory images"
    
    if [ $IMAGE_COUNT -eq 21 ]; then
        print_result 0 "All 21 memory images present"
    else
        print_result 1 "All 21 memory images present (found: $IMAGE_COUNT)"
    fi
    
    # Check a few specific images
    for i in 1 2 3 10 20 21; do
        if [ -f "public/images/memory_$i.png" ]; then
            print_result 0 "memory_$i.png exists"
        else
            print_result 1 "memory_$i.png exists"
        fi
    done
else
    print_result 1 "public/images directory exists"
fi

echo ""
echo "=================================================="
echo "  STEP 4: Code Pattern Verification"
echo "=================================================="
echo ""

# Check if the analytics endpoint populate fix is applied
echo "Checking analytics endpoint fix..."
if grep -A5 'router.get("/analytics/:quizId"' backend/routes/quiz.js | grep -q '.populate("questions")'; then
    print_result 1 "Analytics endpoint should NOT have .populate('questions')"
    echo "   Found .populate('questions') in analytics endpoint - this should be removed!"
else
    print_result 0 "Analytics endpoint correctly avoids .populate('questions')"
fi

# Check that other endpoints have try-catch for populate
echo ""
echo "Checking that other endpoints handle populate errors..."
if grep -q 'Question populate skipped' backend/routes/quiz.js; then
    print_result 0 "Other endpoints have error handling for populate"
else
    print_result 1 "Other endpoints have error handling for populate"
fi

# Check if error handling is added to PieceView
echo ""
echo "Checking puzzle image error handling..."
if grep -q "onError.*setImageError" src/components/puzzles/EmbeddableMatchPieces.tsx; then
    print_result 0 "PieceView has image error handling"
else
    print_result 1 "PieceView has image error handling"
    echo "   Missing onError handler in PieceView component"
fi

if grep -q "fallbackImage" src/components/puzzles/EmbeddableMatchPieces.tsx; then
    print_result 0 "PieceView has fallback image mechanism"
else
    print_result 1 "PieceView has fallback image mechanism"
fi

echo ""
echo "=================================================="
echo "  STEP 5: TypeScript Compilation Check"
echo "=================================================="
echo ""

# Note: This is informational - we can't run tsc here without dependencies
echo -e "${YELLOW}ℹ️  Manual Check Required:${NC}"
echo "   Run 'npm run build' to verify TypeScript compilation"
echo "   Expected: No errors in modified files"

echo ""
echo "=================================================="
echo "  SUMMARY"
echo "=================================================="
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All automated tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start backend: cd backend && npm start"
    echo "2. Start frontend: npm run dev"
    echo "3. Test analytics endpoint with a quiz containing puzzles"
    echo "4. Test puzzle game in browser and check image loading"
    echo "5. Check browser console for any errors"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the errors above.${NC}"
    exit 1
fi
