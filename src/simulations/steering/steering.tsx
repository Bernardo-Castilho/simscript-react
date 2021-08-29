import {
    Simulation, SimulationState, Entity, Queue, Event, EventArgs, RandomVar,
    Network, IAnimationPosition, IPoint, Point, setOptions, clamp, format
} from 'simscript';
import { SimulationComponent, NumericParameter, BooleanParameter } from '../../simscript-react/components';

const
    FAST_MODE_FRAMEDELAY = 0,
    SLOW_MODE_FRAMEDELAY = 5;

/**
 * Custom Component to show Crosswalk Simulations with 
 * Simulation parameters and custom output.
 */
export class SteeringComponent extends SimulationComponent<SteeringBehaviors> {

    // render parameters section
    renderParams(): JSX.Element {
        const sim = this.props.sim;
        return <>
            <h3>
                Parameters
            </h3>
            <ul>
                <li>
                    <NumericParameter label='Entity Count' parent={this}
                        value={sim.entityCount}
                        min={1} max={50}
                        change={v => sim.entityCount = v}
                        suffix={` ${format(sim.entityCount, 0)} entities`} /></li>
                <li>
                    <BooleanParameter label='Slow Mode' parent={this}
                        value={sim.slowMode}
                        min={1} max={50}
                        change={v => sim.slowMode = v} /></li>
            </ul>
        </>;
    }

    // render output section
    renderOutput(): JSX.Element {
        return <></>;
    }

    // render animation section
    renderAnimation(): JSX.Element {
        const viewBox = this.props.viewBox || '0 0 1000 500';
        return <svg className='ss-anim steering' viewBox={viewBox}>
                <circle className='ss-queue'></circle>
            </svg>;
    }
    initializeAnimation(animHost: HTMLElement) {
        const
            color = 'lightgrey',
            obstacles = (this.props.sim as any).obstacles,
            network = (this.props.sim as any).network;
        if (obstacles instanceof Array) {
            obstacles.forEach(o => {
                const p = o.position;
                animHost.innerHTML += `<circle cx='${p.x}' cy='${p.y}' r='${o.radius}' fill='${color}'/>`;
            });
        }
        if (network instanceof Network) {
            let html = `<g stroke='lightgray' stroke-width='40' stroke-linecap='round'>`;
            network.links.forEach(link => {
                const
                    p1 = link.from.position as IPoint,
                    p2 = link.to.position as IPoint;
                    html += `<line x1='${p1.x}' y1='${p1.y}' x2='${p2.x}' y2='${p2.y}' />`;
            });
            html += `</g>`;
            animHost.innerHTML += html;
        }
    }

    // get animation options
    getAnimationOptions(): any {
        const sim = this.props.sim;
        return {
            rotateEntities: true,
            getEntityHtml: (e: SteeringVehicle) => `<polygon
                stroke='black' stroke-width='4' fill='${e.color || 'black'}' opacity='0.5'
                points='0 0, 40 0, 50 10, 40 20, 0 20'/>`
            ,
            updateEntityElement: (e: SteeringVehicle, element: HTMLElement) => {
                const polygon = element.querySelector('polygon') as any;
                if (polygon.fill !== e.color) {
                    polygon.setAttribute('fill', e.color);
                }
            },
            queues: [
                { queue: sim.q, element: 'svg .ss-queue' }
            ]
        }
    }
}

/**
 * Simulation used to show various steering behaviors.
 * It defines properties that determine the animation **bounds**, 
 * a **slowMode**, and the **entityCount**. 
 * It also provides a **getRandomPosition** method for generating
 * random positions for entities.
 */
export class SteeringBehaviors extends Simulation {
    q = new Queue();
    step = 0.01; // simulated time step
    bounds = [new Point(), new Point(1000, 500)]; // simulation bounds
    _eCnt = 8; // start with 8 entities

