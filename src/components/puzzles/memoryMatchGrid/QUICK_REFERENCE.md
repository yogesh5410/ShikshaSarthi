# Memory Match Grid - Quick Reference

## 🎮 Game Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    MODE SELECTION                            │
│   👤 Individual Mode    OR    👥 Group Mode                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    PREVIEW PHASE                             │
│   📋 All cards face up - Memorize positions (15s)           │
│   🧠 Timer counts down with blue color                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SOLVE PHASE                               │
│   🎯 Match all 10 pairs (20 cards)                          │
│   ⏱️ 3 minutes timer                                         │
│   ⚡ Track moves and matches                                │
│   🎨 Beautiful 5×4 grid layout                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                END CONDITIONS                                │
│   ✅ All pairs matched        (COMPLETED)                   │
│   ⏱️ Timer runs out           (TIME_UP)                     │
│   ❌ Player exits manually    (EXITED)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    RESULTS                                   │
│   🏆 Score (0-100)                                           │
│   📊 Memory Level (Low → Exceptional)                       │
│   📈 Performance Breakdown                                   │
│   🔄 Play Again or Back to Home                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Card Configuration

```
┌─────────────────────────────────────────────────┐
│           GRID LAYOUT (5 columns × 4 rows)      │
├─────┬─────┬─────┬─────┬─────┐                  │
│ C1  │ C2  │ C3  │ C4  │ C5  │  Row 1            │
├─────┼─────┼─────┼─────┼─────┤                  │
│ C6  │ C7  │ C8  │ C9  │ C10 │  Row 2            │
├─────┼─────┼─────┼─────┼─────┤                  │
│ C11 │ C12 │ C13 │ C14 │ C15 │  Row 3            │
├─────┼─────┼─────┼─────┼─────┤                  │
│ C16 │ C17 │ C18 │ C19 │ C20 │  Row 4            │
└─────┴─────┴─────┴─────┴─────┘                  │
                                                   │
Total Cards: 20                                    │
Total Pairs: 10                                    │
Card Ratio: 3:4 (Portrait)                         │
└─────────────────────────────────────────────────┘
```

## ⏱️ Timer States

| Time Remaining | Color   | Icon State | Description           |
|---------------|---------|------------|-----------------------|
| Preview phase | 🔵 Blue | Normal     | Memorization time     |
| > 60 seconds  | 🟢 Green| Normal     | Plenty of time        |
| 30-60 seconds | 🟠 Orange| Normal    | Getting close         |
| < 30 seconds  | 🔴 Red  | Pulsing    | Hurry up!            |

## 🎯 Card States

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   [Image]    │  │      ?       │  │   [Image]    │
│              │  │              │  │   🏆         │
└──────────────┘  └──────────────┘  └──────────────┘
  FACE UP           FACE DOWN        MATCHED
  (showing)         (hidden)         (completed)
```

## 📊 Evaluation Metrics

### Scoring Formula
```
Score = (0.4 × Accuracy) + 
        (0.25 × Efficiency) + 
        (0.2 × Speed) + 
        (0.15 × Control) - 
        Penalty
```

### Components
- **Accuracy**: correctPairs / totalPairs
- **Efficiency**: 1 - (extraClicks / expectedClicks)
- **Speed**: 1 - (timeTaken / maxTime)
- **Control**: 1 - (errors / totalPairs)

### Penalties
- ⚠️ Exited: -20%
- ⏱️ Time Up: -10%
- ✅ Completed: No penalty

### Memory Levels
| Score Range | Level          | Description                    |
|-------------|----------------|--------------------------------|
| 85-100      | Exceptional    | Excellent memory & strategy    |
| 70-84       | High           | Strong working memory          |
| 55-69       | Average        | Normal cognitive performance   |
| 40-54       | Below Average  | Needs practice                 |
| 0-39        | Low            | Poor memory recall             |

## 🎨 UI Components

### Stats Bar
```
┌────────────────────────────────────────────────────┐
│  🎯 Matches: 5/10  ⚡ Moves: 12  🕐 2:45  ❌ Exit │
└────────────────────────────────────────────────────┘
```

### Result Card
```
┌──────────────────────────────────┐
│          🏆                       │
│   Assessment Complete!            │
│                                   │
│      ┌─────────┐                 │
│      │   85    │  (Circular)     │
│      │  /100   │  (Animated)     │
│      └─────────┘                 │
│                                   │
│  Memory Level: Exceptional        │
│  Feedback: Excellent performance  │
│                                   │
│  📊 Breakdown:                    │
│  [Accuracy] [Efficiency]          │
│  [Speed]    [Control]             │
│                                   │
│  [Play Again] [Back to Home]      │
└──────────────────────────────────┘
```

## 🔧 Key Files

| File                    | Purpose                           |
|-------------------------|-----------------------------------|
| `memoryMatchGrid.tsx`   | Main game component               |
| `imageUtils.ts`         | Image management utilities        |
| `puzzles.js` (backend)  | Evaluation API endpoint           |

## 🚀 Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run backend
cd backend
node index.js
```

## 📝 Configuration Variables

```typescript
// In memoryMatchGrid.tsx
const PREVIEW_TIME = 15;    // Memorization phase
const SOLVE_TIME = 180;     // Game duration
const TOTAL_PAIRS = 10;     // Number of pairs
```

```typescript
// In imageUtils.ts
export const CLOUDINARY_IMAGES = [
  // Add your 10 image URLs here
];
```

## 🎯 Success Checklist

- [ ] Updated Cloudinary image URLs
- [ ] Tested image loading
- [ ] Verified timer works correctly
- [ ] Checked responsive design
- [ ] Backend evaluation endpoint works
- [ ] Results display correctly
- [ ] Can play multiple rounds
- [ ] Exit button functions
- [ ] Mobile-friendly

## 🐛 Common Issues & Solutions

| Issue                  | Solution                              |
|------------------------|---------------------------------------|
| Images not loading     | Check Cloudinary URLs                 |
| Timer not working      | Check browser console                 |
| Backend errors         | Verify API_URL in .env                |
| Broken layout          | Clear cache, restart dev server       |
| Cards not flipping     | Check click handlers                  |

## 📱 Responsive Breakpoints

- Desktop: 5×4 grid
- Tablet: 5×4 grid (smaller cards)
- Mobile: 5×4 grid (smallest cards)

## 🎨 Color Palette

| Element     | Colors                          |
|-------------|---------------------------------|
| Background  | Indigo-50 → Purple-50 → Pink-50 |
| Primary     | Indigo-500 → Purple-600         |
| Cards       | White / Indigo-500              |
| Timer       | Blue / Green / Orange / Red     |
| Success     | Green-500                       |
| Error       | Red-500                         |

## 📚 Additional Files

- `UPDATE_SUMMARY.md` - Complete change log
- `CLOUDINARY_SETUP.md` - Image setup guide
- `DYNAMIC_IMAGES_GUIDE.md` - Advanced features

---

**Need help? Check the detailed guides or contact support! 🚀**
