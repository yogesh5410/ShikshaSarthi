#!/bin/bash

echo "🔍 Final Demo Verification"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check backend
echo "1️⃣ Checking Backend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/mat/modules | grep -q "200"; then
    echo -e "   ${GREEN}✅ Backend running${NC}"
else
    echo -e "   ${RED}❌ Backend not running${NC}"
    exit 1
fi

# 2. Check frontend
echo "2️⃣ Checking Frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8083 | grep -q "200"; then
    echo -e "   ${GREEN}✅ Frontend running${NC}"
else
    echo -e "   ${RED}❌ Frontend not running${NC}"
    exit 1
fi

# 3. Check demo data
echo "3️⃣ Checking Demo Data..."
DEMO=$(curl -s "http://localhost:5000/mat/questions/MAT-SC-H-001" | jq -r '.interactiveContent | {html: (.html|length), css: (.css|length), js: (.javascript|length)}')
HTML_LEN=$(echo "$DEMO" | jq -r '.html')
CSS_LEN=$(echo "$DEMO" | jq -r '.css')
JS_LEN=$(echo "$DEMO" | jq -r '.js')

if [ "$HTML_LEN" -gt 100 ] && [ "$CSS_LEN" -gt 100 ] && [ "$JS_LEN" -gt 100 ]; then
    echo -e "   ${GREEN}✅ Demo data complete${NC}"
    echo "      HTML: ${HTML_LEN} chars"
    echo "      CSS: ${CSS_LEN} chars"
    echo "      JS: ${JS_LEN} chars"
else
    echo -e "   ${RED}❌ Demo data incomplete${NC}"
    exit 1
fi

# 4. Check button in HTML
echo "4️⃣ Checking Interactive Elements..."
BUTTON_COUNT=$(curl -s "http://localhost:5000/mat/questions/MAT-SC-H-001" | jq -r '.interactiveContent.html' | grep -o "onclick=" | wc -l)
if [ "$BUTTON_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Interactive buttons found: $BUTTON_COUNT${NC}"
else
    echo -e "   ${RED}❌ No interactive buttons${NC}"
fi

# 5. Check function definitions
echo "5️⃣ Checking JavaScript Functions..."
FUNC_COUNT=$(curl -s "http://localhost:5000/mat/questions/MAT-SC-H-001" | jq -r '.interactiveContent.javascript' | grep -o "function " | wc -l)
if [ "$FUNC_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ Functions defined: $FUNC_COUNT${NC}"
else
    echo -e "   ${YELLOW}⚠️  No 'function' keyword (might use arrow functions)${NC}"
fi

# 6. Test all categories
echo ""
echo "6️⃣ Testing All Demo Categories..."
CATEGORIES=(
    "MAT-SC-H-001:श्रृंखला पूर्णता"
    "MAT-CD-H-001:कोडिंग"
    "MAT-BR-H-001:रक्त संबंध"
    "MAT-DS-H-001:दिशा"
    "MAT-VD-H-001:वेन"
)

for cat in "${CATEGORIES[@]}"; do
    IFS=':' read -r qid name <<< "$cat"
    HAS_DATA=$(curl -s "http://localhost:5000/mat/questions/$qid" | jq -r '.interactiveContent.html | length > 100')
    if [ "$HAS_DATA" = "true" ]; then
        echo -e "   ${GREEN}✅${NC} $name ($qid)"
    else
        echo -e "   ${RED}❌${NC} $name ($qid)"
    fi
done

echo ""
echo "=========================="
echo "🎉 Verification Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Open: http://localhost:8083/demo-test"
echo "   2. Check browser console (F12)"
echo "   3. Click demo button"
echo "   4. Watch animation play!"
echo ""
echo "   Full Practice: http://localhost:8083/student/mat"
echo ""

echo "💡 Expected Console Logs:"
echo "   📦 DatabaseInteractiveDemo received"
echo "   🎨 Loading interactive demo..."
echo "   ✅ CSS injected"
echo "   ✅ JavaScript injected and executed"
echo "   ✅ Demo functions loaded successfully"
echo ""
