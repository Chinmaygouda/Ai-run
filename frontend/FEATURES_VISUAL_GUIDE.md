# Visual Features Guide - NeuralSight Frontend

Visual reference guide showing the layout and design of each enhanced feature.

---

## 🎯 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMMAND CENTER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌────────┐│
│  │  📊 Total    │  │  💡 Insights │  │  ⭐ Avg      │ │ 💾    ││
│  │  Analyses    │  │  Found       │  │ Confidence  │ │Storage ││
│  │              │  │              │  │              │ │Used    ││
│  │      47      │  │     184      │  │      95%     │ │582 MB  ││
│  │    📈 +12%   │  │    📈 +28%   │  │   📈 +1.2%   │ │📈+8.4% ││
│  └──────────────┘  └──────────────┘  └──────────────┘ └────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   PLATFORM ACTIVITY                         ││
│  │  (AreaChart - 14 day trend)                                 ││
│  │                                                             ││
│  │        Analyses ─ • ─ • ─ • ─ • ─ Insights                ││
│  │  32 │                                                       ││
│  │  24 │     •                                                 ││
│  │  16 │   • │ •   •                                           ││
│  │   8 │  •  │  • •  • •                                       ││
│  │   0 └──────────────────────────                            ││
│  │    Jun Jun Jun Jun Jun Jun Jun                              ││
│  │    06  08  10  12  14  16  19                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐│
│  │  ACTIVE QUEUE (2)        │  │ RECENT ACTIVITY (5)            ││
│  │  ──────────────────────  │  │ ────────────────────────────    ││
│  │  📄 Customer_Churn_...  │  │ ✓ Q3_Revenue_Analysis         ││
│  │     ████████░░  65%      │  │   completed • 30 min ago       ││
│  │     ~2 min left         │  │ ⟳ Customer_Churn_Model         ││
│  │                          │  │   processing • 5 min ago       ││
│  │  📄 Customer_Churn_...  │  │ ✓ Server logs patterns         ││
│  │     ██████░░░░░░  40%    │  │   completed • 2 hours ago      ││
│  │     ~3 min left         │  │ ⚠️  Corrupted dataset           ││
│  │                          │  │   failed • 5 hours ago         ││
│  │                          │  │ ✓ Executive Report            ││
│  │                          │  │   completed • yesterday         ││
│  └──────────────────────────┘  └────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Color Key:**
- Stat cards: Dark bg with white text, green trend badge
- Chart: Violet & cyan lines on dark background
- Timeline dots: Green (✓), Violet (⟳), Red (⚠️)

---

## 📤 Upload Workflow

### Step 1: Upload Zone

```
┌─────────────────────────────────────────────────────┐
│               NEW ANALYSIS                          │
│                                                     │
│  ◎─────┬─1─┬─────┬─2─┬─────┬─3─◎  (Progress)      │
│                                                     │
│  ┌─────────────────────────────────────────────────┐│
│  │                                                 ││
│  │          ╭─────────────────╮                   ││
│  │          │                 │                   ││
│  │          │    ╰─ ◯ ─╯      │                   ││
│  │          │    (glow ring)  │                   ││
│  │          │                 │                   ││
│  │          ╰─────────────────╯                   ││
│  │                                                 ││
│  │  Drag & drop your dataset                      ││
│  │  or click to browse local files                ││
│  │                                                 ││
│  │  [CSV]  [JSON]  [PARQUET]  [XLSX]             ││
│  │                                                 ││
│  │  Max 25GB per file • E2E Encrypted            ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Step 2: Configure

```
┌─────────────────────────────────────────────────────┐
│  ANALYSIS TYPE                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────┐ │
│  │ 🧠 Exploratory │ │🔮 Predictive  │ │⚠️ Anomaly│ │
│  │ Broad scan...  │ │Train validate │ │Identify │ │
│  └────────────────┘ └────────────────┘ └─────────┘ │
│  ┌────────────────┐                                 │
│  │💬 Text Analysis│                                 │
│  │Sentiment...    │                                 │
│  └────────────────┘                                 │
│                                                     │
│  ANALYSIS NAME                                      │
│  [Customer_Churn_Analysis_________________]          │
│                                                     │
│  TAGS                                               │
│  [churn]✕  [prediction]✕  [ml]✕                    │
│  [__________________]                               │
│                                                     │
│  PRIORITY                                           │
│  [low]  [normal]✓  [high]                          │
│                                                     │
│  [Back]  [Continue to Review]                      │
└─────────────────────────────────────────────────────┘
```

### Step 3: Review

```
┌─────────────────────────────────────────────────────┐
│  REVIEW SUMMARY                                     │
│                                                     │
│  ┌───────────────┐  ┌────────────────────────────┐ │
│  │ File          │  │ Name                       │ │
│  │ customer_....│ │ Customer_Churn_Analysis    │ │
│  └───────────────┘  └────────────────────────────┘ │
│                                                     │
│  ┌───────────────┐  ┌────────────────────────────┐ │
│  │ Type          │  │ Tags                       │ │
│  │ Predictive    │  │ churn  prediction  ml      │ │
│  └───────────────┘  └────────────────────────────┘ │
│                                                     │
│  [Back]  [Upload & Analyze] ✨                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Results Page

