-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED');

-- AlterTable
ALTER TABLE "Shipment" ADD COLUMN     "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING';
