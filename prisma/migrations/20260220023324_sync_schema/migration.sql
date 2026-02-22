/*
  Warnings:

  - You are about to drop the column `hashed_password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "hashed_password",
ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "sessions";

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");
