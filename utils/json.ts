import {ContextParser} from "jsonld-context-parser";

/**
 * Handles parameters
 * @param obj: An object representing an actor or mediator
 * @param parameterNameFull: The full IRI of the parameter
 * @param parameter: The information about the given parameter
 */
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

/**
 * Handles actors to store them in our inner state, also looks if mediators are defined implicitly
 * @param normalizedContext: The context of the given actor
 * @param actor: The actor to be handled
 * @param actors: A list of handled actors
 * @param mediators: A list of handled mediators
 */
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

/**
 * Handles mediators to store them in our inner state
 * @param normalizedContext: The context of the given mediator
 * @param mediator: The mediator to be handled
 * @param mediators: A list of handled mediators
 */
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

/**
 * Maps our inner state to a jsonld
 * @param state: Our inner state
 * @param set: The set of the current json to map
 */
export async function stateToJsonld(state: any, set: string) {
    let addedActors: any = [];
    const createdActors: any[] = state.createdActors
    let normalizedContext = await parseContext([...state.context[set]]);

    for (let [busGroup, actors] of  Object.entries(createdActors)) {
        actors = actors.filter((a: any) => a.set === set);
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
        'actors': addedActors
    };

    let graph: any[] = [runner];

    const createdMediators: any[] = state.createdMediators.filter((m: any) => m.set === set);

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
        '@context': [...state.context[set]],
        '@graph': graph
    };

    return JSON.stringify(output, null, '  ');
}

/**
 * Maps a jsonld to our inner state.
 * @param jsonld: A jsonld
 */
export async function jsonldToState(jsonld: any) {
    let id = '';
    let context = jsonld['@context'];
    let actors: any[] = [];
    let mediators: any[] = [];

    let normalizedContext = await parseContext(context);

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
            handleActor(normalizedContext, a, actors, mediators);
        }
    }

    return {
        id: id,
        actors: actors,
        mediators: mediators,
        context: jsonld['@context']
    }
}

/**
 * Normalize a context by recursively looking at each context
 * @param context: A context
 */
export async function parseContext(context: any) {
    const parser = new ContextParser();
    return await parser.parse(context);
}

/**
 * Expand a term given its context
 * @param normalizedContext: The context of the term
 * @param compactTerm: A compact form of an IRI
 */
export function getExpandedIRI(normalizedContext: any, compactTerm: string) {

    if (compactTerm[0] === '@' || compactTerm.startsWith('https'))
        return compactTerm;

    if (compactTerm === 'beforeActor')
        return 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/core/Actor/beforeActor';

    const iri = normalizedContext.expandTerm(compactTerm, true);
    return iri ? iri : compactTerm;
}

/**
 * Compact an IRI given its context
 * @param normalizedContext: The context of the IRI
 * @param expandedIRI: A full IRI
 */
export function getCompactedIRI(normalizedContext: any, expandedIRI: string) {

    if (expandedIRI[0] === '@')
        return expandedIRI;

    if (expandedIRI === 'https://linkedsoftwaredependencies.org/bundles/npm/@comunica/core/Actor/beforeActor')
        return 'beforeActor';

    const iri = normalizedContext.compactIri(expandedIRI, true);
    return iri ? iri: expandedIRI;
}