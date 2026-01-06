# 📖 User Guide - Orion Site Selection v2.5

## 🎯 Overview

Orion Site Selection helps you evaluate and compare potential edge data centre locations across UK and Europe using a weighted criteria framework.

---

## 🗺️ Application Structure

### Two Main Workflows:

```
1. EVALUATE SITES           2. COMPARE SITES
   ↓                           ↓
DC Selection Matrix    →   Site Compare
(Discover & Rank)         (Detailed Comparison)
```

---

## 📍 Workflow 1: Evaluate Sites (DC Selection Matrix)

### Purpose
Find and rank potential data centre sites based on your specific requirements.

### Step-by-Step Guide

#### Step 1: Select Your Target Location

Navigate to **DC Selection Matrix** page and use the location filters:

```
┌─────────────────────────────────────────┐
│ 📍 Location & Area Selection            │
├─────────────────────────────────────────┤
│ Country:     [United Kingdom      ▼]   │
│ Region:      [London              ▼]   │
│ Min Score:   [≥ 3.0 (Good)        ▼]   │
│                                         │
│              [🔍 Find Sites]            │
└─────────────────────────────────────────┘
```

**Options:**

- **Country**: UK, Ireland, France, Germany, Netherlands
  - Select "All Countries" to see pan-European options
  
- **Region**: London, Manchester, Cambridge, Dublin, Paris, Frankfurt, Amsterdam
  - Select "All Regions" to see all sites in selected country
  
- **Min Score**: Filter by minimum quality threshold
  - All Scores (0+)
  - ≥ 2.0 (Acceptable)
  - ≥ 3.0 (Good)
  - ≥ 4.0 (Excellent)

**Example:**
```
Country: UK
Region: All Regions
Min Score: ≥ 3.0
→ Shows all UK sites scoring 3.0 or higher
```

#### Step 2: Configure Criteria Weights

Expand the **Criteria Weights Configuration** section to adjust importance:

```
┌─────────────────────────────────────────┐
│ ▼ ⚙️ Criteria Weights Configuration    │
├─────────────────────────────────────────┤
│ ⚡ Power and Energy Infrastructure      │
│ [━━━━━━━━━━━━━━━━━━━━━━━━━] 25%        │
│                                         │
│ 🌐 Network and Latency                 │
│ [━━━━━━━━━━━━━━━━━━━━━━] 20%          │
│                                         │
│ 🏢 Property and Site Characteristics   │
│ [━━━━━━━━━━━━━━━] 15%                  │
│                                         │
│ 📋 Planning Compliance and Regulatory  │
│ [━━━━━━━━━━━━━━━] 15%                  │
│                                         │
│ 💰 Cost and Commercial Viability       │
│ [━━━━━━━━━━━━━━━] 15%                  │
│                                         │
│ 🌱 Sustainability and ESG Alignment    │
│ [━━━━━━━━━━] 10%                       │
│                                         │
│ Total: 100%                             │
│ [🔄 Reset to Recommended]              │
└─────────────────────────────────────────┘
```

**Default Weights** (UK/EU edge DC optimized):
- Power: 25% (highest priority due to grid constraints)
- Network: 20% (critical for edge latency)
- Property: 15%
- Planning: 15%
- Cost: 15%
- Sustainability: 10%

**Customization Examples:**

*Hyperscaler-focused (prioritize power & cost):*
```
Power: 30%
Network: 15%
Property: 10%
Planning: 10%
Cost: 25%
Sustainability: 10%
```

*ESG-focused (sustainability priority):*
```
Power: 20%
Network: 20%
Property: 15%
Planning: 10%
Cost: 10%
Sustainability: 25%
```

*Edge/Latency-focused (network priority):*
```
Power: 20%
Network: 35%
Property: 15%
Planning: 10%
Cost: 10%
Sustainability: 10%
```

**💡 Tip:** Click "Show Details" on each criterion to see sub-criteria breakdown.

#### Step 3: Review Recommendations

Scroll to **Site Recommendations** section:

```
┌─────────────────────────────────────────┐
│ 🎯 Site Recommendations      5 sites    │
├─────────────────────────────────────────┤
│ ✨ Showing 5 recommended sites          │
│    based on your criteria               │
│                      [📥 Export List]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ┌───┐                               │ │
│ │ │#1 │ London Edge DC Alpha          │ │
│ │ │4.2│ 🌍 UK  📍 London  📅 01/04/26│ │
│ │ └───┘                               │ │
│ │ Overall Score: 4.2 / 5.0            │ │
│ │ [━━━━━━━━━━━━━━━━━━] 84%           │ │
│ │                                     │ │
│ │ 🏆 Top Strengths:                   │ │
│ │ ⚡ Power (4.5/5.0)                  │ │
│ │ 🌐 Network (4.2/5.0)                │ │
│ │ 🌱 ESG (4.0/5.0)                    │ │
│ │                                     │ │
│ │ [📊 View Details] [➕ Add to Compare]│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ #2 [3.8] Manchester Edge DC         │ │
│ │ ... (more sites)                    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Understanding Recommendations:**

- **Ranking**: Sites sorted by total weighted score (highest first)
- **Score Badge**: Color-coded by quality
  - 🟢 Green (4.0+): Excellent
  - 🟠 Orange (3.0-3.9): Good
  - 🔴 Red (<3.0): Acceptable but review needed
- **Metadata**: Country, Region, Date added
- **Top Strengths**: 3 best-performing criteria
- **Actions**:
  - **View Details**: Opens full scoring breakdown
  - **Add to Compare**: Saves site for detailed comparison

#### Step 4: Add Sites to Comparison

Click **"➕ Add to Compare"** on sites you want to evaluate further.

**Best Practices:**
- Select 2-4 sites for optimal comparison
- Mix high-scoring with medium-scoring to see trade-offs
- Choose sites from same region for fair comparison

**Success Message:**
```
✅ Site added to comparison list!

Go to "Site Compare" page to view your selection.
```

---

## ⚖️ Workflow 2: Compare Sites (Site Compare)

### Purpose
Detailed side-by-side comparison of selected sites with criteria breakdown.

### Step-by-Step Guide

#### Step 1: Navigate to Site Compare Page

Click **"⚖️ Site Compare"** in the sidebar.

Sites you added from DC Selection Matrix will automatically load.

#### Step 2: Review Comparison Table

```
┌──────────────────────┬─────────┬─────────┬─────────┐
│ Criteria             │ Site A  │ Site B  │ Site C  │
├──────────────────────┼─────────┼─────────┼─────────┤
│ Overall Score        │  4.2    │  3.8    │  3.5    │
│                      │ [Green] │[Orange] │[Orange] │
├──────────────────────┼─────────┼─────────┼─────────┤
│ ⚡ Power (25%)       │   4.5   │   3.9   │   3.2   │
│                      │ ████░   │ ███░    │ ██░     │
├──────────────────────┼─────────┼─────────┼─────────┤
│ 🌐 Network (20%)     │   4.2   │   4.0   │   3.8   │
│                      │ ████░   │ ████    │ ███░    │
├──────────────────────┼─────────┼─────────┼─────────┤
│ 🏢 Property (15%)    │   3.8   │   3.5   │   4.0   │
│                      │ ███░    │ ███     │ ████    │
├──────────────────────┼─────────┼─────────┼─────────┤
│ 📋 Planning (15%)    │   3.5   │   4.2   │   3.0   │
│                      │ ███     │ ████░   │ ██░     │
├──────────────────────┼─────────┼─────────┼─────────┤
│ 💰 Cost (15%)        │   3.2   │   3.8   │   4.5   │
│                      │ ██░     │ ███░    │ ████░   │
├──────────────────────┼─────────┼─────────┼─────────┤
│ 🌱 ESG (10%)         │   4.0   │   3.5   │   3.2   │
│                      │ ████    │ ███     │ ██░     │
└──────────────────────┴─────────┴─────────┴─────────┘

