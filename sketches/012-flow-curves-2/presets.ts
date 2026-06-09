export const flowPresets = {
    smallLines: {
        controllers: { liveInterval: 10 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 50,
                    minSteps: 5,
                    minSpace: 3,
                    maxFails: 300,
                    decreaseStep: 1,
                    minInitialCurves: 3,
                    maxFailsIncrease: 0.11,
                    qtCapacity: 20,
                    scale: 0.00125,
                },
                folders: {},
            },
            'flow vals': {
                controllers: { '0': 2.54, '1': 12.61, '2': 7.19, '3': 15.98 },
                folders: {},
            },
            drawing: {
                controllers: {
                    lineWidthMax: 2.5,
                    lineWidthMin: 0.5,
                    taperLength: 30,
                    lineCap: 'round',
                    colorRepeats: 4,
                    colorsMethod: 'clumps',
                    colorRandomDist: 200,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#0d0612',
                        colors: ['#962648', '#e85d32', '#f5b14d', '#9984D4'],
                        name: 'ember-0',
                    },
                    paletteIndex: 19,
                },
                folders: {},
            },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },
    tiny: {
        controllers: { liveInterval: 10 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 5,
                    minSteps: 5,
                    minSpace: 9,
                    maxFailsMax: 1700,
                    maxFailsMin: 1700,
                    decreaseStep: 5,
                    minInitialCurves: 5,
                    qtCapacity: 20,
                    scale: 0.00125,
                },
                folders: {},
            },
            'flow vals': {
                controllers: { '0': 7.57, '1': 7.35, '2': 8.57, '3': 8.25 },
                folders: {},
            },
            drawing: {
                controllers: {
                    lineWidthMax: 7,
                    lineWidthMin: 7,
                    taperLength: 30,
                    lineCap: 'square',
                    colorRepeats: 4,
                    colorsMethod: 'clumps',
                    colorRandomDist: 200,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#0d0612',
                        colors: ['#962648', '#e85d32', '#f5b14d', '#9984D4'],
                        name: 'ember-0',
                    },
                    paletteIndex: 19,
                },
                folders: {},
            },
            size: { controllers: { width: 800, height: 800 }, folders: {} },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },

    tiles: {
        controllers: { preset: '', liveInterval: 10 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 50,
                    minSteps: 5,
                    minSpace: 5,
                    maxFailsMax: 1494,
                    maxFailsMin: 300,
                    decreaseStep: 1,
                    minInitialCurves: 1,
                    qtCapacity: 20,
                    scale: 0.00125,
                },
                folders: {},
            },
            'flow vals': { controllers: { '0': 20, '1': 0, '2': 20, '3': 0 }, folders: {} },
            drawing: {
                controllers: {
                    lineWidthMax: 5.5,
                    lineWidthMin: 0.5,
                    taperLength: 25,
                    lineCap: 'round',
                    colorRepeats: 2,
                    colorsMethod: 'temp',
                    colorRandomDist: 335,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#0b0b0c',
                        colors: ['#5c4569', '#9b7ba6', '#d8b4c9', '#f0d9a8', '#6b8a99'],
                        name: 'dust-2',
                    },
                    paletteIndex: 15,
                },
                folders: {},
            },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },
    squiggly: {
        controllers: { preset: '', liveInterval: 10 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 627,
                    minSteps: 10,
                    minSpace: 5,
                    maxFailsMax: 785,
                    maxFailsMin: 300,
                    decreaseStep: 3,
                    minInitialCurves: 7,
                    qtCapacity: 20,
                    scale: 0.00125,
                },
                folders: {},
            },
            'flow vals': {
                controllers: { '0': 9.74, '1': 14.84, '2': 9.48, '3': 7.25 },
                folders: {},
            },
            drawing: {
                controllers: {
                    lineWidthMax: 4,
                    lineWidthMin: 0.5,
                    taperLength: 200,
                    lineCap: 'round',
                    colorRepeats: 4,
                    colorsMethod: 'temp',
                    colorRandomDist: 201,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#190506',
                        colors: ['#0a71b6', '#f9c40a', '#eb5432', '#eaf2f0'],
                        name: 'squiggles-1',
                    },
                    paletteIndex: 51,
                },
                folders: {},
            },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },
    another: {
        controllers: { preset: '', liveInterval: 10 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 200,
                    minSteps: 10,
                    minSpace: 10,
                    maxFailsMax: 300,
                    maxFailsMin: 300,
                    decreaseStep: 5,
                    minInitialCurves: 5,
                    qtCapacity: 20,
                    scale: 0.00125,
                    offset: 0,
                },
                folders: {},
            },
            'flow vals': {
                controllers: { '0': 3.3, '1': 2.8, '2': -0.199999999999999, '3': -1.1 },
                folders: {},
            },
            drawing: {
                controllers: {
                    lineWidthMax: 7,
                    lineWidthMin: 0.5,
                    taperLength: 100,
                    lineCap: 'round',
                    colorRepeats: 2,
                    colorsMethod: 'temp',
                    colorRandomDist: 385,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#0d0612',
                        colors: ['#962648', '#e85d32', '#f5b14d', '#9984D4'],
                        name: 'ember-0',
                    },
                    paletteIndex: 19,
                },
                folders: {},
            },
            size: { controllers: { width: 1000, height: 1000 }, folders: {} },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },
    nice: {
        controllers: { preset: '', liveInterval: 6 },
        folders: {
            flow: {
                controllers: {
                    stepLength: 1,
                    maxSteps: 500,
                    minSteps: 20,
                    minSpace: 9,
                    maxFailsMax: 300,
                    maxFailsMin: 300,
                    decreaseStep: 5,
                    minInitialCurves: 3,
                    qtCapacity: 20,
                    scale: 0.00125,
                    offset: 0,
                },
                folders: {},
            },
            'flow vals': {
                controllers: { '0': -0.699999999999999, '1': 0.100000000000001, '2': 2, '3': -9.5 },
                folders: {},
            },
            drawing: {
                controllers: {
                    lineWidthMax: 7,
                    lineWidthMin: 0.5,
                    taperLength: 100,
                    lineCap: 'round',
                    colorRepeats: 3,
                    colorsMethod: 'temp',
                    colorRandomDist: 347,
                    taperEase: 'outCirc',
                    brightenMin: 0,
                    brightenMax: 0,
                    showColors: false,
                },
                folders: {},
            },
            palette: {
                controllers: {
                    palette: {
                        bg: '#020107',
                        colors: [
                            '#87425d',
                            '#3c2e6b',
                            '#0081af',
                            '#a7d6c3',
                            '#285943',
                            '#8a8fbd',
                            '#9a79b8',
                            '#fcee49',
                        ],
                        name: 'earthGem1-0',
                    },
                    paletteIndex: 16,
                },
                folders: {},
            },
            size: { controllers: { width: 1000, height: 1000 }, folders: {} },
            grain: {
                controllers: {
                    type: 'none',
                    adjustAmount: 30,
                    overAlpha: 1,
                    overOperation: 'overlay',
                },
                folders: {},
            },
        },
    },
}
