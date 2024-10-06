export class Settings {
    static readonly V_WIDTH = 1200
    static readonly V_HEIGHT = 720

    static debug_render = true
    // debug_text
    // color_scheme

    static readonly collisionCategories = {
        DEFAULT: 0x0001,
        CRITTER: 0x0002,
        PROJECTILE: 0x0004,
        3: 0x0008,
        4: 0x0010,
        5: 0x0020,
        6: 0x0040,
        7: 0x0080,
        8: 0x0100
    }

    static readonly elements = {
        physical: 0,
        fire: 1,
        water: 2,
        plant: 3,
        ice: 4,
        electric: 5,
        wind: 6,
        metal: 7,
        plague: 8,
        healing: 9,
        rock: 10,
        shell: 11,
        blunt: 12,
        sound: 13,
        glass: 14,
        brainwave: 15

    }
    static readonly elemental_effectiveness = [
        {
            el: Settings.elements.physical,
            beats: [Settings.elements.glass],
            bad: [Settings.elements.rock, Settings.elements.metal]
        }
    ]


    static readonly teams = {
        NEUTRAL: 0,
        PLAYER: 1,
        ENEMY: 2,
    }

    static selectionCircleRadius = 200
}