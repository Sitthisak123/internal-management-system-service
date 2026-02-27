-- 1. Create Users
INSERT INTO users (fullname, position, role, status) 
VALUES 
  ('Alice Admin', 'Manager', 1, 1), 
  ('Bob Builder', 'Engineer', 0, 1);

-- 2. Create a Material Type
INSERT INTO material_type (title) 
VALUES ('Raw Materials');

-- 3. Create some Materials
INSERT INTO material (title, material_type_id, unit, quantity) 
VALUES 
  ('Steel Beam 10m', 1, 'pcs', 50), 
  ('Copper Wire', 1, 'meters', 500);

-- 4. Create an MR Form (Created & Owned by Bob, User ID 2)
INSERT INTO mr_form (ref_no, subject, creator_id, owner_id) 
VALUES ('MR-2026-001', 'Materials for New Warehouse', 2, 2);

-- 5. Add materials to the MR Form (This links to Form ID 1 and Material IDs 1 & 2)
INSERT INTO mr_form_materials (mr_form_id, material_id, quantity) 
VALUES 
  (1, 1, 10),  -- 10 Steel Beams
  (1, 2, 100); -- 100 meters of Copper Wire

BEGIN;

-- Tell PostgreSQL that User 1 (Alice Admin) is performing this action
SELECT set_config('app.current_user_id', '1', true);

-- Add an optional note explaining the deletion
SELECT set_config('app.delete_note', 'Warehouse project was cancelled.', true);

-- Delete the MR Form. 
-- Because of 'ON DELETE CASCADE', this will automatically delete the 2 linked mr_form_materials rows!
DELETE FROM mr_form WHERE id = 1;

COMMIT;

-- Query the View
SELECT jsonb_pretty(row_to_json(v)::jsonb) AS formatted_log
FROM vw_nested_deletion_logs v;


-- =========================
-- EXTPECTED OUTPUT
-- =========================
/*

    "ID": 1,
    "Note": "Warehouse project was cancelled.",
    "Table": "mr_form",
    "Record": {
        "id": 1,
        "ref_no": "MR-2026-001",
        "status": 0,
        "purpose": null,
        "subject": "Materials for New Warehouse",
        "owner_id": 2,
        "form_date": "2026-02-27T12:50:00+07:00",
        "creator_id": 2,
        "created_at": "2026-02-27T12:50:00+07:00",
        "updated_at": "2026-02-27T12:50:00+07:00",
        "description": null,
        "authorizer_id": null
    },
    "DeleteBy": 1,
    "CreateDate": "2026-02-27T12:50:05+07:00",
    "Effected_fk": [
        [
            1,
            "mr_form_materials",
            2
        ]
    ]
}

*/