    /**
     * Initializes a new instance of the {@link SteeringBehaviors} class.
     * @param options Object with parameters used to initialize the {@link SteeringBehaviors} instance.
     */
    constructor(options?: any) {
        super();
        this.slowMode = false;
        setOptions(this, options);
    }
    /**
     * Gets or sets a value that determines the simulation speed.
     */
    get slowMode(): boolean {
        return this.frameDelay === SLOW_MODE_FRAMEDELAY;
    }
    set slowMode(value: boolean) {
        this.frameDelay = value ? SLOW_MODE_FRAMEDELAY : FAST_MODE_FRAMEDELAY;
    }
    /**
     * Gets or sets the number of entities to generate.
     */
    get entityCount(): number {
        return this._eCnt;
    }
    set entityCount(value: number) {
        if (value !== this._eCnt) {
            this._eCnt = value;
            if (this.state === SimulationState.Running) {
                this.start(true);
            }
        }
    }
    /**
     * Gets a random position within the animation surface.
     */ 
     getRandomPosition(): IPoint {
        return new Point(
            Math.round(Math.random() * this.bounds[1].x),
            Math.round(Math.random() * this.bounds[1].y));
    }
    /**
     * Generates a group of circular obstacles along a given path.
     * @param path Array of {@link IPoint} instances that define the path.
     * @param radius The radius of the obstacles.
     * @param bounce Value for the **bounce** property of the obstacles.
     * @returns Array of {@link IObstacle} instances.
     */
    generateObstaclesForPath(path: IPoint[], radius: number, bounce?: boolean): IObstacle[] {
        const obstacles: IObstacle[] = [];
        for (let i = 0; i < path.length - 1; i++) {
            const segment = this.generateObstaclesForLineSegment(path[i], path[i + 1], radius, bounce);
            obstacles.push(...segment);
        }
        return obstacles;
    }
    /**
     * Generates a group of circular obstacles along a given line segment.
     * @param p1 {@link IPoint} that defines the start of the obstacle.
     * @param p2 {@link IPoint} that defines the end of the obstacle.
     * @param radius The radius of the obstacles.
     * @param bounce Value for the **bounce** property of the obstacles.
     * @returns Array of {@link IObstacle} instances.
     */
    generateObstaclesForLineSegment(p1: IPoint, p2: IPoint, radius: number, bounce?: boolean): IObstacle[] {
        const
            d = Point.distance(p1, p2),
            a = Point.angle(p1, p2, true),
            cos = Math.cos(a),
            sin = Math.sin(a),
            rOverlap = radius * 1.1,
            obstacles: IObstacle[] = [];
        for (let l = 0; l <= d; l += radius * 2) {
            obstacles.push({
                position: { x: p1.x + l * cos, y: p1.y + l * sin },
                radius: rOverlap,
                bounce: bounce
            });
        }
        return obstacles;
    }
}

/**
 * Entities with a {@link position}, {@link angle}, {@link speed},
 * {@link acceleration}, {@link steerAngle}, and an 
 * {@link updatePosition} method that updates the current position
 * and angle after a time interval.
 * 
 * This class also has a {@link behaviors} property that contains
 * an array of {@link SteeringBehavior} objects which are applied
 * in sequence to update the entity state after each time increment.
 */
export class SteeringVehicle<S extends SteeringBehaviors = SteeringBehaviors> extends Entity<S> {
    _speed = 0;
    _speedMin = 0;
    _speedMax: number | null = null;
    _accel = 0;
    _angle = 0; // in degrees, clockwise
    _sin = 0;
    _cos = 1;
    _pos: IPoint = new Point();
    _steerAngle = 0;
    _steerAngleMax = 90;
    _lastUpdate = 0;
  
