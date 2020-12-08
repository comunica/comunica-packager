/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const path = require('path');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
    on('before:browser:launch', (browser, options) => {
        const downloadDirectory = path.join(__dirname, '..', 'downloads')

        if (browser.family === 'chromium' && browser.name !== 'electron') {
            options.preferences.default['download'] = { default_directory: downloadDirectory }

            return options
        }

        if (browser.family === 'firefox') {
            options.preferences['browser.download.dir'] = downloadDirectory
            options.preferences['browser.download.folderList'] = 2

            // needed to prevent download prompt for text/csv files.
            options.preferences['browser.helperApps.neverAsk.saveToDisk'] = 'text/csv'

            return options
        }
    })
}
