import {ContextParser} from "jsonld-context-parser";

function handleParameter(obj: any, parameterNameFull: string, parameter: any) {

    let parameterNameShort = parameterNameFull.split('/').pop();
    parameterNameShort = parameterNameShort ? parameterNameShort : parameterNameFull;
    if (parameterNameShort[0] === '@') {
        obj[parameterNameFull] = parameter
    } else {
        let value = parameter;
        if (parameterNameShort.includes('mediator') || parameterNameShort === 'bus')
            value = parameter['@id'];
        else if (parameterNameShort === 'logger')
            value = parameter['@type'];
        else if (typeof value !== 'string')
            value = JSON.stringify(value);

        obj.parameters[parameterNameFull] = {
            value: value,
        };
    }
}

export function handleActor(normalizedContext: any, actor: any, actors: any[], mediators: any[]) {
    let actorExtracted: any = {
        parameters: {}
    };
    for (const key of Object.keys(actor)) {
        if (key.includes('mediator') && Object.keys(actor[key]).length > 1) {
            if (!Object.keys(actor[key]).includes('@id')) {
                actor[key]['@id'] = `${actor['@id']}#${key}`;
            }
            // Handle implicitly defined mediators
            handleMediator(normalizedContext, actor[key], mediators);
            actor[key] = {
                '@id': actor[key]['@id']
            };
        }
        const iri = getExpandedIRI(normalizedContext, key);
        handleParameter(actorExtracted, iri, actor[key]);
    }

    actors.push(actorExtracted);
}

export function handleMediator(normalizedContext: any, mediator: any, mediators: any[]) {
    let mediatorExtracted: any = {
        parameters: {}
    };
    for (const key of Object.keys(mediator)) {
        const iri = getExpandedIRI(normalizedContext, key);
        handleParameter(mediatorExtracted, iri, mediator[key]);
    }

    mediators.push(mediatorExtracted);
}

export async function stateToJsonld(state: any) {
    let addedActors: any = [];
    const createdActors: any[] = state.createdActors;
    let normalizedContext = await parseContext([...state.context]);

    for (let [busGroup, actors] of  Object.entries(createdActors)) {
        if (actors.length) {
            for (let actor of actors) {
                let actorToAdd: any = {
                    '@id': actor['@id'],
                    '@type': actor.actorName
                };
                for (let key of Object.keys(actor.parameters)) {
                    let parameter = actor.parameters[key];
                    if (parameter.value) {
                        if (parameter['@id'].includes('mediator')) {
                            actorToAdd[parameter['@id']] = {
                                '@id': parameter.value
                            }
                        } else {
                            switch (parameter.range) {
                                case 'cc:Logger': {
                                    actorToAdd[parameter['@id']] = {
                                        '@type': parameter.value
                                    };
                                    break;
                                }
                                case 'cc:Bus': {
                                    actorToAdd['cc:Actors/bus'] = {
                                        '@id': parameter.value
                                    };
                                    break;
                                }
                                default: {
                                    try {
                                        actorToAdd[getCompactedIRI(normalizedContext, key)] = JSON.parse(parameter.value);
                                    } catch (err) {
                                        actorToAdd[getCompactedIRI(normalizedContext, key)] = parameter.value;
                                    }
                                }
                            }
                        }
                    }
                }
                addedActors.push(actorToAdd);
            }
        }
    }

    let runner = {
        '@id': 'urn:comunica:my',
        '@type': 'Runner',
        'actors': addedActors
    };

    let graph: any[] = [runner];

    const createdMediators: any[] = state.createdMediators;

    for (let mediator of createdMediators) {
        let mediatorToAdd: any = {
            '@id': mediator['@id'],
            '@type': mediator.type,
        }
        for (let key of Object.keys(mediator.parameters)) {
            let parameter = mediator.parameters[key];
            if (parameter.range == 'cc:Bus') {
                mediatorToAdd['cc:Mediator/bus'] = {
                    '@id': parameter.value
                }
            } else {
                try {
                    mediatorToAdd[getCompactedIRI(normalizedContext, key)] = JSON.parse(parameter.value);
                } catch (err) {
                    mediatorToAdd[getCompactedIRI(normalizedContext, key)] = parameter.value;
                }
            }
        }
        graph.push(mediatorToAdd);
    }

    let output = {
        '@context': [...state.context],
        '@graph': graph
    };

    return JSON.stringify(output, null, '  ');
}

export async function jsonldToState(jsonld: any) {
    let id = '';
    let context = jsonld['@context'];
    let actors: any[] = [];
    let mediators: any[] = [];

    const normalizedContext = await parseContext(context);

    if (jsonld.hasOwnProperty('@graph')) {
        let actorPart = jsonld['@graph'][0];
        // TODO: auto-generated id if not present (for importing)
        id = actorPart['@id'] ? actorPart['@id'] : ''

        for (const a of actorPart.actors) {
            handleActor(normalizedContext, a, actors, mediators);
        }
        if (jsonld['@graph'].length > 1) {
            for (let i = 1; i < jsonld['@graph'].length; i++) {
                handleMediator(normalizedContext, jsonld['@graph'][i], mediators);
            }
        }
    } else {
        id = jsonld['@id'] ? jsonld['@id'] : ''
        for (const a of jsonld.actors) {
            handleActor(context, a, actors, mediators);
        }
    }

    return {
        id: id,
        actors: actors,
        mediators: mediators,
        context: jsonld['@context']
    }
}

export async function parseContext(context: any) {
    const parser = new ContextParser();
    return await parser.parse(context);
}

export function getExpandedIRI(normalizedContext: any, compactTerm: string) {

    if (compactTerm[0] === '@' || compactTerm.startsWith('https'))
        return compactTerm;

    const iri = normalizedContext.expandTerm(compactTerm, true);
    return iri ? iri : compactTerm;
}

export function getCompactedIRI(normalizedContext: any, expandedIRI: string) {

    if (expandedIRI[0] === '@')
        return expandedIRI;

    const iri = normalizedContext.compactIri(expandedIRI, true);
    return iri ? iri: expandedIRI;
}