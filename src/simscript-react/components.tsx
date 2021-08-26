import React from 'react';
import { Simulation, SimulationState, assert } from 'simscript';


///////////////////////////////////////////////////////////////////////////////
// component that renders a Simulation
interface ISimulationComponentProps<T> {
    sim: T,
    name?: string,
    showNetValues?: boolean
}
export class SimulationComponent<T extends Simulation = Simulation> extends React.Component<ISimulationComponentProps<T>, any> {
    _mounted = false;
    _lastUpdate = 0;

    // initialize simulation
    constructor(props: ISimulationComponentProps<T>) {
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
        this.props.sim.stop();
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
        return <HTMLDiv html={this.props.sim.getStatsTable(this.props.showNetValues)} />
    }
}


///////////////////////////////////////////////////////////////////////////////
// component that provides two-way binding to numeric values
interface INumericParameterProps {
    label: string,
    tag: string,
    value: number,
    min: number,
    max: number,
    change: (value: number) => void
}
export function NumericParameter(props: INumericParameterProps) {
    return <>
        <label>
            <HTMLSpan html={props.label}/>
            <input type='range'
                min={props.min}
                max={props.max}
                value={props.value}
                onChange={e => props.change(e.target.valueAsNumber)} />
            {props.tag}
        </label>
    </>;
}


///////////////////////////////////////////////////////////////////////////////
// component that renders HTML content
interface IHTMLDivProps {
    html: string;
}
export function HTMLDiv(props: IHTMLDivProps) {
    return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
}
export function HTMLSpan(props: IHTMLDivProps) {
    return <span dangerouslySetInnerHTML={{ __html: props.html }} />;
}