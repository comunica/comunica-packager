import JSZip from "jszip";
const path = require('path');

describe('The home (index) page', () => {
    it('imports and successfully downloads config', () => {
        const downloadFolder = path.join(__dirname, '..', 'downloads');
        const zipFile = downloadFolder + '/engine.zip';
        const engineFolder = downloadFolder + '/engine/';

        cy.visit('/');
        // Wait 30 seconds to load everything in
        cy.get('#mediators').should('not.exist');
        cy.wait(10000);
        // If #mediators exists then mediators are loaded.
        cy.get('#mediators').should('exist');
        cy.get('#import-conf').click();
        cy.contains('Comunica SPARQL').click();
        cy.wait(500);
        cy.get('#export-conf').click();
        cy.wait(500);
        // Assert if file exists
        cy.readFile(zipFile, 'binary');
        // Unzip file
        cy.exec('unzip -d ' + engineFolder + ' ' + zipFile);



        // Finally delete downloaded zip and unzipped folder
        cy.exec('rm ' + zipFile);
        cy.exec('rm -r ' + engineFolder);

    });
});