    /**
     * Initializes a new instance of the {@link SteeringVehicle} class.
     */
    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    /**
     * Gets or sets the entity's current color.
     * 
     * The default value for this property is **'black'**.
     */
    color = 'black';
    /**
     * Gets or sets the entity's radius (used to detect collisions).
     * 
     * The default value for this property is **25**.
     */
    radius = 25;
    /**
     * Gets or sets an array containing {@link SteeringBehavior} objects
     * that determine how the entity moves within the simulation.
     */
    behaviors: SteeringBehavior[] = []; // no behaviors by default
    /**
     * Gets or sets a value that determines whether the entity is done
     * and should exit the simulation.
     */
    done = false;
    /**
     * Gets or sets the entity's current position.
     */
    get position(): IPoint {
        return this._pos;
    }
    set position(value: IPoint) {
        this._pos = value;
    }
    /**
     * Gets or sets the entity's current angle.
     * 
     * The angle determines the entity's orientation (on the X-Y plane)
     * and the direction it is moving in.
     * 
     * The angle is measured in degrees, in the clockwise direction.
     */
    get angle(): number {
        return this._angle;
    }
    set angle(value: number) {

        // normalize value
        while (value > 180) {
            value -= 360;
        }
        while (value < -180) {
            value += 360;
        }

        // save angle, sin, and cos
        this._angle = value;
        this._sin = Math.sin(value * Math.PI / 180);
        this._cos = Math.cos(value * Math.PI / 180);
    }
    /**
     * Gets or sets a value that represents the change, in degrees,
     * of the {@link angle} property per unit time.
     * 
     * The default value for this property is **0**.
     * 
     * See also the {@link steerAngleMax} property.
     */
    get steerAngle(): number {
        return this._steerAngle;
    }
    set steerAngle(value: number) {
        this._steerAngle = clamp(value, -this.steerAngleMax, this.steerAngleMax);
    }
    /**
     * Gets or sets the maximum {@link steerAngle} value, in degrees.
     * 
     * The default value for this property is **90** degrees, which means
     * the {@link steerAngle} property is clamped to values between 
     * -90 and +90 degrees.
     */
    get steerAngleMax(): number {
        return this._steerAngleMax;
    }
    set steerAngleMax(value: number) {
        this._steerAngleMax = value;
        this.steerAngle = this._steerAngle;
    }
    /**
     * Gets or sets a value that represents the entity's current speed
     * (amount by which to increase the entity's {@link position} in 
     * the direction determined by the entity's {@link angle} per
     * unit time). 
     */
    get speed(): number {
        return this._speed;
    }
    set speed(value: number) {
        this._speed = clamp(value, this.speedMin, this.speedMax);
    }
    /**
     * Gets or sets the minimum {@link speed} value.
     * 
     * The default value for this property is **0**.
     */
    get speedMin(): number {
        return this._speedMin;
    }
    set speedMin(value: number) {
        this._speedMin = value;
        this.speed = this._speed;
    }
    /**
     * Gets or sets the maximum {@link speed} value.
     * 
     * The default value for this property is **null**, which 
     * means there is no maximum speed limit.
     */
    get speedMax(): number | null {
        return this._speedMax;
    }
    set speedMax(value: number | null) {
        this._speedMax = value;
        this.speed = this._speed;
    }
    /**
     * Gets or sets a value that represents the entity's current
     * acceleration (amount by which to increase the entity's 
     * {@link speed} per unit time).
     */
    get acceleration(): number {
        return this._accel;
    }
    set acceleration(value: number) {
        this._accel = value;
    }
    /**
     * Updates the entity's angle, speed, and position after a given
     * time interval.
     */
    updatePosition(dt: number) {

        // apply all behaviors
        if (this.behaviors) {
            for (let i = 0; i < this.behaviors.length; i++) {
                const b = this.behaviors[i];
                b.entity = this;
                if (b.applyBehavior(this, dt)) {
                    break; // stop iterating if applyBehavior returned true
                }
            }
        }

        // update angle
        this.angle += this.steerAngle * dt;

        // update speed
        this.speed += this.acceleration * dt;

        // update position
        const p = this.position;
        p.x += this.speed * this._cos * dt;
        p.y += this.speed * this._sin * dt;
    }
    /**
     * Gets the angle to turn to in order to match a target angle.
     * 
     * Use this method to make gradual turns instead of changing
     * the angle abruptly to a new value.
     * 
     * @param targetAngle The angle we are aiming for.
     * @param dt The time step.
     * @param da The maximum angle to turn per time step.
     * @returns The new angle needed to make a gradual turn from the
     * current angle to the **targetAngle**.
     */
    getTurnAngle(targetAngle: number, dt: number, da = 2): number {
        const step = Math.max(da, da * dt); // turn up to da degrees at a time
        let delta = targetAngle - this.angle;

        // normalize delta to [-180,+180]
        if (delta < -180) {
            delta += 360;
        } else if (delta > 180) {
            delta -= 360;
        }

        // close enough
        if (Math.abs(delta) < step) {
            return targetAngle;
        }

        // get closer
        return this.angle + step * Math.sign(delta);
    }
    /**
     * Gets the entity's current animation position and angle.
     */
    getAnimationPosition(q: Queue, start: IPoint, end: IPoint): IAnimationPosition {
        const timeNow = this.simulation.timeNow;
        this.updatePosition(timeNow - this._lastUpdate);
        this._lastUpdate = timeNow;
        return this;
    }
    /**
     * Enter the single queue and wait.
     */
    async script() {
        const sim = this.simulation;
        this.enterQueueImmediately(sim.q);
        while (!this.done) {
            await this.delay(sim.step);
        }
        this.leaveQueue(sim.q);
    }
}

