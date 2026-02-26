-- =========================
-- 1. INSERT USERS (Merged with Personnel info)
-- =========================
INSERT INTO users (username, hash_pwd, display_name, fullname, position, email, role, status) VALUES
('somchai.j', '$2b$10$mockhash1', 'Mr.', 'Somchai Jaidee', 'Warehouse Officer', 'somchai.j@company.com', 1, 1),
('anong.s', '$2b$10$mockhash2', 'Ms.', 'Anong Srisuk', 'Procurement Officer', 'anong.s@company.com', 0, 1),
('kittipong.m', '$2b$10$mockhash3', 'Mr.', 'Kittipong Manee', 'Maintenance Technician', 'kittipong.m@company.com', 0, 1),
('suda.k', '$2b$10$mockhash4', 'Ms.', 'Suda Kanchana', 'Admin Officer', 'suda.k@company.com', 0, 1),
('prasert.b', '$2b$10$mockhash5', 'Mr.', 'Prasert Boonmee', 'Store Keeper', 'prasert.b@company.com', 0, 1),
('nattapong.s', '$2b$10$mockhash6', 'Mr.', 'Nattapong Saelim', 'IT Support', 'nattapong.s@company.com', 1, 1),
('chalida.w', '$2b$10$mockhash7', 'Ms.', 'Chalida Wongsa', 'HR Officer', 'chalida.w@company.com', 0, 1),
('wichai.t', '$2b$10$mockhash8', 'Mr.', 'Wichai Thonglor', 'Site Engineer', 'wichai.t@company.com', 0, 1),
('patcharee.m', '$2b$10$mockhash9', 'Ms.', 'Patcharee Meesuk', 'Accountant', 'patcharee.m@company.com', 0, 1),
('thanakorn.p', '$2b$10$mockhash10', 'Mr.', 'Thanakorn Preecha', 'Project Coordinator', 'thanakorn.p@company.com', 0, 1),
('orathai.c', '$2b$10$mockhash11', 'Ms.', 'Orathai Charoen', 'Office Manager', 'orathai.c@company.com', 1, 1),
('ekkasit.l', '$2b$10$mockhash12', 'Mr.', 'Ekkasit Lertchai', 'Safety Officer', 'ekkasit.l@company.com', 0, 1),
('supaporn.i', '$2b$10$mockhash13', 'Ms.', 'Supaporn Intanon', 'Document Control', 'supaporn.i@company.com', 0, 1),
('chaiwat.r', '$2b$10$mockhash14', 'Mr.', 'Chaiwat Rattanakul', 'Logistics Officer', 'chaiwat.r@company.com', 0, 1),
('siriporn.p', '$2b$10$mockhash15', 'Ms.', 'Siriporn Phasuk', 'Procurement Assistant', 'siriporn.p@company.com', 0, 1),
('narongdet.p', '$2b$10$mockhash16', 'Mr.', 'Narongdet Phanich', 'Technician', 'narongdet.p@company.com', 0, 1),
('kamonwan.y', '$2b$10$mockhash17', 'Ms.', 'Kamonwan Yindee', 'Finance Officer', 'kamonwan.y@company.com', 0, 1),
('sompong.k', '$2b$10$mockhash18', 'Mr.', 'Sompong Klaisri', 'Driver', 'sompong.k@company.com', 0, 1),
('benjamas.t', '$2b$10$mockhash19', 'Ms.', 'Benjamas Thida', 'Engineer', 'benjamas.t@company.com', 0, 1),
('peerawat.c', '$2b$10$mockhash20', 'Mr.', 'Peerawat Chokdee', 'Supervisor', 'peerawat.c@company.com', 1, 1),
('lalita.s', '$2b$10$mockhash21', 'Ms.', 'Lalita Sanguan', 'Admin Assistant', 'lalita.s@company.com', 0, 1),
('rungroj.t', '$2b$10$mockhash22', 'Mr.', 'Rungroj Tantisiri', 'Store Supervisor', 'rungroj.t@company.com', 0, 1),
('pimchanok.s', '$2b$10$mockhash23', 'Ms.', 'Pimchanok Seangdao', 'Planner', 'pimchanok.s@company.com', 0, 1),
('thawatchai.a', '$2b$10$mockhash24', 'Mr.', 'Thawatchai Arun', 'Electrician', 'thawatchai.a@company.com', 0, 1),
('duangkamol.p', '$2b$10$mockhash25', 'Ms.', 'Duangkamol Phrom', 'Coordinator', 'duangkamol.p@company.com', 0, 1);

