function getSpace(type) {
    let unitSpace = 0;
    switch (String(type).toLowerCase()) {
        case 'sack':
            unitSpace = 0.5;
            break;
        case 'pail':
            unitSpace = 1;
            break;
        case 'drum':
            unitSpace = 3;
        break;
        case 'supersack':
            unitSpace = 16;
        break;
        case 'truckload':
            unitSpace = 0;
        break;
        case 'railcar':
            unitSpace = 0;
        break;
        default:
            unitSpace = -1;
    }

    if (unitSpace < 0) {
        const err = {
            custom: 'Invalid package type.',
        };
        throw err;
    } else {
        return unitSpace;
    }
}

export { getSpace };
