import * as React from "react";
import {CurveComponent} from "./CurveComponent";
import {PiecewiseBezier} from "three.quarks";
import {HandleComponent} from "./HandleComponent";
import {ScaleComponent} from "./ScaleComponent";
import {createRef} from "react";

interface BezierCurvesEditorProps {
    value: PiecewiseBezier
    onChange?: (value:PiecewiseBezier) => void,
    width: number,
    height: number,
    padding?: Array<number>,
    className?: string,
    background?: string,
    gridColor?: string,
    curveColor?: string,
    handleColor?: string,
    curveWidth?: number,
    handleRadius?: number,
    handleStroke?: number,
    readOnly?: boolean,
    style?: React.CSSProperties,
    pointers?: React.CSSProperties,
    textStyle?: React.CSSProperties,
}

interface BezierCurvesEditorState {
    curve: number,
    hover: number,
    down: number,
    bezier: PiecewiseBezier,
    heightScaler: number,
}

export class BezierCurvesEditor extends React.PureComponent<BezierCurvesEditorProps, BezierCurvesEditorState> {

    static defaultP = {
        padding: [0, 0, 0, 0],
        handleRadius: 4,
    }; //[25, 5, 25, 18]

    constructor(props: Readonly<BezierCurvesEditorProps>) {
        super(props);
        this.state = {
            curve: -1,
            down: -1,
            hover: -1,
            bezier: new PiecewiseBezier(this.props.value.functions),
            heightScaler: 1.0,
        };
    }

    rootRef = createRef<HTMLDivElement>();

    private _scaledCurves:any;
    private _heightScaler = 1.0;

    componentDidUpdate = (prevProps:any) => {

        if(prevProps.value !== this.props.value)
        {
            //console.log("componentDidUpdate");
            this.scaleHeight();

            const newBezier = new PiecewiseBezier(this._scaledCurves);

            this.setState({
                bezier: newBezier,
            });
        }
    }

    componentWillMount = () => {
        this.scaleHeight();
    }

    positionForEvent = (e: React.MouseEvent) => {
        if (this.rootRef.current) {
            const rect = this.rootRef.current.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        } else {
            return [0, 0];
        }
    };

    x = (value:number) => {
    };

    y = (value:number) => {
    };

    inversex = (x:number) => {
    };

    inversey = (y:number) => {
    };

    scaleHeight = () => {

        //console.log("scaleHeight");

        let maxHeight = 0;

        const scaledBezier = new PiecewiseBezier(this.props.value.functions);

        //console.log("before scaling:",JSON.stringify(scaledBezier))

        scaledBezier.functions.forEach(curve => {
            curve[0]['p'].forEach(y => {
                if(y > maxHeight) {
                    maxHeight = y;
                }
            })
        })

        const roundedMax = Math.floor(maxHeight);
        const roundedMaxStr = roundedMax.toString();
        const numWholeDigits = roundedMaxStr.length;

        this._heightScaler = 1.0;
        
        if(roundedMax > 0)
        {
            const firstDigit = parseInt(roundedMaxStr.charAt(0));
            let maxRangeStr = (firstDigit+1).toString();
            maxRangeStr = maxRangeStr.padEnd(numWholeDigits + maxRangeStr.length - 1, "0");
            this._heightScaler = parseFloat(maxRangeStr); 
        }

        for (let i = 0; i < scaledBezier.numOfFunctions; i++)
        {
            const curve = scaledBezier.getFunction(i);
            curve.p = curve.p.map(y => y/this._heightScaler);
            scaledBezier.setFunction(i, curve.clone());
        }

        this.setState({
            heightScaler: this._heightScaler,
        });

        //console.log("after scaling:",JSON.stringify(scaledBezier))

        this._scaledCurves = scaledBezier.functions;
    };

    onChange = () => {

        if (this.props.onChange)
        {
            //console.log("onChange");

            const unscaledBezier = new PiecewiseBezier(this.state.bezier.functions);
            //console.log("before unscaling:",JSON.stringify(unscaledBezier))

            for (let i = 0; i < unscaledBezier.numOfFunctions; i++)
            {
                const curve = unscaledBezier.getFunction(i);
                curve.p = curve.p.map(y => y*this._heightScaler);
                unscaledBezier.setFunction(i, curve.clone());
            }

            //console.log("after unscaling:",JSON.stringify(unscaledBezier))

            this.props.onChange(unscaledBezier);
        }
    };

    onDownLeave = (e: React.MouseEvent) => {

        if (this.state.down >= 0)
        {
            this.onDownMove(e);
            this.setState({
                down: -1,
                hover: -1
            });

            this.onChange();
        }
    };

