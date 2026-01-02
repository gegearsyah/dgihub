# Credentialing Engine: Open Badges 3.0 & SKKNI/AQRF Mapping

## Overview

This document defines the credentialing engine that issues Open Badges 3.0 compliant credentials, maps Indonesian SKKNI (Standar Kompetensi Kerja Nasional Indonesia) to AQRF (ASEAN Qualifications Reference Framework), and integrates with the tax deduction system.

## Open Badges 3.0 JSON-LD Schema

### Core Open Badges 3.0 Structure

Open Badges 3.0 follows the W3C Verifiable Credentials specification with additional Badge-specific properties.

### Complete Badge Schema

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
    "https://dgihub.go.id/contexts/vocational-badge/v1"
  ],
  "type": [
    "VerifiableCredential",
    "OpenBadgeCredential"
  ],
  "id": "https://dgihub.go.id/credentials/badges/550e8400-e29b-41d4-a716-446655440000",
  "name": "Advanced Software Development Competency",
  "issuer": {
    "id": "https://dgihub.go.id/issuers/lpk-123",
    "type": "Profile",
    "name": "LPK Teknologi Indonesia",
    "url": "https://lpk-teknologi.go.id",
    "image": "https://lpk-teknologi.go.id/logo.png",
    "email": "info@lpk-teknologi.go.id",
    "verification": {
      "id": "https://lpk-teknologi.go.id/.well-known/badge-issuer.json",
      "type": "HostedBadge"
    }
  },
  "issuanceDate": "2024-01-15T10:30:00Z",
  "expirationDate": "2029-01-15T10:30:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "type": "AchievementSubject",
    "achievement": {
      "id": "https://dgihub.go.id/achievements/adv-software-dev-001",
      "type": "Achievement",
      "name": {
        "en-US": "Advanced Software Development Competency",
        "id-ID": "Kompetensi Pengembangan Perangkat Lunak Lanjutan"
      },
      "description": {
        "en-US": "Demonstrated competency in advanced software development including microservices architecture, cloud deployment, and DevOps practices.",
        "id-ID": "Menunjukkan kompetensi dalam pengembangan perangkat lunak lanjutan termasuk arsitektur microservices, deployment cloud, dan praktik DevOps."
      },
      "criteria": {
        "id": "https://dgihub.go.id/criteria/adv-software-dev-001",
        "narrative": "Completed 6-month training program with 80% minimum score in all assessments, completed capstone project, and passed competency assessment."
      },
      "image": "https://dgihub.go.id/images/badges/adv-software-dev.png",
      "issuer": {
        "id": "https://dgihub.go.id/issuers/lpk-123"
      },
      "resultDescription": [
        {
          "id": "https://dgihub.go.id/result-descriptions/score",
          "type": "ResultDescription",
          "name": {
            "en-US": "Overall Score",
            "id-ID": "Skor Keseluruhan"
          },
          "resultType": "Score",
          "value": 92.5
        },
        {
          "id": "https://dgihub.go.id/result-descriptions/grade",
          "type": "ResultDescription",
          "name": {
            "en-US": "Grade",
            "id-ID": "Nilai"
          },
          "resultType": "Grade",
          "value": "A"
        }
      ],
      "alignment": [
        {
          "targetName": {
            "en-US": "SKKNI - Software Development",
            "id-ID": "SKKNI - Pengembangan Perangkat Lunak"
          },
          "targetUrl": "https://sni.bkn.go.id/skkni/software-development",
          "targetCode": "SKKNI-IT-2023-001",
          "targetFramework": {
            "id": "https://sni.bkn.go.id/frameworks/skkni",
            "name": "Standar Kompetensi Kerja Nasional Indonesia"
          },
          "targetDescription": {
            "en-US": "National Competency Standard for Software Development",
            "id-ID": "Standar Kompetensi Kerja Nasional untuk Pengembangan Perangkat Lunak"
          }
        },
        {
          "targetName": {
            "en-US": "AQRF Level 6 - Professional",
            "id-ID": "AQRF Level 6 - Profesional"
          },
          "targetUrl": "https://aqrf.org/levels/6",
          "targetCode": "AQRF-6",
          "targetFramework": {
            "id": "https://aqrf.org/framework",
            "name": "ASEAN Qualifications Reference Framework"
          },
          "targetDescription": {
            "en-US": "AQRF Level 6: Professional level with advanced technical knowledge and skills",
            "id-ID": "AQRF Level 6: Tingkat profesional dengan pengetahuan dan keterampilan teknis lanjutan"
          }
        }
      ]
    },
    "evidence": [
      {
        "id": "https://dgihub.go.id/evidence/training-completion-001",
        "type": "Evidence",
        "name": {
          "en-US": "Training Completion Certificate",
          "id-ID": "Sertifikat Penyelesaian Pelatihan"
        },
        "description": {
          "en-US": "Certificate of completion for 6-month Advanced Software Development training program",
          "id-ID": "Sertifikat penyelesaian program pelatihan Pengembangan Perangkat Lunak Lanjutan selama 6 bulan"
        },
        "genre": "Certificate",
        "audience": {
          "en-US": "Employers and educational institutions",
          "id-ID": "Pemberi kerja dan institusi pendidikan"
        },
        "narrative": "Completed all required modules and assessments with scores above 80%",
        "subject": [
          {
            "id": "https://dgihub.go.id/subjects/module-1",
            "type": "LearningResource",
            "name": "Microservices Architecture"
          },
          {
            "id": "https://dgihub.go.id/subjects/module-2",
            "type": "LearningResource",
            "name": "Cloud Deployment"
          }
        ]
      }
    ],
    "results": [
      {
        "id": "https://dgihub.go.id/results/assessment-001",
        "type": "Result",
        "resultDescription": {
          "id": "https://dgihub.go.id/result-descriptions/score"
        },
        "value": 92.5,
        "achievedLevel": {
          "id": "https://dgihub.go.id/levels/expert",
          "type": "AchievementLevel",
          "name": {
            "en-US": "Expert",
            "id-ID": "Ahli"
          }
        }
      }
    ]
  },
  "credentialStatus": {
    "id": "https://dgihub.go.id/credentials/status/550e8400-e29b-41d4-a716-446655440000",
    "type": "RevocationList2020",
    "revocationListIndex": "94567",
    "revocationListCredential": "https://dgihub.go.id/credentials/revocation-list/2024"
  },
  "proof": {
    "type": "EcdsaSecp256r1Signature2019",
    "created": "2024-01-15T10:30:00Z",
    "verificationMethod": "did:web:dgihub.go.id:issuers:lpk-123#keys-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFUzI1NkstUiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..."
  }
}
```

## Database Schema for Credentials

### 1. Credentials Table

```sql
-- Open Badges 3.0 credentials table
CREATE TABLE credentials.badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Open Badges 3.0 fields
    credential_id VARCHAR(500) UNIQUE NOT NULL, -- Full IRI
    credential_type VARCHAR(100)[] DEFAULT ARRAY['VerifiableCredential', 'OpenBadgeCredential'],
    
    -- Issuer information
    issuer_id VARCHAR(500) NOT NULL, -- Issuer IRI
    issuer_name VARCHAR(255) NOT NULL,
    issuer_type VARCHAR(50) DEFAULT 'Profile',
    
    -- Credential subject (recipient)
    subject_id VARCHAR(500) NOT NULL, -- DID or identifier
    subject_nik VARCHAR(50), -- Encrypted NIK reference
    subject_name VARCHAR(255),
    
    -- Achievement
    achievement_id VARCHAR(500) NOT NULL,
    achievement_name JSONB NOT NULL, -- Language map
    achievement_description JSONB, -- Language map
    achievement_image_url VARCHAR(500),
    achievement_criteria_id VARCHAR(500),
    achievement_criteria_narrative TEXT,
    
    -- Results
    result_score DECIMAL(5,2),
    result_grade VARCHAR(10),
    result_level VARCHAR(100),
    
    -- Dates
    issuance_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED', 'SUSPENDED')),
    revocation_reason TEXT,
    revoked_at TIMESTAMP,
    
    -- SKKNI mapping
    skkni_code VARCHAR(100),
    skkni_name VARCHAR(255),
    skkni_url VARCHAR(500),
    
    -- AQRF mapping
    aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
    aqrf_code VARCHAR(50),
    aqrf_description JSONB, -- Language map
    
    -- Tax deduction linkage
    training_cost_id UUID REFERENCES fiscal.training_costs(training_cost_id),
    tax_deduction_eligible BOOLEAN DEFAULT FALSE,
    tax_deduction_verified BOOLEAN DEFAULT FALSE,
    tax_deduction_verified_at TIMESTAMP,
    tax_deduction_verified_by UUID,
    
    -- Evidence
    evidence_json JSONB, -- Array of evidence objects
    
    -- Full credential JSON
    credential_json JSONB NOT NULL,
    
    -- Proof (signature)
    proof_type VARCHAR(100),
    proof_verification_method VARCHAR(500),
    proof_jws TEXT,
    proof_created TIMESTAMP,
    
    -- Merkle Tree / Blockchain
    merkle_root_hash VARCHAR(64), -- SHA-256 hash
    merkle_proof JSONB,
    blockchain_tx_hash VARCHAR(66), -- Transaction hash if anchored
    blockchain_block_number BIGINT,
    blockchain_network VARCHAR(50), -- 'POLYGON', 'ETHEREUM', etc.
    anchored_at TIMESTAMP,
    
    -- Metadata
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_badges_subject ON credentials.badges(subject_id, issuance_date);
CREATE INDEX idx_badges_issuer ON credentials.badges(issuer_id, issuance_date);
CREATE INDEX idx_badges_skkni ON credentials.badges(skkni_code);
CREATE INDEX idx_badges_aqrf ON credentials.badges(aqrf_level);
CREATE INDEX idx_badges_tax ON credentials.badges(tax_deduction_eligible, tax_deduction_verified);
CREATE INDEX idx_badges_status ON credentials.badges(status, issuance_date);
CREATE INDEX idx_badges_merkle ON credentials.badges(merkle_root_hash);
CREATE INDEX idx_badges_blockchain ON credentials.badges(blockchain_tx_hash);
CREATE INDEX idx_badges_json ON credentials.badges USING GIN (credential_json);
```

### 2. SKKNI Competency Units Table

```sql
-- SKKNI (Standar Kompetensi Kerja Nasional Indonesia) competency units
CREATE TABLE credentials.skkni_units (
    skkni_unit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- SKKNI identification
    skkni_code VARCHAR(100) UNIQUE NOT NULL, -- e.g., "SKKNI-IT-2023-001"
    skkni_name VARCHAR(255) NOT NULL,
    skkni_name_en VARCHAR(255),
    skkni_url VARCHAR(500),
    
    -- Competency details
    competency_unit_code VARCHAR(100),
    competency_unit_name VARCHAR(255),
    competency_element_code VARCHAR(100),
    competency_element_name VARCHAR(255),
    
    -- Performance criteria
    performance_criteria JSONB, -- Array of criteria
    
    -- Range statement
    range_statement TEXT,
    
    -- Evidence guide
    evidence_guide TEXT,
    
    -- AQRF mapping
    aqrf_level INTEGER CHECK (aqrf_level BETWEEN 1 AND 8),
    aqrf_code VARCHAR(50),
    aqrf_justification TEXT, -- Why this SKKNI maps to this AQRF level
    
    -- Metadata
    sector VARCHAR(100), -- Industry sector
    sub_sector VARCHAR(100),
    version VARCHAR(20),
    effective_date DATE,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skkni_code ON credentials.skkni_units(skkni_code);
CREATE INDEX idx_skkni_aqrf ON credentials.skkni_units(aqrf_level);
CREATE INDEX idx_skkni_sector ON credentials.skkni_units(sector, sub_sector);
```

### 3. AQRF Levels Table

```sql
-- AQRF (ASEAN Qualifications Reference Framework) levels
CREATE TABLE credentials.aqrf_levels (
    aqrf_level_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- AQRF level
    level INTEGER UNIQUE NOT NULL CHECK (level BETWEEN 1 AND 8),
    level_code VARCHAR(50) NOT NULL, -- e.g., "AQRF-6"
    
    -- Level descriptions
    level_name JSONB NOT NULL, -- Language map
    level_description JSONB NOT NULL, -- Language map
    
    -- Knowledge, skills, and competencies
    knowledge_description JSONB,
    skills_description JSONB,
    competencies_description JSONB,
    
    -- Typical qualifications
    typical_qualifications JSONB, -- Array of typical qualifications at this level
    
    -- Metadata
    framework_version VARCHAR(20) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_aqrf_level ON credentials.aqrf_levels(level);
```

### 4. SKKNI to AQRF Mapping Table

```sql
-- Mapping between SKKNI and AQRF
CREATE TABLE credentials.skkni_aqrf_mapping (
    mapping_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    skkni_unit_id UUID REFERENCES credentials.skkni_units(skkni_unit_id),
    skkni_code VARCHAR(100) REFERENCES credentials.skkni_units(skkni_code),
    aqrf_level_id UUID REFERENCES credentials.aqrf_levels(aqrf_level_id),
    aqrf_level INTEGER REFERENCES credentials.aqrf_levels(level),
    
    -- Mapping details
    mapping_type VARCHAR(50) NOT NULL CHECK (mapping_type IN ('DIRECT', 'PARTIAL', 'EQUIVALENT')),
    mapping_confidence DECIMAL(5,4) DEFAULT 1.0, -- 0.0 to 1.0
    mapping_justification TEXT NOT NULL,
    
    -- Mapping criteria
    knowledge_alignment JSONB, -- How SKKNI knowledge aligns with AQRF
    skills_alignment JSONB, -- How SKKNI skills align with AQRF
    competencies_alignment JSONB, -- How SKKNI competencies align with AQRF
    
    -- Validation
    validated_by UUID, -- Expert who validated the mapping
    validated_at TIMESTAMP,
    validation_status VARCHAR(50) DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(skkni_unit_id, aqrf_level_id)
);

CREATE INDEX idx_mapping_skkni ON credentials.skkni_aqrf_mapping(skkni_code);
CREATE INDEX idx_mapping_aqrf ON credentials.skkni_aqrf_mapping(aqrf_level);
CREATE INDEX idx_mapping_status ON credentials.skkni_aqrf_mapping(validation_status);
```

## SKKNI to AQRF Mapping Logic

### Mapping Algorithm

```python
class SKKNIToAQRFMapper:
    """Maps SKKNI competency units to AQRF levels"""
    
    def __init__(self):
        self.db = Database()
        self.mapping_rules = MappingRules()
    
    async def map_skkni_to_aqrf(
        self,
        skkni_code: str,
        assessment_results: dict = None
    ) -> dict:
        """Map SKKNI competency to AQRF level"""
        
        # Get SKKNI unit
        skkni_unit = await self.db.get_skkni_unit(skkni_code)
        if not skkni_unit:
            raise SKKNIUnitNotFoundError(f"SKKNI unit not found: {skkni_code}")
        
        # Check for existing mapping
        existing_mapping = await self.db.get_skkni_aqrf_mapping(skkni_code)
        if existing_mapping and existing_mapping.validation_status == 'APPROVED':
            return {
                'skkni_code': skkni_code,
                'aqrf_level': existing_mapping.aqrf_level,
                'mapping_type': existing_mapping.mapping_type,
                'confidence': existing_mapping.mapping_confidence,
                'mapping_id': existing_mapping.mapping_id
            }
        
        # Perform mapping analysis
        mapping_result = await self.analyze_mapping(skkni_unit, assessment_results)
        
        return mapping_result
    
    async def analyze_mapping(
        self,
        skkni_unit: dict,
        assessment_results: dict = None
    ) -> dict:
        """Analyze SKKNI unit and determine AQRF level"""
        
        # Extract SKKNI characteristics
        skkni_characteristics = {
            'complexity': self.assess_complexity(skkni_unit),
            'autonomy': self.assess_autonomy(skkni_unit),
            'responsibility': self.assess_responsibility(skkni_unit),
            'knowledge_depth': self.assess_knowledge_depth(skkni_unit),
            'skills_range': self.assess_skills_range(skkni_unit)
        }
        
        # Get AQRF level descriptors
        aqrf_levels = await self.db.get_all_aqrf_levels()
        
        # Score each AQRF level
        level_scores = {}
        for level in aqrf_levels:
            score = await self.score_aqrf_level(level, skkni_characteristics)
            level_scores[level['level']] = score
        
        # Find best match
        best_match_level = max(level_scores.items(), key=lambda x: x[1])
        
        # Determine mapping type
        if best_match_level[1] >= 0.9:
            mapping_type = 'DIRECT'
        elif best_match_level[1] >= 0.7:
            mapping_type = 'PARTIAL'
        else:
            mapping_type = 'EQUIVALENT'
        
        return {
            'skkni_code': skkni_unit['skkni_code'],
            'aqrf_level': best_match_level[0],
            'mapping_type': mapping_type,
            'confidence': best_match_level[1],
            'justification': self.generate_justification(
                skkni_unit, best_match_level[0], skkni_characteristics
            )
        }
    
    def assess_complexity(self, skkni_unit: dict) -> float:
        """Assess complexity level (0.0 to 1.0)"""
        # Analyze performance criteria complexity
        criteria_count = len(skkni_unit.get('performance_criteria', []))
        element_count = len(skkni_unit.get('competency_elements', []))
        
        # More criteria and elements = higher complexity
        complexity_score = min(1.0, (criteria_count + element_count) / 20.0)
        return complexity_score
    
    def assess_autonomy(self, skkni_unit: dict) -> float:
        """Assess autonomy level (0.0 to 1.0)"""
        # Analyze range statement and evidence guide
        range_statement = skkni_unit.get('range_statement', '')
        evidence_guide = skkni_unit.get('evidence_guide', '')
        
        # Keywords indicating higher autonomy
        autonomy_keywords = [
            'independent', 'autonomous', 'self-directed', 
            'supervise', 'manage', 'lead'
        ]
        
        text = (range_statement + ' ' + evidence_guide).lower()
        keyword_count = sum(1 for keyword in autonomy_keywords if keyword in text)
        
        return min(1.0, keyword_count / 3.0)
    
    async def score_aqrf_level(
        self,
        aqrf_level: dict,
        skkni_characteristics: dict
    ) -> float:
        """Score how well SKKNI matches AQRF level"""
        
        scores = []
        
        # Compare knowledge requirements
        knowledge_score = self.compare_knowledge(
            aqrf_level, skkni_characteristics
        )
        scores.append(knowledge_score * 0.3)
        
        # Compare skills requirements
        skills_score = self.compare_skills(
            aqrf_level, skkni_characteristics
        )
        scores.append(skills_score * 0.3)
        
        # Compare complexity
        complexity_score = self.compare_complexity(
            aqrf_level, skkni_characteristics['complexity']
        )
        scores.append(complexity_score * 0.2)
        
        # Compare autonomy
        autonomy_score = self.compare_autonomy(
            aqrf_level, skkni_characteristics['autonomy']
        )
        scores.append(autonomy_score * 0.2)
        
        return sum(scores)
    
    def generate_justification(
        self,
        skkni_unit: dict,
        aqrf_level: int,
        characteristics: dict
    ) -> str:
        """Generate mapping justification text"""
        
        return f"""
        SKKNI {skkni_unit['skkni_code']} maps to AQRF Level {aqrf_level} based on:
        
        1. Complexity: {characteristics['complexity']:.2f} (indicates level {aqrf_level} competency)
        2. Autonomy: {characteristics['autonomy']:.2f} (matches AQRF Level {aqrf_level} autonomy requirements)
        3. Knowledge Depth: {characteristics['knowledge_depth']:.2f} (aligns with AQRF Level {aqrf_level} knowledge descriptors)
        4. Skills Range: {characteristics['skills_range']:.2f} (matches AQRF Level {aqrf_level} skills descriptors)
        
        This mapping has been validated against AQRF Level {aqrf_level} descriptors and SKKNI performance criteria.
        """
```

### Sample Mapping Data

```sql
-- Sample SKKNI to AQRF mapping
INSERT INTO credentials.skkni_aqrf_mapping (
    skkni_code,
    aqrf_level,
    mapping_type,
    mapping_confidence,
    mapping_justification,
    validation_status
) VALUES (
    'SKKNI-IT-2023-001',
    6,
    'DIRECT',
    0.95,
    'SKKNI Software Development maps directly to AQRF Level 6 (Professional) based on:
    - Advanced technical knowledge in software architecture and design patterns
    - Ability to work independently and supervise junior developers
    - Complex problem-solving skills and innovation capabilities
    - Professional responsibility and ethical considerations',
    'APPROVED'
);
```

## Credential Issuance with SKKNI/AQRF Mapping

```python
class CredentialIssuanceService:
    """Issue Open Badges 3.0 credentials with SKKNI/AQRF mapping"""
    
    async def issue_badge(
        self,
        issuer_id: str,
        subject_id: str,
        achievement_id: str,
        training_completion_id: UUID,
        assessment_results: dict
    ) -> dict:
        """Issue Open Badge 3.0 credential"""
        
        # Get achievement details
        achievement = await self.get_achievement(achievement_id)
        
        # Get SKKNI mapping
        skkni_mapping = await self.skkni_mapper.map_skkni_to_aqrf(
            achievement['skkni_code'],
            assessment_results
        )
        
        # Build credential
        credential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
                "https://dgihub.go.id/contexts/vocational-badge/v1"
            ],
            "type": ["VerifiableCredential", "OpenBadgeCredential"],
            "id": f"https://dgihub.go.id/credentials/badges/{uuid.uuid4()}",
            "name": achievement['name']['en-US'],
            "issuer": await self.get_issuer_profile(issuer_id),
            "issuanceDate": datetime.now().isoformat() + "Z",
            "expirationDate": (datetime.now() + timedelta(days=1825)).isoformat() + "Z",
            "credentialSubject": {
                "id": subject_id,
                "type": "AchievementSubject",
                "achievement": {
                    "id": f"https://dgihub.go.id/achievements/{achievement_id}",
                    "type": "Achievement",
                    "name": achievement['name'],
                    "description": achievement['description'],
                    "criteria": {
                        "id": f"https://dgihub.go.id/criteria/{achievement['criteria_id']}",
                        "narrative": achievement['criteria_narrative']
                    },
                    "alignment": [
                        {
                            "targetName": {
                                "en-US": f"SKKNI - {achievement['skkni_name']}",
                                "id-ID": f"SKKNI - {achievement['skkni_name_id']}"
                            },
                            "targetUrl": achievement['skkni_url'],
                            "targetCode": achievement['skkni_code'],
                            "targetFramework": {
                                "id": "https://sni.bkn.go.id/frameworks/skkni",
                                "name": "Standar Kompetensi Kerja Nasional Indonesia"
                            }
                        },
                        {
                            "targetName": {
                                "en-US": f"AQRF Level {skkni_mapping['aqrf_level']}",
                                "id-ID": f"AQRF Level {skkni_mapping['aqrf_level']}"
                            },
                            "targetUrl": f"https://aqrf.org/levels/{skkni_mapping['aqrf_level']}",
                            "targetCode": f"AQRF-{skkni_mapping['aqrf_level']}",
                            "targetFramework": {
                                "id": "https://aqrf.org/framework",
                                "name": "ASEAN Qualifications Reference Framework"
                            },
                            "targetDescription": {
                                "en-US": await self.get_aqrf_description(skni_mapping['aqrf_level']),
                                "id-ID": await self.get_aqrf_description(skni_mapping['aqrf_level'], 'id-ID')
                            }
                        }
                    ]
                },
                "results": [
                    {
                        "id": f"https://dgihub.go.id/results/{assessment_results['result_id']}",
                        "type": "Result",
                        "resultDescription": {
                            "id": "https://dgihub.go.id/result-descriptions/score"
                        },
                        "value": assessment_results['score']
                    }
                ]
            }
        }
        
        # Sign credential
        signed_credential = await self.sign_credential(credential, issuer_id)
        
        # Store credential
        await self.store_credential(signed_credential, skkni_mapping)
        
        # Link to training cost for tax deduction
        await self.link_to_training_cost(
            signed_credential['id'],
            training_completion_id
        )
        
        return signed_credential
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


