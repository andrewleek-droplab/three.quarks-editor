import React from "react";

export interface ScaleProps {
    lineColor: string;
    lineWidth: number;
    xFrom: number;
    yFrom: number;
    xTo: number;
    yTo: number;
}

export class ScaleComponent extends React.Component<ScaleProps> {

    render() {
        const {
            lineColor,
            lineWidth,
            xFrom,
            yFrom,
            xTo,
            yTo,
        } = this.props;

        return (
            <g key='scale-line'>
                <line 
                    x1={xFrom}
                    y1={yFrom}
                    x2={xTo}
                    y2={yTo}
                    stroke={lineColor}
                    strokeWidth={lineWidth}
                />
            </g>);
    }
}
