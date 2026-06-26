/*
  Warnings:

  - You are about to drop the `ContractLogs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContractLogs" DROP CONSTRAINT "ContractLogs_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "ContractLogs" DROP CONSTRAINT "ContractLogs_contractId_fkey";

-- DropTable
DROP TABLE "ContractLogs";

-- CreateTable
CREATE TABLE "ContractHistory" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContractHistory_contractId_idx" ON "ContractHistory"("contractId");

-- AddForeignKey
ALTER TABLE "ContractHistory" ADD CONSTRAINT "ContractHistory_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractHistory" ADD CONSTRAINT "ContractHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