//------------------------------------------------------------------------------------
// Steering Behaviors

/**
 * Base class for Steering Behaviors.
 */
export abstract class SteeringBehavior {
    entity: SteeringVehicle | null = null;

    /**
     * Initializes a new instance of the SteeringBehavior class.
     */
    constructor(options?: any) {
        setOptions(this, options);
    }

    /**
     * Applies the behavior to the entity, updating its speed and
     * angle to achieve the desired behavior.
     * @returns False to continue iterating through the remaining behaviors,
     * false to stop and not apply any remaining behaviors.
     */
    applyBehavior(e: SteeringVehicle, dt: number): boolean {
        return false;
    }
}

/**
 * Interface implemented by objects that acts as obstacles.
 */
export interface IObstacle {
    /** Gets or sets the position of the obstacle's center. */
    position: IPoint,
    /** Gets or sets the radius of the obstacle. */
    radius: number,
    /** 
     * Gets or sets a value that determines whether entities
     * that get close to the obstacle should ignore it of
     * bounce off it.
     */
    bounce?: boolean
}

/**
 * WrapBehavior: Entity wraps around the simulation surface.
 */
export class WrapBehavior extends SteeringBehavior {
    applyBehavior(e: SteeringVehicle, dt: number): boolean {
        const bounds = e.simulation.bounds;
        if (bounds) {
            const p = e.position;
            if (p.x < bounds[0].x) {
                p.x = bounds[1].x;
            } else if (p.x > bounds[1].x) {
                p.x = bounds[0].x;
            }
            if (p.y < bounds[0].y) {
                p.y = bounds[1].y;
            } else if (p.y > bounds[1].y) {
                p.y = bounds[0].y;
            }
        }
        return false;
    }
}

/**
 * BounceBehavior: Entity bounces around the simulation surface.
 */
export class BounceBehavior extends SteeringBehavior {
    applyBehavior(e: SteeringVehicle, dt: number): boolean {
        const bounds = e.simulation.bounds;
        if (bounds) {
            const p = e.position;
            if (p.x < bounds[0].x || p.x > bounds[1].x) {
                e.angle = 180 - e.angle;
            } else if (p.y < bounds[0].y || p.y > bounds[1].y) {
                e.angle = -e.angle;
            }
        }
        return false;
    }
}

/**
 * WanderBehavior: Entity wanders around the simulation surface.
 */
