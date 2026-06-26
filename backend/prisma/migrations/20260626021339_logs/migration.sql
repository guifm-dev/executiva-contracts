/*
  Warnings:

  - You are about to drop the `ContractHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContractHistory" DROP CONSTRAINT "ContractHistory_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "ContractHistory" DROP CONSTRAINT "ContractHistory_contractId_fkey";

-- DropTable
DROP TABLE "ContractHistory";

-- CreateTable
CREATE TABLE "ContractLogs" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractLogs_contractId_idx" ON "ContractLogs"("contractId");

-- AddForeignKey
ALTER TABLE "ContractLogs" ADD CONSTRAINT "ContractLogs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractLogs" ADD CONSTRAINT "ContractLogs_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
