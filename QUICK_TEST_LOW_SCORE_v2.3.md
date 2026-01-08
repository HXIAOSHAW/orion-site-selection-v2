# 🔴 Quick Test Guide - Low Score Analysis v2.3

## ⚡ Quick Test Steps

### 1. Refresh Browser (Clear Cache!)
```
Mac:     Cmd + Shift + R
Windows: Ctrl + Shift + R
```

### 2. Navigate to DC Selection Matrix
- URL: `http://localhost:8888`
- Password: `EdgeNebula2026`
- Click: **🏢 DC Selection Matrix**

### 3. Create Test Sites

#### Test Site 1: "London Edge DC" (High Score)
```
Name: London Edge DC
Scoring: Rate most sub-criteria 4-5
Expected: Shows in 🌟 High Potential Sites (Green)
```

#### Test Site 2: "Bristol Edge Site" (Medium Score)
```
Name: Bristol Edge Site
Scoring: Rate most sub-criteria 3-4
Expected: Shows in ⚠️ Medium Potential Sites (Orange)
```

#### Test Site 3: "Birmingham Test Site" (Low Score) ⭐
```
Name: Birmingham Test Site
Scoring: Rate most sub-criteria 1-3
Expected: Shows in ⛔ Low Potential Sites (Red) with DETAILED ANALYSIS
```

### 4. What to Look For in Low Score Sites

#### A. Executive Summary Cards
- [ ] ⛔ Critical Issues count
- [ ] 🔍 Problem Areas count
- [ ] 📈 Improvement Potential percentage

#### B. Full Criteria Breakdown
- [ ] All 6 criteria shown with progress bars
- [ ] Problem criteria marked in red (⚠️)
- [ ] Normal criteria marked in green (✓)
- [ ] Weight and score displayed

#### C. Problem Details Section
- [ ] Each problem criterion numbered (①, ②, etc.)
- [ ] Sub-criteria with low scores listed
- [ ] Score badges (1/5, 2/5, 3/5) color-coded
- [ ] 💡 Recommendations for each problem

### 5. Test Interactions

#### Edit Low Score Site
1. Click **✏️ Improve Scoring** button
2. Modal opens with all criteria
3. Improve some scores from 1-2 to 3-4
4. Click **Save Scores**
5. Watch site move to different category!

#### View Radar Chart
1. Click **📊 View Radar Chart**
2. See visual representation
3. Low scores clearly visible

#### Compare Sites
1. Click **⚖️ Compare with Others**
2. Side-by-side comparison table
3. Easily spot differences

---

## 📊 Expected Results

### High Score Site (> 4.0)
```
┌─────────────────────────────────────────┐
│ #1  London Edge DC               [4.2]  │
│ ⚡ Power         [████████] 4.5          │
│ 🌐 Network      [███████░] 4.2          │
│ ... (compact display)                   │
│ [📊 Radar] [⚖️ Compare]                 │
└─────────────────────────────────────────┘
```

### Medium Score Site (3.0-4.0)
```
┌─────────────────────────────────────────┐
│ #2  Bristol Edge Site            [3.5]  │
│ ⚡ Power         [██████░░] 3.8          │
│ 🌐 Network      [█████░░░] 3.2          │
│ ... (compact display)                   │
│ [📊 Radar] [⚖️ Compare]                 │
└─────────────────────────────────────────┘
```

