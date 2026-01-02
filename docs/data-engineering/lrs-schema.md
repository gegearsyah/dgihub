# Learning Record Store (LRS) Schema Design

## Overview

This document defines the database schema for the Learning Record Store (LRS) that handles xAPI (Experience API) statements, including GPS and timestamp logging for Teaching Factory (TeFa) attendance.

## xAPI Statement Structure

### Core xAPI Components

An xAPI statement follows this structure:
```json
{
  "actor": { "who" },
  "verb": { "action" },
  "object": { "what" },
  "result": { "outcome" },
  "context": { "environment" },
  "timestamp": "when",
  "stored": "when stored",
  "authority": { "who verified" },
  "id": "unique identifier"
}
```

## PostgreSQL Schema for LRS

### 1. Core xAPI Statements Table

```sql
-- Core xAPI statements table
CREATE TABLE lrs.statements (
    statement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- xAPI Statement ID (unique identifier)
    xapi_statement_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Actor (who performed the action)
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('Agent', 'Group')),
    actor_account_name VARCHAR(255),
    actor_account_homepage VARCHAR(500),
    actor_mbox VARCHAR(255), -- mailto:email@example.com
    actor_mbox_sha1sum VARCHAR(40),
    actor_openid VARCHAR(500),
    actor_name VARCHAR(255),
    actor_object_type VARCHAR(50) DEFAULT 'Agent',
    actor_json JSONB NOT NULL, -- Full actor object
    
    -- Verb (the action)
    verb_id VARCHAR(500) NOT NULL, -- IRI of the verb
    verb_display JSONB NOT NULL, -- Language map: {"en-US": "completed"}
    verb_json JSONB NOT NULL, -- Full verb object
    
    -- Object (what the action was performed on)
    object_type VARCHAR(50) NOT NULL, -- Activity, Agent, Group, StatementRef, SubStatement
    object_id VARCHAR(500), -- IRI if Activity
    object_definition_name JSONB, -- Language map
    object_definition_description JSONB, -- Language map
    object_definition_type VARCHAR(500), -- Activity type IRI
    object_definition_more_info VARCHAR(500),
    object_json JSONB NOT NULL, -- Full object
    
    -- Result (outcome of the action)
    result_success BOOLEAN,
    result_completion BOOLEAN,
    result_duration VARCHAR(50), -- ISO 8601 duration
    result_score_scaled DECIMAL(5,4), -- 0.0 to 1.0
    result_score_raw DECIMAL(10,2),
    result_score_min DECIMAL(10,2),
    result_score_max DECIMAL(10,2),
    result_response TEXT,
    result_extensions JSONB,
    result_json JSONB, -- Full result object
    
    -- Context (environmental context)
    context_registration UUID, -- Registration ID for grouping statements
    context_instructor JSONB, -- Instructor agent
    context_team JSONB, -- Team group
    context_revision VARCHAR(255), -- Activity revision
    context_platform VARCHAR(255), -- Platform identifier
    context_language VARCHAR(10), -- Language code
    context_statement JSONB, -- Referenced statement
    context_extensions JSONB, -- Custom context data
    context_json JSONB, -- Full context object
    
    -- Authority (who verified the statement)
    authority_object_type VARCHAR(50) DEFAULT 'Agent',
    authority_mbox VARCHAR(255),
    authority_name VARCHAR(255),
    authority_json JSONB, -- Full authority object
    
    -- Timestamps
    statement_timestamp TIMESTAMP NOT NULL, -- When the action occurred
    stored_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When stored in LRS
    version VARCHAR(20) DEFAULT '1.0.0',
    
    -- Attachments (for evidence files)
    attachments JSONB, -- Array of attachment objects
    
    -- Full statement JSON (for complete xAPI compliance)
    statement_json JSONB NOT NULL,
    
    -- Metadata
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_statements_actor ON lrs.statements USING GIN (actor_json);
CREATE INDEX idx_statements_verb ON lrs.statements(verb_id);
CREATE INDEX idx_statements_object ON lrs.statements(object_id, object_type);
CREATE INDEX idx_statements_timestamp ON lrs.statements(statement_timestamp);
CREATE INDEX idx_statements_stored ON lrs.statements(stored_timestamp);
CREATE INDEX idx_statements_registration ON lrs.statements(context_registration);
CREATE INDEX idx_statements_tenant ON lrs.statements(tenant_id);
CREATE INDEX idx_statements_json ON lrs.statements USING GIN (statement_json);

-- Full-text search index
CREATE INDEX idx_statements_fulltext ON lrs.statements 
    USING GIN (to_tsvector('english', statement_json::text));
```

