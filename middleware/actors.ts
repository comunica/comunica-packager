interface Context {
    $axios: any,
    store: any
}

interface Package {
    name: string,
    size: number,
    url: string,
}

function kebabCaseToPascalCase(s: string): string {
    return s.replace(/(^\w|-\w)/g, (s_: string): string => s_.replace(/-/, '').toUpperCase());
}

export default async ({$axios, store}: Context) => {

    const packages = await $axios.$get('https://api.github.com/repos/comunica/comunica/contents/packages?ref=master');
    const packageNames = packages.map((p: Package) => kebabCaseToPascalCase(p.name));

    console.log(packageNames);
}