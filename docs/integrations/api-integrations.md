# API Integrations Specification

## Overview

This document defines the integration specifications for third-party services including SIPLatih (Ministry of Manpower), LinkedIn Certifications API, Europass, and payment gateways (GoPay, LinkAja, OVO).

## 1. SIPLatih Integration (Ministry of Manpower)

### Overview

SIPLatih (Sistem Informasi Pelatihan) is the Ministry of Manpower's training information system. Integration enables automatic reporting of training programs and credential issuance.

### Authentication

```yaml
authentication:
  type: OAuth 2.0
  grant_type: client_credentials
  token_endpoint: https://siplatih.kemnaker.go.id/api/v1/oauth/token
  client_id: ${SIPLATIH_CLIENT_ID}
  client_secret: ${SIPLATIH_CLIENT_SECRET}
  scope: training:read training:write credential:read credential:write
  token_refresh: automatic
```

### API Endpoints

#### 1.1 Register Training Program

```http
POST https://siplatih.kemnaker.go.id/api/v1/training-programs
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "program_code": "LPK-2024-001",
  "program_name": "Advanced Software Development",
  "program_name_en": "Advanced Software Development",
  "lpk_registration_number": "LPK-12345-2023",
  "lpk_name": "LPK Teknologi Indonesia",
  "program_type": "VOCATIONAL",
  "sector": "INFORMATION_TECHNOLOGY",
  "sub_sector": "SOFTWARE_DEVELOPMENT",
  "duration_days": 180,
  "duration_hours": 1440,
  "start_date": "2024-01-15",
  "end_date": "2024-07-15",
  "location": {
    "address": "Jl. Sudirman No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postal_code": "10220"
  },
  "skkni_code": "SKKNI-IT-2023-001",
  "participant_capacity": 50,
  "instructor_qualifications": [
    {
      "name": "Dr. John Doe",
      "qualification": "Ph.D. Computer Science",
      "certification": "CERT-001"
    }
  ],
  "curriculum": [
    {
      "module_name": "Microservices Architecture",
      "duration_hours": 240,
      "learning_outcomes": ["Design microservices", "Implement service mesh"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "siplatih_program_id": "SIPLATIH-2024-001234",
    "program_code": "LPK-2024-001",
    "status": "REGISTERED",
    "registration_date": "2024-01-10T10:00:00Z"
  }
}
```

#### 1.2 Report Training Completion

```http
POST https://siplatih.kemnaker.go.id/api/v1/training-programs/{siplatih_program_id}/completions
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "completion_date": "2024-07-15",
  "participants": [
    {
      "nik": "3201010101010001",
      "full_name": "John Doe",
      "completion_status": "COMPLETED",
      "final_score": 92.5,
      "certificate_number": "CERT-2024-001234"
    }
  ],
  "completion_rate": 95.0,
  "certification_rate": 90.0
}
```

#### 1.3 Submit Credential for Verification

```http
POST https://siplatih.kemnaker.go.id/api/v1/credentials/verify
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential_id": "550e8400-e29b-41d4-a716-446655440000",
  "credential_url": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
  "participant_nik": "3201010101010001",
  "skkni_code": "SKKNI-IT-2023-001",
  "issuance_date": "2024-07-15T10:30:00Z"
}
```

### Integration Service Implementation

```python
class SIPLatihIntegrationService:
    """Service for SIPLatih API integration"""
    
    def __init__(self):
        self.base_url = os.getenv('SIPLATIH_API_URL')
        self.client_id = os.getenv('SIPLATIH_CLIENT_ID')
        self.client_secret = os.getenv('SIPLATIH_CLIENT_SECRET')
        self.token_cache = {}
    
    async def get_access_token(self) -> str:
        """Get OAuth 2.0 access token"""
        # Check cache
        if 'token' in self.token_cache:
            token = self.token_cache['token']
            if token['expires_at'] > datetime.now():
                return token['access_token']
        
        # Request new token
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/oauth/token",
                data={
                    'grant_type': 'client_credentials',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret,
                    'scope': 'training:read training:write credential:read credential:write'
                }
            )
            response.raise_for_status()
            token_data = response.json()
            
            # Cache token
            self.token_cache['token'] = {
                'access_token': token_data['access_token'],
                'expires_at': datetime.now() + timedelta(seconds=token_data['expires_in'] - 60)
            }
            
            return token_data['access_token']
    
    async def register_training_program(self, program_data: dict) -> dict:
        """Register training program with SIPLatih"""
        token = await self.get_access_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/training-programs",
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                },
                json=program_data,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def report_completion(self, program_id: str, completion_data: dict) -> dict:
        """Report training completion to SIPLatih"""
        token = await self.get_access_token()
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/training-programs/{program_id}/completions",
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                },
                json=completion_data,
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
```

