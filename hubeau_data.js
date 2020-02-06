const request = require('superagent')
const csv = require('fast-csv')
const fs = require('fs')
const program = require('commander')
const makeDebug = require('debug')
const debug = makeDebug('data')

async function gatherSites () {
  // Retrieve all available sites
  try {
    const response = await request
      .get('https://hubeau.eaufrance.fr/api/v1/hydrometrie/referentiel/sites.csv')
      .query({
        size: 10000
      })
      .accept('text/csv')
    // Write CSV for debug
    fs.writeFileSync('hubeau_all_sites.csv', response.text)
    // Read CSV in-momory and filter the sites for the target river
    const river = program.args[0]
    let sites = []
    return await new Promise((resolve, reject) => {
      fs.createReadStream('hubeau_all_sites.csv')
        .pipe(csv.parse({ delimiter: ';', headers: true, trim: true }))
        .on('error', reject)
        .on('data', row => {
          if (row.libelle_cours_eau === river) sites.push(row)
        })
        .on('end', rowCount => {
          console.log(`Parsed ${rowCount} sites, selected ${sites.length}`)
          // Write CSV for debug
          csv.write(sites, { delimiter: ';', headers: true }).pipe(fs.createWriteStream(`hubeau_sites_${river}.csv`))
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
  // Retrieve selected sites data for last period
  let end = new Date()
  // Hubeau only allow request for 1 month in the past
  let start = new Date(Date.now() - tr * 24 * 60 * 60 * 1000)
  // Timestep 
  try {
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      const response = await request
        .get('https://hubeau.eaufrance.fr/api/v1/hydrometrie/observations_tr.csv')
        .query({
          code_entite: site.code_site,
          grandeur_hydro: 'H', // Water level
          date_debut_obs: start.toISOString(),
          date_fin_obs: end.toISOString(),
          timestep: program.timestep
        })
        .accept('text/csv')
      // Write CSV for debug
      fs.writeFileSync(`hubeau_site_${site.code_site}_${tr}d_${ts}m_${river}.csv`, response.text)
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
  .option('-ts, --timestep [timestep]', 'Observation timestep in minutes, defaults to 30', 30)
  .option('-tr, --timerange [timerange]', 'Observation time range in days from now, defaults to 30 days (max)', 30)
  .parse(process.argv)

run()