import _ from 'lodash';

export function stateToJsonld(state: any) {
    let s = _.cloneDeep(state);
    console.log(s);

    let addedActors: any = [];
    const createdActors: any[] = state.createdActors

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
                                        actorToAdd[parameter['@id']] = JSON.parse(parameter.value);
                                    } catch (err) {
                                        actorToAdd[parameter['@id']] = parameter.value;
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
    }

    let graph = [runner]

    let output = {
        '@context': [],
        '@graph': graph
    }

    return JSON.stringify(output, null, '  ');
}

export function jsonldToState(jsonld: any) {
    // TODO: start from existing json
}