## 2. LinkedIn Certifications API Integration

### Overview

Integration with LinkedIn allows users to automatically add their credentials to their LinkedIn profile.

### Authentication

```yaml
authentication:
  type: OAuth 2.0
  grant_type: authorization_code
  authorization_endpoint: https://www.linkedin.com/oauth/v2/authorization
  token_endpoint: https://www.linkedin.com/oauth/v2/accessToken
  client_id: ${LINKEDIN_CLIENT_ID}
  client_secret: ${LINKEDIN_CLIENT_SECRET}
  redirect_uri: https://dgihub.go.id/auth/linkedin/callback
  scope: openid profile email w_member_social
```

### API Endpoints

#### 2.1 Add Certification to LinkedIn Profile

```http
POST https://api.linkedin.com/v2/learningActivityReports
Authorization: Bearer {user_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "activityType": "COURSE_COMPLETION",
  "completedAt": 1721030400000,
  "name": "Advanced Software Development Competency",
  "description": "Demonstrated competency in advanced software development",
  "url": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
  "organizationName": "LPK Teknologi Indonesia",
  "issueDate": 1721030400000,
  "expirationDate": 1893456000000,
  "credentialId": "550e8400-e29b-41d4-a716-446655440000",
  "credentialUrl": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
  "image": {
    "url": "https://dgihub.go.id/images/badges/adv-software-dev.png"
  }
}
```

#### 2.2 Share Credential on LinkedIn Feed

