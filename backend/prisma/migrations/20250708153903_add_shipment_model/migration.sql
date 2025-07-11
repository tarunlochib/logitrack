-- CreateEnum
CREATE TYPE "GoodsType" AS ENUM ('BOX', 'NAGS', 'CARTONS', 'BAGS', 'ROLLS', 'PALLETS', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TO_PAY', 'PAID', 'TO_BE_BILLED');

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "consigneeName" TEXT NOT NULL,
    "consignorName" TEXT NOT NULL,
    "consigneeAddress" TEXT NOT NULL,
    "consignorAddress" TEXT NOT NULL,
    "consigneeGstNo" TEXT NOT NULL,
    "consignorGstNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "billNo" TEXT NOT NULL,
    "transportName" TEXT NOT NULL,
    "goodsType" "GoodsType" NOT NULL,
    "goodsDescription" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "privateMark" TEXT,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "freightCharges" DOUBLE PRECISION NOT NULL,
    "localCartageCharges" DOUBLE PRECISION NOT NULL,
    "hamaliCharges" DOUBLE PRECISION NOT NULL,
    "stationaryCharges" DOUBLE PRECISION NOT NULL,
    "doorDeliveryCharges" DOUBLE PRECISION NOT NULL,
    "otherCharges" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "ewayBillNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverId" INTEGER,
    "vehicleId" INTEGER,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_billNo_key" ON "Shipment"("billNo");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
