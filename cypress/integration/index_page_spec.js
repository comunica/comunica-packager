import JSZip from "jszip";
const path = require('path');

describe('The home (index) page', () => {
    it('imports and successfully downloads config', () => {
        const downloadDirectory = path.join(__dirname, '..', 'downloads');

        cy.visit('/');
        // Wait 30 seconds to load everything in
        cy.get('#mediators').should('not.exist');
        cy.wait(30000);
        // If #mediators exists then mediators are loaded.
        cy.get('#mediators').should('exist');
        cy.get('#import-conf').click();
        cy.contains('Comunica SPARQL').click();
        cy.wait(30000);
        cy.get('#export-conf').click();
        cy.wait(500);
        // Assert if file exists
        cy.readFile(downloadDirectory + '/engine.zip', 'binary');
            // .then(x =>{
            //     let zip = new JSZip();
            //     zip.loadAsync(x).then(async (z) => {
            //     })
            // })

    });
});