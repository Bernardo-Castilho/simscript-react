import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import { SimulationComponent } from './simscript-react/components';

// SimScript samples
import { BarberShop } from './simulations/simscript/barbershop';
import { MMC, MMCComponent } from './simulations/simscript/mmc';
import { Crosswalk, CrosswalkComponent } from './simulations/simscript/crosswalk';

// GPSS samples
import { Telephone, TelephoneComponent } from './simulations/gpss/telephone';
import { TVRepairShop, TVRepairShopComponent } from './simulations/gpss/tv-repair-shop';
import { OrderPoint, OrderPointComponent } from './simulations/gpss/order-point';
import { Textile, TextileComponent } from './simulations/gpss/textile';

// Steering samples
import { SteeringSeek } from './simulations/steering/seek';
import { SteeringAvoid } from './simulations/steering/avoid';
import { SteeringLinearObstaclesSeek } from './simulations/steering/seek-avoid';
import { NetworkSteering }  from './simulations/steering/network';

import 'simscript/dist/simscript.css';
import './App.css';

// link with active class name
function MyLink(props: any) {
    return <NavLink exact activeClassName='active' to={props.to}>
        {props.children}
    </NavLink>;
}

// application
export default function App() {
    return (
        <BrowserRouter>
            <h1>
                SimScript in React
            </h1>
            <div className='content'>
                <div className='link-container'>
                    <nav>
                        <MyLink to='/'>Home</MyLink>
                        <details open={true}>
                            <summary>SimScript samples</summary>
                            <MyLink to='/bshop'>Barbershop</MyLink>
                            <MyLink to='/mmc'>M/M/C (default)</MyLink>
                            <MyLink to='/mmc-cst'>M/M/C (custom)</MyLink>
                            <MyLink to='/xwlk'>Crosswalk</MyLink>
                            <MyLink to='/xwlk-anim'>Crosswalk (animated)</MyLink>
                        </details>
                        <details>
                            <summary>GPSS samples</summary>
                            <MyLink to='/phone'>Telephone System</MyLink>
                            <MyLink to='/tv'>TV Repair Shop</MyLink>
                            <MyLink to='/order'>Order Point</MyLink>
                            <MyLink to='/textile'>Textile Factory</MyLink>
                        </details>
                        <details>
                            <summary>Steering samples</summary>
                            <MyLink to='/seek'>Seek</MyLink>
                            <MyLink to='/avoid'>Avoid</MyLink>
                            <MyLink to='/seek-avoid'>Seek and Avoid</MyLink>
                            <MyLink to='/network'>Network</MyLink>
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
                        <div>
                            <h1>
                                BarberShop Simulation</h1>
                            <p>
                                A <a href='https://try-mts.com/gpss-introduction-and-barber-shop-simulation/'>
                                classic GPSS simulation example</a>:
                                customers arrive at a barbershop, wait until the barber is available,
                                get serviced, and leave.</p>
                            <SimulationComponent key={'bshop'} sim={new BarberShop()}/>
                        </div>
                    </Route>
                    <Route path='/mmc'>
                        <div>
                            <h1>
                                M/M/C Simulation (default)</h1>
                            <p>
                                A <a href='https://en.wikipedia.org/wiki/M/M/c_queue'>
                                classic M/M/C queueing system</a>.
                                Entities arrive, are served by one of C servers, and leave.</p>
                            <p>
                                This version shows the standard <b>SimScript</b> output table.</p>
                            <SimulationComponent key='mmc' sim={new MMC()}/>
                        </div>
                    </Route>
                    <Route path='/mmc-cst'>
                        <div>
                            <h1>
                                M/M/C Simulation (custom)</h1>
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
                            <MMCComponent key='mmc-cst' sim={new MMC()} />
                        </div>
                    </Route>
                    <Route path='/xwlk'>
                        <div>
                            <h1>
                                Crosswalk Simulation</h1>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                            <CrosswalkComponent key='xwlk' sim={new Crosswalk()}/>
                        </div>
                    </Route>
                    <Route path='/xwlk-anim'>
                        <div>
                            <h1>
                                Crosswalk Simulation (animated)</h1>
                            <p>
                                Simulates a crosswalk with a traffic light.</p>
                            <p>
                                Shows how to use the <b>waitsignal</b> and <b>sendSignal</b> methods.</p>
                            <CrosswalkComponent
                                key='xwlk-anim'
                                sim={new Crosswalk({ maxTimeStep: 1, frameDelay: 20 })}
                                animated={true}/>
                        </div>
                    </Route>

                    {/* GPSS samples */}
                    <Route path='/phone'>
                        <div>
                            <h1>
                                Telephone System Simulation</h1>
                            <p>
                                A simple telephone system has two external lines.
                                Calls, which originate externally, arrive every 100±60 seconds.
                                When the line is occupied, the caller redials after 5±1 minutes have elapsed.
                                Call duration is 3±1 minutes.</p>
                            <p>
                                A tabulation of the distribution of the time each caller takes to make
                                a successful call is required.</p>
                            <p>
                                How long will it take for 200 calls to be completed?</p>
                            <TelephoneComponent key='phone' sim={new Telephone()} />
                        </div>
                    </Route>
                    <Route path='/tv'>
                        <div>
                            <h1>
                                TV Repair Shop Simulation</h1>
                            <p>
                                A television shop employs a single repairman to overhaul its rented
                                television sets, service customers’ sets and do on-the-spot repairs.</p>
                            <ul>
                                <li>
                                    Overhaul of company owned television sets commences every 40±8 hours
                                    and takes 10±1 hours to complete.</li>
                                <li>
                                    On-the-spot repairs, such as fuse replacement, tuning and adjustments
                                    are done immediately. These arrive every 90±10 minutes and take 15±5 
                                    minutes.</li>
                                <li>
                                    Customers’ television sets requiring normal service arrive every 5±1
                                    hours and take 120±30 minutes to complete.</li>
                                <li>
                                    Normal service of television sets has a higher priority than the 
                                    overhaul of company owned, rented sets.</li>
                            </ul>
                            <p>
                                Simulate the operation of the repair department for 50 days and
                                determine
                                (1)&nbsp;The utilization of the repairman and
                                (2)&nbsp;The delays in the service to customers.</p>
                            <TVRepairShopComponent key='tv' sim={new TVRepairShop()} />
                        </div>
                    </Route>
                    <Route path='/order'>
                        <div>
                            <h1>
                                Order Point Simulation</h1>
                            <p>
                                An inventory system is controlled by an order point, set at 600 units,
                                and an economic order quantity of 500 units.</p>
                            <p>
                                The initial stock quantity is 700.
                                Daily demand is in the range 40 to 63 units, evenly distributed.
                                The lead-time from ordering to delivery of goods is one week (5 days).</p>
                            <p>
                                Simulate the inventory system for a period of 100 days and
                                determine
                                (1)&nbsp;The distribution of inventory and
                                (2)&nbsp;The actual daily sales.</p>
                            <OrderPointComponent key='order' sim={new OrderPoint()} />
                        </div>
                    </Route>
                    <Route path='/textile'>
                        <div>
                            <h1>
                                Textile Factory Simulation</h1>
                            <p>
                                A textile factory produces fine mohair yarn in three departments.</p>
                            <p>
                                The first department draws and blends the raw material, in sliver form,
                                and reduces it to a suitable thickness for spinning, in 5 reducer frames.
                                The second department spins the yarn in one of 40 spinning frames.
                                The final process is in the winding department, where the yarn is wound
                                from spinning bobbins onto cones for dispatch.</p>
                            <p>
                                There are 8 winding frames to perform the winding operation.
                                The factory works 8 hours per day.
                                The unit of production is 10 kilograms of yarn.
                                Reducing frames produce one unit every 38±2 minutes, while the spinning
                                frames and winding frames produce one unit in 320±20 minutes and 64±4
                                minutes, respectively.</p>
                            <p>
                                The initial inventory of reduced material is 50 units, spun material
                                is 25 units and finished yarn is 25 units.
                                The finished material is dispatched, in a container of capacity 200
                                units every two days.</p>
                            <p>
                                Simulate the production process in the textile factory for 5 days to find
                                (1)&nbsp;The distribution of the in-process inventories and
                                (2)&nbsp;The utilization of each of the three types of machines.</p>
                            <TextileComponent key='textile' sim={new Textile()}/>
                        </div>
                    </Route>

                    {/* Steering samples */}
                    <Route path='/seek'>
                        <div>
                            <h1>Seek Simulation</h1>
                            <p>
                                This sample shows entities that implement a <b>SeekBehavior</b>.</p>
                            <p>
                                They move towards the center of the animation, slow down as they
                                approach the target, and restart from a random position when they
                                reach the target.</p>
                            <SimulationComponent key='seek' sim={new SteeringSeek()}/>
                        </div>
                    </Route>
                    <Route path='/avoid'>
                        <div>
                            <h1>Avoid Simulation</h1>
                            <p>
                                Shows how to implement an <b>AvoidBehavior</b> that causes entities
                                to avoid obstacles.</p>
                            <p>
                                In this example, in addition to the static obstacles shown as grey
                                circles, other entities are also treated as obstacles.</p>
                            <SimulationComponent key='avoid' sim={new SteeringAvoid({avoidEntities: true})}/>
                        </div>
                    </Route>
                    <Route path='/seek-avoid'>
                        <div>
                            <h1>Seek and Avoid Simulation</h1>
                            <p>
                                Entities use a <b>SeekBehavior</b> to reach the exit and an
                                <b>AvoidBehavior</b> to avoid walls and other entities.</p>
                            <SimulationComponent key='seek-avoid' sim={new SteeringLinearObstaclesSeek()}/>
                        </div>
                    </Route>
                    <Route path='/network'>
                        <div>
                            <h1>Network Steering Simulation</h1>
                            <p>
                                Shows how you can use steering behaviors with networks.</p>
                            <p>
                                The sample creates a network and uses it to create paths for
                                the entities.</p>
                            <p>
                                Entities traverse the paths using a <b>NetworkSeekBehavior</b>
                                and avoid other entities using a <b>NetworkAvoidBehavior</b>.</p>
                            <SimulationComponent key='network' sim={new NetworkSteering()}/>
                        </div>
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
        <h1>
            SimScript/React Demo</h1>
        <p>
            This demo is a <b>React</b> app that shows simulations created with{' '}
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
