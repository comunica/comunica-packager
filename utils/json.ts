import _ from 'lodash';
import {trimIdentifier} from "~/utils/alpha";

export function stateToJsonld(state: any) {
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
                                    actorToAdd[parameter['@id']] = {
                                        '@id': parameter.value
                                    };
                                    break;
                                }
                                default: {
                                    try {
                                        actorToAdd[trimIdentifier(parameter['@id'])] = JSON.parse(parameter.value);
                                    } catch (err) {
                                        actorToAdd[trimIdentifier(parameter['@id'])] = parameter.value;
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
                mediatorToAdd[parameter['@id']] = {
                    '@id': parameter.value
                }
            } else {
                try {
                    mediatorToAdd[parameter['@id']] = JSON.parse(parameter.value);
                } catch (err) {
                    mediatorToAdd[parameter['@id']] = parameter.value;
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
    // TODO: start from existing json
}