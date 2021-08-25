import React from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from 'react-router-dom';

import { SimulationState } from 'simscript';
import { BarberShop } from './simulations/barbershop';
import { MMC } from './simulations/mmc';

import 'simscript/dist/simscript.css';
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <h1>
                SimScript in React
            </h1>
            <div className='link-container'>
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/bshop">Barbershop</Link>
                    <Link to="/mmc">M/M/C</Link>
                    <Link to="/clock">Clock</Link>
                </nav>

                {/* 
                A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. 
                */}
                <Switch>

                    <Route path="/bshop">
                        <SimulationCard
                            key={'bshop'}
                            sim={new BarberShop()}>
                            <p>
                                A <a href="https://try-mts.com/gpss-introduction-and-barber-shop-simulation/">
                                    classic GPSS simulation example</a>:
                                customers arrive at a barbershop, wait until the barber is available,
                                get serviced, and leave.</p>
                        </SimulationCard>
                    </Route>

                    <Route path="/mmc">
                        <SimulationCard
                            key={'mmc'}
                            sim={new MMC()}
                            name={'M/M/C'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This system is simple enough that there are formulas to calculate
                                the average queue length and waits
                                (calculated values are shown in italics).</p>
                            <p>
                                time now: <b>???</b>
                            </p>
                        </SimulationCard>
                    </Route>

                    <Route path="/clock">
                        <Clock
                            key={'clock'}
                            sim={new MMC()}
                            name={'MMC (class-based)'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This system is simple enough that there are formulas to calculate
                                the average queue length and waits
                                (calculated values are shown in italics).</p>
                            <p>
                                time now: <b>???</b>
                            </p>
                        </Clock>
                    </Route>

                    <Route path="/">
                        <Home />
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

//
function Home() {
    return <div>
        <p>
            This sample shows several simulations written with{' '}
            <a href='https://www.npmjs.com/package/simscript'><b>SimScript</b></a>,
            a Discrete Event Simulation Library in TypeScript with support for
            2D and 3D animations.
        </p>
    </div >;
}

//
function SimulationCard(props: any) {
    const
        sim = props.sim,
        outputElement = React.useRef(null),
        runText = String.fromCharCode(9654) + ' Run',
        stopText = String.fromCharCode(9632) + ' Stop';

    // force updates
    const [, setUpdate] = React.useState({});
    const forceUpdate = () => setUpdate({});
    
    // update output when state changes
    sim.stateChanged.addEventListener(() => {
        forceUpdate();
        updateOutput();
    });

    // update output every 750ms
    let lastUpdate = 0;
    sim.timeNowChanged.addEventListener(() => {
        let now = Date.now();
        if (now - lastUpdate > 750) {
            lastUpdate = now;
            updateOutput();
        }
    });

    // handle run/stop button
    const clickRun = (e: any) => {
        lastUpdate = 0;
        if (sim.state === SimulationState.Running) {
            sim.stop();
        } else {
            sim.start(e.ctrlKey);
        }
        updateOutput();
    }

    // update simulation output
    const updateOutput = () => {
        let e = outputElement as any;
        if (e && e.current) {
            e.current.innerHTML = props.getOutput
                ? props.getOutput(sim)
                : sim.getStatsTable();
        }
    }

    return <div className='sim-card'>
        <h2>
            {props.name || sim.name || sim.constructor.name}
        </h2>
        <div>
            {props.children}
        </div>
        <button className='btn-run' onClick={clickRun}>
            {sim.state !== SimulationState.Running ? runText : stopText}
        </button>
        <div ref={outputElement} />
    </div>;
}

export class Clock extends React.Component<any, any> {
    lastUpdate = 0;
    outputElement = React.createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);

        // this is our simulation
        const sim = props.sim;

        // update output when state changes
        sim.stateChanged.addEventListener(() => {
            this.forceUpdate();
            this.updateOutput();
        });

        // update output every 750ms
        sim.timeNowChanged.addEventListener(() => {
            let now = Date.now();
            if (now - this.lastUpdate > 750) {
                this.lastUpdate = now;
                this.updateOutput();
            }
        });
    }

    // update simulation output
    updateOutput() {
        const e = this.outputElement;
        if (e && e.current) {
            const
                sim = this.props.sim,
                getOutput = this.props.getOutput;
            e.current.innerHTML = getOutput ? getOutput(sim) : sim.getStatsTable();
        }
    }

    // handle run/stop button
    clickRun(e?: any) {
        const sim = this.props.sim;
        this.lastUpdate = 0;
        if (sim.state === SimulationState.Running) {
            sim.stop();
        } else {
            sim.start(e.ctrlKey);
        }
        this.updateOutput();
    }

    render() {
        const
            sim = this.props.sim,
            runText = String.fromCharCode(9654) + ' Run',
            stopText = String.fromCharCode(9632) + ' Stop';
    
        return <div className='sim-card'>
            <h2>
                {this.props.name || sim.name || sim.constructor.name}
            </h2>
            <div>
                {this.props.children}
            </div>
            <button className='btn-run' onClick={e => this.clickRun(e)}>
                {sim.state !== SimulationState.Running ? runText : stopText}
            </button>
            <div ref={this.outputElement} />
        </div>;
    }
}