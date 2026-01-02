# Integrations Documentation

## Overview

This directory contains API integration specifications for third-party services including SIPLatih (Ministry of Manpower), LinkedIn Certifications API, Europass, and payment gateways.

## Documentation

### API Integrations
**File**: `api-integrations.md`

**Contents**:
- SIPLatih integration (OAuth 2.0, training program registration, completion reporting)
- LinkedIn Certifications API (OAuth 2.0, credential sharing)
- Europass integration (credential export)
- Payment gateways (GoPay, LinkAja, OVO)
- API endpoint summary
- Integration service implementations

**Key Features**:
- OAuth 2.0 authentication
- Error handling and retry logic
- Webhook support
- Payment status tracking
- Unified payment gateway service

## Integration Summary

### External Services

| Service | Type | Authentication | Status |
|---------|------|----------------|--------|
| SIPLatih | Government API | OAuth 2.0 | Phase 2 |
| LinkedIn | Social API | OAuth 2.0 | Phase 4 |
| Europass | Credential API | API Key | Phase 4 |
| GoPay | Payment | API Key + Signature | Phase 3 |
| LinkAja | Payment | OAuth 2.0 | Phase 3 |
| OVO | Payment | OAuth 2.0 | Phase 3 |

### Internal API Endpoints

| Endpoint | Method | Description | Phase |
|----------|--------|-------------|-------|
| `/api/v1/integrations/siplatih/register` | POST | Register training program | 2 |
| `/api/v1/integrations/siplatih/report-completion` | POST | Report completion | 2 |
| `/api/v1/integrations/linkedin/connect` | GET | Connect LinkedIn | 4 |
| `/api/v1/integrations/linkedin/add-certification` | POST | Add credential | 4 |
| `/api/v1/integrations/europass/generate` | POST | Generate Europass | 4 |
| `/api/v1/payments/create` | POST | Create payment | 3 |
| `/api/v1/payments/verify` | POST | Verify payment | 3 |
| `/api/v1/payments/callback/{gateway}` | POST | Payment callback | 3 |

## Implementation Checklist

### Phase 2: SIPLatih
- [ ] OAuth 2.0 setup
- [ ] Training program registration
- [ ] Completion reporting
- [ ] Credential verification
- [ ] Error handling
- [ ] Testing

### Phase 3: Payment Gateways
- [ ] GoPay integration
- [ ] LinkAja integration
- [ ] OVO integration
- [ ] Webhook handling
- [ ] Payment status tracking
- [ ] Refund processing

### Phase 4: International
- [ ] LinkedIn integration
- [ ] Europass integration
- [ ] Credential export
- [ ] Social sharing

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