### 2. Teaching Factory (TeFa) Attendance Table

```sql
-- Teaching Factory attendance with GPS and timestamp
CREATE TABLE lrs.tefa_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Statement reference
    statement_id UUID REFERENCES lrs.statements(statement_id) ON DELETE CASCADE,
    xapi_statement_id VARCHAR(255) REFERENCES lrs.statements(xapi_statement_id),
    
    -- Participant
    participant_id VARCHAR(50) NOT NULL, -- NIK or identifier
    participant_name VARCHAR(255),
    
    -- Teaching Factory details
    tefa_id UUID NOT NULL,
    tefa_name VARCHAR(255) NOT NULL,
    tefa_location_id UUID,
    
    -- Attendance details
    attendance_type VARCHAR(50) NOT NULL CHECK (attendance_type IN ('CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END')),
    attendance_status VARCHAR(50) NOT NULL CHECK (attendance_status IN ('PRESENT', 'LATE', 'ABSENT', 'EXCUSED')),
    
    -- GPS coordinates (WGS84)
    latitude DECIMAL(10, 8) NOT NULL, -- -90 to 90
    longitude DECIMAL(11, 8) NOT NULL, -- -180 to 180
    altitude DECIMAL(10, 2), -- Meters above sea level
    accuracy DECIMAL(10, 2), -- Accuracy in meters
    heading DECIMAL(5, 2), -- Direction in degrees (0-360)
    speed DECIMAL(10, 2), -- Speed in m/s
    
    -- Location context
    location_name VARCHAR(255),
    location_address TEXT,
    geofence_id UUID, -- Reference to geofence if applicable
    geofence_radius DECIMAL(10, 2), -- Geofence radius in meters
    within_geofence BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    attendance_timestamp TIMESTAMP NOT NULL, -- Actual attendance time
    device_timestamp TIMESTAMP, -- Device-reported time
    server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Server-received time
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    
    -- Device information
    device_id VARCHAR(255),
    device_type VARCHAR(50), -- 'MOBILE', 'TABLET', 'KIOSK'
    device_manufacturer VARCHAR(100),
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    
    -- Network information
    ip_address INET,
    network_type VARCHAR(50), -- 'WIFI', 'MOBILE_DATA', 'OFFLINE'
    network_operator VARCHAR(100),
    
    -- Verification
    verification_method VARCHAR(50), -- 'GPS', 'QR_CODE', 'NFC', 'BIOMETRIC', 'MANUAL'
    verification_confidence DECIMAL(5,4), -- 0.0 to 1.0
    verified_by UUID, -- User who verified (if manual)
    verification_timestamp TIMESTAMP,
    
    -- Evidence
    photo_url VARCHAR(500), -- URL to attendance photo
    qr_code_data TEXT, -- QR code data if used
    nfc_tag_id VARCHAR(255), -- NFC tag ID if used
    biometric_match_score DECIMAL(5,4), -- Biometric match confidence
    
    -- Metadata
    metadata JSONB, -- Additional metadata
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tefa_attendance_participant ON lrs.tefa_attendance(participant_id, attendance_timestamp);
CREATE INDEX idx_tefa_attendance_tefa ON lrs.tefa_attendance(tefa_id, attendance_timestamp);
CREATE INDEX idx_tefa_attendance_timestamp ON lrs.tefa_attendance(attendance_timestamp);
CREATE INDEX idx_tefa_attendance_location ON lrs.tefa_attendance USING GIST (
    ll_to_earth(latitude, longitude)
); -- PostGIS extension for spatial queries

-- Spatial index for geolocation queries
CREATE INDEX idx_tefa_attendance_gps ON lrs.tefa_attendance USING GIST (
    point(longitude, latitude)
);
```

