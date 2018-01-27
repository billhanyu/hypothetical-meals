export function getWeight(type) {
    let unitWeight = 0;
    switch (String(type).toLowerCase()) {
        case 'sack':
            unitWeight = 50;
            break;
        case 'pail':
            unitWeight = 50;
            break;
        case 'drum':
            unitWeight = 500;
        break;
        case 'supersack':
            unitWeight = 2000;
        break;
        case 'truckload':
            unitWeight = 50000;
        break;
        case 'railcar':
            unitWeight = 280000;
        break;
        default:
            unitWeight = -1;
    }

    if (unitWeight < 0) {
        const err = {
            custom: 'Invalid type of ingredient.',
        };
        throw err;
    } else {
        return unitWeight;
    }
}
