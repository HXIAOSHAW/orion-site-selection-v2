# 🧪 Quick Test Guide - DC Matrix Restructure v2.5

## 🚀 Quick Start Testing

### Prerequisites
```bash
cd /Users/xh/Orion/orion-site-selection-v2

# Start backend (Terminal 1)
cd backend && node server.js

# Start frontend (Terminal 2)
cd frontend && python3 -m http.server 8888
```

### Access Application
```
🔗 http://localhost:8888
🔑 Password: EdgeNebula2026
```

---

## ✅ Test Scenario 1: DC Selection Matrix - Location Filter

### Steps:
1. Navigate to **DC Selection Matrix** page
2. Check that "Add Site" button is **GONE** ✅
3. See new **Location & Area Selection** section at top
4. Test filters:
   ```
   Country: UK
   Region: London
   Min Score: ≥ 3.0
   Click [🔍 Find Sites]
   ```

### Expected Results:
- ✅ Filter status bar appears: "🎯 Filters: UK → London → Score ≥ 3"
- ✅ Recommendations section updates
- ✅ Only London sites with score ≥ 3.0 displayed
- ✅ Sites ranked from highest to lowest score

### Test Data Setup (if empty):
Since you might not have sites yet, let's create test sites:

1. Go to **Site Compare** page (temporarily)
2. Click **"➕ Add Site to Compare"**
3. But first, we need sites in the system...

**Alternative**: Add test sites via console:
```javascript
// Open browser console (F12)
const testSites = [
  {
    id: 'test-london-1',
    name: 'London Edge DC Alpha',
    country: 'UK',
    region: 'London',
    dateAdded: new Date().toISOString(),
    scores: {
      power: { grid: 4, substation: 4, capacity: 4, reliability: 4, renewable: 3, backup: 4 },
      network: { fibre: 4, carriers: 4, latency: 5, mobile: 4, connectivity: 4 },
      property: { availability: 4, size: 4, planning: 4, structure: 4, logistics: 4, security: 4 },
      planning: { permission: 3, authority: 3, environmental: 4, data_protection: 4, timeline: 3 },
      cost: { acquisition: 3, connection: 3, electricity: 3, network: 4, tax: 4, tco: 3 },
      sustainability: { carbon: 4, heat_reuse: 3, water: 4, targets: 4, esg: 4 }
    }
  },
  {
    id: 'test-london-2',
    name: 'London Edge DC Beta',
    country: 'UK',
    region: 'London',
    dateAdded: new Date().toISOString(),
    scores: {
      power: { grid: 3, substation: 3, capacity: 3, reliability: 4, renewable: 4, backup: 3 },
      network: { fibre: 3, carriers: 4, latency: 4, mobile: 3, connectivity: 4 },
      property: { availability: 3, size: 3, planning: 3, structure: 3, logistics: 3, security: 3 },
      planning: { permission: 3, authority: 3, environmental: 3, data_protection: 4, timeline: 3 },
      cost: { acquisition: 4, connection: 3, electricity: 3, network: 3, tax: 3, tco: 3 },
      sustainability: { carbon: 3, heat_reuse: 2, water: 3, targets: 3, esg: 3 }
    }
  },
  {
    id: 'test-manchester-1',
    name: 'Manchester Edge DC',
    country: 'UK',
    region: 'Manchester',
    dateAdded: new Date().toISOString(),
    scores: {
      power: { grid: 4, substation: 4, capacity: 4, reliability: 3, renewable: 4, backup: 4 },
      network: { fibre: 3, carriers: 3, latency: 3, mobile: 3, connectivity: 3 },
      property: { availability: 4, size: 4, planning: 4, structure: 4, logistics: 3, security: 4 },
      planning: { permission: 4, authority: 4, environmental: 4, data_protection: 4, timeline: 4 },
      cost: { acquisition: 5, connection: 4, electricity: 4, network: 3, tax: 4, tco: 4 },
      sustainability: { carbon: 3, heat_reuse: 3, water: 4, targets: 4, esg: 4 }
    }
  }
];

localStorage.setItem('dc_matrix_sites', JSON.stringify(testSites));
location.reload();
```

