# 📊 Criteria Details Enhancement - Update Documentation

## 🎯 Overview

Enhanced the DC Selection Matrix **Criteria Weights Configuration** section to display all sub-criteria clearly and accessibly. Users can now see exactly what each criterion contains before evaluating sites.

---

## ✨ New Features

### 1. **Sub-Criteria Display**
Each main criterion now shows:
- **Number of sub-criteria** (e.g., "6 sub-criteria")
- **Expandable details button** ("Show Details" / "Hide Details")
- **Complete list** of all sub-criteria when expanded

### 2. **Detailed Sub-Criteria Cards**
When expanded, each sub-criterion displays:
- **Sequence number** (1, 2, 3...)
- **Full name** (e.g., "Grid connection availability and lead time")
- **Description** (e.g., "Time and complexity to secure grid connection")

### 3. **Expand/Collapse All**
- **"Expand All Details"** button at the top
- One-click to view all sub-criteria across all 6 main criteria
- Changes to **"Collapse All Details"** when expanded

### 4. **Summary Information**
At the top of the section:
- **6 Main Criteria**
- **36 Sub-Criteria Total**

---

## 📐 UI Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Criteria Weights Configuration        Total: 100%        │
├─────────────────────────────────────────────────────────────┤
│ [6 Main Criteria • 36 Sub-Criteria Total] [📋 Expand All]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐     │
│ │ ⚡ Power and Energy Infrastructure                  │     │
│ │ Primary constraint in UK and Europe...              │     │
│ │ 6 sub-criteria [▼ Show Details]                     │     │
│ │ [━━━━━━━━━━━━━━━━━━━━━━━━] 25%                       │     │
│ │                                                      │     │
│ │ ▼ Detailed Sub-Criteria                    [6 items] │     │
│ │ ┌────────────────────────────────────────────────┐  │     │
│ │ │ ① Grid connection availability and lead time  │  │     │
│ │ │   Time and complexity to secure connection    │  │     │
│ │ ├────────────────────────────────────────────────┤  │     │
│ │ │ ② Proximity to primary or grid substation     │  │     │
│ │ │   Distance to nearest suitable substation     │  │     │
│ │ ├────────────────────────────────────────────────┤  │     │
│ │ │ ③ Available import capacity                    │  │     │
│ │ │   Existing capacity and upgrade requirements  │  │     │
│ │ ├────────────────────────────────────────────────┤  │     │
│ │ │ ④ Electricity reliability and outage history  │  │     │
│ │ │   Historical grid reliability metrics         │  │     │
│ │ ├────────────────────────────────────────────────┤  │     │
│ │ │ ⑤ Access to renewable energy or green tariffs │  │     │
│ │ │   Availability of green power options         │  │     │
│ │ ├────────────────────────────────────────────────┤  │     │
│ │ │ ⑥ Ability to support backup generation        │  │     │
│ │ │   Space and permissions for backup systems    │  │     │
│ │ └────────────────────────────────────────────────┘  │     │
│ │ 💡 Each sub-criterion is scored 1-5 during eval    │     │
│ └─────────────────────────────────────────────────────┘     │
│                                                             │
│ [Same layout for other 5 criteria...]                      │
└─────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

1. **Level 1**: Main criterion card (icon, name, description)
2. **Level 2**: Weight slider and value display
3. **Level 3**: Sub-criteria toggle button
4. **Level 4**: Expanded sub-criteria list with details

---

## 🎨 Design Features

### Color Coding
Each criterion has its own color:
- ⚡ **Power**: Red (`#ef4444`)
- 🌐 **Network**: Blue (`#3b82f6`)
- 🏢 **Property**: Green (`#10b981`)
- 📋 **Planning**: Orange (`#f59e0b`)
- 💰 **Cost**: Purple (`#8b5cf6`)
- 🌱 **Sustainability**: Dark Green (`#059669`)

### Interactive Elements
- **Hover effects** on sub-criteria items
- **Border color change** on hover (gray → blue)
- **Background change** on hover
- **Smooth transitions** for expand/collapse

### Visual Cues
- **Numbered circles** for each sub-criterion
- **Color-coded badges** showing sub-criteria count
- **Informational footer** in each expanded section
- **Clear button states** (Expand ↔ Collapse)

---

## 📋 Complete Criteria List

### ⚡ Power and Energy Infrastructure (6 sub-criteria)
1. Grid connection availability and lead time
2. Proximity to primary or grid substation
3. Available import capacity and reinforcement risk
4. Electricity reliability and outage history
5. Access to renewable energy or green tariffs
6. Ability to support backup generation and energy storage

### 🌐 Network and Latency (5 sub-criteria)
1. Fibre density and route diversity
2. Number of available carriers
3. Latency to target population or enterprise clusters
4. Proximity to mobile core or MEC nodes
5. Regional and international connectivity resilience

### 🏢 Property and Site Characteristics (6 sub-criteria)
1. Land or building availability
2. Site size and shape suitability
3. Planning use class compatibility
4. Structural loading and floor to ceiling height
5. Setback, access and construction logistics
6. Security and boundary conditions

