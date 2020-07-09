import {getExpandedIRI} from "~/utils/json";

export async function extractJson(json: any) {
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
                mediators.push(json['@graph'][i]);
            }
        }
    } else {
        // Implicitly defined mediators in the actors themselves.
        for (const a of json.actors) {
            await handleActor(context, a, actors, mediators);
        }
    }

    console.log('-----');
    console.log(actors);
    console.log(mediators);
    console.log('-----');
}

export async function handleActor(context: any, actor: any, actors: any[], mediators: any[]) {
    let actorExtracted: any = {};
    for (const key of Object.keys(actor)) {
        if (key.includes('mediator')) {
            if (Object.keys(actor[key]).length > 1) {
                // Handle implicitly defined mediators
                mediators.push(actor[key]);
            }
        }
        const x = await getExpandedIRI(context, key);
        let iri = x ? x : key;
        actorExtracted[iri] = actor[key];
    }

    actors.push(actorExtracted);
} 