```
┌────────────────────────────────────────────────────────────────┐
│ ANALYSIS RESULTS                                               │
│ Customer_Churn_Model • Completed 2 minutes ago  [Export]      │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────────────────────────────────────┐  ┌────────────┐  │
│ │ Model Confidence                          │  │    94%     │  │
│ │ Neural analysis complete. Significant...  │  │   ╱════╲   │  │
│ │ Churn probability has increased by 14%...│  │  │   94%  │  │
│ │                                          │  │  ╲════╱   │  │
│ └──────────────────────────────────────────┘  │            │  │
│                                                 └────────────┘  │
│                                                                 │
│ PERFORMANCE METRICS                                            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│ │ Overall      │ │ Anomalies    │ │ Processing   │ │Feature │ │
│ │ Accuracy 📈  │ │ Detected 📈  │ │ Speed 📉     │ │Correl  │ │
│ │ 94.7%        │ │ 1,243 events │ │ 142 ms/epoch │ │ 0.82r² │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ └────────┘ │
│                                                                 │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ MODEL PERFORMANCE (BarChart)                               │ │
│ │  100│   ╭╮            ╭╮                                   │ │
│ │   75│   ║╠═╮          ║╠═╮                                 │ │
│ │   50│   ║╠═╯╭╮  ╭╮   ║╠═╯                                 │ │
│ │   25│   ║║  ║╠╮ ║║   ║║                                   │ │
│ │    0└───╨╨──╨╨╯─╨╨───╨╨───────                           │ │
│ │      Accuracy Precision Recall F1-Score                    │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ KEY INSIGHTS              │  RECOMMENDATIONS                   │
│ ├─────────────────────────┼──────────────────────────────────┤ │
│ │🔴 Critical              │  ❶ Initiate re-engagement         │ │
│ │ Elevated Churn Risk     │     campaign for inactive users   │ │
│ │ Churn probability 68%...│                                  │ │
│ │ PREDICTIVE • CRITICAL   │  ❷ Investigate API gateway       │ │
│ │                         │     performance during peak load  │ │
│ │🟠 High                  │                                  │ │
│ │ Usage Spikes...         │  ❸ Deploy in-app tooltips to   │ │
│ │                         │     drive reporting tool adoption │ │
│ │🟡 Medium                │                                  │ │
│ │ Feature Adoption Lag    │  ❹ Adjust global notification   │ │
│ │                         │     schedules for 2PM-4PM window │ │
│ │🟢 Low                   │                                  │ │
│ │ Optimal Notification... │                                  │ │
│ │ 3x higher click-through │                                  │ │
│ └─────────────────────────┴──────────────────────────────────┘ │
│                                                                 │
│ [Back to Upload]  [Generate Report] ✨                        │
└────────────────────────────────────────────────────────────────┘
```

---

## 📋 History Table

```
┌────────────────────────────────────────────────────────────────┐
│ ANALYSIS HISTORY                                               │
│ 6 analyses • Filtered by all                                   │
│                                                                │
│ [All] [Completed] [Processing] [Failed]                        │
│                                                                │
│ ┌──────────────┬──────────┬────────┬────────┬────────────────┐ │
│ │ FILENAME     │ DATE     │ TYPE   │ STATUS │ CONFIDENCE     │ │
│ │ (sortable ↑↓)│ (sort ↑) │        │ (sort) │ %              │ │
│ ├──────────────┼──────────┼────────┼────────┼────────────────┤ │
│ │ customer_data│2025-06-19│CSV     │ ✓Comp  │ ████████░░  94%│ │
│ │ 14:32        │          │        │        │                │ │
│ ├──────────────┼──────────┼────────┼────────┼────────────────┤ │
│ │ sales_metrics│2025-06-18│Excel   │ ✓Comp  │ ████████░░  89%│ │
│ │ 09:15        │          │        │        │                │ │
│ ├──────────────┼──────────┼────────┼────────┼────────────────┤ │
│ │ user_behavior│2025-06-17│JSON    │ ⟳Proc  │ ░░░░░░░░░░   —  │ │
│ │ 16:42        │          │        │        │                │ │
│ ├──────────────┼──────────┼────────┼────────┼────────────────┤ │
│ │ transaction_l│2025-06-16│CSV     │ ⚠️Fail │ ░░░░░░░░░░   —  │ │
│ │ 11:08        │          │        │        │                │ │
│ └──────────────┴──────────┴────────┴────────┴────────────────┘ │
│                                                                │
│  STATS                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Total Analyses │  │ Completed ✓    │  │ Failed ⚠️      │   │
│  │ 6              │  │ 4              │  │ 1              │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 📄 Reports Carousel

```
┌──────────────────────────────────────────────────────────────────┐
│ GENERATED REPORTS                                                │
│ 4 reports available for download                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────┐  ┌─ ALL REPORTS ─────┐│
│  │                                      │  │ 1. Q3 Customer    ││
│  │  [Predictive] ✨                    │  │    Churn (24p)    ││
│  │                                      │  │ 2. H1 2025 Market ││
│  │  Q3 CUSTOMER CHURN ANALYSIS         │  │    Trends (32p)   ││
│  │  Comprehensive analysis of customer │  │ 3. API Performance││
│  │  churn patterns with predictive...  │  │    (18p)          ││
│  │                                      │  │ 4. Customer       ││
│  │  ┌─────────────────────────────────┐│  │    Sentiment (20p)││
│  │  │ Churn Distribution              ││  └───────────────────┘│
│  │  │ Trend Analysis                  ││                       │
│  │  │ Cohort Comparison               ││                       │
│  │  │ Risk Segments                   ││                       │
│  │  └─────────────────────────────────┘│                       │
│  │                                      │                       │
│  │  24 pages • 4.2 MB • 📅 2025-06-19  │                       │
│  │  [👁 Preview]  [⬇ Download]         │                       │
│  │                                      │                       │
│  │  ◉─────◯─────◯─────◯                │                       │
│  │  [◀]  [dot controls]  [▶]           │                       │
│  └──────────────────────────────────────┘                       │
│                                                                   │
│  STATISTICS                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ 📄 Reports │ │ 📋 Pages   │ │ 💾 Size    │ │ 📅 Latest  │   │
│  │ 4          │ │ 94         │ │ 16.0 MB    │ │ 2025-06-19 │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Settings Page

