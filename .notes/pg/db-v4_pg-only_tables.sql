-- =========================
-- TABLE: users
-- =========================
-- Merged with personnel fields (fullname, position)
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT UNIQUE DEFAULT NULL, -- Nullable for personnel-only records
  hash_pwd TEXT,
  display_name TEXT DEFAULT NULL, -- Optional for personnel-only records
  fullname TEXT NOT NULL UNIQUE, -- Moved from personnel
  position TEXT NOT NULL,        -- Moved from personnel
  email TEXT UNIQUE DEFAULT NULL, -- Nullable for personnel-only records
  workplace_id INTEGER,
  -- Role & Status with Named Constraints
  role SMALLINT NOT NULL DEFAULT 0,
  -- -1=personnel (only records/no login), 0=admin/user, 1=superadmin
  CONSTRAINT chk_users_role CHECK (role IN (-1,0,1)), 
  
  status SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT chk_users_status CHECK (status IN (-1,0,1)), -- -1=suspend/onleave, 0=unauth/inactive, 1=active
  
  created_by INTEGER REFERENCES users(id), -- Self-referencing for creator (can be NULL for initial records)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_created_by ON users(created_by);


-- =========================
-- TABLE: material_type
-- =========================
CREATE TABLE material_type (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- TABLE: material
-- =========================
CREATE TABLE material (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  material_type_id INTEGER NOT NULL REFERENCES material_type(id),
  unit TEXT NOT NULL, 
  minimum_threshold FLOAT DEFAULT NULL,
  
  quantity FLOAT NOT NULL DEFAULT 0,
  CONSTRAINT chk_material_qty CHECK (quantity >= 0), 
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_material_material_type_id ON material(material_type_id);

-- =========================
-- TABLE: mr_form
-- =========================
CREATE TABLE mr_form (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ref_no TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  purpose TEXT, 
  
  -- Workflow Status
  status SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT chk_mr_form_status CHECK (status IN (-1, 0, 1)), -- -1=Rejected, 0=Pending, 1=Approved
  
  -- Key Dates
  form_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ, -- Nullable: Only filled when evaluated (approved/rejected)
  
  -- Relationships
  creator_id INTEGER NOT NULL REFERENCES users(id),    -- The person typing/submitting
  owner_id INTEGER NOT NULL REFERENCES users(id),      -- FIXED: Now points to users(id) instead of personnel(id)
  authorizer_id INTEGER REFERENCES users(id)           -- Nullable: Only filled when approved
);

CREATE INDEX idx_mr_form_creator_id ON mr_form(creator_id);
CREATE INDEX idx_mr_form_owner_id ON mr_form(owner_id);
CREATE INDEX idx_mr_form_authorizer_id ON mr_form(authorizer_id);
CREATE INDEX idx_mr_form_status ON mr_form(status); 

-- =========================
-- TABLE: mr_form_materials (Junction)
-- =========================
CREATE TABLE mr_form_materials (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  mr_form_id INTEGER NOT NULL REFERENCES mr_form(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES material(id) ON DELETE CASCADE,
  
  quantity INTEGER NOT NULL,
  CONSTRAINT chk_mrfm_qty CHECK (quantity > 0), 
  
  UNIQUE (mr_form_id, material_id) 
);

CREATE INDEX idx_mrfm_form_id ON mr_form_materials(mr_form_id);
CREATE INDEX idx_mrfm_material_id ON mr_form_materials(material_id);

-- =========================
-- TABLE: workplace
-- =========================
CREATE TABLE workplace (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  building TEXT NOT NULL,
  room TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- After creating workplace table, add foreign key to users table.
ALTER TABLE users ADD CONSTRAINT fk_users_workplace FOREIGN KEY (workplace_id) REFERENCES workplace(id) ON DELETE SET NULL;
CREATE INDEX idx_users_workplace_id ON users(workplace_id);

-- =========================
-- NEW TABLE: del_logs (Audit System)
-- =========================
CREATE TABLE del_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  record JSONB NOT NULL,
  deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, 
  note TEXT,
  effected_by BIGINT REFERENCES del_logs(id) ON DELETE CASCADE, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_del_logs_table_name ON del_logs(table_name);
CREATE INDEX idx_del_logs_effected_by ON del_logs(effected_by);

-- =========================
-- FUNCTIONS
-- =========================

-- 1. AUTO updated_at Function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. AUTO Audit Logging Function
CREATE OR REPLACE FUNCTION log_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id INTEGER;
  v_note TEXT;
  v_parent_log_id BIGINT;
  v_new_log_id BIGINT;
BEGIN
  -- Extract application context variables
  BEGIN
      v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::INTEGER;
  EXCEPTION WHEN OTHERS THEN v_user_id := NULL;
  END;

  BEGIN
      v_note := current_setting('app.delete_note', true);
  EXCEPTION WHEN OTHERS THEN v_note := NULL;
  END;

  BEGIN
      v_parent_log_id := NULLIF(current_setting('app.parent_log_id', true), '')::BIGINT;
  EXCEPTION WHEN OTHERS THEN v_parent_log_id := NULL;
  END;

  -- Insert the log entry
  INSERT INTO del_logs (table_name, record, deleted_by, note, effected_by)
  VALUES (
      TG_TABLE_NAME,          
      to_jsonb(OLD),          
      v_user_id, 
      v_note, 
      v_parent_log_id         
  )
  RETURNING id INTO v_new_log_id;

  -- Setup cascade tracking for child triggers within this transaction
  IF v_parent_log_id IS NULL THEN
      PERFORM set_config('app.parent_log_id', v_new_log_id::TEXT, true);
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TRIGGERS (Update & Delete)
-- =========================

-- users
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_log_users_delete BEFORE DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- material_type
CREATE TRIGGER trg_material_type_updated BEFORE UPDATE ON material_type FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_log_material_type_delete BEFORE DELETE ON material_type FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- material
CREATE TRIGGER trg_material_updated BEFORE UPDATE ON material FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_log_material_delete BEFORE DELETE ON material FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- mr_form
CREATE TRIGGER trg_mr_form_updated BEFORE UPDATE ON mr_form FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_log_mr_form_delete BEFORE DELETE ON mr_form FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- mr_form_materials (No updated_at needed here based on original, just deletion logging)
CREATE TRIGGER trg_log_mr_form_materials_delete BEFORE DELETE ON mr_form_materials FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- workplace
CREATE TRIGGER trg_workplace_updated BEFORE UPDATE ON workplace FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_log_workplace_delete BEFORE DELETE ON workplace FOR EACH ROW EXECUTE FUNCTION log_deletion();

-- =========================
-- VIEW: vw_nested_deletion_logs
-- =========================
CREATE OR REPLACE VIEW vw_nested_deletion_logs AS
WITH child_counts AS (
    SELECT 
        effected_by,
        table_name,
        COUNT(*) AS deleted_count
    FROM del_logs
    WHERE effected_by IS NOT NULL
    GROUP BY effected_by, table_name
),
numbered_children AS (
    SELECT 
        effected_by,
        table_name,
        deleted_count,
        ROW_NUMBER() OVER (PARTITION BY effected_by ORDER BY table_name) AS row_no
    FROM child_counts
),
aggregated_effects AS (
    SELECT 
        effected_by,
        jsonb_agg(jsonb_build_array(row_no, table_name, deleted_count)) AS effected_fk_array
    FROM numbered_children
    GROUP BY effected_by
)
SELECT 
    p.id AS "ID",
    p.table_name AS "Table",
    p.record AS "Record",
    p.deleted_by AS "DeleteBy",
    p.note AS "Note",
    p.created_at AS "CreateDate",
    COALESCE(a.effected_fk_array, '[]'::jsonb) AS "Effected_fk"
FROM del_logs p
LEFT JOIN aggregated_effects a ON p.id = a.effected_by
WHERE p.effected_by IS NULL;

-- =========================
-- FUNCTION: prune_old_del_logs
-- =========================
CREATE OR REPLACE FUNCTION prune_old_del_logs()
RETURNS void AS $$
BEGIN
    -- Delete root logs older than 365 days. 
    -- The ON DELETE CASCADE rule automatically handles the child logs!
    DELETE FROM del_logs 
    WHERE effected_by IS NULL 
      AND created_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql;