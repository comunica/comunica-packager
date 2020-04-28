export interface Actor {
    actorName: string,
    args: any,
}

export interface BusGroup {
    busGroupName: string,
    actors: Actor[],
}