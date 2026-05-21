/*
  Warnings:

  - You are about to drop the column `userAId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userBId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `seenAt` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userAId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_userBId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "userAId",
DROP COLUMN "userBId",
ADD COLUMN     "lastMessageAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "seenAt";
