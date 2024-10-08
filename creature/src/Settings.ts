
export class Settings {
    static readonly V_WIDTH = 1920
    static readonly V_HEIGHT = 1080

    static debug_render = false
    // debug_text
    // color_scheme

    // ciruclar bounds
    static readonly WORLD_RADIUS = 4000 //Matter units
    static readonly WORLD_CENTER_X = 0
    static readonly WORLD_CENTER_Y = 0
    static readonly BOUND_COLOR = 0x349098//0x8b8b91

    static readonly VIRUS_LIMIT = 300
    static readonly CRITTER_LIMIT = 300
    
    static readonly SPAWN_DELAY = 10000

    static readonly collisionCategories = {
        DEFAULT: 0x0001,
        CRITTER: 0x0002,
        PROJECTILE: 0x0004,
        WALL: 0x0008,
        4: 0x0010,
        5: 0x0020,
        6: 0x0040,
        7: 0x0080,
        8: 0x0100
    }

    static readonly CritterNames = {
        RED: "Rojoruga",
        GREEN: "asdf",
        YELLOW: "KING"
    }

    // static readonly elements = {
    //     physical: 0,
    //     fire: 1,
    //     water: 2,
    //     plant: 3,
    //     ice: 4,
    //     electric: 5,
    //     wind: 6,
    //     metal: 7,
    //     plague: 8,
    //     healing: 9,
    //     rock: 10,
    //     shell: 11,
    //     blunt: 12,
    //     sound: 13,
    //     glass: 14,
    //     brainwave: 15

    // }
    // static readonly elemental_effectiveness = [
    //     {
    //         el: Settings.elements.physical,
    //         beats: [Settings.elements.glass],
    //         bad: [Settings.elements.rock, Settings.elements.metal]
    //     }
    // ]


    static readonly teams = {
        NEUTRAL: 0,
        PLAYER: 1,
        ENEMY: 2,
    }

    static readonly selectionCircleRadius = 2000

    // static readonly critterColors = {
    //     red: 0,
    //     blue: 0,
    //     green: 0,
    //     yellow: 0,
    //     purple: 0
    // }
    // static readonly virusColors = {
    //     red: 0,
    //     blue: 0,
    //     green: 0,
    //     yellow: 0,
    //     purple: 0
    // }

    // static readonly viruses = {
    //     easy: 1,
    //     norma: 2,
    //     blue: 3,
    //     cyano: 4,
    //     hard: 5,
    // }


    // static waves: Wave[] = [
    //     {
    //         num: 0,
    //         viruses: []
    //     },
    //     {
    //         num: 1,
    //         viruses: [
    //             {
    //                 type: Settings.viruses.easy,
    //                 count: 3,
    //                 predelayMs: 2000
    //             },
    //             {
    //                 type: Settings.viruses.blue,
    //                 count: 1,
    //                 predelayMs: 2000
    //             },
    //             {
    //                 type: Settings.viruses.easy,
    //                 count: 5,
    //                 predelayMs: 3000
    //             }
    //         ]

    //     },
    //     {
    //         num: 2,
    //         viruses: [
    //             {
    //                 type: Settings.viruses.easy,
    //                 count: 5,
    //                 predelayMs: 2000
    //             },
    //             {
    //                 type: Settings.viruses.blue,
    //                 count: 2,
    //                 predelayMs: 2000
    //             },
    //             {
    //                 type: Settings.viruses.easy,
    //                 count: 8,
    //                 predelayMs: 3000
    //             }
    //         ]

    //     }
    // ]

}
