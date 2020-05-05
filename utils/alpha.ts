export function kebabCaseToPascalCase(s: string): string {
    return s.replace(/(^\w|-\w)/g, (s_: string): string => s_.replace(/-/, '').toUpperCase());
}

export function pascalCaseToKebabCase(s: string): string {
    return s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().substring(1);
}