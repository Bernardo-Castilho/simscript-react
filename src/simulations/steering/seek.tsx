import { EventArgs } from 'simscript';
import { SteeringVehicle, SteeringBehaviors, SeekBehavior } from './steering';

/**
 * Steering simulation with entities that seek a target
 * (and re-start at a random position when they arrive).
 */
 export class SteeringSeek extends SteeringBehaviors {
    onStarting(e?: EventArgs) {
        super.onStarting(e);
        
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
                    new SeekBehavior({
                        target: { // move towards the center
                            x: this.bounds[1].x / 2,
                            y: this.bounds[1].y / 2
                        },
                        seekAngle: 0.5, // turn up to 0.5 degrees/unit time
                        arrive: (s: SeekBehavior) => { // re-start at random position on arrival
                            const e = s.entity as SteeringVehicle;
                            e.position = this.getRandomPosition();
                        }
                    }),
                ],
            });
            this.activate(e);
        }
    }
}
