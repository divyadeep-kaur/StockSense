-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordResetOtp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordResetOtp" ("codeHash", "consumed", "createdAt", "expiresAt", "id", "userId") SELECT "codeHash", "consumed", "createdAt", "expiresAt", "id", "userId" FROM "PasswordResetOtp";
DROP TABLE "PasswordResetOtp";
ALTER TABLE "new_PasswordResetOtp" RENAME TO "PasswordResetOtp";
CREATE INDEX "PasswordResetOtp_userId_idx" ON "PasswordResetOtp"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
