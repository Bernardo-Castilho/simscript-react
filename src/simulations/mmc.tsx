import { Simulation, Entity, Queue, Exponential } from 'simscript';

// MMC simulation
export class MMC extends Simulation {
    qWait = new Queue('Wait');
    qService = new Queue('Service', 2);
    interArrival = new Exponential(80);
    service = new Exponential(100);

    // generate entities with exponential inter-arrival times
    onStarting() {
        super.onStarting();
        this.timeUnit = 'min';

        // get up tally histograms
        this.qWait.grossPop.setHistogramParameters(1, 0, 10);
        this.qWait.grossDwell.setHistogramParameters(60, 0, 500 - 0.1);

        // start simulation
        this.generateEntities(Customer, this.interArrival, 1e5); // limit the # of customers
    }
}

// customer
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
