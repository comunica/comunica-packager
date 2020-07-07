export function kebabCaseToPascalCase(s: string): string {
    return s.replace(/(^\w|-\w)/g, (s_: string): string => s_.replace(/-/, '').toUpperCase());
}

export function pascalCaseToKebabCase(s: string): string {
    return s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase().substring(1);
}

export function trimIdentifier(s: string): string {
    const firstPhase = s.split('/').pop();
    if (firstPhase) {
        const secondPhase = firstPhase.split(':').pop();
        return secondPhase ? secondPhase : firstPhase
    }
    return s;
}

export function extractLabel(s: string): string {
    const t = s.split(':');
    t.shift();
    return t.join('').split('/').join('');
}