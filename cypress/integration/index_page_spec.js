import JSZip from "jszip";

describe('The home (index) page', () => {
    it('Imports configs', () => {
        cy.visit('/');
        // Wait 15 seconds to load everything in
        cy.wait(5000);
        cy.get('#import-conf').click();
        cy.contains('Comunica SPARQL').click();
        cy.wait(15000);
        cy.get('#export-conf').click().readFile('/home/nathaniel/Downloads/engine.zip', 'binary').then(
            (x) => {
                let zip = new JSZip();
                zip.loadAsync(x).then(async (z) => {
                })
            }
        );

    });
});