    onDownMove = (e: React.MouseEvent) => {
        if (this.state.down >= 0) {
            e.preventDefault();
            const [x, y] = this.positionForEvent(e);
            const value = new PiecewiseBezier(this._scaledCurves);

            const valueX = x / this.props.width;
            const curveIndex = this.state.curve;
            const curve = value.getFunction(curveIndex);

            if (this.state.down === 0) {
                const old = curve.p[0];
                curve.p[0] = (this.props.height - y) / this.props.height;
                curve.p[1] += curve.p[0] - old;
                value.setStartX(curveIndex, x / this.props.width);
                if (curveIndex - 1 >= 0) {
                    const pCurve = value.getFunction(curveIndex - 1);
                    pCurve.p[3] = (this.props.height - y) / this.props.height;
                    pCurve.p[2] += curve.p[0] - old;
                    value.setFunction(curveIndex - 1, value.getFunction(curveIndex - 1).clone());
                }
                value.setFunction(curveIndex, curve.clone());
            }
            if (this.state.down === 3) {
                const old = curve.p[3];
                curve.p[3] = (this.props.height - y) / this.props.height;
                curve.p[2] += curve.p[3] - old;
                value.setEndX(curveIndex, x / this.props.width);
                if (curveIndex + 1 < value.numOfFunctions) {
                    const nCurve = value.getFunction(curveIndex + 1);
                    nCurve.p[0] = (this.props.height - y) / this.props.height;
                    nCurve.p[1] += curve.p[3] - old;
                    value.setFunction(curveIndex + 1, value.getFunction(curveIndex + 1).clone());
                }
                value.setFunction(curveIndex, curve.clone());
            }
            if (this.state.down === 1) {
                curve.p[1] = (this.props.height - y) / this.props.height;
                value.setFunction(curveIndex, curve.clone());
            }
            if (this.state.down === 2) {
                curve.p[2] = (this.props.height - y) / this.props.height;
                value.setFunction(curveIndex, curve.clone());
            }

            //console.log(value);

            this.setState({
                bezier: value,
            });
        }
    };

    onDownUp = () => {
        this.setState({
            down: -1,
        });

        this.onChange();
    };


    onEnterHandle(curve: number, h: number) {
        if (!this.state.down) {
            this.setState({
                hover: h,
                curve: curve,
            });
        }
    }
    onDownHandle(curve: number, h: number, e: React.MouseEvent) {
        e.preventDefault();
        this.setState({
            hover: -1,
            down: h,
            curve: curve,
        });
    }

    onLeaveHandle() {
        if (!this.state.down) {
            this.setState({
                hover: -1,
            });
        }
    }

    render() {

        const {
            width,
            height,
            curveWidth = 1,
            curveColor = "#000",
            handleRadius = BezierCurvesEditor.defaultP.handleRadius,
            handleColor = "#f00",
            handleStroke = 1,
            background = "#fff",
        } = this.props;

        const {
            curve: curveIndex,
            down,
            hover,
            bezier,
            heightScaler,
        } = this.state;

        const curves = [];
        for (let i = 0; i < bezier.numOfFunctions; i ++) {

            const x1 = bezier.getStartX(i);
            const x2 = bezier.getEndX(i);
            const curve = bezier.getFunction(i);
            const slope0 = curve.getSlope(0);
            const slope1 = curve.getSlope(1);

            curves.push(
                <g key={i}>
                    <CurveComponent xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        curveColor={curveColor} curveWidth={curveWidth} value={curve}/>
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 0, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 0)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={0}
                        ystart={curve.p[0]}
                        xval={0}
                        yval={curve.p[0]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 0}
                        hover={curveIndex === i && hover === 0}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 1, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 1)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={0}
                        ystart={curve.p[0]}
                        xval={1.0 / 3}
                        yval={1.0 / 3 * slope0 + curve.p[0]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 1}
                        hover={curveIndex === i && hover === 1}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 2, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 2)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={1}
                        ystart={curve.p[3]}
                        xval={1 - 1.0 / 3}
                        yval={curve.p[3] - 1.0 / 3 * slope1}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 2}
                        hover={curveIndex === i && hover === 2}
                        handleStroke={handleStroke}
                        background={background}
                    />
                    <HandleComponent
                        xFrom={x1 * width} xTo={x2 * width} yFrom={height} yTo={0}
                        onMouseDown={(e)=>this.onDownHandle(i, 3, e)}
                        onMouseEnter={(e)=>this.onEnterHandle(i, 3)}
                        onMouseLeave={(e)=>this.onLeaveHandle()}
                        xstart={1}
                        ystart={curve.p[3]}
                        xval={1}
                        yval={curve.p[3]}
                        handleRadius={handleRadius}
                        handleColor={handleColor}
                        down={curveIndex === i && down === 3}
                        hover={curveIndex === i && hover === 3}
                        handleStroke={handleStroke}
                        background={background}
                    />
                </g>);
        }
        return <div style={{'background':'#eee'}} ref={this.rootRef}
                    onMouseMove={this.onDownMove}
                    onMouseUp={this.onDownUp}
                    onMouseLeave={this.onDownLeave}>
            <svg width={width} height={height}>
                <ScaleComponent xFrom={0} xTo={width} yFrom={2} yTo={2} lineColor={"#000"} lineWidth={1} scale={heightScaler.toString()}/>
                {curves}
            </svg>
        </div>;
    }
}
