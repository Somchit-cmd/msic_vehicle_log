// Standalone script to fetch CarNewsChina data and NHTSA data directly into the database
// Run with: node scripts/fetch-data.js

const { Client } = require('pg');

const CNC_BASE = "https://data.carnewschina.com";

async function main() {
  const client = new Client({
    host: 'aws-1-ap-southeast-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.viuinqpbnupmyachvdnn',
    password: 'U6VQ8PGHdb5wrpRA',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to Supabase database");

  // Check current count
  const currentCount = await client.query('SELECT COUNT(*) as total FROM "CarModel"');
  console.log(`Current car count: ${currentCount.rows[0].total}`);

  // ============================================
  // Step 1: Fetch CarNewsChina data
  // ============================================
  console.log("\n=== Fetching CarNewsChina data ===");
  
  let cncFetched = 0;
  let cncAdded = 0;
  let cncUpdated = 0;
  let hasMore = true;
  const allModels = [];

  for (let page = 1; page <= 35 && hasMore; page++) {
    try {
      const url = `${CNC_BASE}/load-models/all/${page}`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) {
        console.error(`Page ${page}: HTTP ${res.status}`);
        hasMore = false;
        break;
      }

      const data = await res.json();
      if (!data.models || data.models.length === 0) {
        hasMore = false;
        break;
      }

      allModels.push(...data.models);
      process.stdout.write(`\rPage ${page}: ${allModels.length} models collected, ${data.models_count_remain} remaining    `);

      if (data.models_count_remain <= 0) hasMore = false;
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`\nPage ${page} error:`, err.message);
      hasMore = false;
    }
  }

  console.log(`\nCollected ${allModels.length} models from CarNewsChina`);

  function mapBodyType(bodyType, modelName) {
    const name = modelName.toLowerCase();
    const bt = (bodyType || "").toLowerCase();
    if (bt.includes("sedan") || bt.includes("limousine")) return "Sedan";
    if (bt.includes("suv") || bt.includes("crossover")) return "SUV";
    if (bt.includes("hatchback") || bt.includes("compact")) return "Hatchback";
    if (bt.includes("coupe")) return "Coupe";
    if (bt.includes("convertible") || bt.includes("cabriolet")) return "Convertible";
    if (bt.includes("van") || bt.includes("minivan") || bt.includes("mpv")) return "Van";
    if (bt.includes("wagon") || bt.includes("estate")) return "Wagon";
    if (bt.includes("pickup") || bt.includes("truck")) return "Truck";
    if (/suv|cross|tang|song|yuan|atto|sealion|es8|es7|es6|ec7|g6|g9|x9|u8|n7|009|mix|rx|hs|zs|tiggo|h6|tank|omoda|jaecoo/i.test(name)) return "SUV";
    if (/d9|dreamer|m8|v class|spacious|v9/i.test(name)) return "Van";
    if (/dolphin|seagull|t03|mg4/i.test(name)) return "Hatchback";
    if (/coupe|gt\b|roadster/i.test(name)) return "Coupe";
    return "Sedan";
  }

  function mapFuelType(fuelType, modelName) {
    const ft = (fuelType || "").toUpperCase();
    const name = modelName.toLowerCase();
    if (ft === "BEV" || ft.includes("BATTERY") || ft.includes("ELECTRIC")) return "Electric";
    if (ft === "PHEV" || ft === "REEV" || ft.includes("PLUG-IN")) return "Hybrid";
    if (ft === "HEV" || ft.includes("HYBRID")) return "Hybrid";
    if (ft.includes("DIESEL")) return "Diesel";
    if (ft.includes("GASOLINE") || ft.includes("PETROL")) return "Gasoline";
    if (name.includes("ev") || name.includes("electric") || name.includes("bev")) return "Electric";
    if (name.includes("dm") || name.includes("phev") || name.includes("reev")) return "Hybrid";
    return "Electric";
  }

  const currentYear = new Date().getFullYear();

  // Insert CNC models
  for (const model of allModels) {
    cncFetched++;
    let cleanModelName = model.name;
    const brandPrefix = model.brand_name + " ";
    if (cleanModelName.toUpperCase().startsWith(brandPrefix.toUpperCase())) {
      cleanModelName = cleanModelName.substring(brandPrefix.length);
    }

    const carType = mapBodyType(null, cleanModelName);
    const fuelType = mapFuelType(null, cleanModelName);
    const imageUrl = model.image
      ? (model.image.startsWith("http") ? model.image : `${CNC_BASE}${model.image}`)
      : null;

    try {
      const existing = await client.query(
        'SELECT id FROM "CarModel" WHERE brand = $1 AND model = $2 AND year = $3',
        [model.brand_name, cleanModelName, currentYear]
      );

      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE "CarModel" SET type = $1, "fuelType" = $2, transmission = $3, "imageUrl" = $4, source = $5, region = $6, "updatedAt" = NOW() WHERE id = $7`,
          [carType, fuelType, "Automatic", imageUrl, "carnewschina", "China", existing.rows[0].id]
        );
        cncUpdated++;
      } else {
        await client.query(
          `INSERT INTO "CarModel" (id, brand, model, type, year, "fuelType", transmission, "imageUrl", source, region, "createdAt", "updatedAt") 
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
          [model.brand_name, cleanModelName, carType, currentYear, fuelType, "Automatic", imageUrl, "carnewschina", "China"]
        );
        cncAdded++;
      }
    } catch (err) {
      // Skip
    }

    if (cncFetched % 100 === 0) {
      process.stdout.write(`\rCNC progress: ${cncFetched}/${allModels.length} (added: ${cncAdded}, updated: ${cncUpdated})    `);
    }
  }

  console.log(`\nCarNewsChina: Fetched ${cncFetched}, Added ${cncAdded}, Updated ${cncUpdated}`);

  // ============================================
  // Step 2: Fetch NHTSA data
  // ============================================
  console.log("\n=== Fetching NHTSA data ===");
  
  let nhtsaAdded = 0;
  let nhtsaUpdated = 0;
  let nhtsaFetched = 0;

  try {
    const makesRes = await fetch("https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json");
    const makesData = await makesRes.json();
    const makes = makesData.Results?.slice(0, 60) || [];
    console.log(`Found ${makes.length} makes from NHTSA`);

    for (const make of makes) {
      try {
        const modelsRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${make.Make_Name}?format=json`);
        const modelsData = await modelsRes.json();

        if (!modelsData.Results || modelsData.Results.length === 0) continue;

        for (const m of modelsData.Results) {
          nhtsaFetched++;
          const brand = m.Make_Name;
          const modelName = m.Model_Name;
          const year = currentYear;

          try {
            const existing = await client.query(
              'SELECT id FROM "CarModel" WHERE brand = $1 AND model = $2 AND year = $3 AND source = $4',
              [brand, modelName, year, 'nhtsa']
            );

            if (existing.rows.length === 0) {
              await client.query(
                `INSERT INTO "CarModel" (id, brand, model, type, year, source, region, "createdAt", "updatedAt") 
                 VALUES (gen_random_uuid()::text, $1, $2, 'Sedan', $3, $4, 'US', NOW(), NOW())`,
                [brand, modelName, year, 'nhtsa']
              );
              nhtsaAdded++;
            } else {
              nhtsaUpdated++;
            }
          } catch {
            // Skip
          }
        }

        process.stdout.write(`\rNHTSA: ${make.Make_Name} - ${nhtsaFetched} fetched, ${nhtsaAdded} added    `);
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        console.error(`\nError fetching ${make.Make_Name}:`, err.message);
      }
    }
  } catch (err) {
    console.error("NHTSA fetch error:", err.message);
  }

  console.log(`\nNHTSA: Fetched ${nhtsaFetched}, Added ${nhtsaAdded}, Updated ${nhtsaUpdated}`);

  // Final count
  const finalCount = await client.query('SELECT COUNT(*) as total, COUNT(DISTINCT brand) as brands FROM "CarModel"');
  console.log(`\n=== FINAL: ${finalCount.rows[0].total} total cars, ${finalCount.rows[0].brands} brands ===`);

  await client.end();
  console.log("Done!");
}

main().catch(console.error);
