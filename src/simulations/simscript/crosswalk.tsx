import { Simulation, Entity, Queue, Exponential, Uniform, format, setOptions } from 'simscript';
import { SimulationComponent, HTMLDiv, NumericParameter, BooleanParameter } from '../../simscript-react/components';

/**
 * Custom Component to show Crosswalk Simulations with 
 * Simulation parameters and custom output.
 */
export class CrosswalkComponent extends SimulationComponent<Crosswalk> {

    // render parameters section
    renderParams(): JSX.Element {
        const sim = this.props.sim;
        return <>
            <h3>
                Parameters
            </h3>
            <p>
                Pedestrian traffic light cycles:
            </p>
            <ul>
                <li>
                    <NumericParameter label='<span class="light red"></span>Red:' parent={this}
                        value={sim.cycle.red}
                        min={0} max={120}
                        change={v => sim.cycle.red = v}
                        suffix={` ${format(sim.cycle.red, 0)} ${sim.timeUnit}`} />
                </li>
                <li>
                    <NumericParameter label='<span class="light yellow"></span>Yellow:' parent={this}
                        value={sim.cycle.yellow}
                        min={0} max={120}
                        change={v => sim.cycle.yellow = v}
                        suffix={` ${format(sim.cycle.yellow, 0)} ${sim.timeUnit}`} />
                </li>
                <li>
                    <NumericParameter label='<span class="light green"></span>Green:' parent={this}
                        value={sim.cycle.green}
                        min={0} max={120}
                        change={v => sim.cycle.green = v}
                        suffix={` ${format(sim.cycle.green, 0)} ${sim.timeUnit}`} />
                </li>
            </ul>
            <BooleanParameter label='Slow Mode:' parent={this}
                value={sim.slowMode}
                change={v => sim.slowMode = v} />
        </>;
    }

    // render output section
    renderOutput(): JSX.Element {
        const
            sim = this.props.sim,
            c = sim.cycle,
            wPavg = (c.yellow + c.red) / (c.yellow + c.red + c.green) * (c.yellow + c.red) / 2,
            wCavg = (c.yellow + c.green) / (c.yellow + c.red + c.green) * (c.yellow + c.green) / 2,
            wPmax = c.yellow + c.red,
            wCmax = c.yellow + c.green;
        
        return <>
            <h3>
                Results
            </h3>
            <ul>
                <li>
                    Simulated time: <b>{format(sim.timeNow / 60 / 60)}</b> hours</li>
                <li>
                    Elapsed time: <b>{format(sim.timeElapsed / 1000)}</b> seconds</li>
                <li>
                    Average Pedestrian Wait: <b>{format(sim.qPedXing.grossDwell.avg)}</b>{' '}
                    <i>({format(wPavg)})</i> {sim.timeUnit}</li>
                <li>
                    Longest Pedestrian Wait: <b>{format(sim.qPedXing.grossDwell.max)}</b>{' '}
                    <i>({format(wPmax)})</i> {sim.timeUnit}</li>
                <li>
                    Average Car Wait: <b>{format(sim.qCarXing.grossDwell.avg)}</b>{' '}
                    <i>({format(wCavg)})</i> {sim.timeUnit}</li>
                <li>
                    Longest Car Wait: <b>{format(sim.qCarXing.grossDwell.max)}</b>{' '}
                    <i>({format(wCmax)})</i> {sim.timeUnit}</li>
                <li>
                    Pedestrian Count: <b>{format(sim.qPedXing.grossDwell.cnt, 0)}</b></li>
                <li>
                    Car Count: <b>{format(sim.qCarXing.grossDwell.cnt, 0)}</b></li>
            </ul>

            <div className='histograms'>
                <HTMLDiv html={sim.qPedXing.grossPop.getHistogramChart('Pedestrians waiting to cross')} />
                <HTMLDiv html={sim.qCarXing.grossPop.getHistogramChart('Cars waiting to cross')} />
            </div>
                
        </>;
    }

