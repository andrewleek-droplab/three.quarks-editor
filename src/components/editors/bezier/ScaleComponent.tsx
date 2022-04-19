import React from "react";

export interface ScaleProps {
    lineColor: string;
    lineWidth: number;
    xFrom: number;
    yFrom: number;
    xTo: number;
    yTo: number;
    scale: string;
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
            scale,
        } = this.props;

        return (
            <g key='scale'>
                <text x={xFrom+1} y={yFrom+15}>{scale}</text>
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
