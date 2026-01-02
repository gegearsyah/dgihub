# Architecture Overview

## System Architecture Diagram

```mermaid
graph TB
    subgraph "External Users"
        GOV_USER[Government Users]
        LPK_USER[LPK Users]
        EMP_USER[Employer Users]
        MOBILE[Mobile Apps]
    end
    
    subgraph "Edge Layer - AWS Jakarta"
        CF[CloudFront CDN]
        WAF[AWS WAF]
        SHIELD[Shield DDoS]
    end
    
    subgraph "API Layer"
        APIGW[API Gateway v2]
        RATE[Rate Limiting]
    end
    
    subgraph "Application Services - ECS Fargate"
        AUTH[Authentication Service]
        EKYC[e-KYC Service]
        CRED[Credential Service]
        CONSENT[Consent Service]
        DID[DID Service]
        AUDIT[Audit Service]
    end
    
    subgraph "Security Infrastructure"
        HSM[CloudHSM v2<br/>Digital Signatures]
        KMS[KMS<br/>Key Management]
        SECRETS[Secrets Manager]
    end
    
    subgraph "Identity Infrastructure"
        DID_REG[DID Registry]
        VC_STORE[VC Storage]
        REV_REG[Revocation Registry]
    end
    
    subgraph "Data Layer"
        RDS[(RDS PostgreSQL<br/>Multi-AZ Encrypted)]
        DYNAMO[(DynamoDB<br/>Global Tables)]
        S3[(S3 Encrypted<br/>Documents & Biometrics)]
        REDIS[(ElastiCache Redis)]
    end
    
    subgraph "External Services"
        DUKCAPIL[Dukcapil API<br/>NIK Validation]
        KOMINFO[Kominfo<br/>Regulator]
    end
    
    subgraph "Monitoring"
        CW[CloudWatch]
        XRAY[X-Ray]
        PROM[Prometheus]
    end
    
    GOV_USER --> CF
    LPK_USER --> CF
    EMP_USER --> CF
    MOBILE --> CF
    
    CF --> WAF
    WAF --> SHIELD
    SHIELD --> APIGW
    APIGW --> RATE
    
    RATE --> AUTH
    RATE --> EKYC
    RATE --> CRED
    RATE --> CONSENT
    RATE --> DID
    
    AUTH --> HSM
    EKYC --> HSM
    EKYC --> DUKCAPIL
    CRED --> HSM
    CRED --> DID_REG
    CRED --> VC_STORE
    CRED --> REV_REG
    CONSENT --> KMS
    DID --> DID_REG
    DID --> HSM
    
    AUTH --> RDS
    EKYC --> RDS
    CRED --> RDS
    CONSENT --> DYNAMO
    AUDIT --> DYNAMO
    EKYC --> S3
    CRED --> S3
    
    AUTH --> REDIS
    EKYC --> REDIS
    CRED --> REDIS
    
    CONSENT --> KOMINFO
    AUDIT --> KOMINFO
    
    AUTH --> CW
    EKYC --> CW
    CRED --> CW
    CONSENT --> CW
    AUDIT --> CW
    
    CRED --> XRAY
    EKYC --> XRAY
```

## Data Flow: Credential Issuance

```mermaid
sequenceDiagram
    participant LPK as LPK User
    participant API as API Gateway
    participant Auth as Auth Service
    participant Consent as Consent Service
    participant Cred as Credential Service
    participant HSM as CloudHSM
    participant DID as DID Service
    participant DB as Database
    participant S3 as S3 Storage
    
    LPK->>API: Request Credential Issuance
    API->>Auth: Authenticate User
    Auth->>API: Authentication Success
    API->>Consent: Check Consent
    Consent->>DB: Verify Consent Record
    DB->>Consent: Consent Valid
    Consent->>API: Consent Verified
    API->>Cred: Issue Credential
    Cred->>DID: Resolve Issuer DID
    DID->>Cred: DID Document
    Cred->>HSM: Sign Credential
    HSM->>Cred: Digital Signature
    Cred->>DB: Store Credential Metadata
    Cred->>S3: Store Encrypted Credential
    Cred->>API: Credential Issued
    API->>LPK: Return Credential
```

