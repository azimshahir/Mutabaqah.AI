-- Mutabaqah.AI Database Schema
-- Automated Shariah Governance Middleware

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- ENUMS
-- ===========================================

CREATE TYPE financing_status AS ENUM (
  'draft',
  'submitted',
  't1_pending',
  't1_validated',
  't2_pending',
  't2_validated',
  'approved',
  'blocked',
  'disbursed'
);

CREATE TYPE product_type AS ENUM (
  'personal_financing_i',
  'home_financing_i',
  'vehicle_financing_i',
  'business_financing_i'
);

CREATE TYPE transaction_type AS ENUM (
  'T1_PURCHASE',
  'T2_SALE'
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'validated',
  'rejected'
);

CREATE TYPE validation_type AS ENUM (
  'sequence',
  'pricing',
  'ownership',
  'certificate'
);

CREATE TYPE validation_result AS ENUM (
  'pass',
  'fail',
  'warning'
);

CREATE TYPE actor_type AS ENUM (
  'system',
  'user',
  'api'
);

CREATE TYPE blockchain_record_type AS ENUM (
  'qabd_proof',
  'sequence_proof',
  'certificate_hash'
);

-- ===========================================
-- TABLES
-- ===========================================

-- Customers table (simplified - would integrate with bank's core system)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  ic_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financing Applications
CREATE TABLE financing_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  product_type product_type NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL CHECK (principal_amount > 0),
  profit_rate DECIMAL(5,4) NOT NULL CHECK (profit_rate >= 0 AND profit_rate <= 1),
  tenure_months INTEGER NOT NULL CHECK (tenure_months > 0),
  status financing_status DEFAULT 'draft',
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tawarruq Transactions (T1 & T2)
CREATE TABLE tawarruq_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financing_id UUID REFERENCES financing_applications(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  commodity_id VARCHAR(100) NOT NULL,
  commodity_type VARCHAR(50) NOT NULL,
  quantity DECIMAL(10,4) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(15,4) NOT NULL CHECK (unit_price > 0),
  total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
  platform_reference VARCHAR(100),
  timestamp TIMESTAMPTZ NOT NULL,
  sequence_number INTEGER NOT NULL,
  blockchain_tx_hash VARCHAR(100),
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique sequence per financing
  UNIQUE(financing_id, sequence_number)
);

-- Validation Results
CREATE TABLE validation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financing_id UUID REFERENCES financing_applications(id) ON DELETE CASCADE,
  validation_type validation_type NOT NULL,
  result validation_result NOT NULL,
  details JSONB DEFAULT '{}',
  validated_at TIMESTAMPTZ DEFAULT NOW(),
  validator_version VARCHAR(20) NOT NULL
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financing_id UUID REFERENCES financing_applications(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  actor_id UUID,
  actor_type actor_type NOT NULL,
  details JSONB DEFAULT '{}',
  blockchain_proof VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blockchain Records
CREATE TABLE blockchain_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financing_id UUID REFERENCES financing_applications(id) ON DELETE CASCADE,
  record_type blockchain_record_type NOT NULL,
  zetrix_tx_hash VARCHAR(100) NOT NULL,
  block_number BIGINT NOT NULL,
  payload_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================

CREATE INDEX idx_financing_status ON financing_applications(status);
CREATE INDEX idx_financing_customer ON financing_applications(customer_id);
CREATE INDEX idx_financing_created ON financing_applications(created_at DESC);

CREATE INDEX idx_transactions_financing ON tawarruq_transactions(financing_id);
CREATE INDEX idx_transactions_type ON tawarruq_transactions(transaction_type);
CREATE INDEX idx_transactions_timestamp ON tawarruq_transactions(timestamp);

CREATE INDEX idx_validations_financing ON validation_results(financing_id);
CREATE INDEX idx_validations_result ON validation_results(result);

CREATE INDEX idx_audit_financing ON audit_logs(financing_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

CREATE INDEX idx_blockchain_financing ON blockchain_records(financing_id);
CREATE INDEX idx_blockchain_hash ON blockchain_records(zetrix_tx_hash);

-- ===========================================
-- FUNCTIONS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate application number
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part VARCHAR(4);
  seq_num INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(application_number FROM 8) AS INTEGER)
  ), 0) + 1
  INTO seq_num
  FROM financing_applications
  WHERE application_number LIKE 'MUT' || year_part || '%';

  NEW.application_number := 'MUT' || year_part || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validate sequence (T1 before T2)
CREATE OR REPLACE FUNCTION validate_transaction_sequence()
RETURNS TRIGGER AS $$
DECLARE
  t1_timestamp TIMESTAMPTZ;
BEGIN
  IF NEW.transaction_type = 'T2_SALE' THEN
    SELECT timestamp INTO t1_timestamp
    FROM tawarruq_transactions
    WHERE financing_id = NEW.financing_id
      AND transaction_type = 'T1_PURCHASE'
      AND status = 'validated';

    IF t1_timestamp IS NULL THEN
      RAISE EXCEPTION 'T1 (Purchase) must be validated before T2 (Sale)';
    END IF;

    IF NEW.timestamp <= t1_timestamp THEN
      RAISE EXCEPTION 'T2 timestamp must be after T1 timestamp (Tartib violation)';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- TRIGGERS
-- ===========================================

CREATE TRIGGER tr_financing_updated_at
  BEFORE UPDATE ON financing_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_generate_app_number
  BEFORE INSERT ON financing_applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL)
  EXECUTE FUNCTION generate_application_number();

CREATE TRIGGER tr_validate_sequence
  BEFORE INSERT ON tawarruq_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_transaction_sequence();

-- ===========================================
-- ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tawarruq_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_records ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (bank staff)
-- In production, would have more granular role-based policies

CREATE POLICY "Users can view all financing applications"
  ON financing_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert financing applications"
  ON financing_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update financing applications"
  ON financing_applications FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all transactions"
  ON tawarruq_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert transactions"
  ON tawarruq_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view all validations"
  ON validation_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all blockchain records"
  ON blockchain_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their customer profile"
  ON customers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ===========================================
-- SEED DATA (for development)
-- ===========================================

-- Uncomment to add test data
/*
INSERT INTO customers (full_name, ic_number, email, phone) VALUES
  ('Ahmad bin Abdullah', '800101-01-1234', 'ahmad@example.com', '+60123456789'),
  ('Siti binti Hassan', '850202-02-5678', 'siti@example.com', '+60198765432');
*/
