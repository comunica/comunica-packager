import {kebabCaseToPascalCase} from "~/utils/alpha";

interface Context {
    $axios: any,
    store: any
}

interface Package {
    name: string,
    size: number,
    url: string,
}

const baseUrl = 'https://api.github.com/repos/comunica/comunica/contents/packages';
const baseSuffix = '?ref=master';

export default async ({$axios, store}: Context) => {

    // TODO: add @context
    const packages = await $axios.$get(baseUrl + baseSuffix);
    const packageNames = packages.map((p: Package) => p.name);
    const buses = packageNames.filter((p: string) => p.substring(0, 3) === 'bus').map((p: string) => p.substring(4));
    const mediatorPackages = packageNames.filter((p: string) => p.startsWith('mediator-'));
    const loggerPackages = packageNames.filter((p: string) => p.startsWith('logger-'));

    // TODO: clean up and avoid hardcode
    const mediatorSuperParameter = {
        "@id": "cc:Mediator/bus",
        "comment": "The bus this mediator will mediate over.",
        "range": "cc:Bus",
        "unique": true,
        "required": true
    }

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
    ]

    const mediatorsList = [];

    for (const m of mediatorPackages) {
        const mediators = await $axios.$get(`${baseUrl}/${m}/components/Mediator${baseSuffix}`);
        for (const mediator of mediators) {
            const mediatorConfig = await $axios.$get(mediator.url)
            const mediatorComponent = JSON.parse(atob(mediatorConfig.content)).components[0];
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

            mediatorsList.push({
                name: mediatorComponent['@id'],
                parameters: parameters,
            });
        }
    }

    store.commit('addBusGroups', buses.map((bus: string) => {
        return {
            busGroupName: kebabCaseToPascalCase(bus),
            actors: packageNames.filter((p: string) => p.startsWith(`actor-${bus}`)).map(kebabCaseToPascalCase)
        };
    }));

    store.commit('addMediators', mediatorsList);

    store.commit('addLoggers', loggerPackages.map(kebabCaseToPascalCase));

    store.commit('addBuses', buses.map((bus: string) => {
        let prefix = 'cb' + bus.split('-').map(x => x[0]).join('');
        return `${prefix}:Bus/${kebabCaseToPascalCase(bus)}`
    }));
}