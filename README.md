<h1 align="center">🛡️ RiskLock</h1>

---

<p align="center">
  <strong>Real-Time Pre-Trade Risk Engine & High-Frequency Trading Circuit Breaker</strong>
</p>

<p align="center">
  <strong>Sub-millisecond risk checks | Live Candlestick Analytics | Emergency Kill Switch</strong>
</p>

<p align="center">
  <a href="https://ais-pre-5h5li64qh3jpmykiekilhs-793037711970.asia-southeast1.run.app"><strong>View in AI Studio</strong></a>
</p>

---

## 🚀 Overview

RiskLock is a state-of-the-art pre-trade risk management and algorithmic safety platform designed specifically for high-frequency trading (HFT) and retail brokerage environments. It doesn't just process orders; it evaluates risk in **sub-millisecond intervals** by auditing margin exposure, runaway order frequency, fat-finger price deviance, and server version drift before orders reach stock exchanges (NSE / BSE).

---

## ✨ Core Features

- 🛡️ **Sub-Millisecond Risk Filtering**: Automatically calculates and rejects orders exceeding firm-wide exposure or single-order size limits in real-time.
- 🚨 **Emergency Kill Switch**: A global system-wide lockdown gesture that instantly cancels active orders and disables outbound order routing.
- 📊 **Real-Time Candlestick Monitoring**: Live streaming OHLCV charts across top Indian equities (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK).
- 🧪 **Interactive Rogue Loop Simulator**: Demonstrates automated circuit breaker mitigation against high-frequency runaway order loops.
# 🛡️ RiskLock — Automated Pre-Trade Risk & Circuit-Breaker Engine

> **"Detect the Anomaly. Stop the Damage. Protect the Capital."**

**RiskLock** is a real-time pre-trade risk management, algorithmic safety, and market monitoring platform tailored for high-frequency trading (HFT) and modern retail brokerage infrastructure. Inspired by real-world market catastrophic failures (such as the 2012 Knight Capital incident), RiskLock inspects, audits, and gates orders before they reach stock exchanges like the NSE and BSE.

---

### ✨ Key Features

- **📊 Real-Time Candlestick Stock Monitoring:**
  - Interactive candlestick chart with live OHLCV ticks across major Indian equities (RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK).
  - Configurable technical overlays (SMA 20/50, Bollinger Bands, Volume bars, crosshair inspection).
  - Visual breach indicators that flag rogue order bursts and volatility spikes directly on the chart.

- **⚡ Sub-Millisecond Pre-Trade Risk Filtering:**
  - **Exposure & Margin Guard:** Dynamic checks against total firm exposure and single-order limits (formatted in ₹ INR / Lakhs / Crores).
  - **Fat-Finger & Volatility Protection:** Rejects orders exceeding maximum permitted price deviance (5%) and single-order limits (₹50,00,000 max).
  - **Burst Frequency Throttler:** Flags abnormal order submission bursts (e.g., >2,500 orders/sec) to prevent runaway algorithmic loops.

- **🚨 Multi-Tier Emergency Kill Switches:**
  - **Global Kill Switch:** One-click emergency halt across all connected execution gateways.
  - **Auto-Circuit Breaker:** Automatic trigger upon hitting cumulative loss limits or excessive rejection thresholds.
  - **Version Drift & Canister Guard:** Disables rogue nodes running deprecated order-routing binaries before erroneous trades leave the network.

- **🧪 Interactive Scenario Simulator & Test Injector:**
  - **Normal Market:** Smooth order flow and live telemetry under standard risk bounds.
  - **Rogue Trading Loop:** Simulates an infinite loop algorithm firing 4,000+ orders/sec and showcases sub-second automated mitigation.
  - **Manual Order Injector:** Inject custom simulated Buy/Sell orders in ₹ INR with one-click test cases (Safe ₹1.5L vs Oversized ₹1.2 Cr).

- **🧠 Plain-Language Incident Explainer & Educational Mode:**
  - Real-time root cause analysis explaining anomalies, breaches, and mitigation steps in simple, beginner-friendly terms.
  - Financial glossary covering Margin, Exposure, P&L, Kill Switch, and Drift Detection.

---

### 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Visualization:** Custom SVG Candlestick & Volume Engine, Lucide Icons, Motion
- **Build & Dev Tooling:** Vite, Node.js