---

## ✅ Test Scenario 2: Site Recommendations

### Steps:
1. With test sites loaded (see above)
2. On DC Selection Matrix page
3. Apply filter: **UK → London**
4. Scroll to **Site Recommendations** section

### Expected Results:
- ✅ Shows "2 sites match criteria"
- ✅ Cards display:
  ```
  #1 [4.x] London Edge DC Alpha
  🏆 Top: Power (4.0), Network (4.2), ESG (3.8)
  [📊 Details] [➕ Add to Compare]
  
  #2 [3.x] London Edge DC Beta
  🏆 Top: Network (3.8), Planning (3.x), ...
  [📊 Details] [➕ Add to Compare]
  ```
- ✅ Ranking is correct (higher score first)
- ✅ Rank badge color matches score (green >4, orange 3-4)
- ✅ Metadata shows: 🌍 UK 📍 London 📅 Date

### Test Actions:
- Click **"📊 View Details"** → Opens scoring modal ✅
- Click **"➕ Add to Compare"** → Alert: "Site added to comparison list" ✅
- Add 2-3 sites to comparison

---

## ✅ Test Scenario 3: Site Compare Page

### Steps:
1. Navigate to **Site Compare** page
2. Should see sites you added from recommendations

### Expected Results:
- ✅ Header shows: "2 sites selected" (or however many you added)
- ✅ Comparison table displays:
  ```
  ┌──────────────┬────────┬────────┐
  │ Criteria     │ Site A │ Site B │
  ├──────────────┼────────┼────────┤
  │ Overall      │  4.2   │  3.5   │
  │ ⚡ Power     │  4.0   │  3.3   │
  │ 🌐 Network   │  4.2   │  3.8   │
  │ ... etc      │  ...   │  ...   │
  └──────────────┴────────┴────────┘
  ```
- ✅ Score badges are color-coded
- ✅ Progress bars show visually
- ✅ Each criterion shows weight: "(25%)", "(20%)", etc.

### Test Actions:
- Click **"➕ Add Site to Compare"** → Modal opens ✅
- Select "Manchester Edge DC" → Click "Add Site" ✅
- Table updates with 3 columns ✅
- Click **×** button on Site A → Site removed ✅
- Click **"🗑️ Clear All"** → Confirm → Table cleared ✅

---

## ✅ Test Scenario 4: End-to-End Workflow

### Complete User Journey:

1. **DC Selection Matrix**
   - Select: Country = "UK", Region = "All Regions"
   - Click "Find Sites"
   - See 3 sites: 2 London + 1 Manchester
   - Sort by score automatically

2. **Adjust Criteria**
   - Open "Criteria Weights Configuration"
   - Change Power weight: 25% → 30%
   - Change Cost weight: 15% → 10%
   - Recommendations re-rank automatically

3. **Add to Comparison**
   - Add top 2 sites to comparison
   - See success alerts

4. **Compare Sites**
   - Go to Site Compare page
   - See 2 sites side-by-side
   - Add 1 more manually
   - Review all 3 in detail
   - Export (placeholder alert OK for now)

### Expected Results:
- ✅ Smooth workflow from discovery → evaluation → comparison
- ✅ No errors in console (F12)
- ✅ Data persists (refresh page, still there)
- ✅ Clear visual hierarchy
- ✅ Intuitive navigation

---

## 🔍 Visual Checks

### DC Selection Matrix Page

**Top Section:**
```
┌─────────────────────────────────────────┐
│ 🏢 UK/EU Edge Data Centre Selection... │
│                    [📊 Export Report]   │ ✅ No "Add Site" button
└─────────────────────────────────────────┘
```

