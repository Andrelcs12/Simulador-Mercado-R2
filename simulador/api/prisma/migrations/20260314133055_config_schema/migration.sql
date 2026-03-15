-- CreateTable
CREATE TABLE "CategoryMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL,
    "agingPenaltyRate" DOUBLE PRECISION NOT NULL,
    "marketStock" INTEGER NOT NULL,

    CONSTRAINT "CategoryMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapexMaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "baseLicense" DOUBLE PRECISION NOT NULL,
    "upgradeImpact" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CapexMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialCash" DOUBLE PRECISION NOT NULL DEFAULT 700000.0,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "operatorsQty" INTEGER NOT NULL DEFAULT 0,
    "serviceOperatorsQty" INTEGER NOT NULL DEFAULT 0,
    "quizScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalSpent" DOUBLE PRECISION,
    "interestPaid" DOUBLE PRECISION,
    "finalCSAT" DOUBLE PRECISION,
    "finalSLA" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockInput" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "buyQty" INTEGER NOT NULL,
    "appliedMargin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StockInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreCapex" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "capexId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StoreCapex_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundResult" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "totalRevenue" DOUBLE PRECISION NOT NULL,
    "totalCMV" DOUBLE PRECISION NOT NULL,
    "operatingCosts" DOUBLE PRECISION NOT NULL,
    "agingCosts" DOUBLE PRECISION NOT NULL,
    "ebitdaValue" DOUBLE PRECISION NOT NULL,
    "ebitdaMargin" DOUBLE PRECISION NOT NULL,
    "remainingStock" INTEGER NOT NULL,
    "marketShare" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RoundResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Configuration" ADD CONSTRAINT "Configuration_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockInput" ADD CONSTRAINT "StockInput_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCapex" ADD CONSTRAINT "StoreCapex_configId_fkey" FOREIGN KEY ("configId") REFERENCES "Configuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreCapex" ADD CONSTRAINT "StoreCapex_capexId_fkey" FOREIGN KEY ("capexId") REFERENCES "CapexMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
