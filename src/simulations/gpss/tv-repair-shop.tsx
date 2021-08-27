import { Simulation, Entity, Queue, Uniform, EventArgs, format } from 'simscript';
import { SimulationComponent } from '../../simscript-react/components';

/**
 * Custom Component to show TVRepairShop Simulations with custom output.
 */
export class TVRepairShopComponent extends SimulationComponent<TVRepairShop> {

    // render custom output
    renderOutput(): JSX.Element {
        const sim = this.props.sim;
        return <ul>
            <li>
                The utilization of the repairman is <b>{format(sim.qRepairMan.utilization * 100, 0)}</b>%.</li>
            <li>
                The overall average delay is <b>{format(sim.qAllJobs.averageDwell, 0)}</b> min.</li>
            <li>
                The average delay for overhaul jobs is <b>{format(sim.qOverhaulJobs.averageDwell, 0)}</b> min.</li>
            <li>
                The average delay for customer jobs is <b>{format(sim.qCustomerJobs.averageDwell, 0)}</b> min.</li>
            <li>
                The average delay for on-the-spot jobs is <b>{format(sim.qOnTheSpotJobs.averageDwell, 0)}</b> min.</li>
        </ul>;
    }
}

//-------------------------------------------------------------------------
// TVRepairShop
//-------------------------------------------------------------------------
// A television shop employs a single repairman to overhaul its rented
// television sets, service customers’ sets and do on-the-spot repairs.
// Overhaul of company owned television sets commences every 40±8 hours
// and takes 10±1 hours to complete.
// On-the-spot repairs, such as fuse replacement, tuning and adjustments 
// are done immediately. These arrive every 90±10 minutes and take 15±5 
// minutes.
// Customers’ television sets requiring normal service arrive every 5±1 
// hours and take 120±30 minutes to complete.
// Normal service of television sets has a higher priority than the 
// overhaul of company owned, rented sets.
// 1. Simulate the operation of the repair department for 50 days.
// 2. Determine the utilization of the repairman and the delays in the
// service to customers.
//-------------------------------------------------------------------------
export class TVRepairShop extends Simulation {

    // queues
    qRepairMan = new Queue('RepairMan', 1);
    qAllJobs = new Queue('Wait All Jobs');
    qOverhaulJobs = new Queue('Wait Overhaul Jobs');
    qOnTheSpotJobs = new Queue('Wait On-The-Spot Jobs');
    qCustomerJobs = new Queue('Wait Customer Jobs');

    // delays
    interArrOverhaul = new Uniform((40 - 8) * 60, (40 + 8) * 60); // 40+-8 hours
    serviceOverhaul = new Uniform((10 - 1) * 60, (10 + 1) * 60); // 10+-1 hours
    interArrOnTheSpot = new Uniform(90 - 10, 90 + 10); // 90+-10 min
    serviceOnTheSpot = new Uniform(15 - 5, 15 + 5); // 15+-5 min
    interArrCustomer = new Uniform((5 - 1) * 60, (5 + 1) * 60); // 5+-1 hours
    serviceCustomer = new Uniform(120 - 30, 120 + 30); // 120+-30 minutes

    // initialization
    onStarting(e?: EventArgs) {
        super.onStarting(e);
        this.timeUnit = 'hours';
        this.timeEnd = 50 * 8 * 60; // simulate 50 8-hour days
        this.generateEntities(TVOverhaulEntity, this.interArrOverhaul);
        this.generateEntities(TVOnTheSpotEntity, this.interArrOnTheSpot);
        this.generateEntities(TVCustomerEntity, this.interArrCustomer);
    }
}
class TVOverhaulEntity extends Entity<TVRepairShop> {
    async script() {
        const sim = this.simulation;
        this.priority = 1;

        // use repairman for TV overhauling (preemptively)
        await this.seize(
            sim.qRepairMan,
            sim.serviceOverhaul.sample(),
            [sim.qAllJobs, sim.qOverhaulJobs],
            sim.qRepairMan);
    }
}
class TVCustomerEntity extends Entity<TVRepairShop> {
    async script() {
        const sim = this.simulation;
        this.priority = 2;

        // use repairman for a customer job (preemptively)
        await this.seize(
            sim.qRepairMan,
            sim.serviceCustomer.sample(),
            [sim.qAllJobs, sim.qCustomerJobs],
            sim.qRepairMan);
    }
}
class TVOnTheSpotEntity extends Entity<TVRepairShop> {
    async script() {
        const sim = this.simulation;
        this.priority = 3;

        // use repairman for an on-the-spot job (preemptively)
        await this.seize(
            sim.qRepairMan,
            sim.serviceOnTheSpot.sample(),
            [sim.qAllJobs, sim.qOnTheSpotJobs],
            sim.qRepairMan);
    }
}