### 3. Geofence Definitions

```sql
-- Geofence definitions for TeFa locations
CREATE TABLE lrs.geofences (
    geofence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tefa_id UUID NOT NULL,
    geofence_name VARCHAR(255) NOT NULL,
    geofence_type VARCHAR(50) NOT NULL CHECK (geofence_type IN ('CIRCLE', 'POLYGON', 'RECTANGLE')),
    
    -- For CIRCLE type
    center_latitude DECIMAL(10, 8),
    center_longitude DECIMAL(11, 8),
    radius_meters DECIMAL(10, 2),
    
    -- For POLYGON type
    polygon_coordinates JSONB, -- Array of {lat, lng} points
    
    -- For RECTANGLE type
    north_bound DECIMAL(10, 8),
    south_bound DECIMAL(10, 8),
    east_bound DECIMAL(11, 8),
    west_bound DECIMAL(11, 8),
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geofences_tefa ON lrs.geofences(tefa_id);
```

### 4. xAPI Statement Attachments

```sql
-- Attachments for xAPI statements (evidence files)
CREATE TABLE lrs.statement_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statement_id UUID REFERENCES lrs.statements(statement_id) ON DELETE CASCADE,
    
    -- Attachment metadata
    usage_type VARCHAR(500) NOT NULL, -- IRI for usage type
    display JSONB, -- Language map for display name
    description JSONB, -- Language map for description
    content_type VARCHAR(100) NOT NULL, -- MIME type
    length BIGINT NOT NULL, -- File size in bytes
    sha2 VARCHAR(64) NOT NULL, -- SHA-256 hash
    
    -- File storage
    file_url VARCHAR(500), -- S3 URL or storage location
    file_path VARCHAR(500), -- Internal file path
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_statement ON lrs.statement_attachments(statement_id);
CREATE INDEX idx_attachments_sha2 ON lrs.statement_attachments(sha2);
```

### 5. Activity Profile Storage

```sql
-- Activity profiles for xAPI
CREATE TABLE lrs.activity_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id VARCHAR(500) NOT NULL, -- Activity IRI
    profile_id_name VARCHAR(255) NOT NULL, -- Profile key
    
    -- Profile content
    profile_content JSONB NOT NULL,
    content_type VARCHAR(100) DEFAULT 'application/json',
    
    -- Timestamps
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    
    UNIQUE(activity_id, profile_id_name, tenant_id)
);

CREATE INDEX idx_activity_profiles_activity ON lrs.activity_profiles(activity_id);
```

### 6. Agent Profile Storage

```sql
-- Agent profiles for xAPI
CREATE TABLE lrs.agent_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_json JSONB NOT NULL, -- Agent object
    profile_id_name VARCHAR(255) NOT NULL, -- Profile key
    
    -- Profile content
    profile_content JSONB NOT NULL,
    content_type VARCHAR(100) DEFAULT 'application/json',
    
    -- Timestamps
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    tenant_id UUID REFERENCES system.tenants(tenant_id),
    
    UNIQUE(agent_json, profile_id_name, tenant_id)
);

CREATE INDEX idx_agent_profiles_agent ON lrs.agent_profiles USING GIN (agent_json);
```

## Functions and Triggers

### 1. Function to Validate GPS Coordinates

