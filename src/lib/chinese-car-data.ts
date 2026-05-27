// Chinese Car Brands Database
// Comprehensive data for Chinese automotive brands not well-covered by NHTSA

export interface ChineseCarData {
  brand: string;
  model: string;
  type: string;
  year: number;
  engine?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  horsepower?: number | null;
  torque?: number | null;
  drivetrain?: string | null;
  seatingCapacity?: number | null;
  price?: number | null;
  color?: string | null;
  bodyStyle?: string | null;
  mpgCity?: number | null;
  mpgHighway?: number | null;
}

export const CHINESE_CAR_DATA: ChineseCarData[] = [
  // ==================== BYD ====================
  // BYD - World's largest NEV manufacturer
  { brand: "BYD", model: "Seal", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 523, torque: 509, drivetrain: "AWD", seatingCapacity: 5, price: 35000, color: "Aurora White", bodyStyle: "4-Door", mpgCity: 100, mpgHighway: 0 },
  { brand: "BYD", model: "Seal Performance", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 530, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 39900, color: "Deep Ocean Blue", bodyStyle: "4-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "BYD", model: "Han EV", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 222, torque: 258, drivetrain: "FWD", seatingCapacity: 5, price: 30000, color: "Emperor Red", bodyStyle: "4-Door", mpgCity: 115, mpgHighway: 0 },
  { brand: "BYD", model: "Han DM-i", type: "Sedan", year: 2025, engine: "1.5L PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 238, torque: 325, drivetrain: "FWD", seatingCapacity: 5, price: 26500, color: "Mountain Grey", bodyStyle: "4-Door", mpgCity: 60, mpgHighway: 45 },
  { brand: "BYD", model: "Tang EV", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 517, torque: 494, drivetrain: "AWD", seatingCapacity: 7, price: 42000, color: "Galaxy Silver", bodyStyle: "5-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "BYD", model: "Tang DM-i", type: "SUV", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 302, torque: 406, drivetrain: "AWD", seatingCapacity: 7, price: 35000, color: "Amber Brown", bodyStyle: "5-Door", mpgCity: 55, mpgHighway: 42 },
  { brand: "BYD", model: "Song Plus EV", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 201, torque: 224, drivetrain: "FWD", seatingCapacity: 5, price: 25000, color: "Sage Green", bodyStyle: "5-Door", mpgCity: 105, mpgHighway: 0 },
  { brand: "BYD", model: "Song Plus DM-i", type: "SUV", year: 2025, engine: "1.5L PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 197, torque: 288, drivetrain: "FWD", seatingCapacity: 5, price: 22000, color: "Time Grey", bodyStyle: "5-Door", mpgCity: 58, mpgHighway: 44 },
  { brand: "BYD", model: "Qin Plus EV", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 177, torque: 180, drivetrain: "FWD", seatingCapacity: 5, price: 19500, color: "Ethereal Blue", bodyStyle: "4-Door", mpgCity: 112, mpgHighway: 0 },
  { brand: "BYD", model: "Qin Plus DM-i", type: "Sedan", year: 2025, engine: "1.5L PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 177, torque: 243, drivetrain: "FWD", seatingCapacity: 5, price: 16000, color: "Mountain White", bodyStyle: "4-Door", mpgCity: 65, mpgHighway: 48 },
  { brand: "BYD", model: "Dolphin", type: "Hatchback", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 177, torque: 221, drivetrain: "FWD", seatingCapacity: 5, price: 17000, color: "Ocean Blue", bodyStyle: "5-Door", mpgCity: 120, mpgHighway: 0 },
  { brand: "BYD", model: "Seagull", type: "Hatchback", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 74, torque: 95, drivetrain: "FWD", seatingCapacity: 4, price: 11000, color: "Seagull White", bodyStyle: "5-Door", mpgCity: 130, mpgHighway: 0 },
  { brand: "BYD", model: "Atto 3 / Yuan Plus", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 201, torque: 224, drivetrain: "FWD", seatingCapacity: 5, price: 28000, color: "Ski White", bodyStyle: "5-Door", mpgCity: 105, mpgHighway: 0 },
  { brand: "BYD", model: "Yangwang U8", type: "SUV", year: 2025, engine: "Quad Motor PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 1184, torque: 1288, drivetrain: "AWD", seatingCapacity: 5, price: 155000, color: "Dragon Black", bodyStyle: "5-Door", mpgCity: 40, mpgHighway: 32 },
  { brand: "BYD", model: "Denza N7", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 530, torque: 487, drivetrain: "AWD", seatingCapacity: 5, price: 45000, color: "Cosmic Grey", bodyStyle: "5-Door", mpgCity: 90, mpgHighway: 0 },
  { brand: "BYD", model: "Denza D9", type: "Van", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 292, torque: 398, drivetrain: "AWD", seatingCapacity: 7, price: 42000, color: "Pearl White", bodyStyle: "5-Door", mpgCity: 50, mpgHighway: 40 },
  { brand: "BYD", model: "Frigate 07", type: "SUV", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 302, torque: 398, drivetrain: "AWD", seatingCapacity: 5, price: 32000, color: "Storm Blue", bodyStyle: "5-Door", mpgCity: 52, mpgHighway: 40 },
  { brand: "BYD", model: "Sealion 07", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 530, torque: 509, drivetrain: "AWD", seatingCapacity: 5, price: 35000, color: "Coral Pink", bodyStyle: "5-Door", mpgCity: 92, mpgHighway: 0 },

  // ==================== NIO ====================
  { brand: "NIO", model: "ET7", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 644, torque: 627, drivetrain: "AWD", seatingCapacity: 5, price: 70000, color: "First Light", bodyStyle: "4-Door", mpgCity: 88, mpgHighway: 0 },
  { brand: "NIO", model: "ET5", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 489, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 49000, color: "Mirror Silver", bodyStyle: "4-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "NIO", model: "ET5T", type: "Wagon", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 489, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 51000, color: "Starfall Gold", bodyStyle: "5-Door", mpgCity: 92, mpgHighway: 0 },
  { brand: "NIO", model: "ES8", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 644, torque: 627, drivetrain: "AWD", seatingCapacity: 6, price: 77000, color: "Deep Space", bodyStyle: "5-Door", mpgCity: 75, mpgHighway: 0 },
  { brand: "NIO", model: "ES6", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 489, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 52000, color: "Nebula Green", bodyStyle: "5-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "NIO", model: "ES7", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 644, torque: 627, drivetrain: "AWD", seatingCapacity: 5, price: 65000, color: "Polar Blue", bodyStyle: "5-Door", mpgCity: 80, mpgHighway: 0 },
  { brand: "NIO", model: "EC7", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 644, torque: 627, drivetrain: "AWD", seatingCapacity: 5, price: 72000, color: "Aurora Violet", bodyStyle: "5-Door", mpgCity: 78, mpgHighway: 0 },
  { brand: "NIO", model: "EC6", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 489, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 55000, color: "Solar Orange", bodyStyle: "5-Door", mpgCity: 84, mpgHighway: 0 },
  { brand: "NIO", model: "EL8", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 644, torque: 627, drivetrain: "AWD", seatingCapacity: 6, price: 80000, color: "Eclipse Black", bodyStyle: "5-Door", mpgCity: 73, mpgHighway: 0 },

  // ==================== XPeng ====================
  { brand: "XPeng", model: "P7", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 470, torque: 440, drivetrain: "AWD", seatingCapacity: 5, price: 42000, color: "Cosmos Grey", bodyStyle: "4-Door", mpgCity: 96, mpgHighway: 0 },
  { brand: "XPeng", model: "P7i", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 473, torque: 446, drivetrain: "AWD", seatingCapacity: 5, price: 44000, color: "Nebula Purple", bodyStyle: "4-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "XPeng", model: "G6", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 473, torque: 446, drivetrain: "AWD", seatingCapacity: 5, price: 35000, color: "Starlight White", bodyStyle: "5-Door", mpgCity: 100, mpgHighway: 0 },
  { brand: "XPeng", model: "G9", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 551, torque: 516, drivetrain: "AWD", seatingCapacity: 5, price: 55000, color: "Galaxy Blue", bodyStyle: "5-Door", mpgCity: 82, mpgHighway: 0 },
  { brand: "XPeng", model: "X9", type: "Van", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 503, torque: 487, drivetrain: "AWD", seatingCapacity: 7, price: 52000, color: "Lunar Silver", bodyStyle: "5-Door", mpgCity: 78, mpgHighway: 0 },
  { brand: "XPeng", model: "MONA M03", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 215, torque: 236, drivetrain: "FWD", seatingCapacity: 5, price: 17000, color: "Cloud White", bodyStyle: "4-Door", mpgCity: 118, mpgHighway: 0 },

  // ==================== Zeekr ====================
  { brand: "Zeekr", model: "001", type: "Wagon", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 536, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 55000, color: "Polar Night", bodyStyle: "5-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "Zeekr", model: "007", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 637, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 38000, color: "Radiation Green", bodyStyle: "4-Door", mpgCity: 92, mpgHighway: 0 },
  { brand: "Zeekr", model: "009", type: "Van", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 536, torque: 567, drivetrain: "AWD", seatingCapacity: 6, price: 70000, color: "Zenith Black", bodyStyle: "5-Door", mpgCity: 72, mpgHighway: 0 },
  { brand: "Zeekr", model: "X", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 422, torque: 406, drivetrain: "AWD", seatingCapacity: 5, price: 30000, color: "Cosmos Silver", bodyStyle: "5-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "Zeekr", model: "7X", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 637, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 42000, color: "Aurora White", bodyStyle: "5-Door", mpgCity: 88, mpgHighway: 0 },
  { brand: "Zeekr", model: "MIX", type: "Van", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 302, torque: 310, drivetrain: "FWD", seatingCapacity: 5, price: 35000, color: "Morning Mist", bodyStyle: "5-Door", mpgCity: 90, mpgHighway: 0 },

  // ==================== Geely ====================
  { brand: "Geely", model: "Galaxy E8", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 272, torque: 258, drivetrain: "FWD", seatingCapacity: 5, price: 28000, color: "Galaxy Blue", bodyStyle: "4-Door", mpgCity: 102, mpgHighway: 0 },
  { brand: "Geely", model: "Galaxy L7", type: "SUV", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 181, torque: 265, drivetrain: "FWD", seatingCapacity: 5, price: 22000, color: "Starlight Silver", bodyStyle: "5-Door", mpgCity: 55, mpgHighway: 43 },
  { brand: "Geely", model: "Galaxy L6", type: "Sedan", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 181, torque: 265, drivetrain: "FWD", seatingCapacity: 5, price: 18500, color: "Moonlight White", bodyStyle: "4-Door", mpgCity: 58, mpgHighway: 45 },
  { brand: "Geely", model: "Emgrand L", type: "Sedan", year: 2025, engine: "1.5L 4-Cylinder", fuelType: "Gasoline", transmission: "CVT", horsepower: 126, torque: 112, drivetrain: "FWD", seatingCapacity: 5, price: 12000, color: "Ruby Red", bodyStyle: "4-Door", mpgCity: 35, mpgHighway: 45 },
  { brand: "Geely", model: "Coolray", type: "SUV", year: 2025, engine: "1.5L Turbo 3-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 174, torque: 191, drivetrain: "FWD", seatingCapacity: 5, price: 16000, color: "Solar Orange", bodyStyle: "5-Door", mpgCity: 30, mpgHighway: 38 },
  { brand: "Geely", model: "Tugella", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 238, torque: 258, drivetrain: "AWD", seatingCapacity: 5, price: 28000, color: "Meteor Grey", bodyStyle: "5-Door", mpgCity: 24, mpgHighway: 32 },
  { brand: "Geely", model: "Monjaro", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 238, torque: 258, drivetrain: "AWD", seatingCapacity: 5, price: 25000, color: "Horizon Blue", bodyStyle: "5-Door", mpgCity: 25, mpgHighway: 33 },

  // ==================== Lynk & Co ====================
  { brand: "Lynk & Co", model: "07 EM-P", type: "Sedan", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 381, torque: 406, drivetrain: "AWD", seatingCapacity: 5, price: 32000, color: "Midnight Black", bodyStyle: "4-Door", mpgCity: 52, mpgHighway: 42 },
  { brand: "Lynk & Co", model: "08 EM-P", type: "SUV", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 381, torque: 406, drivetrain: "AWD", seatingCapacity: 5, price: 36000, color: "Pulse Blue", bodyStyle: "5-Door", mpgCity: 50, mpgHighway: 40 },
  { brand: "Lynk & Co", model: "09 EM-P", type: "SUV", year: 2025, engine: "2.0T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 429, torque: 457, drivetrain: "AWD", seatingCapacity: 7, price: 48000, color: "Glacier White", bodyStyle: "5-Door", mpgCity: 45, mpgHighway: 38 },
  { brand: "Lynk & Co", model: "01", type: "SUV", year: 2025, engine: "1.5T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 261, torque: 295, drivetrain: "AWD", seatingCapacity: 5, price: 30000, color: "Flame Red", bodyStyle: "5-Door", mpgCity: 48, mpgHighway: 40 },
  { brand: "Lynk & Co", model: "Z10", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 577, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 45000, color: "Quantum Grey", bodyStyle: "4-Door", mpgCity: 90, mpgHighway: 0 },

  // ==================== Chery ====================
  { brand: "Chery", model: "Tiggo 8 Pro", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 254, torque: 276, drivetrain: "FWD", seatingCapacity: 7, price: 20000, color: "Titanium Grey", bodyStyle: "5-Door", mpgCity: 26, mpgHighway: 33 },
  { brand: "Chery", model: "Tiggo 7 Pro", type: "SUV", year: 2025, engine: "1.6L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 186, torque: 210, drivetrain: "FWD", seatingCapacity: 5, price: 16000, color: "Desert Gold", bodyStyle: "5-Door", mpgCity: 30, mpgHighway: 38 },
  { brand: "Chery", model: "Arrizo 8", type: "Sedan", year: 2025, engine: "1.6L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 186, torque: 210, drivetrain: "FWD", seatingCapacity: 5, price: 14000, color: "Arctic White", bodyStyle: "4-Door", mpgCity: 32, mpgHighway: 42 },
  { brand: "Chery", model: "OMODA 5", type: "SUV", year: 2025, engine: "1.6L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "CVT", horsepower: 186, torque: 210, drivetrain: "FWD", seatingCapacity: 5, price: 17000, color: "Aurora Green", bodyStyle: "5-Door", mpgCity: 30, mpgHighway: 38 },
  { brand: "Chery", model: "Jaecoo 7", type: "SUV", year: 2025, engine: "1.6L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 186, torque: 210, drivetrain: "AWD", seatingCapacity: 5, price: 19000, color: "Meteor Grey", bodyStyle: "5-Door", mpgCity: 28, mpgHighway: 36 },
  { brand: "Chery", model: "EXEED RX", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 254, torque: 276, drivetrain: "AWD", seatingCapacity: 5, price: 26000, color: "Sapphire Blue", bodyStyle: "5-Door", mpgCity: 25, mpgHighway: 33 },
  { brand: "Chery", model: "EXEED VX", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 254, torque: 276, drivetrain: "AWD", seatingCapacity: 7, price: 30000, color: "Obsidian Black", bodyStyle: "5-Door", mpgCity: 23, mpgHighway: 30 },

  // ==================== Great Wall / GWM ====================
  { brand: "GWM", model: "Haval H6", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 211, torque: 236, drivetrain: "AWD", seatingCapacity: 5, price: 18000, color: "Burgundy Red", bodyStyle: "5-Door", mpgCity: 27, mpgHighway: 35 },
  { brand: "GWM", model: "Haval H6 HEV", type: "SUV", year: 2025, engine: "1.5L HEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 243, torque: 295, drivetrain: "AWD", seatingCapacity: 5, price: 22000, color: "Forest Green", bodyStyle: "5-Door", mpgCity: 45, mpgHighway: 38 },
  { brand: "GWM", model: "Tank 300", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 227, torque: 258, drivetrain: "4WD", seatingCapacity: 5, price: 28000, color: "Desert Storm", bodyStyle: "5-Door", mpgCity: 20, mpgHighway: 27 },
  { brand: "GWM", model: "Tank 500", type: "SUV", year: 2025, engine: "3.0L Twin-Turbo V6", fuelType: "Gasoline", transmission: "Automatic", horsepower: 354, torque: 369, drivetrain: "4WD", seatingCapacity: 7, price: 45000, color: "Command Green", bodyStyle: "5-Door", mpgCity: 17, mpgHighway: 24 },
  { brand: "GWM", model: "Wey 05", type: "SUV", year: 2025, engine: "1.5L PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 381, torque: 406, drivetrain: "AWD", seatingCapacity: 5, price: 32000, color: "Moonbeam Silver", bodyStyle: "5-Door", mpgCity: 52, mpgHighway: 40 },
  { brand: "GWM", model: "Poer PHEV", type: "Truck", year: 2025, engine: "2.0T PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 381, torque: 443, drivetrain: "4WD", seatingCapacity: 5, price: 30000, color: "Volcanic Ash", bodyStyle: "Crew Cab", mpgCity: 45, mpgHighway: 38 },

  // ==================== MG (SAIC) ====================
  { brand: "MG", model: "MG4", type: "Hatchback", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 201, torque: 207, drivetrain: "RWD", seatingCapacity: 5, price: 25000, color: "Dynamic Red", bodyStyle: "5-Door", mpgCity: 110, mpgHighway: 0 },
  { brand: "MG", model: "MG4 XPower", type: "Hatchback", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 429, torque: 443, drivetrain: "AWD", seatingCapacity: 5, price: 35000, color: "Volcano Orange", bodyStyle: "5-Door", mpgCity: 100, mpgHighway: 0 },
  { brand: "MG", model: "MG5", type: "Sedan", year: 2025, engine: "1.5L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "CVT", horsepower: 158, torque: 177, drivetrain: "FWD", seatingCapacity: 5, price: 14000, color: "Racing Green", bodyStyle: "4-Door", mpgCity: 32, mpgHighway: 42 },
  { brand: "MG", model: "MG7", type: "Sedan", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 254, torque: 276, drivetrain: "FWD", seatingCapacity: 5, price: 20000, color: "Phantom Black", bodyStyle: "4-Door", mpgCity: 28, mpgHighway: 37 },
  { brand: "MG", model: "HS", type: "SUV", year: 2025, engine: "1.5L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 162, torque: 184, drivetrain: "FWD", seatingCapacity: 5, price: 18000, color: "Stellar Silver", bodyStyle: "5-Door", mpgCity: 29, mpgHighway: 37 },
  { brand: "MG", model: "ZS EV", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 174, torque: 207, drivetrain: "FWD", seatingCapacity: 5, price: 27000, color: "Pebble Black", bodyStyle: "5-Door", mpgCity: 105, mpgHighway: 0 },

  // ==================== GAC / Aion ====================
  { brand: "GAC", model: "Aion S", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 177, torque: 194, drivetrain: "FWD", seatingCapacity: 5, price: 20000, color: "Ice Crystal", bodyStyle: "4-Door", mpgCity: 110, mpgHighway: 0 },
  { brand: "GAC", model: "Aion Y Plus", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 201, torque: 225, drivetrain: "FWD", seatingCapacity: 5, price: 22000, color: "Moonlight Blue", bodyStyle: "5-Door", mpgCity: 102, mpgHighway: 0 },
  { brand: "GAC", model: "Aion V", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 201, torque: 225, drivetrain: "FWD", seatingCapacity: 5, price: 26000, color: "Galaxy Grey", bodyStyle: "5-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "GAC", model: "Aion LX Plus", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 360, torque: 369, drivetrain: "AWD", seatingCapacity: 5, price: 38000, color: "Polar White", bodyStyle: "5-Door", mpgCity: 82, mpgHighway: 0 },
  { brand: "GAC", model: "Trumpchi M8", type: "Van", year: 2025, engine: "2.0L Turbo PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 302, torque: 330, drivetrain: "FWD", seatingCapacity: 7, price: 32000, color: "Emperor Gold", bodyStyle: "5-Door", mpgCity: 48, mpgHighway: 40 },
  { brand: "GAC", model: "Trumpchi GS8", type: "SUV", year: 2025, engine: "2.0L Turbo PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 302, torque: 330, drivetrain: "AWD", seatingCapacity: 7, price: 28000, color: "Tempest Blue", bodyStyle: "5-Door", mpgCity: 45, mpgHighway: 38 },

  // ==================== Changan ====================
  { brand: "Changan", model: "Deepal SL03", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 218, torque: 224, drivetrain: "RWD", seatingCapacity: 5, price: 22000, color: "Star Trail", bodyStyle: "4-Door", mpgCity: 108, mpgHighway: 0 },
  { brand: "Changan", model: "Deepal S7", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 218, torque: 224, drivetrain: "RWD", seatingCapacity: 5, price: 24000, color: "Nebula Green", bodyStyle: "5-Door", mpgCity: 100, mpgHighway: 0 },
  { brand: "Changan", model: "Deepal G318", type: "SUV", year: 2025, engine: "1.5L Range Extender", fuelType: "Electric", transmission: "Automatic", horsepower: 381, torque: 443, drivetrain: "AWD", seatingCapacity: 5, price: 28000, color: "Expedition Green", bodyStyle: "5-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "Changan", model: "Nevo A07", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 218, torque: 236, drivetrain: "RWD", seatingCapacity: 5, price: 20000, color: "Moon Frost", bodyStyle: "4-Door", mpgCity: 110, mpgHighway: 0 },
  { brand: "Changan", model: "UNI-V", type: "Sedan", year: 2025, engine: "1.5L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 181, torque: 199, drivetrain: "FWD", seatingCapacity: 5, price: 15000, color: "Flame Red", bodyStyle: "4-Door", mpgCity: 32, mpgHighway: 42 },
  { brand: "Changan", model: "UNI-K", type: "SUV", year: 2025, engine: "2.0L Turbo 4-Cylinder", fuelType: "Gasoline", transmission: "Automatic", horsepower: 233, torque: 258, drivetrain: "AWD", seatingCapacity: 5, price: 22000, color: "Cosmos Black", bodyStyle: "5-Door", mpgCity: 26, mpgHighway: 34 },

  // ==================== Leapmotor ====================
  { brand: "Leapmotor", model: "C10", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 218, torque: 224, drivetrain: "RWD", seatingCapacity: 5, price: 20000, color: "Pearl White", bodyStyle: "5-Door", mpgCity: 102, mpgHighway: 0 },
  { brand: "Leapmotor", model: "C11", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 435, torque: 446, drivetrain: "AWD", seatingCapacity: 5, price: 26000, color: "Canyon Grey", bodyStyle: "5-Door", mpgCity: 90, mpgHighway: 0 },
  { brand: "Leapmotor", model: "C16", type: "SUV", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 218, torque: 224, drivetrain: "RWD", seatingCapacity: 6, price: 22000, color: "Horizon Blue", bodyStyle: "5-Door", mpgCity: 95, mpgHighway: 0 },
  { brand: "Leapmotor", model: "T03", type: "Hatchback", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 107, torque: 133, drivetrain: "FWD", seatingCapacity: 4, price: 10000, color: "Spring Green", bodyStyle: "5-Door", mpgCity: 125, mpgHighway: 0 },

  // ==================== Avatr ====================
  { brand: "Avatr", model: "11", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 578, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 55000, color: "Ethereal Grey", bodyStyle: "5-Door", mpgCity: 82, mpgHighway: 0 },
  { brand: "Avatr", model: "12", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 578, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 52000, color: "Astral Blue", bodyStyle: "4-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "Avatr", model: "07", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 578, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 40000, color: "Nova Red", bodyStyle: "5-Door", mpgCity: 90, mpgHighway: 0 },

  // ==================== IM Motors (SAIC) ====================
  { brand: "IM Motors", model: "L7", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 549, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 52000, color: "Phantom Silver", bodyStyle: "4-Door", mpgCity: 85, mpgHighway: 0 },
  { brand: "IM Motors", model: "LS7", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 549, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 55000, color: "Nebula Teal", bodyStyle: "5-Door", mpgCity: 80, mpgHighway: 0 },
  { brand: "IM Motors", model: "LS6", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 549, torque: 567, drivetrain: "AWD", seatingCapacity: 5, price: 38000, color: "Sapphire Blue", bodyStyle: "5-Door", mpgCity: 88, mpgHighway: 0 },

  // ==================== Hongqi ====================
  { brand: "Hongqi", model: "H9", type: "Sedan", year: 2025, engine: "3.0L Supercharged V6", fuelType: "Gasoline", transmission: "Automatic", horsepower: 283, torque: 295, drivetrain: "RWD", seatingCapacity: 5, price: 65000, color: "Imperial Red", bodyStyle: "4-Door", mpgCity: 20, mpgHighway: 28 },
  { brand: "Hongqi", model: "E-HS9", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 544, torque: 560, drivetrain: "AWD", seatingCapacity: 6, price: 80000, color: "Royal Black", bodyStyle: "5-Door", mpgCity: 72, mpgHighway: 0 },
  { brand: "Hongqi", model: "HQ9", type: "Van", year: 2025, engine: "2.0L Turbo PHEV", fuelType: "Hybrid", transmission: "Automatic", horsepower: 252, torque: 276, drivetrain: "FWD", seatingCapacity: 7, price: 50000, color: "Golden Age", bodyStyle: "5-Door", mpgCity: 42, mpgHighway: 36 },

  // ==================== Rivian (for completeness) ====================
  { brand: "Rivian", model: "R1S", type: "SUV", year: 2025, engine: "Quad Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 835, torque: 1050, drivetrain: "AWD", seatingCapacity: 7, price: 89900, color: "Limestone", bodyStyle: "5-Door", mpgCity: 73, mpgHighway: 0 },
  { brand: "Rivian", model: "R1T", type: "Truck", year: 2025, engine: "Quad Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 835, torque: 1050, drivetrain: "AWD", seatingCapacity: 5, price: 79900, color: "Forest Edge", bodyStyle: "Crew Cab", mpgCity: 69, mpgHighway: 0 },

  // ==================== Lucid ====================
  { brand: "Lucid", model: "Air Grand Touring", type: "Sedan", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 819, torque: 738, drivetrain: "AWD", seatingCapacity: 5, price: 109900, color: "Infinite Black", bodyStyle: "4-Door", mpgCity: 140, mpgHighway: 0 },
  { brand: "Lucid", model: "Air Pure", type: "Sedan", year: 2025, engine: "Single Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 480, torque: 406, drivetrain: "RWD", seatingCapacity: 5, price: 77400, color: "Cosmos Silver", bodyStyle: "4-Door", mpgCity: 142, mpgHighway: 0 },
  { brand: "Lucid", model: "Gravity", type: "SUV", year: 2025, engine: "Dual Motor Electric", fuelType: "Electric", transmission: "Automatic", horsepower: 800, torque: 698, drivetrain: "AWD", seatingCapacity: 7, price: 89900, color: "Stellar White", bodyStyle: "5-Door", mpgCity: 95, mpgHighway: 0 },
];
