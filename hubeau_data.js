const request = require('superagent')
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const makeDebug = require('debug')
const debug = makeDebug('data')

async function gatherSites () {
  // Create data dir on first launch only
  try {
    fs.mkdirSync(program.output)
  } catch (_) {}
  // Retrieve all available sites
  try {
    console.log(`Downloading site list`)
    const response = await request
      .get('https://hubeau.eaufrance.fr/api/v1/hydrometrie/referentiel/sites.csv')
      .query({
        size: 10000
      })
      .accept('text/csv')
    // Write CSV for debug
    fs.writeFileSync(path.join(program.output, 'hubeau_all_sites.csv'), response.text)
    // Read CSV in-memory and filter the sites for the target river
    const river = program.args[0]
    let sites = []
    return await new Promise((resolve, reject) => {
      fs.createReadStream(path.join(program.output, 'hubeau_all_sites.csv'))
        .pipe(csv.parse({ delimiter: ';', headers: true, trim: true }))
        .on('error', reject)
        .on('data', row => {
          if (row.libelle_cours_eau === river) sites.push(row)
        })
        .on('end', rowCount => {
          console.log(`Parsed ${rowCount} sites, selected ${sites.length} for ${river}`)
          // Write CSV for debug
          csv.write(sites, { delimiter: ';', headers: true }).pipe(fs.createWriteStream(path.join(program.output, `hubeau_sites_${river}.csv`)))
          resolve(sites)
        })
    })
  } catch (error) {
    console.log(error)
  }
}

async function gatherSitesData (sites) {
  const river = program.args[0]
  const ts = program.timestep
  const tr = program.timerange
  console.log(`Downloading data for sites in range ${tr} days every ${ts} minutes`)
  // Retrieve selected sites data for last period
  let end = new Date()
  // Hubeau only allow request for 1 month in the past
  let start = new Date(Date.now() - tr * 24 * 60 * 60 * 1000)
  // Timestep 
  try {
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      console.log(`Downloading data for site ${site.libelle_site} -  ${site.code_site} from ${start.toISOString()} to ${end.toISOString()}`)
      const response = await request
        .get('https://hubeau.eaufrance.fr/api/v1/hydrometrie/observations_tr.csv')
        .query({
          code_entite: site.code_site,
          grandeur_hydro: 'H', // Water level
          date_debut_obs: start.toISOString(),
          date_fin_obs: end.toISOString(),
          timestep: ts
        })
        .accept('text/csv')
      const date = start.getFullYear() + '-' +
        (start.getMonth() + 1).toString().padStart(2, '0') + '-' +
        start.getDate().toString().padStart(2, '0')
      // Write CSV
      if (response.text) fs.writeFileSync(path.join(program.output, `hubeau_site_${site.code_site}_${date}_${tr}d_${ts}m_${river}.csv`), response.text)
      else console.log(`Skipping data for site ${site.libelle_site} -  ${site.code_site}, none found`)
    }
  } catch (error) {
    console.log(error)
  }
}

async function run () {
  let sites = await gatherSites()
  await gatherSitesData(sites)
}

program
  .version(require('./package.json').version)
  .usage('<river> [options]')
  .option('-o, --output [output]', ', defaults to "./data"', './data')
  .option('-ts, --timestep [timestep]', 'Observation timestep in minutes, defaults to 30', 30)
  .option('-tr, --timerange [timerange]', 'Observation time range in days from now, defaults to 30 days (max)', 30)
  .parse(process.argv)

run()