## Data Flow: e-KYC Process

```mermaid
sequenceDiagram
    participant User as User
    participant App as Mobile App
    participant API as API Gateway
    participant EKYC as e-KYC Service
    participant Consent as Consent Service
    participant NIK as NIK Validator
    participant Dukcapil as Dukcapil API
    participant Bio as Biometric Service
    participant HSM as CloudHSM
    participant S3 as S3 Storage
    
    User->>App: Start e-KYC
    App->>API: Initiate KYC
    API->>EKYC: Create KYC Session
    EKYC->>User: Request NIK
    User->>EKYC: Provide NIK
    EKYC->>NIK: Validate NIK
    NIK->>Dukcapil: Verify NIK
    Dukcapil->>NIK: NIK Valid
    NIK->>EKYC: Validation Result
    EKYC->>Consent: Request Biometric Consent
    Consent->>User: Consent Request
    User->>Consent: Grant Consent
    Consent->>EKYC: Consent Granted
    EKYC->>User: Request Biometric
    User->>App: Capture Biometric
    App->>Bio: Send Biometric Data
    Bio->>Bio: Liveness Detection
    Bio->>HSM: Encrypt Biometric
    HSM->>Bio: Encrypted Template
    Bio->>S3: Store Encrypted
    Bio->>EKYC: Biometric Verified
    EKYC->>User: KYC Complete
```

## Security Layers

```mermaid
graph TB
    subgraph "Layer 1: Network Security"
        WAF[WAF - DDoS Protection]
        SHIELD[Shield]
        VPC[VPC Isolation]
        SG[Security Groups]
    end
    
    subgraph "Layer 2: Application Security"
        AUTH[Authentication]
        RBAC[Role-Based Access]
        JIT[Just-In-Time Access]
        RATE[Rate Limiting]
    end
    
    subgraph "Layer 3: Data Security"
        ENC_REST[Encryption at Rest]
        ENC_TRANS[Encryption in Transit]
        HSM_ENC[HSM Encryption]
        KMS_ENC[KMS Encryption]
    end
    
    subgraph "Layer 4: Monitoring"
        AUDIT[Audit Logging]
        MONITOR[Security Monitoring]
        ALERT[Alerting]
        ANOMALY[Anomaly Detection]
    end
    
    WAF --> AUTH
    SHIELD --> AUTH
    VPC --> ENC_REST
    SG --> ENC_REST
    
    AUTH --> RBAC
    RBAC --> JIT
    JIT --> ENC_REST
    
    ENC_REST --> HSM_ENC
    ENC_REST --> KMS_ENC
    ENC_TRANS --> HSM_ENC
    
    HSM_ENC --> AUDIT
    KMS_ENC --> AUDIT
    AUDIT --> MONITOR
    MONITOR --> ALERT
    ALERT --> ANOMALY
```

## Multi-Tenancy Isolation

```mermaid
graph TB
    subgraph "Tenant: Government"
        GOV_SCHEMA[(gov_tenant Schema)]
        GOV_DATA[Government Data]
        GOV_ACCESS[Government Access]
    end
    
    subgraph "Tenant: LPK"
        LPK_SCHEMA[(lpk_tenant Schema)]
        LPK_DATA[LPK Data]
        LPK_ACCESS[LPK Access]
    end
    
    subgraph "Tenant: Employer"
        EMP_SCHEMA[(emp_tenant Schema)]
        EMP_DATA[Employer Data]
        EMP_ACCESS[Employer Access]
    end
    
    subgraph "Shared Resources"
        SHARED_SCHEMA[(shared Schema)]
        CRED_DATA[Credentials - Encrypted]
        CONSENT_DATA[Consent Records]
    end
    
    subgraph "Isolation Layer"
        RLS[Row-Level Security]
        CONTEXT[Tenant Context]
        POLICY[Access Policies]
    end
    
    GOV_ACCESS --> CONTEXT
    LPK_ACCESS --> CONTEXT
    EMP_ACCESS --> CONTEXT
    
    CONTEXT --> RLS
    RLS --> POLICY
    
    POLICY --> GOV_SCHEMA
    POLICY --> LPK_SCHEMA
    POLICY --> EMP_SCHEMA
    POLICY --> SHARED_SCHEMA
    
    GOV_SCHEMA --> GOV_DATA
    LPK_SCHEMA --> LPK_DATA
    EMP_SCHEMA --> EMP_DATA
    SHARED_SCHEMA --> CRED_DATA
    SHARED_SCHEMA --> CONSENT_DATA
```

