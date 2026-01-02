# Data Engineering Documentation

## Overview

This directory contains comprehensive documentation for the Learning Record Store (LRS), Credentialing Engine, Fiscal Logic, and Blockchain Anchoring systems.

## Documentation Index

### 1. Learning Record Store (LRS) Schema
**File**: `lrs-schema.md`

**Contents**:
- PostgreSQL schema for xAPI (Experience API) statements
- Teaching Factory (TeFa) attendance with GPS and timestamp logging
- Geofence definitions and validation
- xAPI statement generation from attendance records
- Sample xAPI statements

**Key Features**:
- Full xAPI 1.0.3 compliance
- GPS coordinate validation
- Geofence checking
- Automatic xAPI statement generation
- Attachment support

**Use When**:
- Implementing learning activity tracking
- Setting up TeFa attendance system
- Generating xAPI statements
- Querying learning records

---

### 2. Credentialing Engine
**File**: `credentialing-engine.md`

**Contents**:
- Open Badges 3.0 JSON-LD schema
- Database schema for credentials
- SKKNI (Standar Kompetensi Kerja Nasional Indonesia) to AQRF (ASEAN Qualifications Reference Framework) mapping
- Credential issuance service
- Mapping algorithm and logic

**Key Features**:
- W3C Verifiable Credentials compliant
- Open Badges 3.0 standard
- Automatic SKKNI to AQRF mapping
- Multi-language support (en-US, id-ID)
- Evidence and results tracking

**Use When**:
- Issuing verifiable credentials
- Mapping Indonesian competencies to ASEAN framework
- Building credential verification systems
- Integrating with international standards

---

### 3. Fiscal Logic: Tax Deduction
**File**: `fiscal-logic-tax-deduction.md`

**Contents**:
- 200% Super Tax Deduction implementation (PMK 128/2019)
- Training cost tracking
- Tax deduction verification
- Database triggers for automatic calculation
- Linkage between training costs and verified credentials

**Key Features**:
- Automatic tax deduction calculation
- Verification workflow
- Training cost to credential linkage
- Compliance with PMK 128/2019
- Tax filing integration

**Use When**:
- Implementing tax deduction features
- Verifying training costs
- Linking credentials to tax deductions
- Generating tax reports

---

### 4. Merkle Tree & Blockchain Anchoring
**File**: `merkle-blockchain-anchoring.md`

**Contents**:
- Merkle tree construction for credential batching
- Blockchain anchoring strategy
- Smart contract interface
- Verification process
- Non-repudiation implementation

**Key Features**:
- Efficient batch anchoring
- Merkle proof generation
- Blockchain transaction management
- Credential verification
- Cost-effective anchoring

**Use When**:
- Anchoring credentials to blockchain
- Verifying credential authenticity
- Implementing non-repudiation
- Building trust systems

---

### 5. Sample Credential Payload
**File**: `sample-credential-payload.json`

**Contents**:
- Complete Open Badges 3.0 credential example
- SKKNI and AQRF alignment
- Evidence and results
- Merkle proof inclusion
- Tax deduction information

**Use When**:
- Understanding credential structure
- Testing credential issuance
- Verifying credential format
- Integration reference

---

## Quick Reference

### Database Schemas

| Schema | Purpose | Tables |
|--------|---------|--------|
| `lrs` | Learning Record Store | `statements`, `tefa_attendance`, `geofences`, `statement_attachments` |
| `credentials` | Credentialing | `badges`, `skkni_units`, `aqrf_levels`, `skkni_aqrf_mapping` |
| `fiscal` | Tax Deduction | `training_costs`, `training_cost_participants`, `tax_deduction_verifications` |
| `blockchain` | Blockchain Anchoring | `merkle_batches`, `credential_anchors`, `transactions` |

### Key Workflows

#### 1. Learning Activity Tracking
```
User Activity → xAPI Statement → LRS Storage → Analytics
```

#### 2. Credential Issuance
```
Training Completion → Assessment → SKKNI Mapping → AQRF Mapping → Credential Issuance → Blockchain Anchoring
```

#### 3. Tax Deduction
```
Training Cost Registration → Training Completion → Credential Issuance → Verification → Tax Deduction Eligibility
```

#### 4. Blockchain Anchoring
```
Credential Batch → Merkle Tree → Blockchain Transaction → Verification
```

## Implementation Checklist

### Phase 1: LRS Setup
- [ ] Create LRS database schema
- [ ] Implement xAPI statement storage
- [ ] Set up TeFa attendance tracking
- [ ] Configure geofence validation
- [ ] Test xAPI statement generation

### Phase 2: Credentialing
- [ ] Create credential database schema
- [ ] Implement Open Badges 3.0 issuance
- [ ] Set up SKKNI to AQRF mapping
- [ ] Build credential verification
- [ ] Test credential issuance

### Phase 3: Fiscal Logic
- [ ] Create fiscal database schema
- [ ] Implement training cost tracking
- [ ] Set up tax deduction triggers
- [ ] Build verification workflow
- [ ] Test tax deduction calculation

### Phase 4: Blockchain Anchoring
- [ ] Deploy smart contract
- [ ] Implement Merkle tree builder
- [ ] Set up blockchain service
- [ ] Build anchoring workflow
- [ ] Test verification process

## Integration Points

### LRS → Credentialing
- Training completion tracked in LRS
- xAPI statements used as evidence for credentials
- Attendance records linked to credential issuance

### Credentialing → Fiscal
- Credentials linked to training costs
- Credential verification triggers tax deduction eligibility
- Completion rate calculated from credential issuance

### Credentialing → Blockchain
- Credentials batched into Merkle trees
- Merkle roots anchored to blockchain
- Verification uses Merkle proofs

## API Endpoints

### LRS
- `POST /api/v1/lrs/statements` - Store xAPI statement
- `GET /api/v1/lrs/statements/{id}` - Get statement
- `POST /api/v1/lrs/tefa/attendance` - Record TeFa attendance
- `GET /api/v1/lrs/tefa/attendance` - Get attendance records

### Credentialing
- `POST /api/v1/credentials/issue` - Issue credential
- `GET /api/v1/credentials/{id}` - Get credential
- `POST /api/v1/credentials/{id}/verify` - Verify credential
- `GET /api/v1/credentials/skkni/{code}/aqrf` - Get AQRF mapping

### Fiscal
- `POST /api/v1/fiscal/training-costs` - Register training cost
- `GET /api/v1/fiscal/training-costs/{id}` - Get training cost
- `POST /api/v1/fiscal/training-costs/{id}/verify` - Verify for tax deduction
- `GET /api/v1/fiscal/tax-deduction/{employer_id}` - Get tax deduction summary

### Blockchain
- `POST /api/v1/blockchain/anchor` - Anchor credential batch
- `GET /api/v1/blockchain/verify/{credential_id}` - Verify credential anchor
- `GET /api/v1/blockchain/batches/{id}` - Get batch information

## Testing

### Unit Tests
- Merkle tree construction and verification
- SKKNI to AQRF mapping algorithm
- Tax deduction calculation
- xAPI statement generation

### Integration Tests
- Credential issuance workflow
- Tax deduction verification
- Blockchain anchoring
- LRS statement storage

### End-to-End Tests
- Complete credential lifecycle
- Tax deduction workflow
- Blockchain verification
- Learning activity tracking

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