```
┌─────────────────────────────────────────────────────────┐
│ SETTINGS                                                │
│ Manage your account preferences and security settings   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  👤 PROFILE INFORMATION                                 │
│  Update your personal details                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Full Name  [Dr. Sarah Chen______________]       │   │
│  │ Email      [sarah.chen@neuralsight.ai__]        │   │
│  │ Phone      [+1 (555) 123-4567__________]        │   │
│  │ Organization [TechCorp Analytics______]         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🔐 CHANGE PASSWORD                                     │
│  Update your security credentials                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Current Password [••••••••••••] [👁]            │   │
│  │ New Password     [••••••••••••]                 │   │
│  │ Confirm Password [••••••••••••]                 │   │
│  │ 🔐 Password must be at least 12 characters...  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🔔 NOTIFICATIONS                                       │
│  Choose how you want to be notified                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Email Notifications               [████●]      │   │
│  │ Receive analysis completion alerts              │   │
│  │                                                 │   │
│  │ Slack Notifications                [●████]      │   │
│  │ Send alerts to your Slack workspace             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🔑 API KEYS                                            │
│  Manage your API credentials                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Live API Key                                    │   │
│  │ [sk_live_••••••••••••••••••••••••] [👁][📋]    │   │
│  │ ⚠️ Keep your API key confidential. Regenerate   │   │
│  │ [Regenerate API Key]                            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚠️ DANGER ZONE                                         │
│  Irreversible actions that require caution             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [Sign Out from All Devices]                     │   │
│  │ [Delete Account]                                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Save Changes ✓]  [Cancel]                             │
│  (Changes to green with checkmark on save)             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Component Interaction States

### Button States
```
Default:     [  Action  ]        (Violet bg)
Hover:       [  Action  ]✨      (Slightly lighter)
Active:      [  Action  ]        (Pressed effect)
Disabled:    [  Action  ]        (Grayed out)
Loading:     [  ⟳ ...  ]         (Spinning icon)
Success:     [  ✓ Done ]         (Green, checkmark)
```

### Input States
```
Normal:   [__________________________]    (White border)
Focused:  [__________________________]    (Violet ring)
Error:    [__________________________]    (Red border + message)
Disabled: [__________________________]    (Gray, no interaction)
Filled:   [Value________________]        (White text)
```

### Toggle Switch States
```
Enabled:   ████ [●]───────  (Violet)
Disabled:  ─────[●] ████    (Gray)
```

---

## 📐 Responsive Breakpoints

```
Mobile (< 768px)
├─ Single column layout
├─ Stacked components
├─ Full-width inputs
└─ Hamburger menu sidebar

Tablet (768px - 1024px)
├─ Two column layouts
├─ Side-by-side components
└─ Partial sidebar

Desktop (> 1024px)
├─ Multi-column grids
├─ Full sidebar
└─ Optimized spacing
```

---

## 🎬 Animation Timeline

```
Page Load:
├─ Fade in (400ms)
├─ Stagger elements (50-100ms apart)
└─ Slide up 20px

Hover Effects:
├─ Scale 105% (150ms)
├─ Background shift (100ms)
└─ Border brighten (100ms)

Route Transition:
├─ Exit fade out (300ms)
├─ Enter fade in (400ms)
└─ Smooth handoff

Data Updates:
├─ Skeleton load (200ms)
├─ Fade to content (300ms)
└─ Smooth number updates
```

---

**Last Updated:** June 19, 2025
**Theme:** Dark Mode Only
**Status:** Production Ready ✅