```http
POST https://api.linkedin.com/v2/ugcPosts
Authorization: Bearer {user_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "author": "urn:li:person:{person_id}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "I just earned my Advanced Software Development Competency certificate! 🎓 #VocationalTraining #Indonesia"
      },
      "shareMediaCategory": "ARTICLE",
      "media": [
        {
          "status": "READY",
          "description": {
            "text": "Advanced Software Development Competency Certificate"
          },
          "media": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
          "title": {
            "text": "Advanced Software Development Competency"
          }
        }
      ]
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

### Integration Service

```python
class LinkedInIntegrationService:
    """Service for LinkedIn API integration"""
    
    async def add_certification(
        self,
        user_access_token: str,
        credential: dict
    ) -> dict:
        """Add credential to LinkedIn profile"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.linkedin.com/v2/learningActivityReports",
                headers={
                    'Authorization': f'Bearer {user_access_token}',
                    'Content-Type': 'application/json'
                },
                json={
                    "activityType": "COURSE_COMPLETION",
                    "completedAt": int(credential['issuance_date'].timestamp() * 1000),
                    "name": credential['name'],
                    "description": credential['credentialSubject']['achievement']['description']['en-US'],
                    "url": credential['id'],
                    "organizationName": credential['issuer']['name'],
                    "issueDate": int(credential['issuanceDate'].timestamp() * 1000),
                    "expirationDate": int(credential['expirationDate'].timestamp() * 1000),
                    "credentialId": credential['id'],
                    "credentialUrl": credential['id']
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
```

## 3. Europass Integration

### Overview

Europass integration enables credential export in Europass format for European recognition.

### API Endpoints

#### 3.1 Generate Europass Digital Credential

```http
POST https://europa.eu/europass/api/credentials/issue
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://europa.eu/europass/credentials/v1"
    ],
    "type": ["VerifiableCredential", "EuropassCredential"],
    "id": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
    "issuer": {
      "id": "https://dgihub.go.id/issuers/lpk-123",
      "name": "LPK Teknologi Indonesia"
    },
    "issuanceDate": "2024-01-15T10:30:00Z",
    "credentialSubject": {
      "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
      "achievement": {
        "id": "https://dgihub.go.id/achievements/adv-software-dev-001",
        "type": "Achievement",
        "name": {
          "en": "Advanced Software Development Competency"
        },
        "description": {
          "en": "Demonstrated competency in advanced software development"
        },
        "learningOutcome": [
          {
            "type": "Knowledge",
            "description": "Advanced knowledge of microservices architecture"
          },
          {
            "type": "Skill",
            "description": "Ability to design and implement cloud-based solutions"
          },
          {
            "type": "Competence",
            "description": "Professional competency in software development"
          }
        ],
        "level": {
          "type": "AQRF",
          "value": 6
        }
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "europass_credential_id": "EP-2024-001234",
    "credential_url": "https://europa.eu/europass/credentials/EP-2024-001234",
    "qr_code": "https://europa.eu/europass/qr/EP-2024-001234"
  }
}
```

## 4. Payment Gateway Integrations

### 4.1 GoPay Integration

#### Authentication

```yaml
authentication:
  type: API Key + Signature
  merchant_id: ${GOPAY_MERCHANT_ID}
  api_key: ${GOPAY_API_KEY}
  secret_key: ${GOPAY_SECRET_KEY}
  environment: production # or sandbox
```

#### Create Payment

```http
POST https://api.gojek.com/gopay/v1/payments
Authorization: Bearer {api_key}
X-Gojek-Signature: {signature}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 500000,
  "currency": "IDR",
  "order_id": "ORDER-2024-001234",
  "description": "Training Program Registration - Advanced Software Development",
  "customer": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+6281234567890"
  },
  "callback_url": "https://dgihub.go.id/payments/callback/gopay",
  "return_url": "https://dgihub.go.id/payments/return",
  "metadata": {
    "training_program_id": "550e8400-e29b-41d4-a716-446655440000",
    "participant_id": "3201010101010001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "GOPAY-2024-001234",
    "payment_url": "https://gopay.co.id/pay/GOPAY-2024-001234",
    "qr_code": "https://gopay.co.id/qr/GOPAY-2024-001234",
    "expires_at": "2024-01-15T11:00:00Z"
  }
}
```

### 4.2 LinkAja Integration

#### Create Payment

```http
POST https://api.linkaja.com/v1/payments
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 500000,
  "currency": "IDR",
  "order_id": "ORDER-2024-001234",
  "description": "Training Program Registration",
  "customer": {
    "msisdn": "081234567890",
    "name": "John Doe"
  },
  "callback_url": "https://dgihub.go.id/payments/callback/linkaja",
  "metadata": {
    "training_program_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 4.3 OVO Integration

#### Create Payment

```http
POST https://api.ovo.id/v1.0/api/customers/transactions
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 500000,
  "merchant_id": "DGIHUB",
  "order_id": "ORDER-2024-001234",
  "description": "Training Program Registration",
  "phone": "081234567890",
  "callback_url": "https://dgihub.go.id/payments/callback/ovo"
}
```

### Payment Gateway Service

```python
class PaymentGatewayService:
    """Unified payment gateway service"""
    
    def __init__(self):
        self.gopay = GoPayClient()
        self.linkaja = LinkAjaClient()
        self.ovo = OVOClient()
    
    async def create_payment(
        self,
        amount: Decimal,
        order_id: str,
        description: str,
        customer: dict,
        payment_method: str,  # 'GOPAY', 'LINKAJA', 'OVO'
        metadata: dict = None
    ) -> dict:
        """Create payment with selected gateway"""
        
        payment_data = {
            'amount': float(amount),
            'currency': 'IDR',
            'order_id': order_id,
            'description': description,
            'customer': customer,
            'callback_url': f"https://dgihub.go.id/payments/callback/{payment_method.lower()}",
            'return_url': "https://dgihub.go.id/payments/return",
            'metadata': metadata or {}
        }
        
        if payment_method == 'GOPAY':
            return await self.gopay.create_payment(payment_data)
        elif payment_method == 'LINKAJA':
            return await self.linkaja.create_payment(payment_data)
        elif payment_method == 'OVO':
            return await self.ovo.create_payment(payment_data)
        else:
            raise ValueError(f"Unsupported payment method: {payment_method}")
    
    async def verify_payment(self, payment_id: str, payment_method: str) -> dict:
        """Verify payment status"""
        if payment_method == 'GOPAY':
            return await self.gopay.verify_payment(payment_id)
        elif payment_method == 'LINKAJA':
            return await self.linkaja.verify_payment(payment_id)
        elif payment_method == 'OVO':
            return await self.ovo.verify_payment(payment_id)
```

## API Endpoint Summary

### Internal API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/integrations/siplatih/register` | POST | Register training program |
| `/api/v1/integrations/siplatih/report-completion` | POST | Report training completion |
| `/api/v1/integrations/linkedin/connect` | GET | Connect LinkedIn account |
| `/api/v1/integrations/linkedin/add-certification` | POST | Add credential to LinkedIn |
| `/api/v1/integrations/europass/generate` | POST | Generate Europass credential |
| `/api/v1/payments/create` | POST | Create payment |
| `/api/v1/payments/verify` | POST | Verify payment status |
| `/api/v1/payments/callback/{gateway}` | POST | Payment callback |

### External API Endpoints

| Service | Base URL | Authentication |
|---------|---------|----------------|
| SIPLatih | `https://siplatih.kemnaker.go.id/api/v1` | OAuth 2.0 |
| LinkedIn | `https://api.linkedin.com/v2` | OAuth 2.0 |
| Europass | `https://europa.eu/europass/api` | API Key |
| GoPay | `https://api.gojek.com/gopay/v1` | API Key + Signature |
| LinkAja | `https://api.linkaja.com/v1` | OAuth 2.0 |
| OVO | `https://api.ovo.id/v1.0` | OAuth 2.0 |

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


