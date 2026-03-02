import mongoose from 'mongoose'
import Challenge from '../models/Challenge'

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB = process.env.MONGODB_DB || 'wildcard'

const now = new Date()
const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)
const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)
const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

const challenges = [
  {
    challengeId: 'ocean-microplastics',
    title: 'Ocean Microplastics Without Cleanup Ships',
    problem:
      'Microplastics have infiltrated every ocean layer, from surface waters to the Mariana Trench. Current cleanup approaches rely on expensive vessels that can only skim surface-level debris and miss particles under 1mm. Estimates suggest there are over 170 trillion plastic particles in the ocean, and the number is accelerating. Marine life mistakes microplastics for food, concentrating toxins up the food chain and into human seafood consumption.',
    constraints:
      'No cleanup vessels, no surface-skimming technology, no conventional filtration infrastructure.',
    inspirationDomains: ['biomimicry', 'mycology', 'synthetic biology', 'indigenous fishing practices'],
    sources: [
      { title: 'UNEP Microplastics in Marine Environments Report', url: 'https://www.unep.org/resources/report/microplastics-marine-environments' },
      { title: 'Mussel Filtration Rate Studies — Nature', url: 'https://www.nature.com' },
      { title: 'Mycelium Bioremediation Research Overview', url: 'https://www.ncbi.nlm.nih.gov' },
    ],
    status: 'open',
    submissionDeadline: in48h,
    votingDeadline: in72h,
  },
  {
    challengeId: 'urban-heat-islands',
    title: 'Urban Heat Islands Without More Air Conditioning',
    problem:
      'Cities are 1-3°C hotter than surrounding areas due to heat absorption by concrete and asphalt, reduced vegetation, and waste heat from buildings and transportation. Heat-related deaths are rising globally. The default response — more AC — increases energy demand and outdoor heat through waste heat exhaust, creating a dangerous feedback loop that accelerates the very problem it addresses.',
    constraints: 'No new AC installations. No solutions that increase electricity demand.',
    inspirationDomains: ['traditional desert architecture', 'materials science', 'urban ecology', 'behavioral science'],
    sources: [
      { title: 'Persian Badgir Wind Tower Architecture', url: 'https://www.archdaily.com' },
      { title: 'MIT Radiative Cooling Paint Studies', url: 'https://news.mit.edu' },
      { title: 'Urban Canopy Effect on Temperature', url: 'https://www.epa.gov/green-infrastructure' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'soil-regeneration',
    title: 'Soil Regeneration in Post-Industrial Farmland',
    problem:
      'Decades of monoculture and chemical fertilizers have depleted topsoil across major agricultural regions. The United States alone has lost half its topsoil since 1950. Conventional approaches — cover cropping, no-till farming — work but take 10-20 years to show measurable results. Smallholder farmers in the developing world cannot wait decades and cannot afford expensive inputs.',
    constraints:
      'Must show measurable improvement within 3 years. No synthetic inputs. Budget-constrained — solutions must be affordable for smallholder farmers.',
    inspirationDomains: ['mycorrhizal networks', 'terra preta', 'biochar', 'insect farming', 'fermentation science'],
    sources: [
      { title: 'Amazonian Dark Earth (Terra Preta) Research', url: 'https://www.science.org' },
      { title: 'Mycorrhizal Inoculation Field Studies', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Biochar Soil Amendment Trials', url: 'https://www.biochar-journal.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'coral-reef-restoration',
    title: 'Coral Reef Restoration Without Transplanting',
    problem:
      'Coral reefs support 25% of all marine species and protect 500 million people\'s coastlines, yet half the world\'s reefs have died since 1950. Bleaching events — triggered by 1-2°C temperature increases — are occurring more frequently and with greater intensity. Current restoration involves growing coral fragments in nurseries and transplanting them: a process that is labor-intensive, expensive, and often fails because the thermal stress that caused the bleaching is still present.',
    constraints: 'No coral transplanting. No artificial reef structures.',
    inspirationDomains: ['acoustic ecology', 'epigenetics', 'probiotic microbiology', 'traditional Pacific island management'],
    sources: [
      { title: 'Reef Soundscape Restoration — Steve Simpson Research', url: 'https://www.stevensimpson.net' },
      { title: 'Coral Probiotic Studies', url: 'https://www.science.org' },
      { title: 'Traditional Polynesian Ra\'ui Marine Management', url: 'https://www.sprep.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'rice-paddy-methane',
    title: 'Reducing Methane from Rice Paddies',
    problem:
      'Rice paddies produce approximately 1.5% of global greenhouse gas emissions via methane from anaerobic decomposition in flooded fields. Rice feeds over half the world\'s population, making production cuts impossible. This is one of the largest agricultural emissions sources we have almost no viable solution for — a genuine wicked problem.',
    constraints:
      'Cannot reduce rice output. No genetically modified organisms. Must be adoptable by smallholder farmers in Southeast Asia.',
    inspirationDomains: ['alternate wetting/drying', 'duck-rice farming', 'Azolla symbiosis', 'fermentation science', 'Balinese subak systems'],
    sources: [
      { title: 'IRRI Alternate Wetting and Drying Studies', url: 'https://www.irri.org' },
      { title: 'Azolla Biofertilizer and Methane Suppression', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Balinese Subak UNESCO Documentation', url: 'https://whc.unesco.org/en/list/1194' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'deforestation-monitoring',
    title: 'Deforestation Monitoring Without Satellites',
    problem:
      'Satellite-based deforestation monitoring has critical gaps: cloud cover in tropical regions blocks satellites 60-90% of the time, time lags mean logging is often complete before detection, and resolution limits miss selective logging under canopy cover. By the time illegal activity is detected, the damage is done. Meanwhile, enforcement agencies are understaffed and underfunded.',
    constraints: 'No satellite imagery. No drones — too expensive and regulated in most tropical countries.',
    inspirationDomains: ['bioacoustics', 'community monitoring', 'IoT sensors', 'fungal network signals'],
    sources: [
      { title: 'Rainforest Connection Acoustic Monitoring', url: 'https://rfcx.org' },
      { title: 'Indigenous Land Monitoring Programs', url: 'https://www.wrm.org.uy' },
      { title: 'Mycorrhizal Network Stress Communication', url: 'https://www.ncbi.nlm.nih.gov' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 36 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'textile-waste',
    title: 'Textile Waste Without Recycling Plants',
    problem:
      '92 million tons of textile waste are generated annually. Less than 1% is recycled into new clothing. Recycling infrastructure is concentrated in wealthy nations while waste accumulates in developing countries — Ghana alone receives 15 million garments per week from Western fast fashion. The recycling technology that exists requires high capital investment and specialized infrastructure.',
    constraints: 'No industrial recycling facilities. Solutions must work in low-infrastructure contexts.',
    inspirationDomains: ['mycelium decomposition', 'insect bioprocessing', 'Japanese boro technique', 'enzymatic breakdown'],
    sources: [
      { title: 'Fungal Textile Decomposition Studies', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Black Soldier Fly Waste Processing', url: 'https://www.sciencedirect.com' },
      { title: 'Japanese Boro Textile Reuse History', url: 'https://www.thecollector.com' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 43 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'freshwater-scarcity',
    title: 'Freshwater Scarcity Without Desalination',
    problem:
      '2 billion people lack access to safe drinking water. By 2025, half the world\'s population will live in water-stressed regions. Desalination works but requires massive energy — a single desalination plant uses as much energy as a small city — and produces toxic concentrated brine that devastates coastal ecosystems. Groundwater is being depleted 3x faster than natural recharge rates.',
    constraints: 'No desalination plants. No new dam construction. Must be energy-minimal.',
    inspirationDomains: ['fog harvesting', 'atmospheric water generation', 'qanat systems', 'mangrove filtration', 'dew collection'],
    sources: [
      { title: 'Namib Beetle-Inspired Fog Collectors', url: 'https://www.nature.com' },
      { title: 'Iranian Qanat Underground Aqueduct Engineering', url: 'https://whc.unesco.org/en/list/1506' },
      { title: 'Atmospheric Water Harvesting Review', url: 'https://www.sciencedirect.com' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 49 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'food-waste-methane',
    title: 'Food Waste Methane Without Landfill Infrastructure',
    problem:
      'Food waste in landfills produces methane — a greenhouse gas 80x more potent than CO2 over 20 years. 1/3 of all food produced globally is wasted. The infrastructure needed for large-scale composting or anaerobic digestion requires capital, land, and collection systems that most cities — particularly in the Global South — simply do not have.',
    constraints:
      'No centralized composting or anaerobic digestion facilities. Must work at household or neighborhood scale.',
    inspirationDomains: ['bokashi fermentation', 'black soldier fly bioconversion', 'vermicomposting', 'Korean natural farming', 'community biogas'],
    sources: [
      { title: 'Bokashi Fermentation Meta-analyses', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Black Soldier Fly Food Waste Studies', url: 'https://www.sciencedirect.com' },
      { title: 'Korean Natural Farming Indigenous Microorganism Research', url: 'https://www.ctahr.hawaii.edu' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 56 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 57 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'invasive-species',
    title: 'Invasive Species Without Pesticides or Hunting',
    problem:
      'Invasive species cost the global economy $423 billion annually and are a leading driver of biodiversity loss — second only to habitat destruction. On islands, they have caused 58% of all recorded extinctions. Conventional control relies on pesticides that damage native ecosystems or hunting programs that are expensive, often ineffective, and politically contentious.',
    constraints: 'No synthetic pesticides. No culling programs. Must avoid harming native species.',
    inspirationDomains: ['biocontrol agents', 'gene drives', 'acoustic deterrents', 'Aboriginal cultural burning', 'taste-aversion conditioning'],
    sources: [
      { title: 'Gene Drive Ethics Research', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Aboriginal Cultural Burning Practices', url: 'https://www.csiro.au' },
      { title: 'Sterile Insect Technique Field Trials', url: 'https://www.iaea.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 63 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 64 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'carbon-sequestration',
    title: 'Carbon Sequestration Without Tree Planting',
    problem:
      'Tree planting campaigns have become the default carbon offset strategy, but most are deeply flawed: they plant monocultures that store less carbon, displace native grasslands that were already effective carbon sinks, or fail within 5 years due to lack of maintenance. Meanwhile, "plant trees" has become a rhetorical substitute for systemic emissions reductions.',
    constraints: 'No tree planting. No direct air capture machines.',
    inspirationDomains: ['seagrass restoration', 'kelp farming', 'enhanced rock weathering', 'biochar burial', 'peatland restoration'],
    sources: [
      { title: 'Seagrass Carbon Sequestration Rates', url: 'https://www.nature.com' },
      { title: 'Enhanced Weathering Field Experiments', url: 'https://www.sciencedirect.com' },
      { title: 'Rewilding and Carbon Sequestration Studies', url: 'https://www.rewildingeurope.com' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 70 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 71 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'light-pollution',
    title: 'Light Pollution Without Turning Off Lights',
    problem:
      'Artificial light at night is growing at 2% per year globally. It disrupts bird migration, causes insect population collapse (a major driver of the overall insect decline), interferes with sea turtle nesting, and disrupts coral spawning cycles. 80% of the world\'s population lives under light-polluted skies, and the Milky Way is invisible to a third of humanity.',
    constraints:
      'Cannot eliminate artificial lighting — safety and economic considerations make this impossible. Solutions cannot make areas darker for humans.',
    inspirationDomains: ['spectral ecology', 'bioluminescent design', 'dark-sky navigation', 'adaptive lighting', 'chronobiology'],
    sources: [
      { title: 'Insect-Friendly Amber Wavelength Research', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Bioluminescent Pathway Design Studies', url: 'https://www.sciencedirect.com' },
      { title: 'Spectral Impact on Nocturnal Wildlife', url: 'https://www.royalsocietypublishing.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 77 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 78 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'ocean-noise-pollution',
    title: 'Noise Pollution in Oceans Without Silencing Ships',
    problem:
      'Underwater noise from commercial shipping, military sonar, and offshore construction has increased dramatically. Whales that communicate across ocean basins are now effectively deaf in shipping lanes. Fish spawning aggregations have shifted or collapsed. The global shipping fleet crosses 90,000 routes daily, and halting international trade is not an option.',
    constraints: 'Cannot halt global shipping. No solutions requiring vessel redesign — too slow and expensive to implement at scale.',
    inspirationDomains: ['acoustic refugia design', 'bubble curtain engineering', 'marine spatial planning', 'temporal zoning', 'traditional fishing calendars'],
    sources: [
      { title: 'Bubble Curtain Noise Reduction Studies', url: 'https://www.sciencedirect.com' },
      { title: 'Whale Communication Disruption Research', url: 'https://www.nature.com' },
      { title: 'Traditional Pacific Navigation Calendars', url: 'https://www.sprep.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 84 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 85 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'pollinator-decline',
    title: 'Pollinator Decline Without Banning Pesticides',
    problem:
      '40% of insect pollinator species face extinction. $577 billion in annual food production depends on pollinators. Pesticide bans are the obvious solution but face intense political resistance from agricultural lobbies in every country that has attempted them. Meanwhile, neonicotinoids — the most harmful class — remain legal in the world\'s largest agricultural markets.',
    constraints: 'Cannot ban pesticides outright. Must work alongside existing agricultural systems.',
    inspirationDomains: ['push-pull farming', 'traditional milpa systems', 'robotic pollination', 'fungal endophyte biopesticides', 'corridor design'],
    sources: [
      { title: 'Push-Pull Technology — ICIPE Kenya Research', url: 'https://www.icipe.org' },
      { title: 'Milpa System Studies — Traditional Agriculture', url: 'https://www.fao.org' },
      { title: 'Fungal Endophyte Biopesticide Trials', url: 'https://www.ncbi.nlm.nih.gov' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 91 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 92 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'glacier-melt',
    title: 'Glacier Melt Without Geoengineering',
    problem:
      'Glaciers provide drinking water to 2 billion people across High Mountain Asia, the Andes, and the Alps. They are retreating at unprecedented rates. Geoengineering proposals — reflective blankets, artificial snowfall, cloud seeding — are expensive, scientifically controversial, and do nothing to address the downstream impacts on communities who depend on glacier-fed water systems.',
    constraints: 'No geoengineering. No reflective surface covers. Must address downstream water access impacts, not just slowing melt.',
    inspirationDomains: ['ice stupas', 'karez water systems', 'glacier-fed wetland restoration', 'Arctic snow fencing', 'indigenous water storage'],
    sources: [
      { title: 'Sonam Wangchuk\'s Ice Stupa Project', url: 'https://www.icestupa.org' },
      { title: 'Karez Underground Aqueduct Systems', url: 'https://whc.unesco.org/en/list/1506' },
      { title: 'Glacier-Fed Watershed Management', url: 'https://www.icimod.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 98 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 99 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'electronic-waste',
    title: 'Electronic Waste Without Export or Landfill',
    problem:
      '50 million tons of e-waste are generated annually, growing at 4-5% per year. Most is exported to Ghana, Nigeria, Pakistan, and India for informal recycling — workers burn plastic insulation to extract copper, poisoning soil, water, and themselves. Formal recycling recovers only a small fraction of the rare earth elements and precious metals embedded in modern electronics.',
    constraints: 'No export to other countries. No landfilling. Must recover critical minerals at meaningful scale.',
    inspirationDomains: ['urban mining', 'bioleaching bacteria', 'modular design mandates', 'fungal rare earth extraction', 'traditional metalworking'],
    sources: [
      { title: 'Bioleaching for Precious Metal Recovery', url: 'https://www.sciencedirect.com' },
      { title: 'Fungal Rare Earth Element Extraction', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Urban Mining Feasibility Analysis', url: 'https://www.sciencedirect.com' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 105 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 106 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'wildfire-prevention',
    title: 'Wildfire Prevention Without Suppression',
    problem:
      'A century of fire suppression in North America and Australia has created forests with 10x the normal fuel load. The result: fires that are catastrophically larger, hotter, and more destructive than historical norms. More suppression creates more suppression — a vicious cycle. Yet letting fires burn near communities creates immediate safety crises.',
    constraints: 'No fire suppression resources. Solutions cannot put communities at immediate risk.',
    inspirationDomains: ['Aboriginal cultural burning', 'grazing-based fuel reduction', 'community timber programs', 'fire-adapted landscape design', 'indigenous fire stewardship'],
    sources: [
      { title: 'Aboriginal Burning Practice Research — CSIRO', url: 'https://www.csiro.au' },
      { title: 'Targeted Grazing Fuel Reduction Studies', url: 'https://www.sciencedirect.com' },
      { title: 'Fire-Adapted Community Design Frameworks', url: 'https://headwaterseconomics.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 112 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 113 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'nitrogen-runoff',
    title: 'Nitrogen Runoff Without Reducing Fertilizer Use',
    problem:
      'Agricultural nitrogen runoff creates oceanic dead zones — over 400 globally, including the Gulf of Mexico dead zone covering 22,000 km². Excess nitrogen triggers algal blooms that consume oxygen and suffocate marine life. Farmers are economically dependent on nitrogen fertilizers, and reducing application risks crop yields in a food-insecure world.',
    constraints: 'Cannot reduce fertilizer volume applied. Must maintain crop yields.',
    inspirationDomains: ['constructed wetlands', 'nitrogen-fixing intercropping', 'biochar retention', 'chinampas floating gardens', 'precision soil reading'],
    sources: [
      { title: 'Constructed Wetland Nitrogen Removal Studies', url: 'https://www.epa.gov' },
      { title: 'Chinampa Ecosystem Services Research', url: 'https://www.sciencedirect.com' },
      { title: 'Biochar Nutrient Retention Field Trials', url: 'https://www.biochar-journal.org' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 119 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'monoculture-biodiversity',
    title: 'Biodiversity Loss in Monoculture Regions',
    problem:
      'Industrial agriculture has transformed vast landscapes into biological deserts. In the US Midwest, over 90% of the original prairie ecosystem has been converted to corn and soybean monocultures. These systems support almost zero wildlife beyond pest species. Insect biomass has declined 75% in monoculture-dominated regions since 1989.',
    constraints: 'Cannot convert farmland back to wilderness. Must maintain agricultural productivity.',
    inspirationDomains: ['agroforestry', 'beetle banks', 'milpa intercropping', 'rewilding field margins', 'agricultural-scale insect hotels'],
    sources: [
      { title: 'Agroforestry Productivity Studies', url: 'https://www.worldagroforestry.org' },
      { title: 'Beetle Bank Biodiversity Research', url: 'https://www.sciencedirect.com' },
      { title: 'Three Sisters Intercropping Analysis', url: 'https://www.ncbi.nlm.nih.gov' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 126 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 127 * 24 * 60 * 60 * 1000),
  },
  {
    challengeId: 'permafrost-thaw',
    title: 'Permafrost Thaw Methane Without Capping Emissions',
    problem:
      'Permafrost stores 1.5 trillion tons of organic carbon — twice what\'s currently in the atmosphere. As it thaws, microbial decomposition releases methane and CO2 in a self-reinforcing feedback loop. This is already happening regardless of our current emission reductions: the warming is locked in, the carbon is there, and we have no practical way to stop it.',
    constraints: 'Cannot re-freeze permafrost at scale. Cannot cap emissions at source — too dispersed across millions of km².',
    inspirationDomains: ['Pleistocene rewilding', 'methanotroph bioaugmentation', 'albedo modification', 'thermokarst lake management', 'Yakutian horse grazing'],
    sources: [
      { title: 'Pleistocene Park Research — Sergey Zimov', url: 'https://www.pleistocenepark.ru' },
      { title: 'Methanotrophic Bacteria Studies', url: 'https://www.ncbi.nlm.nih.gov' },
      { title: 'Grassland Albedo and Climate Research', url: 'https://www.nature.com' },
    ],
    status: 'upcoming',
    submissionDeadline: new Date(now.getTime() + 133 * 24 * 60 * 60 * 1000),
    votingDeadline: new Date(now.getTime() + 134 * 24 * 60 * 60 * 1000),
  },
]

async function seed() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set')
    process.exit(1)
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })
  console.log('Connected to MongoDB')

  let created = 0
  let skipped = 0

  for (const challenge of challenges) {
    const existing = await Challenge.findOne({ challengeId: challenge.challengeId })
    if (existing) {
      skipped++
      continue
    }
    await Challenge.create(challenge)
    created++
    console.log(`Created: ${challenge.title}`)
  }

  console.log(`\nDone! Created ${created}, skipped ${skipped} existing challenges.`)
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
