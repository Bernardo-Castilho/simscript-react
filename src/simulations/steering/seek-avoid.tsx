import { Uniform, EventArgs, setOptions } from 'simscript';
import {
    SteeringVehicle, SteeringBehaviors, 
    AvoidBehavior, SeekBehavior, BounceBehavior
} from './steering';

/**
 * Seek behavior with linear obstacles.
 */
 export class SteeringLinearObstaclesSeek extends SteeringBehaviors {
    avoidColor = 'red';
    obstacles = [
        ...this.generateObstaclesForPath([
            { x: -100, y: 450 },
            { x: 450, y: 150 },
            { x: 450, y: -10 }
        ], 5, true),
        ...this.generateObstaclesForPath([
            { x: 1100, y: 450 },
            { x: 550, y: 150 },
            { x: 550, y: -10 },
        ], 5, true),
    ];

    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    onStarting(e?: EventArgs) {
        super.onStarting(e);

        const
            obstacles = this.obstacles.slice(), // array with obstacles used by the AvoidBehavior
            xPos = new Uniform(0, 1000), // // entity starting x position
            yPos = new Uniform(460, 490), // entity starting y position
            speed = new Uniform(10, 100), // entity starting speed
            angle = new Uniform(0, 360); // entity starting angle

        // create some wandering entities
        for (let i = 0; i < this.entityCount; i++) {
            const e = new SteeringVehicle({

                // initialize entity properties
                color: 'orange',
                speedMin: 10,
                speedMax: speed.sample(),
                speed: speed.sample(),
                angle: angle.sample(),
                position: { x: xPos.sample(), y: yPos.sample() },
                radius: 10,
    
                // initialize entity behaviors
                behaviors: [
                    new BounceBehavior(), // bounce off edges
                    new AvoidBehavior({ // avoid obstacles
                        obstacles: obstacles,
                        avoidColor: this.avoidColor
                    }),
                    new SeekBehavior({ // seek exit
                        target: { x: this.bounds[1].x / 2, y: 0 }, // exit point
                        arrivalDistance: 25, // close enough
                        arrive: (s: SeekBehavior) => { // remove entity from simulation on arrival
                            const
                                e = s.entity as SteeringVehicle,
                                index = obstacles.indexOf(e);
                            if (index > -1) {
                                obstacles.splice(index, 1);
                            }
                            e.done = true;
                        }
                    }),
                ],
            });

            // optionally, add this entity to the obstacle array
            obstacles.push(e);

            // activate the entity
            this.activate(e);
        }
    }
}
