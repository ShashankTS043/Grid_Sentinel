# ⚡ Grid Sentinel: AI-Powered IoT Digital Twin

![Project Status](https://img.shields.io/badge/Status-Prototype%20V1-success)
![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20|%20React%20|%20ESP32-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> A next-generation smart grid monitoring system that detects power theft, predicts transformer failures, and identifies physical tampering using Audio AI and Physics Engines.

---

## 📸 Dashboard Preview
![Dashboard Screenshot](https://via.placeholder.com/1000x500?text=Grid+Sentinel+Dashboard+Screenshot)

---

## 🚀 Key Features

### 🧠 1. AI & Physics Hybrid Core
Unlike standard IoT monitors, Grid Sentinel uses a dual-engine approach:
- **Physics Engine:** Calculates *Rate of Rise* (Thermal Shock) and *Aging Factors* based on IEEE standards.
- **Audio AI:** Analyzes vibration frequencies (via Piezo sensors) to detect physical tampering (sawing/hammering) or internal mechanical loosening.

### 🛡️ 2. Anti-Theft & Security
- **Differential Current Analysis:** Compares Source (Transformer) vs. Destination (Meter) current in real-time.
- **Automatic Cut-Off:** Instantly triggers a relay kill-switch if theft > 300mA is detected.
- **Twilio SMS Alerts:** Sends critical security warnings directly to grid operators.

### 🔮 3. Predictive Maintenance (The "Oracle")
- Uses linear regression models on live temperature data to predict *time-to-failure*.
- Warns operators *before* a blackout occurs.

---

## 🏗️ System Architecture

| Component | Tech Stack | Responsibility |
|-----------|-----------|----------------|
| **Hardware** | ESP32, ACS712, Piezo, DS18B20 | Edge sensing & Relay control |
| **Communication** | MQTT (HiveMQ) | Real-time low-latency data stream |
| **Backend** | Python, FastAPI, SQLAlchemy | Data processing, AI logic, Alerting |
| **Frontend** | React, Vite, TailwindCSS | Digital Twin visualization & controls |

---

