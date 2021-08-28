import { Uniform, EventArgs, setOptions } from 'simscript';
import {
    SteeringVehicle, SteeringBehaviors, IObstacle,
    AvoidBehavior, WrapBehavior, WanderBehavior
} from './steering';

const staticObstacles: IObstacle[] = [
    { position: { x: 100, y: 400 }, radius: 50 },
    { position: { x: 150, y: 300 }, radius: 30 },
    { position: { x: 200, y: 150 }, radius: 80 },
    { position: { x: 500, y: 250 }, radius: 125 },
    { position: { x: 800, y: 200 }, radius: 50 },
    { position: { x: 800, y: 400 }, radius: 75 },
];

/**
 * Steering simulation with entities that avoid obstacles.
 */
export class SteeringAvoid extends SteeringBehaviors {
    obstacles = staticObstacles;
    avoidEntities = false;
    avoidColor = 'red'; // slows down 3D animations

    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    onStarting(e?: EventArgs) {
        super.onStarting(e);

        // array of obstacles used by the AvoidBehavior
        const obstacles = [...this.obstacles];

        // create wandering entities that avoid targets
        for (let i = 0; i < this.entityCount; i++) {
            const e = new SteeringVehicle({
                color: 'orange',
                speedMin: 10,
                speedMax: 50,
                speed: 10 + Math.random() * (50 - 10),
                steerAngleMax: 45,
                angle: Math.round(Math.random() * 360),
                position: this.getRandomPosition(),
                behaviors: [
                    new AvoidBehavior({ // avoid obstacles
                        obstacles: obstacles,
                        avoidColor: this.avoidColor
                    }),
                    new WanderBehavior({ // wander (if not avoiding obstacles)
                        steerChange: new Uniform(-20, +20),
                        speedChange: new Uniform(-50, +50)
                    }),
                    new WrapBehavior() // wrap at the edges
                ],
            });
            e.position.y = 0; // start away from static obstacles
            this.activate(e);

            // add entity to obstacle array
            if (this.avoidEntities) {
                obstacles.push(e);
            }
        }
    }
}
