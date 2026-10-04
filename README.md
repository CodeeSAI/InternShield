# InternShield

### AI-Powered Recruitment Fraud Intelligence

InternShield analyzes suspicious internship and job offers using an evidence-first approach.

## How it works

User submits an internship/job offer
→ deterministic evidence detection
→ URL/domain extraction
→ RDAP domain intelligence
→ local Ollama Qwen AI analysis
→ final risk engine
→ explainable risk report

## Key Features

- 0–100 risk scoring
- LOW / MEDIUM / HIGH risk classification
- Payment and registration-fee detection
- OTP detection
- Sensitive identity-document detection
- WhatsApp-only communication detection
- Urgency/time-pressure detection
- Unsolicited offer detection
- URL and domain intelligence using RDAP
- Local AI analysis using Ollama + Qwen2.5:1.5b
- Additional red flags
- Verification questions
- Safety recommendations

## Technology

- React + Vite
- n8n
- Ollama
- Qwen2.5:1.5b
- RDAP
- JavaScript

## Run Locally

Start Ollama with the required model:

```bash
ollama run qwen2.5:1.5b
