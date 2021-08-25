import React from 'react';
import { Simulation, SimulationState, assert } from 'simscript';

export class SimulationComponent extends React.Component<any, any> {
    _mounted = false;
    _lastUpdate = 0;

    // initialize simulation
    constructor(props: any) {
        super(props);

        // this is our simulation
        const sim = props.sim;
        assert(sim instanceof Simulation, '**sim** parameter should be a Simulation');

        // update output when state changes
        sim.stateChanged.addEventListener(() => {
            this.updateOutput();
        });

        // update output every 750ms
        sim.timeNowChanged.addEventListener(() => {
            let now = Date.now();
            if (now - this._lastUpdate > 750) {
                this._lastUpdate = now;
                this.updateOutput();
            }
        });
    }

    // keep track of mounted state
    componentDidMount() {
        this._mounted = true;
    }
    componentWillUnmount() {
        this._mounted = false;
    }

    // update simulation output
    updateOutput() {
        if (this._mounted) {
            this.forceUpdate();
        }
    }

    // set html output
    createMarkup(html: string) {
        return { __html: html };
    };

    // handle run/stop button
    clickRun(e?: any) {
        const sim = this.props.sim;
        this._lastUpdate = 0;
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
            <div className='sim-content'>
                {this.props.children}
            </div>
            <div className='sim-params'>
                {this.renderParams()}
            </div>
            <button className='btn-run' onClick={e => this.clickRun(e)}>
                {sim.state !== SimulationState.Running ? runText : stopText}
            </button>
            <div className='sim-output'>
                {sim.timeNow > 0 && this.renderOutput()}
            </div>
        </div>;
    }

    // no parameters by default
    renderParams(): JSX.Element | null {
        return null;
    }

    // show stats table by default
    renderOutput(): JSX.Element | null {
        const sim = this.props.sim;
        return <div
            dangerouslySetInnerHTML={this.createMarkup(sim.getStatsTable(this.props.showNetValues))}
        />;
    }
}
