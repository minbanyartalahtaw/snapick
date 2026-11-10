-- Rename the "careful" trust level to "untrusted"; existing rows follow the rename.
ALTER TYPE "TrustLevel" RENAME VALUE 'careful' TO 'untrusted';
