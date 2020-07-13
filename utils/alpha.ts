/**
 * Converts a kebab case string to pascal case.
 * @param s: A string in kebab case (this-is-an-example)
 */
export function kebabCaseToPascalCase(s: string): string {
    switch(s) {
        case 'actor-query-operation-leftjoin-left-deep':
            return 'ActorQueryOperationLeftJoinLeftDeep';
        case 'actor-query-operation-leftjoin-nestedloop':
            return 'ActorQueryOperationLeftJoinNestedLoop'
        case 'actor-rdf-parse-rdfxml':
            return 'ActorRdfParseRdfXml'
        case 'actor-query-operation-orderby-sparqlee':
            return 'ActorQueryOperationOrderBySparqlee'
        case 'actor-rdf-resolve-quad-pattern-rdfjs-source':
            return 'ActorRdfResolveQuadPatternRdfJsSource'
        case 'actor-rdf-serialize-jsonld':
            return 'ActorRdfSerializeJsonLd'
        case 'actor-rdf-parse-jsonld':
            return 'ActorRdfParseJsonLd'
        case 'actor-rdf-join-symmetrichash':
            return 'ActorRdfJoinSymmetricHash'
        case 'actor-rdf-join-nestedloop':
            return 'ActorRdfJoinNestedLoop'
        default:
            return s
                .replace(/(^\w|-\w)/g, (s_: string): string => s_
                    .replace(/-/, '')
                    .toUpperCase());
    }
}

/**
 * Converst a pascal case string to kebab case. Used only to retrieve the URL given an actors name in pascal case.
 * Special cases are explicitly defined in a switch case here as the default case would result in a 404.
 * @param s: A string in pascal case (ThisIsAnExample)
 */
export function pascalCaseToKebabCase(s: string): string {
    switch(s) {
        case 'ActorQueryOperationLeftJoinLeftDeep':
            return 'actor-query-operation-leftjoin-left-deep';
        case 'ActorQueryOperationLeftJoinNestedLoop':
            return 'actor-query-operation-leftjoin-nestedloop'
        case 'ActorRdfParseRdfXml':
            return 'actor-rdf-parse-rdfxml'
        case 'ActorQueryOperationOrderBySparqlee':
            return 'actor-query-operation-orderby-sparqlee'
        case 'ActorRdfResolveQuadPatternRdfJsSource':
            return 'actor-rdf-resolve-quad-pattern-rdfjs-source'
        case 'ActorRdfSerializeJsonLd':
            return 'actor-rdf-serialize-jsonld'
        case 'ActorRdfParseJsonLd':
            return 'actor-rdf-parse-jsonld'
        case 'ActorRdfJoinSymmetricHash':
            return 'actor-rdf-join-symmetrichash'
        case 'ActorRdfJoinNestedLoop':
            return 'actor-rdf-join-nestedloop'
        default:
            return s
                .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
                .toLowerCase()
                .substring(1);
    }
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