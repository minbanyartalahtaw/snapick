-- AlterTable: existing rows are backfilled (the volatile default is evaluated per row)
ALTER TABLE "orders" ADD COLUMN "uid" TEXT NOT NULL DEFAULT replace((gen_random_uuid())::text, '-'::text, ''::text);

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "orders"("uid");
