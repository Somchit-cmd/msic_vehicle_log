const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const BRAND_PRICES = {
  TOYOTA: 28500, HONDA: 27500, NISSAN: 27000, MAZDA: 26000,
  SUBARU: 29000, MITSUBISHI: 24000, SUZUKI: 22000,
  LEXUS: 42000, ACURA: 38000, INFINITI: 39000,
  FORD: 33000, CHEVROLET: 31000, DODGE: 32000, CHRYSLER: 30000,
  CADILLAC: 45000, LINCOLN: 46000, BUICK: 35000, GMC: 38000,
  JEEP: 36000, RAM: 35000, TESLA: 42000,
  BMW: 43000, "MERCEDES-BENZ": 47000, AUDI: 42000, PORSCHE: 62000,
  VOLKSWAGEN: 28000, MINI: 30000,
  HYUNDAI: 26000, KIA: 25000, GENESIS: 42000,
  VOLVO: 40000, POLESTAR: 48000,
  JAGUAR: 48000, "LAND ROVER": 52000, "ASTON MARTIN": 160000,
  BENTLEY: 200000, "ROLLS-ROYCE": 330000, LOTUS: 80000, MCLAREN: 190000,
  FERRARI: 280000, LAMBORGHINI: 220000, MASERATI: 80000,
  "ALFA ROMEO": 42000, FIAT: 22000,
  BYD: 30000, NIO: 48000, XPENG: 35000, ZEEKR: 42000,
  GEELY: 22000, "LI AUTO": 45000, CHERY: 18000, AVATR: 40000,
  HONGQI: 35000, GWM: 25000, "MG MOTOR": 24000, LEAPMOTOR: 22000,
  DENZA: 38000, CHANGAN: 20000, GAC: 22000, "LYNK & CO": 28000,
  AITO: 35000, AION: 25000, DEEPAL: 23000, ARCFOX: 38000,
  VOYAH: 42000, "IM MOTORS": 32000, ORA: 24000,
  WEY: 30000, TANK: 32000,
  LUCID: 78000, RIVIAN: 68000, FISKER: 38000, SHELBY: 80000,
};

const TYPE_MULT = {
  Sedan: 1.0, SUV: 1.15, Truck: 1.10, Hatchback: 0.85,
  Coupe: 1.20, Convertible: 1.25, Van: 1.05, Wagon: 1.05,
};

async function main() {
  const total = await db.carModel.count();
  const withPrice = await db.carModel.count({ where: { price: { not: null } } });
  console.log(`Before: ${withPrice}/${total} have price (${Math.round((withPrice / total) * 100)}%)`);

  const cars = await db.carModel.findMany({
    where: { price: null },
    select: { id: true, brand: true, model: true, type: true, year: true },
  });
  console.log(`Cars without price: ${cars.length}`);

  const updates = [];
  for (const car of cars) {
    const brandUpper = car.brand.toUpperCase();
    let basePrice = BRAND_PRICES[brandUpper];
    if (!basePrice) {
      for (const [key, price] of Object.entries(BRAND_PRICES)) {
        if (brandUpper.includes(key) || key.includes(brandUpper)) {
          basePrice = price;
          break;
        }
      }
    }
    if (!basePrice) continue;

    const typeMult = TYPE_MULT[car.type] || 1.0;
    const age = new Date().getFullYear() - car.year;
    let yearMult = 1.0;
    if (age === 1) yearMult = 0.92;
    else if (age === 2) yearMult = 0.85;
    else if (age === 3) yearMult = 0.78;
    else if (age >= 4) yearMult = 0.65;

    const est = Math.round((basePrice * typeMult * yearMult) / 100) * 100;
    updates.push({ id: car.id, price: est });
  }

  console.log(`Estimated prices for: ${updates.length}`);

  // Batch update using raw SQL for speed
  let count = 0;
  for (let i = 0; i < updates.length; i += 200) {
    const batch = updates.slice(i, i + 200);
    const cases = batch.map((u) => `WHEN '${u.id}' THEN ${u.price}`).join(" ");
    const ids = batch.map((u) => `'${u.id}'`).join(",");
    await db.$executeRawUnsafe(
      `UPDATE "CarModel" SET price = CASE id ${cases} END, "priceEstimated" = true WHERE id IN (${ids}) AND price IS NULL`
    );
    count += batch.length;
    if (count % 1000 === 0) console.log(`  Processed ${count}/${updates.length}`);
  }

  const newWithPrice = await db.carModel.count({ where: { price: { not: null } } });
  console.log(`\nAfter: ${newWithPrice}/${total} have price (${Math.round((newWithPrice / total) * 100)}%)`);

  await db.$disconnect();
}

main().catch(console.error);
