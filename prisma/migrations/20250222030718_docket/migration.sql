/*
  Warnings:

  - You are about to drop the column `sourceDocuments` on the `Summary` table. All the data in the column will be lost.
  - Added the required column `docketId` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Summary" DROP COLUMN "sourceDocuments",
ADD COLUMN     "docketId" INTEGER NOT NULL,
ADD COLUMN     "pacerDocumentIds" TEXT[];
