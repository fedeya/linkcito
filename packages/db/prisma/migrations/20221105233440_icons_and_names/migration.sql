/*
  Warnings:

  - Added the required column `name` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "icon" TEXT;
