-- CreateTable
CREATE TABLE "material" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "material_type_id" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "minimum_threshold" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_type" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mr_form" (
    "id" SERIAL NOT NULL,
    "ref_no" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "status" SMALLINT NOT NULL DEFAULT 0,
    "form_date" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator_id" INTEGER NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "authorizer_id" INTEGER,

    CONSTRAINT "mr_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mr_form_materials" (
    "id" SERIAL NOT NULL,
    "mr_form_id" INTEGER NOT NULL,
    "material_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "mr_form_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "hash_pwd" TEXT,
    "display_name" TEXT,
    "fullname" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "email" TEXT,
    "role" SMALLINT NOT NULL DEFAULT 0,
    "status" SMALLINT NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "del_logs" (
    "id" BIGSERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "record" JSONB NOT NULL,
    "deleted_by" INTEGER,
    "note" TEXT,
    "effected_by" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "del_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_material_material_type_id" ON "material"("material_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "mr_form_ref_no_key" ON "mr_form"("ref_no");

-- CreateIndex
CREATE INDEX "idx_mr_form_authorizer_id" ON "mr_form"("authorizer_id");

-- CreateIndex
CREATE INDEX "idx_mr_form_creator_id" ON "mr_form"("creator_id");

-- CreateIndex
CREATE INDEX "idx_mr_form_owner_id" ON "mr_form"("owner_id");

-- CreateIndex
CREATE INDEX "idx_mr_form_status" ON "mr_form"("status");

-- CreateIndex
CREATE INDEX "idx_mrfm_form_id" ON "mr_form_materials"("mr_form_id");

-- CreateIndex
CREATE INDEX "idx_mrfm_material_id" ON "mr_form_materials"("material_id");

-- CreateIndex
CREATE UNIQUE INDEX "mr_form_materials_mr_form_id_material_id_key" ON "mr_form_materials"("mr_form_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_fullname_key" ON "users"("fullname");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_created_by" ON "users"("created_by");

-- CreateIndex
CREATE INDEX "idx_del_logs_effected_by" ON "del_logs"("effected_by");

-- CreateIndex
CREATE INDEX "idx_del_logs_table_name" ON "del_logs"("table_name");

-- AddForeignKey
ALTER TABLE "material" ADD CONSTRAINT "material_material_type_id_fkey" FOREIGN KEY ("material_type_id") REFERENCES "material_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mr_form" ADD CONSTRAINT "mr_form_authorizer_id_fkey" FOREIGN KEY ("authorizer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mr_form" ADD CONSTRAINT "mr_form_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mr_form" ADD CONSTRAINT "mr_form_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mr_form_materials" ADD CONSTRAINT "mr_form_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "material"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mr_form_materials" ADD CONSTRAINT "mr_form_materials_mr_form_id_fkey" FOREIGN KEY ("mr_form_id") REFERENCES "mr_form"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "del_logs" ADD CONSTRAINT "del_logs_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "del_logs" ADD CONSTRAINT "del_logs_effected_by_fkey" FOREIGN KEY ("effected_by") REFERENCES "del_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