export class WanderBehavior extends SteeringBehavior {
    changeInterval = 10;
    steerChange: RandomVar | null = null;
    speedChange: RandomVar | null = null;
    _timeLastChange = 0;
    
    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    applyBehavior(e: SteeringVehicle, dt: number): boolean {
        const now = e.simulation.timeNow;
        if (now - this._timeLastChange >= this.changeInterval) {
            if (this.steerChange != null) {
                e.steerAngle += this.steerChange.sample();
            }
            if (this.speedChange != null) {
                e.speed += this.speedChange.sample();
            }
            this._timeLastChange = now;
        }
        return false;
    }
}

/**
 * SeekBehavior: Entity moves toward a target.
 */
export class SeekBehavior extends SteeringBehavior {
    target: IPoint | null = null;
    readonly arrive = new Event();

    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    /**
     * Gets or sets a value that represents the maximum change in
     * angle per unit time while seeking the target.
     * 
     * The default value for this property is **0.5**, which
     * corresponds to a 0.5 degree change in direction per unit
     * time while seeking a target.
     */
    seekAngle: number = 0.5;
    /**
     * Gets or sets the distance between the entity and the target
     * that means the entity has arrived.
     * 
     * The default value for this property is **null**, which causes
     * the behavior to use the enitity's radius as the arrival 
     * distance.
     */
    arrivalDistance: number | null = null;
    /**
     * Gets or sets the distance at which the entity can proceed
     * at full speed.
     * 
     * The default value for this property is **null**, which causes
     * the behavior to use half of the simulation width as the max
     * speed distance.
     */
    maxSpeedDistance: number | null = null;

    applyBehavior(e: SteeringVehicle, dt: number): boolean {
        if (this.target) {

            // adjust speed
            const
                dist = Point.distance(e.position, this.target),
                distMax = this.maxSpeedDistance || (e.simulation.bounds[1].x / 2),
                pct = dist / distMax;
            e.speed = (e.speedMax as number) * pct;

            // adjust angle
            let angTarget = Point.angle(e.position, this.target);
            e.angle = e.getTurnAngle(angTarget, dt, this.seekAngle);

            // raise event on arrival
            let arrivalDistance = this.arrivalDistance != null ? this.arrivalDistance : e.radius;
            if (dist < arrivalDistance) {
                this.onArrive();
            }
        }
        return false;
    }
    onArrive(e?: EventArgs) {
        this.arrive.raise(this, e || EventArgs.empty);
    }
}

/**
 * AvoidBehavior: Entity avoids obstacles.
 */
export class AvoidBehavior extends SteeringBehavior {
    _currentObstacle: IObstacle | null = null;
    _saveColor = ''; // original color
    _saveSpeed = 0; // original speed

    constructor(options?: any) {
        super();
        setOptions(this, options);
    }

    /**
     * Gets or sets the list of obstacles, represented by
     * an array of {@link IObstacle} objects.
     */
    obstacles: IObstacle[] = [];
    /**
     * Gets or sets the color used to represent the entity
     * while it is avoiding other entities.
     * 
     * The default value for this property is an empty string,
     * which preserves the original entity color while it is
     * avoiding other entities.
     */
    avoidColor = '';
    /**
     * Gets or sets a value that represents the slow-down factor
     * used to reduce the entity's speed while it is avoiding other 
     * entities.
     * 
     * The default value for this property is **0.75**, which
     * corresponds to a 25% speed reduction while avoiding other
     * entities.
     */
    slowDown = 0.75; // slow down factor while avoiding
    /**
     * Gets or sets a value that represents the maximum change in
     * angle per unit time while the entity is avoiding other 
     * entities.
     * 
     * The default value for this property is **0.5**, which
     * corresponds to a 0.5 degree change in direction per unit
     * time while avoiding other entities.
     */
    avoidAngle = 0.5;
    /**
     * Gets or sets a value that determines whether the behavior
     * should prevent other behaviors from being applied while 
     * avoiding an obstacle.
     * 
     * The default value for this property is **true**.
     */
    preventOthersWhileAvoiding = true;
    /**
     * Gets or sets the current obstacle being avoided by this behavior.
     */
    get currentObstacle(): IObstacle | null {
        return this._currentObstacle;
    }
    set currentObstacle(value: IObstacle | null) {
        if (value !== this._currentObstacle) {
            const e = this.entity;
            if (e != null) {
                if (this._currentObstacle === null && value !== null) { // start avoiding, save properties
                    if (this.avoidColor) {
                        this._saveColor = e.color;
                        e.color = this.avoidColor;
                    }
                    this._saveSpeed = e.speed;
                    e.speed *= this.slowDown;
                } else if (this._currentObstacle != null && value === null) { // done avoiding, restore properties
                    if (this._saveColor) {
                        e.color = this._saveColor;
                    }
                    e.speed = this._saveSpeed;
                }
            }
            this._currentObstacle = value;
        }
    }

