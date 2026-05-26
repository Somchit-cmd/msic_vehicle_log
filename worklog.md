---
Task ID: carnewschina-integration
Agent: Main Agent
Task: Integrate CarNewsChina data source for Chinese car brands

Work Log:
- Explored data.carnewschina.com/database/ to find Chinese EV data
- Discovered CarNewsChina's internal JSON API: /load-models/all/{page} and /load-models/{brandSlug}/{page}
- Created CarNewsChina scraper service at /src/lib/services/carnewschina-service.ts
- Service supports: quick fetch (top 18 brands) and full fetch (all models with specs)
- Created API route at /api/cars/fetch-carnewschina (GET=quick, POST=full with options)
- Updated main page UI with "Chinese EVs" button and progress indicator
- Updated daily refresh cron to include CarNewsChina data
- Fixed model name cleaning (removes brand prefix from model names)
- Improved body type detection with Chinese car naming patterns
- Successfully tested: 182 models from 16 Chinese brands added to database

Stage Summary:
- CarNewsChina API endpoints discovered and integrated
- 16 Chinese brands now available: BYD, Nio, Xpeng, Zeekr, Geely, Chery, Avatr, Hongqi, GWM, Leapmotor, Denza, Changan, Aion, Lynk & Co, Aito, Deepal
- Total database: 1447 cars (1265 from NHTSA + 182 from CarNewsChina)
- CarNewsChina models have real images from their CDN
- Body type detection works for common Chinese car naming patterns