    // render animation section
    renderAnimation(): JSX.Element {
        return <svg className='ss-anim' viewBox='0 0 1000 500'>
            <g className='light'>
                <rect className='light' x='47.5%' y='0%' width='5%' height='25%' rx='2%'/>
                <circle className='red' cx='50%' cy='5%' r='2%'/>
                <circle className='yellow' cx='50%' cy='12.5%' r='2%'/>
                <circle className='green' cx='50%' cy='20%' r='2%'/>
            </g>

            <rect className='street' x='10%' y='50%' width='80%' height='20%'/>
            <rect className='crosswalk' x='45%' y='50%' width='10%' height='20%'/>

            <circle className='ss-queue car-arr' cx='10%' cy='60%' r='10'/>
            <circle className='ss-queue car-xing' cx='40%' cy='60%' r='10'/>
            <circle className='ss-queue car-xed' cx='90%' cy='60%' r='10'/>

            <circle className='ss-queue ped-arr' cx='10%' cy='85%' r='10'/>
            <circle className='ss-queue ped-xing' cx='50%' cy='75%' r='10'/>
            <circle className='ss-queue ped-xed' cx='50%' cy='45%' r='10'/>
            <circle className='ss-queue ped-leave' cx='90%' cy='35%' r='10'/>
        </svg>
    }

    // get animation options
    getAnimationOptions(): any {
        const sim = this.props.sim;
        return {
            getEntityHtml: (e: Entity) => {
                if (e instanceof Pedestrian) {
                    return `<g class='ped' fill='black' stroke='black' opacity='0.8' transform='scale(1,0.8)'>
                        <circle cx='1%' cy='1%' r='0.5%' fill='orange'/>
                        <rect x='.4%' y='2%' width='1.3%' height='4%' fill='green' rx='0.7%'/>
                        <rect x='.66%' y='4%' width='.8%' height='3%' fill='blue'/>
                        <rect x='.4%' y='7%' width='1.3%' height='.75%' rx='0.5%'/>
                    </g>`;
                } else {
                    return `<g class='car' fill='black' stroke='black'>
                        <rect x='1%' y='0' width='5%' height='4%' rx='1%'/>
                        <rect x='0' y='1.5%' width='9%' height='3%' fill='red' rx='0.5%'/>
                        <circle cx='1.5%' cy='4%' r='.9%' opacity='0.8'/>
                        <circle cx='7.5%' cy='4%' r='.9%' opacity='0.8'/>
                        <rect x='0' y='0' width='10%' height='1%' opacity='0'/>
                    </g>`;
                }
            },
            queues: [
                { queue: sim.qPedArr, element: 'svg .ss-queue.ped-arr' },
                { queue: sim.qPedXing, element: 'svg .ss-queue.ped-xing', angle: -45, max: 8 },
                { queue: sim.qPedXed, element: 'svg .ss-queue.ped-xed' },
                { queue: sim.qPedLeave, element: 'svg .ss-queue.ped-leave' },

                { queue: sim.qCarArr, element: 'svg .ss-queue.car-arr' },
                { queue: sim.qCarXing, element: 'svg .ss-queue.car-xing', angle: 0, max: 16 },
                { queue: sim.qCarXed, element: 'svg .ss-queue.car-xed' },
            ]
        };
    }

    // update traffic lights
    initializeAnimation(animHost: HTMLElement): void {
        const
            sim = this.props.sim,
            lights = animHost.querySelectorAll('.light circle'),
            updateStats = () => {
                for (let i = 0; i < lights.length; i++) {
                    (lights[i] as HTMLElement).style.opacity = (i === sim.light) ? '1' : '';
                }
            };
        sim.timeNowChanged.addEventListener(updateStats);
        sim.stateChanged.addEventListener(updateStats);

    }
}
    
/**
 * CrossWalk simulation
 */
export enum Signal {
    RED,
    YELLOW,
    GREEN,
}

