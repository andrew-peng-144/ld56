import { Random } from "random-js"
import { Settings } from "../../Settings"
import { Critter, CritterFactory } from "../CritterFactory"
import { ceratron } from "./critters/ceratron"
import { EntityStore } from "../EntityStore"


export function makeTestCritters(critterFactory: CritterFactory, rng: Random, critters: EntityStore<Critter>) : string {
    
    let marked1 : string = ""

    for (let i = 0; i < 10; i++) {
        let newCritter = critterFactory.create({
            x: i * 5,
            y: rng.integer(0, 500),
            team: Settings.teams.PLAYER
        })

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        if (i === 5) {
            marked1 = entityID
        }
        newCritter.body.label = entityID
    }
    for (let i = 0; i < 10; i++) {
        let newCritter = critterFactory.create(
            ceratron(
                i * 5 + 500,
                rng.integer(0, 500),
                Settings.teams.ENEMY
            )
        )

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        newCritter.body.label = entityID
    }
    for (let i = 0; i < 10; i++) {
        let newCritter = critterFactory.create(
            ceratron(
                i * 5 + 1000,
                rng.integer(0, 500),
                Settings.teams.PLAYER
            )
        )

        let entityID = critters.add(newCritter)
        newCritter.entityID = entityID
        newCritter.body.label = entityID
    }

    return marked1
}