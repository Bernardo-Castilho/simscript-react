import { Simulation, Queue, Entity, Uniform, EventArgs, format } from 'simscript';
import { SimulationComponent, HTMLDiv } from '../../simscript-react/components';
import { getLineChart } from '../../simscript-react/util';

/**
 * Custom Component to show Textile Simulations with custom output.
 */
export class TextileComponent extends SimulationComponent<Textile> {

    // render custom output
    renderOutput(): JSX.Element {
        const sim = this.props.sim;
        return <>
            <p>
                The distribution of the in-process inventories was:</p>
            <HTMLDiv html={
                getLineChart('In-Process Inventories',
                    { name: 'Reduced', data: sim.recReduced, color: 'red', showPoints: true },
                    { name: 'Wound', data: sim.recWound, color: 'green', showPoints: true },
                    { name: 'Spun', data: sim.recSpun, color: 'blue', showPoints: true },
                )
            } />
            <p>
                The utilization of the machines was:</p>
            <ul>
                <li>Reducers: <b>{format(sim.qReducers.utilization * 100, 0)}</b>%</li>
                <li>Spinners: <b>{format(sim.qReducers.utilization * 100, 0)}</b>%</li>
                <li>Winders: <b>{format(sim.qReducers.utilization * 100, 0)}</b>%</li>
            </ul>
        </>;
    }
}

//-------------------------------------------------------------------------
// Textile
//-------------------------------------------------------------------------
// A textile factory produces fine mohair yarn in three departments.
// The first department draws and blends the raw material, in sliver form,
// and reduces it to a suitable thickness for spinning, in 5 reducer frames.
// The second department spins the yarn in one of 40 spinning frames.
// The final process is in the winding department, where the yarn is wound
// from spinning bobbins onto cones for dispatch.
// There are 8 winding frames to perform the winding operation.
// The factory works 8 hours per day.
// The unit of production is 10 kilograms of yarn.
// Reducing frames produce one unit every 38±2 minutes, while the spinning 
// frames and winding frames produce one unit in 320±20 minutes and 64±4
// minutes, respectively.
// The initial inventory of reduced material is 50 units, spun material
// is 25 units and finished yarn is 25 units.
// The finished material is dispatched, in a container of capacity 200
// units, every two days.
// 1. Simulate the production process in the textile factory for 5 days.
// 2. Find the distribution of the in-process inventories.
// 3. Determine the utilization of each of the three types of machines.
//-------------------------------------------------------------------------
export class Textile extends Simulation {

    // resources
    qReducers = new Queue('Reducers', 5); // 5 reducer frames
    qSpinners = new Queue('Spinners', 40); // 40 spinning frames
    qWinders = new Queue('Winders', 8); // 8 winding frames

    // processing times (minutes)
    timeReduce = new Uniform(38 - 2, 38 + 2);
    timeSpin = new Uniform(320 - 20, 320 + 20);
    timeWind = new Uniform(64 - 4, 64 + 4);

    // stock
    reduced = 50;
    spun = 25;
    wound = 25;

    // stock records
    recReduced: number[] = [];
    recWound: number[] = [];
    recSpun: number[] = [];

    onStarting(e?: EventArgs) {
        super.onStarting(e);
        this.timeUnit = 'min';

        // initialize stock
        this.reduced = 50;
        this.spun = 25;
        this.wound = 25;
        this.recReduced = [];
        this.recWound = [];
        this.recSpun = [];

        // simulate 5 8-hour days
        this.timeEnd = 5 * 8 * 60;

        // activate entities
        this.generateEntities(TextileTransaction, 20); // one transaction every 20 min
        this.activate(new TextileDispatcher()); // dispatch 200kg every two days
        this.activate(new TextileRecorder()); // record inventories once a day
    }
}

class TextileTransaction extends Entity {
    async script() {
        const sim = this.simulation as Textile;
        ////console.log('started unit', this.serial, 'at', sim.timeNow);

        // reduce one unit (10kg)
        await this.enterQueue(sim.qReducers);
        await this.delay(sim.timeReduce.sample());
        this.leaveQueue(sim.qReducers);
        sim.reduced++;

        // spin one unit
        await this.enterQueue(sim.qSpinners);
        await this.delay(sim.timeSpin.sample());
        this.leaveQueue(sim.qSpinners);
        sim.reduced--;
        sim.spun++;

        // wind one unit
        await this.enterQueue(sim.qWinders);
        await this.delay(sim.timeWind.sample());
        this.leaveQueue(sim.qWinders);
        sim.spun--;
        sim.wound++;

        ///console.log('finished unit', this.serial, 'at', sim.timeNow);
    }
}
class TextileDispatcher extends Entity {
    async script() {
        const sim = this.simulation as Textile;

        // one unit of production is 10 kilograms of yarn
        for (; ;) {
            await this.delay(16 * 60); // every two 8-hour days
            if (sim.wound >= 20) {
                sim.wound -= 20; // dispatched 20 units (200kg)
                //console.log('dispatched 200kg', sim.wound);////
            } else {
                //console.log('missed dispatch', sim.wound);////
            }
        }
    }
}
class TextileRecorder extends Entity {
    async script() {
        const sim = this.simulation as Textile;
        for (; ;) {

            // record inventories
            sim.recReduced.push(sim.reduced);
            sim.recWound.push(sim.wound);
            sim.recSpun.push(sim.spun);

            // record once a day
            await this.delay(8 * 60);
        }
    }
}
