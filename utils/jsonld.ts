import {getExpandedIRI, parseContext} from "~/utils/json";

export async function extractJson(json: any): Promise<any> {
    let actors: any[] = [];
    let mediators: any[] = [];
    let context = json['@context'];

    if (json.hasOwnProperty('@graph')) {
        // Graph based jsonld's where the mediators are defined explicitly.
        let actorPart = json['@graph'][0];
        for (const a of actorPart.actors) {
            await handleActor(context, a, actors, mediators);
        }
        if (json['@graph'].length > 1) {
            for (let i = 1; i < json['@graph'].length; i++) {
                await handleMediator(context, json['@graph'][i], mediators);
            }
        }
    } else {
        // Implicitly defined mediators in the actors themselves.
        for (const a of json.actors) {
            await handleActor(context, a, actors, mediators);
        }
    }

    return {
        atContext: context,
        actors: actors,
        mediators: mediators
    };
}

export async function handleActor(context: any, actor: any, actors: any[], mediators: any[]) {
    let actorExtracted: any = {};
    const normalizedContext = await parseContext(context);
    for (const key of Object.keys(actor)) {
        if (key.includes('mediator') && Object.keys(actor[key]).length > 1) {
            if (!Object.keys(actor[key]).includes('@id')) {
                actor[key]['@id'] = `${actor['@id']}#${key}`;
            }
            // Handle implicitly defined mediators
            await handleMediator(context, actor[key], mediators);
            actor[key] = {
                '@id': actor[key]['@id']
            };
        }
        const iri = getExpandedIRI(normalizedContext, key);
        actorExtracted[iri] = actor[key];
    }

    actors.push(actorExtracted);
}

export async function handleMediator(context: any, mediator: any, mediators: any[]) {
    let mediatorExtracted: any = {};
    const normalizedContext = await parseContext(context);
    for (const key of Object.keys(mediator)) {
        const iri = getExpandedIRI(normalizedContext, key);
        mediatorExtracted[iri] = mediator[key];
    }

    mediators.push(mediatorExtracted);
}