    applyBehavior(e: SteeringVehicle, dt: number): boolean {

        // find nearest obstacle
        const obstacle = this.getNearestObstacle(dt);

        // change obstacle
        this.currentObstacle = obstacle;

        // avoid obstacle
        if (obstacle != null) {
            e.angle = this.getAvoidAngle(obstacle, dt);
            e.steerAngle = 0; // don't turn while avoiding
        }

        // return true if we are in avoiding mode
        return obstacle != null && this.preventOthersWhileAvoiding;
    }

    // gets the nearest obstacle to an entity
    protected getNearestObstacle(dt: number, criticalDistance = this.entity ? this.entity.radius : 0): IObstacle | null {
        const
            e = this.entity as SteeringVehicle,
            pNow = e.position,
            pNext = {
                x: pNow.x + e._cos,
                y: pNow.y + e._sin
            };
        let obstacle: IObstacle | null = null,
            minDist: number | null = null;
        this.obstacles.forEach(o => {
            if (o !== e) {
                const
                    offset = o.radius + e.radius + e.speed * dt,
                    dist = Point.distance(pNow, o.position) - offset;
                if (minDist === null || dist < minDist) { // closer
                    if (dist <= criticalDistance) { // close enough...
                        if (Point.distance(pNext, o.position) - offset < dist) { // and getting closer...
                            if (minDist === null || o.bounce || (obstacle && o.bounce === obstacle.bounce)) { // prioritize bouncing obstacles
                                minDist = dist;
                                obstacle = o;
                            }
                        }
                    }
                }
            }
        });
        return obstacle;
    }

    // gets the angle to use in order to avoid an obstacle
    protected getAvoidAngle(obstacle: IObstacle, dt: number): number {
        const
            e = this.entity as SteeringVehicle,
            d = Point.distance(e.position, obstacle.position);
        
        // too close? bounce or ignore
        if (d < obstacle.radius) {
            return (obstacle.bounce)
                ? e.angle + 180 + Math.random() * 6 - 3
                : e.angle;
        }

        // choose new angle
        const
            aDelta = 90 * obstacle.radius / d,
            d1 = this.getDeltaDistance(obstacle, +aDelta),
            d2 = this.getDeltaDistance(obstacle, -aDelta),
            avoidDelta = d1 > d2 ? +aDelta : -aDelta;
        return e.getTurnAngle(e.angle + avoidDelta, dt, this.avoidAngle);
    }

    // measure the distance between an obstacle and a future entity position
    protected getDeltaDistance(obstacle: IObstacle, aDelta: number): number {
        const
            e = this.entity as SteeringVehicle,
            a = (e.angle + aDelta) * Math.PI / 180,
            d = obstacle.radius,
            ePos = e.position,
            p = {
                x: ePos.x + d * Math.cos(a),
                y: ePos.y + d * Math.sin(a)
            };
        return Point.distance(obstacle.position, p);
    }    
}
