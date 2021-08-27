import { Simulation, Entity, Uniform, Tally, EventArgs, format } from 'simscript';
import { SimulationComponent, HTMLDiv } from '../../simscript-react/components';
import { getLineChart } from '../../simscript-react/util';

/**
 * Custom Component to show OrderPoint Simulations with custom output.
 */
export class OrderPointComponent extends SimulationComponent<OrderPoint> {

    // render custom output
    renderOutput(): JSX.Element {
        const sim = this.props.sim;
        return <>
            <ul>
                <li>
                    Average Inventory: <b>{format(sim.stockTally.avg, 0)}</b> units.</li>
                <li>
                    Maximum Inventory: <b>{format(sim.stockTally.max, 0)}</b> units.</li>
                <li>
                    Minimum Inventory: <b>{format(sim.stockTally.min, 0)}</b> units.</li>
            </ul>
            <HTMLDiv html={
                getLineChart('Demand and Inventory',
                    { data: [sim.stockTally.min, sim.stockTally.min], color: '#d0d0d0', width: '1' },
                    { data: [sim.stockTally.max, sim.stockTally.max], color: '#d0d0d0', width: '1' },
                    { data: [sim.stockTally.avg, sim.stockTally.avg], color: '#d0d0d0', width: '1' },
                    { name: 'Inventory', data: sim.inventoryLevel, color: 'blue', showPoints: true },
                    { name: 'Daily Orders', data: sim.dailyOrders, color: 'green' }
                )
            } />
        </>;
    }
}
        
//-------------------------------------------------------------------------
// OrderPoint
//-------------------------------------------------------------------------
// An inventory system is controlled by an order point, set at 600 units,
// and an economic order quantity of 500 units.
// The initial stock quantity is 700. Daily demand is in the range 40 to 63
// units, evenly distributed.
// The lead-time from ordering to delivery of goods is one week (5 days).
// Simulate the inventory system for a period of 100 days.
// Determine the distribution of inventory and the actual daily sales.
//-------------------------------------------------------------------------
export class OrderPoint extends Simulation {
    stock = 700;
    economicOrderQuantity = 500;
    orderPoint = 600;
    leadTime = 5;
    demand = new Uniform(40, 63);
    stockTally = new Tally();

    // plot data
    dailyOrders: number[] = [];
    inventoryLevel: number[] = [];

    onStarting(e?: EventArgs) {
        super.onStarting(e);
        this.timeUnit = 'days';

        this.stock = 700;
        this.timeEnd = 100;
        this.dailyOrders = [];
        this.inventoryLevel = [];
        this.stockTally.reset();

        this.generateEntities(OrderMaker);
        this.generateEntities(Order, 1);
    }
}

class OrderMaker extends Entity {
    async script() {
        const sim = this.simulation as OrderPoint;
        for (; ;) {

            // calculate how many units to order
            let units = sim.stock <= sim.orderPoint
                ? sim.economicOrderQuantity
                : 0;

            // place order, wait for it to arrive, and update the stock
            if (units) {
                await this.delay(sim.leadTime);
                sim.stock += units;
            } else { // wait for a day and check again
                await this.delay(1);
            }
        }
    }
}
class Order extends Entity {
    async script() {
        const sim = this.simulation as OrderPoint;
        let units = Math.round(sim.demand.sample());
        sim.stock = Math.max(0, sim.stock - units);
        sim.dailyOrders.push(units);
        sim.inventoryLevel.push(sim.stock);
        sim.stockTally.add(sim.stock);
    }
}
