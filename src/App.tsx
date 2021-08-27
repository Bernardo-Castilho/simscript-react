import React from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
    Link
} from 'react-router-dom';

import { SimulationComponent } from './simscript-react/components';
import { BarberShop } from './simulations/simscript/barbershop';
import { MMC, MMCComponent } from './simulations/simscript/mmc';
import { Crosswalk, CrosswalkComponent } from './simulations/simscript/crosswalk';

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
                            <Link to='/xwlk-anim'>Crosswalk (animated)</Link>
                        </details>
                        <details>
                            <summary>GPSS samples</summary>
                            <Link to='/phone'>Telephone</Link>
                            <Link to='/tv'>TV Repair</Link>
                            <Link to='/order'>Order Point</Link>
                            <Link to='/textile'>Textile</Link>
                        </details>
                        <details>
                            <summary>Steering samples</summary>
                            <Link to='/seek'>Seek</Link>
                            <Link to='/avoid'>Avoid</Link>
                            <Link to='/seek-avoid'>Seek and Avoid</Link>
                            <Link to='/network'>Network</Link>
                        </details>
                    </nav>
                </div>

                {/* 
                A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. 
                */}
                <Switch>

                    {/* SimScript samples */}
                    <Route path='/bshop'>
                        <SimulationComponent key={'bshop'} sim={new BarberShop()}>
                            <p>
                                A <a href='https://try-mts.com/gpss-introduction-and-barber-shop-simulation/'>
                                classic GPSS simulation example</a>:
                                customers arrive at a barbershop, wait until the barber is available,
                                get serviced, and leave.</p>
                        </SimulationComponent>
                    </Route>
                    <Route path='/mmc'>
                        <SimulationComponent key='mmc' name='M/M/C (default)' sim={new MMC()}>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This version shows the standard <b>SimScript</b> output table.</p>
                        </SimulationComponent>
                    </Route>
                    <Route path='/mmc-cst'>
                        <MMCComponent key='mmc-cst' name='MMC (custom)' sim={new MMC()}>
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
                        <CrosswalkComponent key='xwlk' sim={new Crosswalk()}>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                        </CrosswalkComponent>
                    </Route>
                    <Route path='/xwlk-anim'>
                        <CrosswalkComponent key='xwlk-anim' name='Crosswalk (Animated)' animated={true} sim={new Crosswalk()}>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                        </CrosswalkComponent>
                    </Route>

                    {/* GPSS samples */}
                    <Route path='/phone'>
                        <h2>Telephone</h2>
                    </Route>
                    <Route path='/tv'>
                        <h2>TV</h2>
                    </Route>
                    <Route path='/order'>
                        <h2>Order Point</h2>
                    </Route>
                    <Route path='/textile'>
                        <h2>Textile</h2>
                    </Route>

                    {/* Steering samples */}
                    <Route path='/seek'>
                        <h2>Seek</h2>
                    </Route>
                    <Route path='/avoid'>
                        <h2>Avoid</h2>
                    </Route>
                    <Route path='/seek-avoid'>
                        <h2>Seek and Avoid</h2>
                    </Route>
                    <Route path='/network'>
                        <h2>Network</h2>
                    </Route>

                    {/* home */}
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
            2D and 3D animations.</p>
        <p>
            The sample simulations are divided into three categories:</p>
        <ol>
            <li>
                <b>SimScript</b>: These are simple examples that demonstrate
                SimScript features.</li>
            <li>
                <b>GPSS</b>: These samples are inspired by the set of{' '}
                <a href="http://www.minutemansoftware.com/tutorial/tutorial_manual.htm">GPSS samples</a>{' '}
                published by Minuteman software.<br/>
                They show how you can use SimScript to simulate a wide range of practical
                applications and allow you to compare results obtained by GPSS and SimScript.</li>
            <li>
                <b>Steering</b>: These samples are inspired by the article{' '}
                <a href='http://www.red3d.com/cwr/steer/'>Steering Behaviors For Autonomous Characters</a>.<br/>
                They present solutions for a common requirement of autonomous characters
                in simulations and games: the ability to navigate around their world
                in a life-like and improvisational manner.</li>
        </ol>
    </div>;
}
