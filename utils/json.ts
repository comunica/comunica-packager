import {ContextParser} from "jsonld-context-parser";

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

export function jsonldToState(jsonld: any) {
    let id = '';
    let actors: any[] = [];
    let mediators: any[] = [];

    // Handle graph based jsonlds
    if (jsonld.hasOwnProperty('@graph')) {
        let runner = jsonld['@graph'][0];
        id = runner['@id'];
        runner.actors.forEach((a: any) => {
            actors.push(a);
        });
        if (jsonld['@graph'].length > 1) {
            for (let i = 1; i < jsonld['@graph'].length; i++) {
                mediators.push(jsonld['@graph'][i]);
            }
        }
    // Handle single object jsonlds
    } else {
        // TODO: version without graph and mediators in actors
        alert('Version without graph not yet supported!');
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