export class Crosswalk extends Simulation {
    qPedArr = new Queue('Pedestrian Arrival');
    qPedXing = new Queue('Pedestrian Crossing');
    qPedXed = new Queue('Pedestrian Crossed');
    qPedLeave = new Queue('Pedestrian Leaving');

    qCarArr = new Queue('Car Arrival');
    qCarXing = new Queue('Car Crossing');
    qCarXed = new Queue('Car Crossed');
    
    walkToXing = new Uniform(60, 120);
    walkAcross = new Uniform(10, 20);
    walkAway = new Uniform(120, 180);

    driveToXing = new Uniform(5, 6);
    driveAway = new Uniform(10, 12);

    pedestrianArrivalInterval = new Exponential(60 / 10); // 10/min
    carArrivalInterval = new Exponential(60 / 6); // 6/min

    cycle = {
        red: 20,
        yellow: 10,
        green: 30,
    };
    light = Signal.RED;

    _slowMode = false;

    // initialize Simulation
    constructor(options?: any) {
        super();
        this.name = 'Crosswalk';
        this.timeUnit = 's';
        this.qPedXing.grossPop.setHistogramParameters(3);
        this.qCarXing.grossPop.setHistogramParameters(2);
        this.timeEnd = 3600 * 24; // 24 hours
        setOptions(this, options);
    }

    // create entity generators
    onStarting() {
        super.onStarting();
        this.activate(new TrafficLight());
        this.generateEntities(Pedestrian, this.pedestrianArrivalInterval);
        this.generateEntities(Car, this.carArrivalInterval);
    }

    // toggle simulation speed
    get slowMode(): boolean {
        return this._slowMode;
    }
    set slowMode(value: boolean) {
        this._slowMode = value;
        if (value) {
            this.maxTimeStep = 1;
            this.frameDelay = 30;
        } else {
            this.maxTimeStep = 0;
            this.frameDelay = 0;
        }
    }
}


// pedestrians
export class Pedestrian extends Entity<Crosswalk> {
    async script() {
        let sim = this.simulation;

        // walk to crosswalk
        await this.delay(sim.walkToXing.sample(), {
            queues: [sim.qPedArr, sim.qPedXing]
        });

        // enter pedestrian crosswalk
        await this.enterQueue(sim.qPedXing);

        // wait for green light
        while (sim.light !== Signal.GREEN) {
            await this.waitSignal(Signal.GREEN);
        }

        // leave crossing
        this.leaveQueue(sim.qPedXing);

        // walk across and away
        await this.delay(sim.walkAcross.sample(), {
            queues: [sim.qPedXing, sim.qPedXed]
        });
        await this.delay(sim.walkAway.sample(), {
            queues: [sim.qPedXed, sim.qPedLeave]
        });
    }
}

// cars
export class Car extends Entity<Crosswalk> {
    async script() {
        let sim = this.simulation;

        // drive to crosswalk
        await this.delay(sim.driveToXing.sample(), {
            queues: [sim.qCarArr, sim.qCarXing]
        });

        // enter crosswalk
        await this.enterQueue(sim.qCarXing);

        // wait until red for pedestrians
        while (sim.light !== Signal.RED) {
            await this.waitSignal(Signal.RED);
        }

        // leave crosswalk
        this.leaveQueue(sim.qCarXing);

        // drive away
        await this.delay(sim.driveAway.sample(), {
            queues: [sim.qCarXing, sim.qCarXed]
        });
    }
}

// traffic light
class TrafficLight extends Entity<Crosswalk> {
    async script() {
        let sim = this.simulation;
        while (true) {

            // turn green to allow pedestrians to cross
            this.setLight(Signal.GREEN);
            await this.delay(sim.cycle.green);

            // turn yellow to clear pedestrians
            this.setLight(Signal.YELLOW);
            await this.delay(sim.cycle.yellow);

            // turn red to allow cars to cross
            this.setLight(Signal.RED);
            await this.delay(sim.cycle.red);
        }
    }
    setLight(value: Signal) {
        this.simulation.light = value;
        this.sendSignal(value);
    }
}
