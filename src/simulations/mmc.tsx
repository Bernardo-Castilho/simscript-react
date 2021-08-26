import { Simulation, Entity, Queue, Exponential, setOptions, format } from 'simscript';
import { SimulationComponent, HTMLDiv, NumericParameter } from '../simscript-react/components';

/**
 * Custom Component to show MMC Simulations with 
 * Simulation parameters and custom output.
 */
export class MMCComponent extends SimulationComponent<MMC> {

    // render parameters section
    renderParams(): JSX.Element {
        const
            sim = this.props.sim,
            c = sim.qService.capacity as number;

        return <>
            <h3>
                Parameters
            </h3>
            <ul>
                <li>
                    <NumericParameter label='Number of Servers: ' value={c}
                        min={1} max={10}
                        change={v => {
                            sim.qService.capacity = v;
                            this.forceUpdate();
                        }}
                        tag={` ${format(c, 0)} servers`} />
                </li>
                <li>
                    <NumericParameter label='Mean inter-arrival time: ' value={sim.interArrival.mean}
                        min={10} max={200}
                        change={v => {
                            sim.interArrival = new Exponential(v);
                            this.forceUpdate();
                        }}
                        tag={` ${format(sim.interArrival.mean, 0)} ${sim.timeUnit}`} />
                </li>
                <li>
                    <NumericParameter label='Mean service time: ' value={sim.service.mean}
                        min={10} max={200}
                        change={v => {
                            sim.service = new Exponential(v);
                            this.forceUpdate();
                        }}
                        tag={` ${format(sim.service.mean, 0)} ${sim.timeUnit}`} />
                </li>
            </ul>
        </>;
    }

    // render output section
    renderOutput(): JSX.Element {
        const sum = (rho1: number, c: number): number => {
            let sum = 0;
            for (let i = 0; i < c; i++) {
                sum += 1 / factorial(i) * Math.pow(rho1, i);
            }
            return sum;
        }
        const factorial = (n: number): number => {
            let f = 1;
            for (let i = 2; i <= n; i++) f *= i;
            return f;
        }
        const
            sim = this.props.sim as MMC,
            lambda = 1 / sim.interArrival.mean, // arrival rate
            mu = 1 / sim.service.mean, // service rate
            c = sim.qService.capacity as number, // server count
            rho1 = lambda / mu, // utilization
            rho = rho1 / c; // actual utilization
        const
            p0 = 1 / (sum(rho1, c) + 1 / factorial(c) * Math.pow(rho1, c) * c * mu / (c * mu - lambda)),
            ws = Math.pow(rho1, c) * mu * p0 / (factorial(c - 1) * Math.pow(c * mu - lambda, 2)) + 1 / mu,
            ls = ws * lambda,
            lq = ls - rho1, // average queue length
            wq = lq / lambda; // average wait
        
        return <>
            <h3>
                Results
            </h3>

            {/* show error if utilization exceeds 100% */}
            {rho >= 1 && <p className='error'>
                ** The server utilization exceeds 100%; the system will not reach a steady-state. **
            </p>}

            <ul>
                <li>
                    Simulated time:{' '}
                    <b>{format(sim.timeNow / 60, 0)}</b> hours</li>
                <li>
                    Elapsed time:{' '}
                    <b>{format(sim.timeElapsed / 1000, 2)}</b> seconds</li>
                <li>
                    Number of Servers:{' '}
                    <b>{format(c, 0)}</b></li>
                <li>
                    Mean Inter-Arrival Time:{' '}
                    <b>{format(sim.interArrival.mean, 0)}</b> {sim.timeUnit}</li>
                <li>
                    Mean Service Time:{' '}
                    <b>{format(sim.service.mean, 0)}</b> {sim.timeUnit}</li>
                <li>
                    Server Utilization:{' '}
                    <b>{format(sim.qService.grossPop.avg / c * 100, 0)}%</b>{' '}
                    (<i>{format(rho * 100, 0)}%</i>)</li>
                <li>
                    Average Wait:{' '}
                    <b>{format(sim.qWait.grossDwell.avg, 0)}</b>{' '}
                    (<i>{format(wq, 0)})</i> {sim.timeUnit}</li>
                <li>
                    Average Queue:{' '}
                    <b>{format(sim.qWait.grossPop.avg, 0)}</b>{' '}
                    (<i>{format(lq, 0)}</i>) customers</li>
                <li>
                    Longest Wait:{' '}
                    <b>{format(sim.qWait.grossDwell.max, 0)}</b> {sim.timeUnit}</li>
                <li>
                    Longest Queue:{' '}
                    <b>{format(sim.qWait.grossPop.max, 0)}</b> customers</li>
                <li>
                    Customers Served:{' '}
                    <b>{format(sim.qService.grossDwell.cnt, 0)}</b></li>
            </ul>

            <div className='histograms'>
                <HTMLDiv html={ sim.qWait.grossPop.getHistogramChart('Queue lengths') }/>
                <HTMLDiv html={sim.qWait.grossDwell.getHistogramChart('Wait times (minutes)')} />
            </div>

        </>;
    }
}

/**
 * MMC Simulation
 */
export class MMC extends Simulation {
    qWait = new Queue('Wait');
    qService = new Queue('Service', 2);
    interArrival = new Exponential(80);
    service = new Exponential(100);

    constructor(options?: any) {
        super();
        this.name = 'MMC';
        this.timeUnit = 'min';
        setOptions(this, options);
    }

    // generate entities with exponential inter-arrival times
    onStarting() {
        super.onStarting();

        // get up tally histograms
        this.qWait.grossPop.setHistogramParameters(1, 0, 10);
        this.qWait.grossDwell.setHistogramParameters(60, 0, 500 - 0.1);

        // start simulation
        this.generateEntities(Customer, this.interArrival, 1e5); // limit the # of customers
    }
}

// MMC customer
class Customer extends Entity<MMC> {
    async script() {
        let sim = this.simulation;
        this.enterQueueImmediately(sim.qWait);
        await this.enterQueue(sim.qService);
        this.leaveQueue(sim.qWait);
        await this.delay(sim.service.sample());
        this.leaveQueue(sim.qService);
    }
}

