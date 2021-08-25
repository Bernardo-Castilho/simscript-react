import React from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from 'react-router-dom';

import { SimulationComponent } from './simulation-component';
import { BarberShop } from './simulations/barbershop';
import { MMC, MMCComponent } from './simulations/mmc';
import { Crosswalk } from './simulations/crosswalk';

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
                    <Link to="/xwlk">Crosswalk</Link>
                    <Link to="/mmc-cst">M/M/C (Custom)</Link>
                </nav>

                {/* 
                A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. 
                */}
                <Switch>

                    <Route path="/bshop">
                        <SimulationComponent
                            key={'bshop'}
                            sim={new BarberShop()}>
                            <p>
                                A <a href="https://try-mts.com/gpss-introduction-and-barber-shop-simulation/">
                                    classic GPSS simulation example</a>:
                                customers arrive at a barbershop, wait until the barber is available,
                                get serviced, and leave.</p>
                        </SimulationComponent>
                    </Route>

                    <Route path="/mmc">
                        <SimulationComponent
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
                        </SimulationComponent>
                    </Route>

                    <Route path="/mmc-cst">
                        <MMCComponent
                            key={'mmc-cst'}
                            sim={new MMC()}
                            name={'MMC (Custom)'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                    classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This system is simple enough that there are formulas to calculate
                                the average queue length and waits
                                (calculated values are shown in italics).</p>
                        </MMCComponent>
                    </Route>

                    <Route path="/xwlk">
                        <SimulationComponent
                            key={'xwlk'}
                            sim={new Crosswalk()}>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                        </SimulationComponent>
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
        <h2>
            Home
        </h2>
        <p>
            This sample shows several simulations written with{' '}
            <a href='https://www.npmjs.com/package/simscript'><b>SimScript</b></a>,
            a Discrete Event Simulation Library in TypeScript with support for
            2D and 3D animations.
        </p>
    </div>;
}