## Compliance Workflow

```mermaid
graph TB
    subgraph "Privacy by Design"
        PIA[Privacy Impact Assessment]
        MIN[Data Minimization]
        PURP[Purpose Limitation]
        RET[Retention Policies]
    end
    
    subgraph "Consent Management"
        COLLECT[Consent Collection]
        STORE[Consent Storage]
        ENFORCE[Consent Enforcement]
        WITHDRAW[Consent Withdrawal]
    end
    
    subgraph "Breach Response"
        DETECT[Breach Detection]
        ASSESS[Impact Assessment]
        CONTAIN[Containment]
        NOTIFY[72-Hour Notification]
    end
    
    subgraph "Data Subject Rights"
        REQUEST[Request Received]
        VERIFY[Identity Verification]
        PROCESS[Process Request]
        RESPOND[72-Hour Response]
    end
    
    PIA --> COLLECT
    MIN --> COLLECT
    PURP --> COLLECT
    RET --> COLLECT
    
    COLLECT --> STORE
    STORE --> ENFORCE
    ENFORCE --> WITHDRAW
    
    DETECT --> ASSESS
    ASSESS --> CONTAIN
    CONTAIN --> NOTIFY
    
    REQUEST --> VERIFY
    VERIFY --> PROCESS
    PROCESS --> RESPOND
```

## Key Performance Indicators

### Infrastructure
- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)
- **Credential Issuance**: < 2 seconds
- **Credential Verification**: < 500ms
- **e-KYC Completion**: < 5 minutes

### Security
- **Encryption Coverage**: 100%
- **Access Control Enforcement**: 100%
- **Audit Log Completeness**: 100%
- **Security Incident Response**: < 1 hour

### Compliance
- **Breach Notification**: < 72 hours
- **Data Subject Request Response**: < 72 hours
- **Consent Coverage**: 100%
- **Data Retention Compliance**: 100%

### Availability
- **Uptime**: 99.9%
- **RTO**: 4 hours
- **RPO**: 1 hour
- **Failover Time**: < 5 minutes

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **CDN** | CloudFront | Content delivery and caching |
| **WAF** | AWS WAF | Web application firewall |
| **API** | API Gateway v2 | API management and routing |
| **Compute** | ECS Fargate | Container orchestration |
| **Service Mesh** | App Mesh | Service-to-service communication |
| **Database** | RDS PostgreSQL | Primary data store |
| **NoSQL** | DynamoDB | Session and audit logs |
| **Storage** | S3 | Documents and backups |
| **Cache** | ElastiCache Redis | Caching and sessions |
| **HSM** | CloudHSM v2 | Digital signatures and encryption |
| **KMS** | AWS KMS | Key management |
| **Monitoring** | CloudWatch, X-Ray, Prometheus | Observability |
| **Identity** | DID Registry | Decentralized identity |

## Deployment Regions

### Primary: Jakarta (ap-southeast-5)
- All production services
- Multi-AZ deployment
- Primary data storage

### Secondary: Singapore (ap-southeast-1)
- Disaster recovery site
- RDS read replica
- DynamoDB global table replica
- S3 cross-region replication

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


