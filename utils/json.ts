import {ContextParser} from "jsonld-context-parser";

export async function stateToJsonld(state: any) {
    let addedActors: any = [];
    const createdActors: any[] = state.createdActors;

    for (let [busGroup, actors] of  Object.entries(createdActors)) {
        if (actors.length) {
            for (let actor of actors) {
                let actorToAdd: any = {
                    '@id': actor['@id'],
                    '@type': actor.actorName
                };
                for (let parameter of actor.parameters) {
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
                                        actorToAdd[await getCompactedIRI([...state.context], parameter['@id'])] = JSON.parse(parameter.value);
                                    } catch (err) {
                                        actorToAdd[await getCompactedIRI([...state.context], parameter['@id'])] = parameter.value;
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
        for (let parameter of mediator.parameters) {
            if (parameter.range == 'cc:Bus') {
                mediatorToAdd['cc:Mediator/bus'] = {
                    '@id': parameter.value
                }
            } else {
                try {
                    mediatorToAdd[await getCompactedIRI([...state.context], parameter['@id'])] = JSON.parse(parameter.value);
                } catch (err) {
                    mediatorToAdd[await getCompactedIRI([...state.context], parameter['@id'])] = parameter.value;
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

export async function getExpandedIRI(context: any, compactTerm: string) {
    const parser = new ContextParser();
    const myContext = await parser.parse(context);
    const iri = myContext.expandTerm(compactTerm, true);

    return iri ? iri : compactTerm;
}

export async function getCompactedIRI(context: any, expandedIRI: string) {
    const parser = new ContextParser();
    const myContext = await parser.parse(context);
    const iri = myContext.compactIri(expandedIRI, true);

    return iri ? iri: expandedIRI;
}