```sql
CREATE OR REPLACE FUNCTION lrs.validate_gps_coordinates(
    p_latitude DECIMAL,
    p_longitude DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Validate latitude (-90 to 90)
    IF p_latitude < -90 OR p_latitude > 90 THEN
        RETURN FALSE;
    END IF;
    
    -- Validate longitude (-180 to 180)
    IF p_longitude < -180 OR p_longitude > 180 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 2. Function to Check Geofence

```sql
CREATE OR REPLACE FUNCTION lrs.check_geofence(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_geofence_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_geofence lrs.geofences%ROWTYPE;
    v_distance DECIMAL;
BEGIN
    SELECT * INTO v_geofence
    FROM lrs.geofences
    WHERE geofence_id = p_geofence_id AND is_active = TRUE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check based on geofence type
    IF v_geofence.geofence_type = 'CIRCLE' THEN
        -- Calculate distance using Haversine formula
        v_distance := (
            6371000 * acos(
                cos(radians(v_geofence.center_latitude)) *
                cos(radians(p_latitude)) *
                cos(radians(p_longitude) - radians(v_geofence.center_longitude)) +
                sin(radians(v_geofence.center_latitude)) *
                sin(radians(p_latitude))
            )
        );
        
        RETURN v_distance <= v_geofence.radius_meters;
    ELSIF v_geofence.geofence_type = 'RECTANGLE' THEN
        RETURN p_latitude <= v_geofence.north_bound AND
               p_latitude >= v_geofence.south_bound AND
               p_longitude <= v_geofence.east_bound AND
               p_longitude >= v_geofence.west_bound;
    ELSE
        -- POLYGON: Use PostGIS if available, otherwise return false
        RETURN FALSE; -- Implement polygon check with PostGIS
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### 3. Trigger for Geofence Validation

```sql
CREATE OR REPLACE FUNCTION lrs.validate_tefa_attendance_geofence()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate GPS coordinates
    IF NOT lrs.validate_gps_coordinates(NEW.latitude, NEW.longitude) THEN
        RAISE EXCEPTION 'Invalid GPS coordinates: latitude=%, longitude=%', 
            NEW.latitude, NEW.longitude;
    END IF;
    
    -- Check geofence if specified
    IF NEW.geofence_id IS NOT NULL THEN
        NEW.within_geofence := lrs.check_geofence(
            NEW.latitude, 
            NEW.longitude, 
            NEW.geofence_id
        );
        
        IF NOT NEW.within_geofence THEN
            RAISE WARNING 'Attendance GPS location is outside geofence: geofence_id=%', 
                NEW.geofence_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_tefa_geofence
    BEFORE INSERT OR UPDATE ON lrs.tefa_attendance
    FOR EACH ROW
    EXECUTE FUNCTION lrs.validate_tefa_attendance_geofence();
```

### 4. Function to Generate xAPI Statement from TeFa Attendance

```sql
CREATE OR REPLACE FUNCTION lrs.generate_tefa_attendance_statement(
    p_attendance_id UUID
) RETURNS UUID AS $$
DECLARE
    v_attendance lrs.tefa_attendance%ROWTYPE;
    v_statement_id UUID;
    v_xapi_statement_id VARCHAR(255);
    v_actor JSONB;
    v_verb JSONB;
    v_object JSONB;
    v_result JSONB;
    v_context JSONB;
    v_statement JSONB;
BEGIN
    -- Get attendance record
    SELECT * INTO v_attendance
    FROM lrs.tefa_attendance
    WHERE attendance_id = p_attendance_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Attendance record not found: %', p_attendance_id;
    END IF;
    
    -- Generate xAPI statement ID
    v_xapi_statement_id := gen_random_uuid()::text;
    
    -- Build actor (participant)
    v_actor := jsonb_build_object(
        'objectType', 'Agent',
        'account', jsonb_build_object(
            'homePage', 'https://dgihub.go.id',
            'name', v_attendance.participant_id
        ),
        'name', v_attendance.participant_name
    );
    
    -- Build verb based on attendance type
    CASE v_attendance.attendance_type
        WHEN 'CHECK_IN' THEN
            v_verb := jsonb_build_object(
                'id', 'http://adlnet.gov/expapi/verbs/initialized',
                'display', jsonb_build_object('en-US', 'initialized')
            );
        WHEN 'CHECK_OUT' THEN
            v_verb := jsonb_build_object(
                'id', 'http://adlnet.gov/expapi/verbs/completed',
                'display', jsonb_build_object('en-US', 'completed')
            );
        ELSE
            v_verb := jsonb_build_object(
                'id', 'http://adlnet.gov/expapi/verbs/experienced',
                'display', jsonb_build_object('en-US', 'experienced')
            );
    END CASE;
    
    -- Build object (TeFa activity)
    v_object := jsonb_build_object(
        'objectType', 'Activity',
        'id', 'https://dgihub.go.id/activities/tefa/' || v_attendance.tefa_id::text,
        'definition', jsonb_build_object(
            'name', jsonb_build_object('en-US', v_attendance.tefa_name),
            'type', 'http://adlnet.gov/expapi/activities/assessment',
            'extensions', jsonb_build_object(
                'https://dgihub.go.id/extensions/tefa-id', v_attendance.tefa_id::text,
                'https://dgihub.go.id/extensions/location-id', 
                    COALESCE(v_attendance.tefa_location_id::text, '')
            )
        )
    );
    
    -- Build result
    v_result := jsonb_build_object(
        'success', v_attendance.attendance_status = 'PRESENT',
        'completion', v_attendance.attendance_type IN ('CHECK_OUT'),
        'extensions', jsonb_build_object(
            'https://dgihub.go.id/extensions/gps', jsonb_build_object(
                'latitude', v_attendance.latitude,
                'longitude', v_attendance.longitude,
                'accuracy', v_attendance.accuracy
            ),
            'https://dgihub.go.id/extensions/within-geofence', 
                v_attendance.within_geofence,
            'https://dgihub.go.id/extensions/verification-method', 
                v_attendance.verification_method
        )
    );
    
    -- Build context
    v_context := jsonb_build_object(
        'extensions', jsonb_build_object(
            'https://dgihub.go.id/extensions/device', jsonb_build_object(
                'type', v_attendance.device_type,
                'manufacturer', v_attendance.device_manufacturer,
                'model', v_attendance.device_model
            ),
            'https://dgihub.go.id/extensions/network', jsonb_build_object(
                'type', v_attendance.network_type,
                'operator', v_attendance.network_operator
            )
        )
    );
    
    -- Build complete statement
    v_statement := jsonb_build_object(
        'id', v_xapi_statement_id,
        'actor', v_actor,
        'verb', v_verb,
        'object', v_object,
        'result', v_result,
        'context', v_context,
        'timestamp', v_attendance.attendance_timestamp,
        'stored', CURRENT_TIMESTAMP,
        'version', '1.0.3'
    );
    
    -- Insert statement
    INSERT INTO lrs.statements (
        xapi_statement_id,
        actor_type,
        actor_json,
        verb_id,
        verb_display,
        verb_json,
        object_type,
        object_id,
        object_json,
        result_json,
        context_json,
        statement_timestamp,
        statement_json,
        tenant_id
    ) VALUES (
        v_xapi_statement_id,
        'Agent',
        v_actor,
        v_verb->>'id',
        v_verb->'display',
        v_verb,
        'Activity',
        v_object->>'id',
        v_object,
        v_result,
        v_context,
        v_attendance.attendance_timestamp,
        v_statement,
        v_attendance.tenant_id
    ) RETURNING statement_id INTO v_statement_id;
    
    -- Update attendance record with statement reference
    UPDATE lrs.tefa_attendance
    SET statement_id = v_statement_id,
        xapi_statement_id = v_xapi_statement_id
    WHERE attendance_id = p_attendance_id;
    
    RETURN v_statement_id;
END;
$$ LANGUAGE plpgsql;
```

## Sample xAPI Statement for TeFa Attendance

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "actor": {
    "objectType": "Agent",
    "account": {
      "homePage": "https://dgihub.go.id",
      "name": "3201010101010001"
    },
    "name": "John Doe"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/initialized",
    "display": {
      "en-US": "initialized",
      "id-ID": "memulai"
    }
  },
  "object": {
    "objectType": "Activity",
    "id": "https://dgihub.go.id/activities/tefa/123e4567-e89b-12d3-a456-426614174000",
    "definition": {
      "name": {
        "en-US": "Teaching Factory - Advanced Manufacturing",
        "id-ID": "Teaching Factory - Manufaktur Lanjutan"
      },
      "type": "http://adlnet.gov/expapi/activities/assessment",
      "extensions": {
        "https://dgihub.go.id/extensions/tefa-id": "123e4567-e89b-12d3-a456-426614174000",
        "https://dgihub.go.id/extensions/location-id": "loc-001"
      }
    }
  },
  "result": {
    "success": true,
    "completion": false,
    "extensions": {
      "https://dgihub.go.id/extensions/gps": {
        "latitude": -6.2088,
        "longitude": 106.8456,
        "altitude": 8.5,
        "accuracy": 5.2,
        "heading": 45.0,
        "speed": 0.0
      },
      "https://dgihub.go.id/extensions/within-geofence": true,
      "https://dgihub.go.id/extensions/verification-method": "GPS",
      "https://dgihub.go.id/extensions/device": {
        "type": "MOBILE",
        "manufacturer": "Samsung",
        "model": "Galaxy S21"
      }
    }
  },
  "context": {
    "registration": "550e8400-e29b-41d4-a716-446655440001",
    "extensions": {
      "https://dgihub.go.id/extensions/network": {
        "type": "WIFI",
        "operator": "Telkomsel"
      },
      "https://dgihub.go.id/extensions/timezone": "Asia/Jakarta"
    }
  },
  "timestamp": "2024-01-15T08:00:00.000Z",
  "stored": "2024-01-15T08:00:05.123Z",
  "version": "1.0.3"
}
```

## Query Examples

### Get Attendance Records for a Participant

```sql
SELECT 
    ta.attendance_timestamp,
    ta.attendance_type,
    ta.attendance_status,
    ta.latitude,
    ta.longitude,
    ta.within_geofence,
    tf.tefa_name
