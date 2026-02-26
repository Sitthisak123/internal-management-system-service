-- =========================
-- TABLE: users
-- =========================
-- Merged with personnel fields (fullname, position)
CREATE TABLE users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  hash_pwd TEXT NOT NULL,
  display_name TEXT NOT NULL,
  fullname TEXT NOT NULL UNIQUE, -- Moved from personnel
  position TEXT NOT NULL,        -- Moved from personnel
  email TEXT NOT NULL UNIQUE,

  -- Role & Status with Named Constraints
  role SMALLINT NOT NULL DEFAULT 0,
  -- -1=personnel (only records/no login), 0=admin/user, 1=superadmin
  CONSTRAINT chk_users_role CHECK (role IN (-1,0,1)), 
  
  status SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT chk_users_status CHECK (status IN (-1,0,1)), -- -1=suspend, 0=unauth, 1=active
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


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
  
  quantity INTEGER NOT NULL DEFAULT 0,
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
  material_id INTEGER NOT NULL REFERENCES material(id),
  
  quantity INTEGER NOT NULL,
  CONSTRAINT chk_mrfm_qty CHECK (quantity > 0), 
  
  UNIQUE (mr_form_id, material_id) 
);

CREATE INDEX idx_mrfm_form_id ON mr_form_materials(mr_form_id);
CREATE INDEX idx_mrfm_material_id ON mr_form_materials(material_id);

-- =========================
-- AUTO updated_at TRIGGER
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_material_type_updated
BEFORE UPDATE ON material_type
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_material_updated
BEFORE UPDATE ON material
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_mr_form_updated 
BEFORE UPDATE ON mr_form
FOR EACH ROW EXECUTE FUNCTION set_updated_at();