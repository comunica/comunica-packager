import {kebabCaseToPascalCase} from "~/utils/alpha";
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

export function handleParameters(normalizedContext: any, parametersAll: any, parameters: any) {
    for (const p of parameters) {
        const iri = getExpandedIRI(normalizedContext, p['@id'])
        if (parametersAll.hasOwnProperty(iri))
            parametersAll[iri] = {
                ...parametersAll[iri],
                ...p
            }
        else parametersAll[iri] = p;
    }
}

export default async ({$axios, store}: Context) => {

    const appConfig = await $axios.$get('/comunica-packager/app-config.json');
    store.commit('setStateEntry', {key: 'appConfig', value: appConfig});

    // Retrieve the list of all Comunica related packages
    // TODO: use packageUrls from config
    const packages = await $axios.$get('https://api.github.com/repos/comunica/comunica/contents/packages?ref=master');
    // Define all different types of packages
    const packageNames = packages.map((p: Package) => p.name);
    const buses = packageNames.filter((p: string) => p.substring(0, 3) === 'bus').map((p: string) => p.substring(4));
    const mediatorPackages = packageNames.filter((p: string) => p.startsWith('mediator-'));
    const loggerPackages = packageNames.filter((p: string) => p.startsWith('logger-'));

    let busGroups: any = [];
    // Avoid actors being added to multiple bus types
    let usedActors = new Set();

    for (const b of buses) {
        let busGroup: any = {
            busGroupName: kebabCaseToPascalCase(b)
        };
        let actors = packageNames
                .filter((p: string) => p.startsWith(`actor-${b}`))
                .map(kebabCaseToPascalCase)
                .filter((a: any) => !usedActors.has(a));
        actors.forEach((a: any) => usedActors.add(a));
        busGroup.actors = actors;
        busGroups.push(busGroup);
    }

    store.commit('addBusGroups', busGroups);

    store.commit('addMediatorPackages', mediatorPackages);

    store.commit('addLoggers', loggerPackages.map(kebabCaseToPascalCase));

    store.commit('addBuses', buses.map((bus: string) => {
        let prefix = 'cb' + bus.split('-').map(x => x[0]).join('');
        return `${prefix}:Bus/${kebabCaseToPascalCase(bus)}`
    }));
}