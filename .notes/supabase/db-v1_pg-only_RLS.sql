ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "personnel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material_type" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mr_form" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mr_form_materials" ENABLE ROW LEVEL SECURITY;

-- ตัวอย่าง Policy: ให้ทุกคนอ่านข้อมูล Material ได้ แต่แก้ไม่ได้
CREATE POLICY "Enable read access for all users" ON "material"
FOR SELECT USING (true);
