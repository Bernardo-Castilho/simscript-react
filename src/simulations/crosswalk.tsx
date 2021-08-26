import { Simulation, Entity, Queue, Exponential, Uniform, format, setOptions } from 'simscript';
import { SimulationComponent, HTMLDiv, NumericParameter } from '../simscript-react/components';

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
                    <NumericParameter label='<span class="light red"></span>Red: ' value={sim.cycle.red}
                        min={0} max={120}
                        change={v => {
                            sim.cycle.red = v;
                            this.forceUpdate();
                        }}
                        tag={` ${format(sim.cycle.red, 0)} ${sim.timeUnit}`} />
                </li>
                <li>
                    <NumericParameter label='<span class="light yellow"></span>Yellow: ' value={sim.cycle.yellow}
                        min={0} max={120}
                        change={v => {
                            sim.cycle.yellow = v;
                            this.forceUpdate();
                        }}
                        tag={` ${format(sim.cycle.yellow, 0)} ${sim.timeUnit}`} />
                </li>
                <li>
                    <NumericParameter label='<span class="light green"></span>Green: ' value={sim.cycle.green}
                        min={0} max={120}
                        change={v => {
                            sim.cycle.green = v;
                            this.forceUpdate();
                        }}
                        tag={` ${format(sim.cycle.green, 0)} ${sim.timeUnit}`} />
                </li>
            </ul>
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

    // initialize Simulation
    constructor(options?: any) {
        super();
        this.name = 'Crosswalk';
        this.timeUnit = 's';
        this.qPedXing.grossPop.setHistogramParameters(3);
        this.qCarXing.grossPop.setHistogramParameters(2);
        if (this.timeEnd == null) {
            this.timeEnd = 3600 * 24; // 24 hours
        }
        setOptions(this, options);
    }

    // create entity generators
    onStarting() {
        super.onStarting();
        this.activate(new TrafficLight());
        this.generateEntities(Pedestrian, this.pedestrianArrivalInterval);
        this.generateEntities(Car, this.carArrivalInterval);
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
