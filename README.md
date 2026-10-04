# InternShield

## AI-Powered Recruitment Fraud Intelligence

<p align="center">
  <b>Verify before you trust.</b><br>
  An evidence-first platform for detecting suspicious internship and job offers.
</p>

---

## Overview

InternShield is an AI-powered recruitment fraud intelligence platform designed to help students and job seekers identify suspicious internship and employment offers.

The system combines:

- Deterministic scam detection rules
- URL and domain intelligence
- RDAP registration data
- Local AI analysis using Ollama + Qwen2.5:1.5b
- Explainable risk scoring
- Actionable safety recommendations

---

## How It Works

```text
User submits internship / job offer
                ↓
          n8n Webhook
                ↓
         Rules Engine
                ↓
       URL / Domain Extraction
                ↓
        RDAP Domain Intelligence
                ↓
        Local Ollama AI Analysis
                ↓
          Final Risk Engine
                ↓
        Explainable Risk Report
Product Screenshots
1. InternShield Analysis Interface

2. Explainable Risk Assessment

3. System Architecture

Key Features
Risk Detection
0–100 risk scoring
LOW / MEDIUM / HIGH classification
Registration and payment-fee detection
OTP request detection
Sensitive identity-document detection
WhatsApp-only communication detection
Urgency and time-pressure detection
Unsolicited internship/job offer detection
Domain Intelligence
Automatic URL extraction
Domain extraction
RDAP lookup
Domain registration date
Domain age calculation
Recently registered domain detection
Recruitment-related suspicious domain heuristics
Local AI Analysis

InternShield uses a locally hosted AI model:

Ollama
   └── Qwen2.5:1.5b

The AI provides:

Contextual scam analysis
Additional red flags
Verification questions
Recommended safety actions

The deterministic risk engine remains responsible for the final numeric score.

Example Detection

Example suspicious internship offer:

Congratulations! You have been selected for a remote internship.

Pay ₹2,499 registration fee to confirm your position.

Send your Aadhaar card, PAN card, and OTP to our HR manager on WhatsApp.

Complete the payment within 30 minutes or your internship will be cancelled.

Apply here: https://example.com/verify

InternShield can identify:

⚠ Registration / payment fee
⚠ OTP request
⚠ Sensitive identity documents
⚠ WhatsApp-only communication
⚠ Urgency / time pressure
⚠ Unsolicited selection message

Example result:

HIGH RISK
100 / 100

The system also provides contextual AI analysis, additional red flags, questions to ask, and recommended actions.

Technology Stack
Technology	Purpose
React	Frontend interface
Vite	Frontend development and build
JavaScript	Application logic
n8n	Workflow orchestration
Ollama	Local AI runtime
Qwen2.5:1.5b	Local AI model
RDAP	Domain intelligence
Cloudflare Quick Tunnel	Temporary public demo access
Architecture
                    INTERN SHIELD
                         │
                  React Web App
                         │
                    POST Request
                         │
                    n8n Webhook
                         │
                   Rules Engine
                         │
                Extract URL / Domain
                         │
                  RDAP Intelligence
                         │
             ┌───────────┴───────────┐
             │                       │
       Domain Evidence         Local AI Analysis
                                     │
                              Ollama + Qwen
             │                       │
             └───────────┬───────────┘
                         │
                  Final Risk Engine
                         │
                Explainable Result
Risk Assessment Logic

InternShield uses evidence-based heuristic scoring.

Typical signals include:

Registration / payment fee     +30
OTP request                    +30
Sensitive identity documents   +20
WhatsApp-only communication    +10
Urgency / time pressure        +10
Unsolicited offer              +5
Recently registered domain     +20
Suspicious domain pattern      +15

The final score is capped at:

100

Risk levels:

0–30    → LOW
31–70   → MEDIUM
71–100  → HIGH

The score is a heuristic risk indicator, not a statistically calibrated probability of fraud.

Local Setup
1. Start Ollama

Install Ollama and make sure the model is available:

ollama run qwen2.5:1.5b
2. Start n8n
npx n8n

Open:

http://localhost:5678

Make sure the InternShield workflow is available and the webhook accepts:

POST /webhook/internshield
3. Start the frontend
cd frontend
npm install
npm run dev

Open:

http://localhost:5173
Local Analysis Flow
Offer Text / URL
       ↓
Webhook
       ↓
Rules Engine
       ↓
Domain Extraction
       ↓
RDAP
       ↓
Ollama Qwen AI
       ↓
Final Risk Engine
       ↓
Risk Assessment
Privacy

InternShield follows a local-first architecture.

During local execution, AI analysis is performed using Ollama and Qwen2.5:1.5b on the user's machine rather than requiring a paid external AI API.

Sensitive offer information should still be handled carefully and users should avoid submitting unnecessary personal information.

Live Demo
Public Demo

https://translations-varieties-assignment-circuit.trycloudflare.com

The live demo uses a temporary Cloudflare Quick Tunnel connected to the local development environment. The demo is available only while the local services and tunnel are running.

Source Code
GitHub Repository

https://github.com/CodeeSAI/InternShield

Current MVP

The verified MVP currently supports:

Text-based internship/job offer analysis
Evidence-based risk scoring
URL/domain extraction
RDAP domain intelligence
Local Qwen AI analysis
Additional AI red flags
Verification questions
Safety recommendations
Explainable results
Future Scope

Planned extensions include:

Screenshot and image analysis
PDF analysis
Email analysis
Telegram-based analysis
Persistent analysis history
Expanded scam intelligence database
More advanced multimodal detection
Permanent cloud deployment
Safety Disclaimer

InternShield provides an evidence-based risk assessment and is not a guarantee that an offer is legitimate or fraudulent.

Users should independently verify organizations through official websites and trusted communication channels before:

Sending money
Sharing OTPs
Sharing Aadhaar or other identity documents
Following unfamiliar links
Project Status

Hackathon MVP — Working

Frontend
   ↓
n8n
   ↓
Rules Engine
   ↓
RDAP Domain Intelligence
   ↓
Ollama Qwen AI
   ↓
Final Risk Engine
   ↓
Explainable Risk Report