**Location Filter:**
```
┌─────────────────────────────────────────┐
│ 📍 Location & Area Selection            │
│ ┌─────────────────────────────────────┐ │
│ │ Country [UK ▼] Region [London ▼]   │ │ ✅ Three dropdowns + button
│ │ Min Score [≥3.0▼] [🔍 Find Sites]  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Recommendations:**
```
┌─────────────────────────────────────────┐
│ 🎯 Site Recommendations      2 sites    │
│ ┌─────────────────────────────────────┐ │
│ │ ┌──┐ #1 London Edge DC Alpha       │ │
│ │ │#1│ Overall Score: 4.2            │ │ ✅ Rank badge
│ │ └──┘ 🏆 Top: Power, Network, ESG   │ │ ✅ Top strengths
│ │      [📊 Details][➕ Add to Compare]│ │ ✅ Action buttons
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Site Compare Page

**Comparison Table:**
```
┌──────────────┬────────┬────────┬────────┐
│ Criteria     │ Site A │ Site B │ Site C │ ✅ Clean header
│──────────────┼────────┼────────┼────────│
│ Overall      │ [4.2]  │ [3.8]  │ [3.5]  │ ✅ Color badges
│──────────────┼────────┼────────┼────────│
│ ⚡ Power(25%)│  4.0   │  3.9   │  3.2   │ ✅ Icons + weights
│              │ ████░  │ ███░   │ ██░    │ ✅ Progress bars
└──────────────┴────────┴────────┴────────┘
```

---

## 🐛 Bug Checklist

### Things to Watch For:

- [ ] **Empty state**: If no sites, shows helpful message ✅
- [ ] **No matches**: Filter with no results shows appropriate message ✅
- [ ] **Score calculation**: Overall scores match weighted criteria ✅
- [ ] **localStorage**: Data persists after refresh ✅
- [ ] **Comparison persistence**: Added sites remain in list ✅
- [ ] **Modal close**: Can close modals with ×, Cancel, or ESC ✅
- [ ] **Responsive**: Works on smaller screens (test with DevTools) ✅
- [ ] **No console errors**: Check F12 console ✅

---

## 🎯 Success Criteria

### ✅ All Tests Pass When:

1. Location filters work and update recommendations
2. Recommendations display with proper ranking
3. "Add to Compare" saves sites to comparison list
4. Site Compare page loads comparison list
5. Comparison table shows side-by-side breakdown
6. Can add/remove sites from comparison
7. No JavaScript errors
8. Data persists across page reloads
9. UI is clean and professional
10. Workflow feels intuitive

---

## 🔧 Troubleshooting

### Issue: No recommendations showing
**Solution:**
```javascript
// Check if sites exist
console.log(localStorage.getItem('dc_matrix_sites'));

// If null, add test sites (see Test Scenario 1)
```

### Issue: Comparison page empty
**Solution:**
```javascript
// Check comparison list
console.log(localStorage.getItem('dc_comparison_list'));

// Should show: ["site-id-1", "site-id-2"]
// If null, go back to DC Matrix and add sites
```

### Issue: Scores look wrong
**Solution:**
```javascript
// Check weights
console.log(localStorage.getItem('dc_matrix_weights'));

// Reset to defaults if needed
localStorage.removeItem('dc_matrix_weights');
location.reload();
```

### Issue: Browser cache
**Solution:**
```
Cmd/Ctrl + Shift + R (Hard refresh)

Or:
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"
```

---

## 📝 Test Report Template

```
Date: _____________
Tester: ___________
Version: 2.5.0

Test Results:
[ ] Location Filter - PASS / FAIL
[ ] Site Recommendations - PASS / FAIL
[ ] Add to Comparison - PASS / FAIL
[ ] Site Compare Table - PASS / FAIL
[ ] Add/Remove Sites - PASS / FAIL
[ ] Data Persistence - PASS / FAIL

Issues Found:
1. ________________________________
2. ________________________________

Overall: ✅ APPROVED / ❌ NEEDS FIXES
```

---

## 🚀 Ready to Test!

1. **Load test data** (see Test Scenario 1)
2. **Run through scenarios** (1-4)
3. **Check visual elements**
4. **Verify bug checklist**
5. **Confirm success criteria**

### Estimated Time: 15-20 minutes

**Happy Testing! 🎉**

---

*Version: 2.5.0*  
*Last Updated: January 4, 2026*



