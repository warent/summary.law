/*
  Warnings:

  - Added the required column `curationScore` to the `Summary` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Summary" ADD COLUMN     "curationScore" INTEGER NOT NULL;
