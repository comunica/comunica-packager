import {extractLabel, kebabCaseToPascalCase} from "~/utils/alpha";
import * as jsonldParser from 'jsonld';
import {getExpandedIRI} from "~/utils/json";

interface Context {
    $axios: any,
    store: any
}

interface Package {
    name: string,
    size: number,
    url: string,
}

const baseURL = 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/'

export default async ({$axios, store}: Context) => {

    const t = performance.now();

    // Retrieve the list of all Comunica related packages
    const packages = await $axios.$get('https://api.github.com/repos/comunica/comunica/contents/packages?ref=master');
    const packageNames = packages.map((p: Package) => p.name);
    const buses = packageNames.filter((p: string) => p.substring(0, 3) === 'bus').map((p: string) => p.substring(4));
    const mediatorPackages = packageNames.filter((p: string) => p.startsWith('mediator-'));
    const loggerPackages = packageNames.filter((p: string) => p.startsWith('logger-'));

    // TODO: optimizations
    // Every mediator has a bus parameter
    const mediatorSuperParameter = {
        "@id": "cc:Mediator/bus",
        "comment": "The bus this mediator will mediate over.",
        "range": "cc:Bus",
        "unique": true,
        "required": true
    };

    // Every number mediator has these parameters
    const numberSuperParameters = [
        {
            "@id": "cmn:Mediator/Number/field",
            "comment": "The field name to mediate over",
            "range": "xsd:string",
            "unique": true,
            "required": true
        },
        {
            "@id": "cmn:Mediator/Number/ignoreErrors",
            "comment": "If actors that throw test errors should be ignored",
            "range": "xsd:boolean",
            "unique": true,
            "required": true,
            "default": false
        }
    ];

    const mediatorsList = [];


    for (const m of mediatorPackages) {
        const mediatorComponents : any = await $axios.$get(`${baseURL}/${m}/^1.0.0/components/components.jsonld`);
        const mediatorComponentsExpanded : any = await jsonldParser.expand(mediatorComponents);
        for (const mediatorURL of mediatorComponentsExpanded[0]['http://www.w3.org/2002/07/owl#imports']) {

            const mediatorJson = await $axios.$get(mediatorURL['@id']);
            const mediatorComponent = mediatorJson.components[0];
            const parameters: any[] = [mediatorSuperParameter];

            if (mediatorComponent.parameters)
                parameters.push(...mediatorComponent.parameters);
            if (mediatorComponent.extends && mediatorComponent.extends !== 'cc:Mediator') {
                parameters.splice(1, 1);
                parameters.push(...numberSuperParameters);
            }

            for (let p of parameters)
                if (p.hasOwnProperty('default'))
                    p.value = p.default;

            for (const p of parameters)
                p['@id'] = await getExpandedIRI(mediatorJson['@context'], p['@id']);


            mediatorsList.push({
                context: mediatorJson['@context'],
                name: extractLabel(mediatorComponent['@id']) ,
                parameters: parameters,
            });
        }
    }

    let busGroups: any = [];

    for (const b of buses) {
        let busGroup: any = {
            busGroupName: kebabCaseToPascalCase(b)
        };

        busGroup.actors = await Promise.all(
            packageNames
                .filter((p: string) => p.startsWith(`actor-${b}`))
                .map(kebabCaseToPascalCase)
        );

        busGroups.push(busGroup);
    }

    store.commit('addBusGroups', busGroups);

    store.commit('addMediators', mediatorsList);

    store.commit('addLoggers', loggerPackages.map(kebabCaseToPascalCase));

    store.commit('addBuses', buses.map((bus: string) => {
        let prefix = 'cb' + bus.split('-').map(x => x[0]).join('');
        return `${prefix}:Bus/${kebabCaseToPascalCase(bus)}`
    }));

    console.log(`Time for loading: ${performance.now() - t}`);
}