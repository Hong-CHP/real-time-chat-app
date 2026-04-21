/*
  Warnings:

  - A unique constraint covering the columns `[uniqueKey]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE', 'GROUP');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "type" "RoomType" NOT NULL,
ADD COLUMN     "uniqueKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Room_uniqueKey_key" ON "Room"("uniqueKey");
