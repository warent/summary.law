-- CreateTable
CREATE TABLE "Summary" (
    "id" TEXT NOT NULL,
    "pacerCaseId" TEXT NOT NULL,
    "pacerDocumentIds" TEXT[],
    "fullSummary" TEXT,
    "shortSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);