### 📋 Planning Compliance and Regulatory (5 sub-criteria)
1. Planning permission likelihood
2. Local authority support and policy alignment
3. Environmental and noise compliance
4. Data protection and sovereignty constraints
5. Permitting timeline and approval risk

### 💰 Cost and Commercial Viability (6 sub-criteria)
1. Land or building acquisition cost
2. Power connection and reinforcement cost
3. Electricity price structure and volatility
4. Network access cost
5. Local tax environment and incentives
6. Estimated total cost of ownership

### 🌱 Sustainability and ESG Alignment (5 sub-criteria)
1. Grid carbon intensity
2. Heat reuse potential
3. Water usage and cooling efficiency
4. Alignment with local sustainability targets
5. ESG reporting and certification readiness

**Total: 33 sub-criteria across 6 main criteria**

---

## 💡 User Benefits

### 1. **Clarity**
- See exactly what each criterion measures
- Understand the full scope before scoring
- No surprises during site evaluation

### 2. **Efficiency**
- Quick overview with collapsed view
- Detailed reference when needed
- One-click expand/collapse all

### 3. **Education**
- Learn UK/EU edge DC requirements
- Understand evaluation methodology
- Reference guide built-in

### 4. **Confidence**
- Know what to look for in each site
- Understand scoring implications
- Make informed decisions

---

## 🔧 Technical Implementation

### Files Modified

1. **`dc-matrix.js`**
   - Enhanced `dcRenderWeights()` function
   - Added sub-criteria HTML rendering
   - Implemented `dcToggleSubCriteria()` function
   - Implemented `dcToggleAllSubCriteria()` function
   - Added controls bar with summary info

2. **`styles.css`**
   - Added `.criteria-controls-bar` styles
   - Added `.sub-criteria-list` styles
   - Added `.sub-criterion-item` styles
   - Added `.toggle-sub-criteria-btn` styles
   - Added hover effects and transitions

### Key Functions

```javascript
// Individual criterion toggle
window.dcToggleSubCriteria = function(criterionId) {
  // Toggles visibility of one criterion's sub-criteria
  // Updates button text and icon
}

// All criteria toggle
window.dcToggleAllSubCriteria = function() {
  // Expands or collapses all sub-criteria lists
  // Updates all buttons and main toggle button
}
```

### CSS Classes

- `.criteria-controls-bar` - Top control panel
- `.sub-criteria-list` - Container for sub-criteria
- `.sub-criteria-grid` - Grid layout for items
- `.sub-criterion-item` - Individual sub-criterion card
- `.sub-criterion-number` - Numbered circle
- `.sub-criterion-content` - Name and description
- `.toggle-sub-criteria-btn` - Expand/collapse button

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] All 6 criteria display correctly
- [ ] Sub-criteria counts are accurate (6, 5, 6, 5, 6, 5)
- [ ] Color coding is applied correctly
- [ ] Hover effects work on sub-criteria items

### Functional Tests
- [ ] "Show Details" expands individual criterion
- [ ] "Hide Details" collapses individual criterion
- [ ] "Expand All Details" shows all sub-criteria
- [ ] "Collapse All Details" hides all sub-criteria
- [ ] Icons change correctly (▼ ↔ ▲)
- [ ] Button text updates properly

### Interaction Tests
- [ ] Weight sliders still work correctly
- [ ] Total weight calculation unchanged
- [ ] Page layout remains responsive
- [ ] No JavaScript errors in console

### Content Tests
- [ ] All 33 sub-criteria are listed
- [ ] Descriptions are accurate
- [ ] Numbering is sequential (1-6 or 1-5)
- [ ] Footer tips are displayed

---

## 📱 Responsive Design

- **Desktop** (>1200px): Full grid layout, 2 columns
- **Tablet** (768-1200px): Single column
- **Mobile** (<768px): Stacked layout, full width

All expand/collapse functionality works across all screen sizes.

---

## 🎯 Use Cases

### For Investors
- **Quick Reference**: Understand investment criteria
- **Due Diligence**: See all evaluation factors
- **Decision Making**: Know what matters most

### For Development Teams
- **Site Assessment**: Checklist of requirements
- **Data Collection**: Know what information to gather
- **Prioritization**: Focus on high-weight criteria

### For Consultants
- **Client Presentations**: Clear framework explanation
- **Training**: Educational tool for new team members
- **Documentation**: Built-in reference guide

---

## 🚀 Future Enhancements

Potential additions:
1. **Search/Filter**: Find specific sub-criteria
2. **Custom Notes**: Add site-specific notes per sub-criterion
3. **Benchmarks**: Industry standard scores for reference
4. **Help Text**: Detailed scoring guidance per item
5. **Print View**: Optimized layout for printing
6. **Export**: Sub-criteria list to CSV/PDF

---

## 📞 Support

If sub-criteria don't display:
1. Clear browser cache (Cmd/Ctrl + Shift + R)
2. Check browser console for errors (F12)
3. Verify `dc-matrix.js` file size (~52KB)
4. Confirm all 6 criteria have sub-criteria arrays

---

*Enhanced: January 4, 2026*  
*Version: 2.4.0*  
*Feature: Criteria Details Display*




