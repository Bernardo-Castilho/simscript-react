import { Simulation, Entity, Queue, Uniform, EventArgs, format } from 'simscript';
import { SimulationComponent, HTMLDiv } from '../../simscript-react/components';

/**
 * Custom Component to show Telephone Simulations with custom output.
 */
export class TelephoneComponent extends SimulationComponent<Telephone> {

    // render custom output
    renderOutput(): JSX.Element {
        const sim = this.props.sim;
        return <>
            <ul>
                <li>
                    It took <b>{format(sim.timeNow / 60)}</b> minutes to complete 200 calls.</li>
                <li>
                    The average call took <b>{format(sim.totalDuration.averageDwell / 60)}</b> minutes to complete.</li>
                <li>
                    The phone line utilization was <b>{format(sim.lines.utilization * 100, 0)}</b>%.</li>
            </ul>
            <HTMLDiv html={sim.totalDuration.grossDwell.getHistogramChart('Call Duration (min)', 1 / 60)}/>
        </>;
    }
}

//-------------------------------------------------------------------------
// Telephone
//-------------------------------------------------------------------------
// A simple telephone system has two external lines.
// Calls, which originate externally, arrive every 100±60 seconds.
// When the line is occupied, the caller redials after 5±1 minutes have elapsed.
// Call duration is 3±1 minutes.
// A tabulation of the distribution of the time each caller takes to make
// a successful call is required.
// How long will it take for 200 calls to be completed?
//-------------------------------------------------------------------------
export class Telephone extends Simulation {
    lines = new Queue('Phone Lines', 2);
    totalDuration = new Queue('Total Duration');
    callArrival = new Uniform(100 - 60, 100 + 60); // calls arrive every 100 +- 60 sec
    callDuration = new Uniform(2 * 60, 4 * 60); // calls last 3 +- 1 min

    onStarting(e: EventArgs) {
        super.onStarting(e);
        this.timeUnit = 's';
        this.totalDuration.grossDwell.setHistogramParameters(60 * 10, 0, 60 * 120); // 10-min bins up to 2 hours
        this.generateEntities(Call, this.callArrival, 200);
    }
}
class Call extends Entity {
    async script() {
        const sim = this.simulation as Telephone;
        let done = false;
        this.enterQueueImmediately(sim.totalDuration);
        while (!done) {
            if (sim.lines.canEnter(1)) { // line is available, make the call now
                this.enterQueueImmediately(sim.lines);
                await this.delay(sim.callDuration.sample());
                this.leaveQueue(sim.lines);
                done = true;
            } else { // line is busy, wait for 5 minutes and try again
                await this.delay(5 * 60);
            }
        }
        this.leaveQueue(sim.totalDuration);
    }
}
