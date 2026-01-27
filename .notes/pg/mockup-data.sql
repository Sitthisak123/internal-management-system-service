-- ⚠️ เริ่มต้น Transaction และปิดการเช็ค Constraint ชั่วคราว (เพื่อให้สร้าง Mock Profile ได้โดยไม่ต้องมี User จริง)
BEGIN;
SET session_replication_role = 'replica';

-- 1. สร้างข้อมูล Personnel (พนักงาน) 100 คน
INSERT INTO "personnel" (fullname, position)
SELECT 
  'Employee ' || i,
  CASE (i % 5)
    WHEN 0 THEN 'Manager'
    WHEN 1 THEN 'Engineer'
    WHEN 2 THEN 'HR'
    WHEN 3 THEN 'Accountant'
    ELSE 'Staff'
  END
FROM generate_series(1, 100) i;

-- 2. สร้างข้อมูล Profiles (User จำลอง) 100 คน
-- หมายเหตุ: id ถูกสุ่มขึ้นมา ไม่ได้เชื่อมกับ auth.users จริง (ใช้เพื่อเทสระบบเท่านั้น)
INSERT INTO "profiles" (id, username, title, role, status, personnel_id)
SELECT 
  gen_random_uuid(), -- สุ่ม UUID
  'user' || i,
  CASE (i % 2) WHEN 0 THEN 'Mr.' ELSE 'Ms.' END,
  CASE WHEN i <= 5 THEN 1 ELSE 0 END, -- ให้ 5 คนแรกเป็น Admin (1)
  1, -- Active status
  i -- ผูกกับ personnel_id 1-100
FROM generate_series(1, 100) i;

-- 3. สร้างข้อมูล Material Type (ประเภทวัสดุ) 5 ประเภท
INSERT INTO "material_type" (title) VALUES 
('Office Supplies'), ('IT Equipment'), ('Hardware'), ('Cleaning'), ('Pantry');

-- 4. สร้างข้อมูล Material (วัสดุ) 100 รายการ
INSERT INTO "material" (title, material_type_id, quantity, unit)
SELECT 
  'Item ' || i,
  floor(random() * 5 + 1)::int, -- สุ่ม type 1-5
  floor(random() * 1000 + 10)::int, -- สุ่มจำนวน 10-1000
  CASE (i % 3)
    WHEN 0 THEN 'Pcs'
    WHEN 1 THEN 'Box'
    ELSE 'Set'
  END
FROM generate_series(1, 100) i;

-- 5. สร้างข้อมูล MR Form (ใบเบิก) 100 ใบ
INSERT INTO "mr_form" (subject, ref_no, description, creator_id, owner_personnel_id, date)
SELECT 
  'Request for ' || (floor(random() * 5 + 1)::int), -- หัวข้อสุ่ม
  'MR-' || to_char(now(), 'YYYYMM') || '-' || lpad(i::text, 4, '0'), -- เลขที่เอกสาร MR-202401-0001
  'Please approve request for department usage.',
  (SELECT id FROM "profiles" ORDER BY random() LIMIT 1), -- สุ่มคนขอ
  (SELECT id FROM "personnel" ORDER BY random() LIMIT 1), -- สุ่มเจ้าของเรื่อง
  now() - (random() * interval '30 days') -- สุ่มเวลาย้อนหลัง 30 วัน
FROM generate_series(1, 100) i;

-- 6. สร้างข้อมูล MR Form Materials (รายการของในใบเบิก) 
-- สร้างประมาณ 300 รายการ (เฉลี่ยใบละ 3 รายการ)
INSERT INTO "mr_form_materials" (mr_form_id, material_id, quantity)
SELECT 
  floor(random() * 100 + 1)::int, -- สุ่มเลขใบเบิก 1-100 (ที่เราเพิ่งสร้าง)
  floor(random() * 100 + 1)::int, -- สุ่มสินค้า 1-100
  floor(random() * 10 + 1)::int -- สุ่มจำนวนเบิก 1-10
FROM generate_series(1, 300) i;

-- ✅ เปิดการเช็ค Constraint กลับคืน และยืนยันข้อมูล
SET session_replication_role = 'origin';
COMMIT;
