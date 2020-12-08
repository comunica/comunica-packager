const path = require('path');

describe('The home (index) page', () => {
    before(() => {
        // Go to index page
        cy.visit('/');
        // Mediators should load
        cy.get('#mediators').should('not.exist');
        // Wait enough seconds to load everything in
        cy.wait(10000);
        // Mediators should be loaded
        cy.get('#mediators').should('exist');
    });

    beforeEach(() => {
        cy.get('#reset-conf').click();
        cy.get('#confirm').click();
    });

    it('imports preset and exports default config',  () => {

        const downloadFolder = path.join(__dirname, '..', 'downloads');
        const zipFile = downloadFolder + '/engine.zip';
        const engineFolder = downloadFolder + '/engine/';

        // Open dropdown of import configs
        cy.get('#import-conf').click();
        // Click Comunica SPARQL
        cy.contains('Comunica SPARQL').click();
        // Wait half a second
        cy.wait(500);
        // Click export
        cy.get('#export-conf').click();
        // Wait 2 seconds
        cy.wait(2000);
        // Unzip the file for further testing
        cy.exec('unzip -d ' + engineFolder + ' ' + zipFile);

        // const myEngine = newEngineDynamic();
        //
        // // Finally delete downloaded zip and unzipped folder
        // cy.exec('rm ' + zipFile);
        // cy.exec('rm -r ' + engineFolder);

    });
});