[📥 Export Comparison]  [📊 View Charts]
```

**How to Read:**

- **Overall Score**: Total weighted score (top row)
- **Criteria Rows**: Individual criterion scores
- **Weights**: Shown in parentheses (e.g., "25%")
- **Progress Bars**: Visual score representation
- **Color Coding**:
  - Dark blue: 4.0+ (Excellent)
  - Medium blue: 3.0-3.9 (Good)
  - Light blue: 2.0-2.9 (Acceptable)
  - Red: <2.0 (Poor)

**Analysis Example:**

*Scenario: Comparing 3 sites*

**Site A (Score: 4.2)**
- Strengths: Power (4.5), Network (4.2), ESG (4.0)
- Weaknesses: Cost (3.2)
- **Best for**: High-quality deployment, ESG priority

**Site B (Score: 3.8)**
- Strengths: Planning (4.2), Network (4.0), Cost (3.8)
- Weaknesses: Power (3.9), ESG (3.5)
- **Best for**: Balanced approach, faster permits

**Site C (Score: 3.5)**
- Strengths: Cost (4.5), Property (4.0)
- Weaknesses: Power (3.2), Planning (3.0)
- **Best for**: Budget-conscious, good property

**Decision:**
- Choose **Site A** if budget allows and ESG is important
- Choose **Site B** for fastest time-to-market
- Choose **Site C** for lowest capex

#### Step 3: Add More Sites (Optional)

Click **"➕ Add Site to Compare"** to add additional sites:

```
┌─────────────────────────────────────────┐
│ ➕ Add Site to Comparison                │
├─────────────────────────────────────────┤
│ Select Site:                            │
│ ┌─────────────────────────────────────┐ │
│ │ London Edge DC Beta (London)      ▼│ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]                    [Add Site]  │
└─────────────────────────────────────────┘
```

**Available Sites:**
- All sites from DC Selection Matrix (not already in comparison)
- Dropdown shows: Site Name (Region)

#### Step 4: Manage Comparison

**Remove Site:**
- Click **×** button in site's header column
- Site instantly removed from table

**Clear All:**
- Click **"🗑️ Clear All"** button
- Confirms before clearing
- Resets comparison to empty state

**Export:**
- Click **"📥 Export Comparison"**
- Downloads CSV/PDF report (coming soon)

---

## 🎓 Use Cases

### Use Case 1: Investor Evaluating New Market

**Goal:** Find best UK sites for new edge DC investment

**Steps:**
1. DC Matrix → Select "UK" + "All Regions" + Score ≥ 3.5
2. Adjust weights: Power 30%, Cost 20% (investor priorities)
3. Review 10 recommended sites
4. Add top 3 to comparison (1 London, 1 Manchester, 1 Edinburgh)
5. Site Compare → Analyze trade-offs
6. Export comparison for board presentation

**Outcome:** Data-driven site selection with clear rationale

---

### Use Case 2: Developer Optimizing for Latency

**Goal:** Find best edge site near population centers

**Steps:**
1. DC Matrix → Select "UK" + "London" (target market)
2. Adjust weights: Network 35%, Power 25% (edge priorities)
3. Review 5 London recommendations
4. Filter Min Score ≥ 4.0 (only highest quality)
5. Add top 2 to comparison
6. Site Compare → Verify network scores
7. Select site with best latency metrics

**Outcome:** Optimal edge location for low-latency services

---

### Use Case 3: ESG-Focused Deployment

**Goal:** Find most sustainable DC site

**Steps:**
1. DC Matrix → Select "All Countries" (pan-European)
2. Adjust weights: ESG 30%, Power 25%, Cost 15%
3. Review recommendations sorted by ESG
4. Filter to sites with renewable energy access
5. Add 3 highest ESG scores to comparison
6. Site Compare → Review carbon intensity, heat reuse
7. Choose greenest option

**Outcome:** Sustainable deployment meeting ESG targets

---

## 💡 Tips & Best Practices

### Getting Started
1. **Use Defaults First**: Recommended weights are optimized for UK/EU edge DCs
2. **Start Broad**: Begin with "All Regions" to see full landscape
3. **Narrow Down**: Apply region and score filters progressively
4. **Compare Few**: 2-4 sites is optimal; more becomes cluttered

### Criteria Weights
- **Don't Over-Customize**: Unless you have specific requirements, defaults work well
- **Total Must = 100%**: System enforces this automatically
- **Save Custom Weights**: Use "💾 Save Settings" to preserve your configuration
- **Reset Anytime**: "🔄 Reset" returns to recommended weights

### Recommendations
- **Score Context**: 4.0+ is excellent, 3.0-3.9 is good, <3.0 needs review
- **Top Strengths**: Shows where site excels, useful for quick assessment
- **Metadata**: Check date added to see how recent the data is

### Comparison
- **Mix Scores**: Compare sites with different profiles to see trade-offs
- **Check Weights**: Criteria weights shown in table (e.g., "25%")
- **Progress Bars**: Use for quick visual comparison
- **Export**: Save comparison for offline review or sharing

### Data Management
- **Persistent**: All data saved in browser (localStorage)
- **Per-Browser**: Data doesn't sync across devices
- **Clear Cache**: If issues arise, try hard refresh (Cmd/Ctrl+Shift+R)

---

## 🔧 Troubleshooting

### Problem: No recommendations showing

**Causes:**
1. No sites match filters
2. No sites in database yet
3. Min score too high

**Solutions:**
- Broaden filters (All Countries, All Regions)
- Lower min score threshold
- Check if test data is loaded

---

### Problem: Comparison page empty

**Cause:** No sites added to comparison list

**Solution:**
1. Go to DC Selection Matrix
2. Click "➕ Add to Compare" on desired sites
3. Return to Site Compare page

---

### Problem: Scores seem incorrect

**Causes:**
1. Custom weights modified
2. Site data incomplete

**Solutions:**
- Reset weights to recommended
- Verify site has scores for all criteria
- Check browser console (F12) for errors

---

### Problem: Changes not saving

**Cause:** Browser storage issues

**Solutions:**
- Check browser allows localStorage
- Try different browser
- Clear cache and retry

---

## 📊 Understanding Scores

### Scoring System

**Individual Sub-Criteria:**
- Scale: 1.0 to 5.0
- 5.0 = Excellent
- 4.0 = Good
- 3.0 = Acceptable
- 2.0 = Poor
- 1.0 = Critical Issue

**Criterion Score:**
- Average of all sub-criteria scores
- Example: Power has 6 sub-criteria
  - Grid: 4, Substation: 4, Capacity: 3, Reliability: 5, Renewable: 3, Backup: 4
  - Power Score = (4+4+3+5+3+4)/6 = 3.83

**Overall Score:**
- Weighted average of all criteria
- Example with default weights:
  ```
  Power: 3.8 × 25% = 0.95
  Network: 4.2 × 20% = 0.84
  Property: 3.5 × 15% = 0.53
  Planning: 3.2 × 15% = 0.48
  Cost: 3.8 × 15% = 0.57
  ESG: 4.0 × 10% = 0.40
  ─────────────────────────
  Total: 3.77
  ```

### Score Interpretation

| Range | Color | Meaning | Action |
|-------|-------|---------|--------|
| 4.5-5.0 | 🟢 Dark Green | Outstanding | Prioritize |
| 4.0-4.4 | 🟢 Green | Excellent | Strong candidate |
| 3.5-3.9 | 🟠 Light Orange | Good | Consider |
| 3.0-3.4 | 🟠 Orange | Acceptable | Review carefully |
| 2.0-2.9 | 🔴 Light Red | Below standard | Identify issues |
| <2.0 | 🔴 Red | Critical issues | Avoid or fix first |

---

## 📚 Additional Resources

- **Technical Details**: See `DC_MATRIX_RESTRUCTURE_v2.5.md`
- **Quick Testing**: See `QUICK_TEST_v2.5.md`
- **Criteria Guide**: See `DC_SELECTION_MATRIX_GUIDE.md`

---

## 🆘 Support

**Need Help?**
- Check this user guide
- Review troubleshooting section
- Check browser console for errors (F12)
- Refer to technical documentation

---

*Version: 2.5.0*  
*Last Updated: January 4, 2026*  
*User Guide for Orion Site Selection Platform*



