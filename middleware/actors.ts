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

export default async ({$axios, store}: Context) => {

    const packages = await $axios.$get('https://api.github.com/repos/comunica/comunica/contents/packages?ref=master');
    const packageNames = packages.map((p: Package) => p.name);
    const buses = packageNames.filter((p: string) => p.substring(0, 3) === 'bus').map((p: string) => p.substring(4));

    store.commit('addBusGroups', buses.map((bus: string) => {
        return {
            busGroupName: kebabCaseToPascalCase(bus),
            actors: packageNames.filter((p: string) => p.startsWith(`actor-${bus}`)).map(kebabCaseToPascalCase)
        };
    }))
}