FROM lrs.tefa_attendance ta
JOIN lrs.tefa_locations tf ON ta.tefa_id = tf.tefa_id
WHERE ta.participant_id = '3201010101010001'
  AND ta.attendance_timestamp >= CURRENT_DATE
ORDER BY ta.attendance_timestamp DESC;
```

### Get xAPI Statements for a Training Program

```sql
SELECT 
    s.xapi_statement_id,
    s.statement_timestamp,
    s.actor_json->>'name' as participant_name,
    s.object_json->'definition'->'name'->>'en-US' as activity_name,
    s.result_json->>'success' as success,
    s.statement_json
FROM lrs.statements s
WHERE s.object_json->>'id' LIKE 'https://dgihub.go.id/activities/tefa/%'
  AND s.statement_timestamp >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY s.statement_timestamp DESC;
```

### Check Geofence Compliance

```sql
SELECT 
    ta.attendance_id,
    ta.attendance_timestamp,
    ta.within_geofence,
    g.geofence_name,
    ST_Distance(
        ST_MakePoint(ta.longitude, ta.latitude)::geography,
        ST_MakePoint(g.center_longitude, g.center_latitude)::geography
    ) as distance_meters
FROM lrs.tefa_attendance ta
LEFT JOIN lrs.geofences g ON ta.geofence_id = g.geofence_id
WHERE ta.within_geofence = FALSE
  AND ta.attendance_timestamp >= CURRENT_DATE;
```

## NoSQL Alternative (DynamoDB)

For high-volume xAPI statements, consider DynamoDB:

```python
# DynamoDB table structure for xAPI statements
{
    "TableName": "xapi-statements",
    "KeySchema": [
        {
            "AttributeName": "statement_id",
            "KeyType": "HASH"
        },
        {
            "AttributeName": "stored_timestamp",
            "KeyType": "RANGE"
        }
    ],
    "GlobalSecondaryIndexes": [
        {
            "IndexName": "actor-timestamp-index",
            "KeySchema": [
                {"AttributeName": "actor_id", "KeyType": "HASH"},
                {"AttributeName": "stored_timestamp", "KeyType": "RANGE"}
            ]
        },
        {
            "IndexName": "object-timestamp-index",
            "KeySchema": [
                {"AttributeName": "object_id", "KeyType": "HASH"},
                {"AttributeName": "stored_timestamp", "KeyType": "RANGE"}
            ]
        }
    ]
}
```

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0


