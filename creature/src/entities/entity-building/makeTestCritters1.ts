import { Random } from "random-js"
import { Settings } from "../../Settings"
import { Critter, CritterFactory } from "../CritterFactory"
import { EntityStore } from "../EntityStore"


export function makeTestCritters(critterFactory: CritterFactory, rng: Random, critters: EntityStore<Critter>) : string {
    
    let marked1 : string = ""

    // SLOW LONGRAGNGE
    for (let i = 0; i < 45; i++) {
        let newCritter = critterFactory.create({
            x: i * 5,
            y: rng.integer(0, 500),
            team: Settings.teams.PLAYER,
            projectileLifetime: 1.9,
            projectileSpeed: 14,
            fireDelay: 0.9
        })

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        if (i === 2) {
            marked1 = entityID
        }
        newCritter.body.label = entityID
        
    }

    // FAST SHORTRANGE
    for (let i = 0; i < 15; i++) {
        let newCritter = critterFactory.create({
            x: -i * 8 - 100,
            y: rng.integer(0, 500),
            team: Settings.teams.PLAYER,
            color: 0x59b300,
            scale: 1.3,
            movementSpeed: 4.4,
            projectileSpeed: 8.8,
            projectileLifetime: 0.5,
            fireDelay: 2.2,
            name: "yello"
        })

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        if (i === 2) {
            marked1 = entityID
        }
        newCritter.body.label = entityID
        
    }
    // for (let i = 0; i < 10; i++) {
    //     let newCritter = critterFactory.create(
    //         ceratron(
    //             i * 5 + 500,
    //             rng.integer(0, 500),
    //             Settings.teams.ENEMY
    //         )
    //     )

    //     let entityID = critters.add(newCritter)
    //     newCritter.entityID = entityID
    //     newCritter.body.label = entityID
    // }
    // for (let i = 0; i < 10; i++) {
    //     let newCritter = critterFactory.create(
    //         ceratron(
    //             i * 5 + 1000,
    //             rng.integer(0, 500),
    //             Settings.teams.PLAYER
    //         )
    //     )

    //     let entityID = critters.add(newCritter)
    //     newCritter.entityID = entityID
    //     newCritter.body.label = entityID
    // }

    return marked1
}