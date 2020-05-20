import _ from 'lodash';

export function stateToJsonld(state: any) {
    let s = _.cloneDeep(state);
    console.log(s);

    return JSON.stringify(s, null, '  ');
}

export function jsonldToState(jsonld: any) {
    // TODO: start from existing json
}