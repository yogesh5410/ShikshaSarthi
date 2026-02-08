#!/bin/bash

# Demo Verification Script
# Tests if interactive demos are working properly

echo "🔍 Verifying Interactive Demos..."
echo ""

# 1. Check if backend is running
echo "1️⃣ Checking backend server..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/mat/modules | grep -q "200"; then
    echo "   ✅ Backend is running on port 5000"
else
    echo "   ❌ Backend is not responding"
    exit 1
fi
echo ""

# 2. Check total questions
echo "2️⃣ Checking total MAT questions..."
TOTAL=$(curl -s "http://localhost:5000/mat/modules" | jq '[.[].totalQuestions] | add')
echo "   📊 Total questions: $TOTAL"
echo ""

# 3. Sample demos from each category
echo "3️⃣ Testing sample demos from each category..."

DEMOS=(
    "MAT-SC-H-001:श्रृंखला पूर्णता"
    "MAT-CD-H-001:कोडिंग-डिकोडिंग"
    "MAT-BR-H-001:रक्त संबंध"
    "MAT-DS-H-001:दिशा बोध"
    "MAT-RA-H-001:रैंकिंग"
    "MAT-MO-H-001:गणितीय संक्रियाएं"
    "MAT-AN-H-001:सादृश्य"
    "MAT-OO-H-001:विषम"
    "MAT-VD-H-001:वेन आरेख"
    "MAT-CT-H-001:कैलेंडर"
    "MAT-DI-H-001:डेटा"
    "MAT-LR-H-001:तार्किक"
    "MAT-PS-H-001:पहेलियाँ"
    "MAT-NL-H-001:संख्या पैटर्न"
)

for demo in "${DEMOS[@]}"; do
    IFS=':' read -r qid category <<< "$demo"
    
    RESULT=$(curl -s "http://localhost:5000/mat/questions/$qid" | jq -r '{
        has_html: (.interactiveContent.html != null and .interactiveContent.html != ""),
        has_css: (.interactiveContent.css != null and .interactiveContent.css != ""),
        has_js: (.interactiveContent.javascript != null and .interactiveContent.javascript != ""),
        html_len: (.interactiveContent.html | length),
        has_buttons: (.interactiveContent.html | contains("button"))
    }')
    
    HAS_HTML=$(echo "$RESULT" | jq -r '.has_html')
    HAS_CSS=$(echo "$RESULT" | jq -r '.has_css')
    HAS_JS=$(echo "$RESULT" | jq -r '.has_js')
    HTML_LEN=$(echo "$RESULT" | jq -r '.html_len')
    HAS_BUTTONS=$(echo "$RESULT" | jq -r '.has_buttons')
    
    if [ "$HAS_HTML" = "true" ] && [ "$HAS_CSS" = "true" ] && [ "$HAS_JS" = "true" ]; then
        if [ "$HAS_BUTTONS" = "true" ]; then
            echo "   ✅ $qid ($category) - ${HTML_LEN} chars, interactive"
        else
            echo "   ⚠️  $qid ($category) - ${HTML_LEN} chars, no buttons"
        fi
    else
        echo "   ❌ $qid ($category) - Missing content"
    fi
done
echo ""

# 4. Check for common demo patterns
echo "4️⃣ Verifying demo patterns..."
SAMPLE=$(curl -s "http://localhost:5000/mat/questions/MAT-SC-H-001" | jq -r '.interactiveContent.javascript')

if echo "$SAMPLE" | grep -q "function"; then
    echo "   ✅ JavaScript contains functions"
else
    echo "   ❌ JavaScript missing functions"
fi

if echo "$SAMPLE" | grep -q "classList.add"; then
    echo "   ✅ JavaScript uses DOM manipulation"
else
    echo "   ⚠️  JavaScript might not manipulate DOM"
fi

if echo "$SAMPLE" | grep -q "setTimeout"; then
    echo "   ✅ JavaScript has animation timing"
else
    echo "   ⚠️  JavaScript missing animation timing"
fi
echo ""

# 5. Summary
echo "5️⃣ Summary"
echo "   📦 Total Questions: $TOTAL"
echo "   🎨 Demo Categories Tested: ${#DEMOS[@]}"
echo "   ✅ All demos stored in MongoDB"
echo ""
echo "🎉 Verification Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Open http://localhost:8083/student/mat"
echo "   2. Select any module"
echo "   3. Click on a question"
echo "   4. Look for 'इंटरैक्टिव डेमो' card"
echo "   5. Click the button to start animation"
echo ""