-- =========================
-- 2. INSERT MATERIAL TYPES
-- =========================
INSERT INTO material_type (title) VALUES
('Electrical'),
('Plumbing'),
('Hardware'),
('Office Supplies'),
('Safety Equipment');

-- =========================
-- 3. INSERT MATERIALS
-- =========================
INSERT INTO material (title, material_type_id, unit, quantity) VALUES
('Electric Cable 2x1.5', 1, 'roll', 50),
('LED Bulb 18W', 1, 'piece', 120),
('Circuit Breaker 32A', 1, 'piece', 40),
('PVC Pipe 1 inch', 2, 'length', 200),
('PVC Elbow', 2, 'piece', 300),
('Water Tap', 2, 'piece', 45),
('Steel Bolt M10', 3, 'box', 75),
('Hex Nut M10', 3, 'box', 80),
('Screw 1 inch', 3, 'box', 150),
('A4 Paper', 4, 'ream', 500),
('Ballpoint Pen', 4, 'box', 200),
('Stapler', 4, 'piece', 35),
('Safety Helmet', 5, 'piece', 60),
('Safety Gloves', 5, 'pair', 150),
('Reflective Vest', 5, 'piece', 90),
('Extension Cord', 1, 'piece', 70),
('Switch 1 Gang', 1, 'piece', 110),
('Flexible Hose', 2, 'roll', 40),
('Pipe Clamp', 2, 'piece', 180),
('Drill Bit Set', 3, 'set', 25),
('Marker Pen', 4, 'box', 90),
('File Folder', 4, 'box', 130),
('Face Shield', 5, 'piece', 55),
('Ear Plug', 5, 'box', 75),
('Voltage Tester', 1, 'piece', 30);

-- =========================
-- 4. INSERT FORMS (MR)
-- =========================
-- Note: owner_id now references users(id). 
-- Since we inserted users in the same order as the old personnel list, IDs 1-25 match.
INSERT INTO mr_form (ref_no, subject, description, purpose, status, creator_id, owner_id, authorizer_id) VALUES
('MR-2026-001', 'Request Electrical Supplies', 'For site wiring work', 'New project setup', 1, 2, 8, 1),
('MR-2026-002', 'Office Stationery', 'Monthly office supply refill', 'Office usage', 0, 4, 11, NULL),
('MR-2026-003', 'Safety Equipment', 'New staff safety gear', 'Safety compliance', 1, 7, 12, 6),
('MR-2026-004', 'Plumbing Repair', 'Fix restroom leakage', 'Maintenance', 0, 3, 16, NULL),
('MR-2026-005', 'Warehouse Tools', 'Tool replacement', 'Damaged tools', 1, 5, 22, 20),
('MR-2026-006', 'IT Equipment', 'Cables and testers', 'System upgrade', 0, 6, 6, NULL),
('MR-2026-007', 'Project Site Materials', 'Initial stock', 'Project startup', 1, 10, 19, 11),
('MR-2026-008', 'Admin Supplies', 'Files and pens', 'Office admin', 0, 21, 4, NULL),
('MR-2026-009', 'Electrical Maintenance', 'Breaker replacements', 'Routine maintenance', 1, 8, 3, 1),
('MR-2026-010', 'Safety Refill', 'Replace worn PPE', 'Safety restock', -1, 12, 12, 6);

-- =========================
-- 5. INSERT FORM ITEMS
-- =========================
INSERT INTO mr_form_materials (mr_form_id, material_id, quantity) VALUES
(1, 1, 5),
(1, 2, 20),
(2, 10, 10),
(2, 11, 5),
(3, 13, 10),
(3, 14, 20),
(4, 4, 15),
(4, 5, 20),
(5, 20, 2),
(6, 25, 3),
(7, 7, 10),
(7, 8, 10),
(8, 21, 5),
(8, 22, 10),
(9, 3, 4),
(10, 23, 6);