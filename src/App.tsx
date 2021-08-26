import React from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from 'react-router-dom';

import { SimulationComponent } from './simscript-react/components';
import { BarberShop } from './simulations/barbershop';
import { MMC, MMCComponent } from './simulations/mmc';
import { Crosswalk, CrosswalkComponent } from './simulations/crosswalk';

import 'simscript/dist/simscript.css';
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <h1>
                SimScript in React
            </h1>
            <div className='content'>
                <div className='link-container'>
                    <nav>
                        <Link to='/'>Home</Link>
                        <details open={true}>
                            <summary>SimScript samples</summary>
                            <Link to='/bshop'>Barbershop</Link>
                            <Link to='/mmc'>M/M/C (default)</Link>
                            <Link to='/mmc-cst'>M/M/C (custom)</Link>
                            <Link to='/xwlk'>Crosswalk</Link>
                        </details>
                        <details>
                            <summary>GPSS samples</summary>
                            <Link to='/bshop'>Telephone</Link>
                            <Link to='/mmc'>TV Repair</Link>
                            <Link to='/mmc'>Order Point</Link>
                            <Link to='/mmc'>Textile</Link>
                            <Link to='/mmc'>Robot FMS</Link>
                        </details>
                        <details>
                            <summary>Steering samples</summary>
                            <Link to='/bshop'>Seek</Link>
                            <Link to='/mmc'>Avoid</Link>
                            <Link to='/xwlk'>Seek with Obstacles</Link>
                            <Link to='/mmc-cst'>Network</Link>
                        </details>
                    </nav>
                </div>

                {/* 
                A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. 
                */}
                <Switch>

                    <Route path='/bshop'>
                        <SimulationComponent
                            key={'bshop'}
                            sim={new BarberShop()}>
                            <p>
                                A <a href='https://try-mts.com/gpss-introduction-and-barber-shop-simulation/'>
                                classic GPSS simulation example</a>:
                                customers arrive at a barbershop, wait until the barber is available,
                                get serviced, and leave.</p>
                        </SimulationComponent>
                    </Route>

                    <Route path='/mmc'>
                        <SimulationComponent
                            key={'mmc'}
                            sim={new MMC()}
                            name={'M/M/C (default)'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This version shows the standard <b>SimScript</b> output table.</p>
                        </SimulationComponent>
                    </Route>

                    <Route path='/mmc-cst'>
                        <MMCComponent
                            key={'mmc-cst'}
                            sim={new MMC()}
                            name={'MMC (custom)'}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This version shows a custom component that:</p>
                            <ol>
                                <li>
                                    Allows users to edit the simulation parameters, and</li>
                                <li>
                                    Shows the theoretical/calculated values in italics
                                    next to the results calculated by <b>SimScript</b>.</li>
                            </ol>
                        </MMCComponent>
                    </Route>

                    <Route path='/xwlk'>
                        <CrosswalkComponent
                            key={'xwlk'}
                            sim={new Crosswalk()}>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                        </CrosswalkComponent>
                    </Route>
                    
                    <Route path='/'>
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
