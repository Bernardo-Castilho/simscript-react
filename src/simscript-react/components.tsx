import React from 'react';
import { Simulation, SimulationState, Animation, assert } from 'simscript';


///////////////////////////////////////////////////////////////////////////////
// component that renders a Simulation
interface ISimulationComponentProps<T> {
    sim: T,
    showNetValues?: boolean,
    animated?: boolean | string,
    viewBox?: string,
    viewPoint?: string
}

export class SimulationComponent<T extends Simulation = Simulation> extends React.Component<ISimulationComponentProps<T>, any> {
    _mounted = false;
    _lastUpdate = 0;
    _animRef = React.createRef<HTMLDivElement>();

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

        // initialize animation after mounting
        if (this.props.animated !== false && this._animRef.current !== null) {
            const animHost = this._animRef.current.querySelector('.ss-anim') as HTMLElement;
            if (animHost !== null) {
                new Animation(this.props.sim, animHost, this.getAnimationOptions());
                this.initializeAnimation(animHost);
            }
        }
    }
    componentWillUnmount() {
        this.props.sim.stop(true);
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
            stopText = String.fromCharCode(9632) + ' Stop',
            animHtml = this.getAnimationHostHtml();
        return <div className='sim-cmp'>
            <div className='sim-params'>
                {this.renderParams()}
            </div>
            <div className='sim-animation' ref={this._animRef}>
                {this.props.animated !== false && animHtml != null && <HTMLDiv html={animHtml} />}
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

    // no animation by default
    getAnimationHostHtml(): string | null{
        return null;
    }
    getAnimationOptions(): any {
        return null;
    }
    initializeAnimation(animHost: HTMLElement) {
        // override to initialize animation
    }
}


///////////////////////////////////////////////////////////////////////////////
// component that provides two-way binding to numeric values
interface IParameterProps<T> {
    label: string,
    value: T,
    min?: number,
    max?: number,
    change: (value: T) => void,
    parent: React.Component,
    suffix?: string,
}
export function NumericParameter(props: IParameterProps<number>) {
    return <label>
        <HTMLSpan html={props.label} />
        <input type='range'
            min={props.min}
            max={props.max}
            value={props.value}
            onChange={e => {
                props.change(e.target.valueAsNumber);
                props.parent.forceUpdate();
            }} />
        {props.suffix}
    </label>;
}
export function BooleanParameter(props: IParameterProps<boolean>) {
    return <label>
        <HTMLSpan html={props.label} />
        <input type='checkbox'
            checked={props.value}
            onChange={e => {
                props.change(e.target.checked);
                props.parent.forceUpdate();
            }} />
        {props.suffix}
    </label>;
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