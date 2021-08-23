import React from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from 'react-router-dom';

import { SimulationState, format } from 'simscript';
import { BarberShop } from './simulations/barbershop';
import { MMC } from './simulations/mmc';

import 'simscript/dist/simscript.css';
import './App.css';

export default function App() {
    const sims = {
        mmc: new MMC(),
        bshop: new BarberShop()
    }
    
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
                </nav>

                {/* 
                A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. 
                */}
                <Switch>

                    <Route path="/bshop">
                        <SimulationCard
                            key={'bshop'}
                            sim={sims['bshop']}>
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
                            sim={sims['mmc']}
                            name={'M/M/C'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This system is simple enough that there are formulas to calculate
                                the average queue length and waits
                                (calculated values are shown in italics).</p>
                        </SimulationCard>
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
    
    // keep track of the simulation state
    const [simState, setSimState] = React.useState(sim.state);
    sim.stateChanged.addEventListener(() => {
        setSimState(sim.state);
        updateOutput();
    });

    // update output every 500ms
    let lastUpdate = 0;
    sim.timeNowChanged.addEventListener(() => {
        let now = Date.now();
        if (now - lastUpdate > 500) {
            lastUpdate = now;
            updateOutput();
        }
    });

    // handle run/stop button
    const clickRun = (e: any) => {
        lastUpdate = 0;
        if (simState === SimulationState.Running) {
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
        {props.children}
        <button className='btn-run' onClick={clickRun}>
            {simState !== SimulationState.Running ? runText : stopText}
        </button>
        <div ref={outputElement} />
    </div>;
}