### Low Score Site (≤ 3.0) - EXPANDED VIEW ⭐
```
┌──────────────────────────────────────────────────────┐
│ #3  Birmingham Test Site  ⚠️ Needs Attention    [2.4] │
│ Score: 2.40/5.00  |  Gap: 52% below optimal         │
├──────────────────────────────────────────────────────┤
│ SUMMARY CARDS                                        │
│ [⛔ 4/6 Critical] [🔍 15 Problems] [📈 52% Potential]│
├──────────────────────────────────────────────────────┤
│ FULL CRITERIA BREAKDOWN                              │
│ ⚡ Power (25% | 2.1/5.0) ⚠️  [████░░░░░░] 42%       │
│ 🌐 Network (20% | 3.8/5.0) ✓ [███████░░░] 76%      │
│ 🏢 Property (15% | 2.3/5.0) ⚠️ [████░░░░░░] 46%    │
│ 📋 Planning (15% | 2.8/5.0) ⚠️ [█████░░░░░] 56%    │
│ 💰 Cost (15% | 1.9/5.0) ⚠️    [███░░░░░░░] 38%     │
│ 🌱 ESG (10% | 3.2/5.0) ✓      [██████░░░░] 64%     │
├──────────────────────────────────────────────────────┤
│ PROBLEM DETAILS & RECOMMENDATIONS                    │
│                                                      │
│ ① ⚡ Power and Energy Infrastructure (2.1/5.0)      │
│   ┌─────────────────────────────────────────────┐   │
│   │ [2/5] Grid connection availability          │   │
│   │ Ease and speed of connecting to grid        │   │
│   │ 💡 Recommendation: Engage with DNO early... │   │
│   └─────────────────────────────────────────────┘   │
│   [More sub-criteria problems...]                   │
│                                                      │
│ ② 🏢 Property and Site (2.3/5.0)                    │
│   [Sub-criteria problems and recommendations...]    │
│                                                      │
│ ③ 📋 Planning (2.8/5.0)                             │
│   [Sub-criteria problems and recommendations...]    │
│                                                      │
│ ④ 💰 Cost (1.9/5.0)                                 │
│   [Sub-criteria problems and recommendations...]    │
├──────────────────────────────────────────────────────┤
│ [📊 View Radar] [✏️ Improve] [⚖️ Compare]           │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Page loads without errors
- [ ] Three category sections visible (High/Medium/Low)
- [ ] Low score sites show expanded detailed view
- [ ] Summary cards display correct numbers
- [ ] All 6 criteria shown in breakdown
- [ ] Problem criteria highlighted in red
- [ ] Recommendations displayed for low-score sub-criteria
- [ ] All buttons functional (Edit, Radar, Compare)
- [ ] Scores update when edited
- [ ] Sites move between categories when scores change

---

## 🐛 Troubleshooting

### Problem: Low score site shows compact view
**Cause**: Site score may be > 3.0
**Fix**: Edit site, set multiple sub-criteria to 1-2 to bring overall score ≤ 3.0

### Problem: No recommendations showing
**Cause**: May be a criterion without low-score sub-criteria
**Fix**: Ensure at least one sub-criterion in a category scores < 3

### Problem: Categories not appearing
**Cause**: No sites in that score range
**Fix**: Create sites with varied scores (high, medium, low)

### Problem: Changes not visible
**Cause**: Browser cache
**Fix**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📝 Test Scenario Example

### Scenario: Poor Power Infrastructure Site

1. Create site: "Rural Edge Site"
2. Score Power criteria sub-items as:
   - Grid availability: **1/5**
   - Proximity to substation: **2/5**
   - Import capacity: **1/5**
   - Reliability: **3/5**
   - Renewable access: **2/5**
   - Backup support: **2/5**
3. Score other criteria normally (3-4)
4. Save and observe:
   - Site appears in ⛔ Low Potential section
   - Summary shows critical issues
   - Power criterion highlighted as problem
   - Detailed recommendations for each low-score sub-criterion

### Expected Recommendations:
- **Grid availability (1/5)**: "Engage with DNO early. Consider alternative connection points..."
- **Import capacity (1/5)**: "Grid reinforcement likely required. Engage DNO for detailed capacity study..."
- **Renewable access (2/5)**: "Limited green energy options. May impact ESG ratings..."

---

## 🎯 Key Features to Test

### 1. Automatic Categorization
- Add sites with different scores
- Verify they appear in correct categories
- Check color coding (green/orange/red)

### 2. Detailed Problem Analysis
- Create low-score site
- Verify all problem areas identified
- Check recommendation relevance

### 3. Dynamic Updates
- Edit a low-score site to improve scores
- Watch it move from Low → Medium → High categories
- Verify problem section disappears when score improves

### 4. Recommendation Context
- Test different criteria combinations
- Verify recommendations change per criterion
- Check recommendations vary by score level

---

## 📊 Performance Benchmarks

| Action | Expected Time |
|--------|---------------|
| Page load | < 2 seconds |
| Render low-score site | < 500ms |
| Calculate recommendations | Instant |
| Update after edit | < 1 second |

---

## 🆘 Need Help?

### Browser Console
Press **F12** → **Console** tab
- Look for red errors
- Screenshot and report issues

### Files Changed
- `frontend/dc-matrix.js` - Main logic
- `frontend/styles.css` - Styling
- `docs/` - Mirrored versions

### Documentation
- `LOW_SCORE_ANALYSIS_UPDATE.md` - Full feature documentation
- `DC_SELECTION_MATRIX_GUIDE.md` - Scoring methodology
- `DC_MATRIX_QUICK_START.md` - Getting started

---

*Quick Test Guide v2.3 - January 4, 2026*




