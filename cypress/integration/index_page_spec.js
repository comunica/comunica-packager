const path = require('path');

describe('The home (index) page', () => {
    before(() => {
        // Go to index page
        cy.visit('/');
        // Mediators should load
        cy.get('#mediators').should('not.exist');
        // Wait enough seconds to load everything in
        const seconds = process.env.NODE_ENV === 'production' ? 60000 : 11000;
        cy.wait(seconds);
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

        cy.exec('echo ' + downloadFolder);

        // Open dropdown of import configs
        cy.get('#import-conf').click();
        // Click Comunica SPARQL
        cy.contains('Comunica SPARQL').click();
        // Wait half a second
        cy.wait(500);
        // Export
        cy.get('#export-conf').click();
        cy.get('#btn-export').click();
        // Wait 2 seconds
        cy.wait(2000);
        // Unzip the file for further testing
        cy.exec('unzip -d ' + engineFolder + ' ' + zipFile);

    });
});