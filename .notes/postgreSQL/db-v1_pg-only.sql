-- Create Table: users
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "username" varchar NOT NULL,
  "hash_pwd" varchar NOT NULL,
  "title" varchar NOT NULL,
  "role" smallint NOT NULL DEFAULT 0, -- 0=user, 1=admin
  "status" smallint NOT NULL DEFAULT 0, -- -1=suspend, 0=unauth, 1=active
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "email" varchar NOT NULL UNIQUE,
  "personel_id" integer NOT NULL
);

-- Create Table: porsonel (Note: Kept original spelling 'porsonel', recommended: 'personnel')
CREATE TABLE "porsonel" (
  "id" SERIAL PRIMARY KEY,
  "fullname" varchar NOT NULL,
  "position" varchar NOT NULL
);

-- Create Table: material_type
CREATE TABLE "material_type" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Table: material
CREATE TABLE "material" (
  "id" SERIAL PRIMARY KEY,
  "title" varchar NOT NULL,
  "material_type_id" integer NOT NULL, -- Fixed: Changed from varchar to integer to match FK
  "quantity" integer NOT NULL DEFAULT 0,
  "unit" varchar NOT NULL,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Table: mr_form
CREATE TABLE "mr_form" (
  "id" SERIAL PRIMARY KEY,
  "descripts" varchar,
  "authorizer_id" integer NOT NULL,
  "materials" integer, -- Note: This column seems redundant given the junction table below
  "creator_id" integer NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "update_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "date" timestamp NOT NULL,
  "subject" varchar NOT NULL,
  "ref_no" varchar NOT NULL,
  "owner" integer NOT NULL,
  "owing_to" varchar
);

-- Create Table: mr_form_materials (Junction Table)
CREATE TABLE "mr_form_materials" (
  "id" SERIAL PRIMARY KEY,
  "mr_form_id" integer NOT NULL,
  "material_id" integer NOT NULL,
  "quantity" integer NOT NULL
);

-- Comments
COMMENT ON TABLE "users" IS 'role: 0=user, 1=admin; status: -1=suspend, 0=Unauthorize, 1=Activated';
COMMENT ON TABLE "mr_form_materials" IS 'Materials included in the MR form with requested quantity';

-- Foreign Keys

-- Link MR Form Authorizer to Users
ALTER TABLE "mr_form" ADD CONSTRAINT "fk_mr_form_authorizer" 
FOREIGN KEY ("authorizer_id") REFERENCES "users" ("id");

-- Link MR Form Creator to Users
ALTER TABLE "mr_form" ADD CONSTRAINT "fk_mr_form_creator" 
FOREIGN KEY ("creator_id") REFERENCES "users" ("id");

-- Link Material to Material Type
ALTER TABLE "material" ADD CONSTRAINT "fk_material_type" 
FOREIGN KEY ("material_type_id") REFERENCES "material_type" ("id");

-- Link MR Form Owner to Personnel
ALTER TABLE "mr_form" ADD CONSTRAINT "fk_mr_form_owner" 
FOREIGN KEY ("owner") REFERENCES "porsonel" ("id");

-- Link Junction Table to MR Form
ALTER TABLE "mr_form_materials" ADD CONSTRAINT "fk_mrfm_form" 
FOREIGN KEY ("mr_form_id") REFERENCES "mr_form" ("id");

-- Link Junction Table to Material
ALTER TABLE "mr_form_materials" ADD CONSTRAINT "fk_mrfm_material" 
FOREIGN KEY ("material_id") REFERENCES "material" ("id");

-- Link Users to Personnel
-- Note: Logic reversed from input. Usually 'users' links TO 'personnel', not 'personnel' PK referencing 'users' col.
ALTER TABLE "users" ADD CONSTRAINT "fk_users_personnel" 
FOREIGN KEY ("personel_id") REFERENCES "porsonel" ("id");