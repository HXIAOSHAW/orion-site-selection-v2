# 🚀 DC Selection Matrix - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Access the Tool
```
URL: http://localhost:8888
Password: EdgeNebula2026
Click: 🏢 DC Selection Matrix (left sidebar)
```

### 2. Add Your First Site
```
1. Click "➕ Add Site"
2. Enter site name (e.g., "London Docklands A")
3. Site created with default scores
```

### 3. Score the Site
```
1. Click "✏️ Edit" on the site card
2. Rate each sub-criterion 1-5:
   - 1 = Very Poor
   - 2 = Poor
   - 3 = Average ⭐ (default)
   - 4 = Good
   - 5 = Excellent
3. Click "Save Scores"
```

### 4. Add More Sites & Compare
```
1. Repeat steps 2-3 for additional sites
2. Click "⚖️ Compare" to see side-by-side comparison
3. Click "📊 View Radar Chart" for visual analysis
```

### 5. Adjust Weights (Optional)
```
1. Expand "⚙️ Criteria Weights Configuration"
2. Drag sliders to adjust importance
3. Ensure total stays near 100%
4. Scores recalculate automatically
```

### 6. Export Results
```
Click "📊 Export Report" → Downloads CSV file
```

---

## 📋 Evaluation Criteria (Quick Reference)

| Criterion | Icon | Weight | What It Measures |
|-----------|------|--------|-----------------|
| **Power & Energy** | ⚡ | 25% | Grid connection, capacity, reliability |
| **Network & Latency** | 🌐 | 20% | Fibre, carriers, latency, connectivity |
| **Property & Site** | 🏢 | 15% | Physical characteristics, availability |
| **Planning & Regulatory** | 📋 | 15% | Permissions, compliance, approvals |
| **Cost & Viability** | 💰 | 15% | TCO, acquisition, operating costs |
| **Sustainability & ESG** | 🌱 | 10% | Carbon, heat reuse, ESG alignment |

---

## 🎯 Scoring Cheat Sheet

### Power & Energy (6 sub-criteria)

| Score | Grid Connection | Capacity Available |
|-------|----------------|-------------------|
| 5 | <12 months | 5MW+ ready |
| 3 | 18-36 months | Some reinforcement needed |
| 1 | >5 years | Major upgrades required |

### Network & Latency (5 sub-criteria)

| Score | Latency | Carriers Available |
|-------|---------|-------------------|
| 5 | <2ms | 5+ carriers, diverse routes |
| 3 | 3-5ms | 2-3 carriers |
| 1 | >10ms | Single carrier, no diversity |

### Property & Site (6 sub-criteria)

| Score | Availability | Suitability |
|-------|-------------|-------------|
| 5 | Immediate, shovel-ready | Optimal size, suitable use class |
| 3 | Some adaptation needed | Adequate, achievable |
| 1 | Major constraints | Insufficient, complex planning |

### Planning & Regulatory (5 sub-criteria)

| Score | Permission Likelihood | Timeline |
|-------|---------------------|----------|
| 5 | Policy support, low risk | <6 months |
| 3 | Neutral, moderate risk | 6-12 months |
| 1 | Policy conflict, high risk | >18 months |

### Cost & Viability (6 sub-criteria)

| Score | Acquisition | Connection Cost |
|-------|------------|----------------|
| 5 | Below market | Minimal (<£500k) |
| 3 | Market rate | Moderate (£500k-£2M) |
| 1 | Premium | High (>£5M) |

### Sustainability & ESG (5 sub-criteria)

| Score | Grid Carbon | Heat Reuse Potential |
|-------|------------|---------------------|
| 5 | <100 gCO2/kWh | Immediate opportunity |
| 3 | 200-300 gCO2/kWh | No opportunity |
| 1 | >400 gCO2/kWh | Water-stressed area |

---

## 💡 Quick Tips

### Efficient Scoring Workflow

1. **Desktop Research First** → Score all sites to 60% confidence
2. **Site Visits** → Refine Property, Planning, Sustainability scores
3. **Technical Studies** → Finalize Power and Network scores
4. **Commercial Negotiation** → Update Cost scores

### Weight Configuration Presets

**Conservative (Low Risk)**:
```
Power: 30% | Planning: 20% | Network: 15% 
Property: 15% | Cost: 15% | Sustainability: 5%
```

**Aggressive (Speed-to-Market)**:
```
Property: 25% | Network: 25% | Power: 20%
Cost: 15% | Planning: 10% | Sustainability: 5%
```

**ESG-Led**:
```
Sustainability: 25% | Power: 25% | Planning: 20%
Network: 15% | Property: 10% | Cost: 5%
```

### Interpretation

| Overall Score | Interpretation | Action |
|--------------|---------------|---------|
| **4.5-5.0** | Exceptional | Fast-track ✅ |
| **4.0-4.4** | Strong | Proceed to DD ✅ |
| **3.5-3.9** | Viable | Proceed with caution ⚠️ |
| **3.0-3.4** | Marginal | High risk ⚠️ |
| **<3.0** | Poor | Reject ❌ |

---

## 🔧 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Site | `A` (when focused) |
| Save Scores | `Ctrl+S` / `Cmd+S` |
| Close Modal | `Esc` |
| Export | `Ctrl+E` / `Cmd+E` |

---

## ❓ Common Questions

**Q: Can I change weights after scoring sites?**  
A: Yes! Scores recalculate automatically.

**Q: How many sites can I compare?**  
A: Unlimited. UI optimized for 3-8 sites.

**Q: Is data saved automatically?**  
A: Yes, to browser localStorage. Use Export for backup.

**Q: Can I import sites from Excel?**  
A: Not yet. Manual entry for now, CSV export available.

**Q: What if criteria don't fit my needs?**  
A: Code is customizable. Edit `dc-matrix.js` to add criteria.

---

## 🆘 Troubleshooting

**Problem**: Weights don't total 100%  
**Solution**: Visual alert shown. Adjust sliders. System still works with any total.

**Problem**: Can't see radar chart  
**Solution**: Ensure Canvas is supported. Try Chrome/Firefox.

**Problem**: Data lost after refresh  
**Solution**: Check browser localStorage is enabled. Not in incognito mode.

---

## 📞 Support

- **Full Documentation**: [DC_SELECTION_MATRIX_GUIDE.md](DC_SELECTION_MATRIX_GUIDE.md)
- **Platform Guide**: [HOW_TO_USE_v2.2.md](HOW_TO_USE_v2.2.md)
- **Issues**: GitHub Issues

---

## 🎉 You're Ready!

Start evaluating your UK/EU edge data centre sites with confidence.

**Next Steps**:
1. Add 3-5 candidate sites
2. Score based on available data
3. Compare and identify top 2 sites
4. Conduct detailed diligence on top sites
5. Export results for stakeholders

Good luck with your site selection! 🏢⚡🌐

---

*EdgeNebula Orion - UK/EU Edge DC Intelligence*  
*Quick Start v1.0 - 2026-01-03*

