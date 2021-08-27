import { format } from 'simscript';

/**
 * Defines parameters for series in a chart created by the
 * {@link getLineChart} method.
 */
 interface IChartSeries {
    /** The series name as shown in the legend. */
    name?: string,
    /** The series color (defaults to black). */
    color?: string,
    /** The series line width (defaults to 3px). */
    width?: string,
    /** Whether to show points with tooltpis along the line (dafaults to false). */
    showPoints?: boolean,
    /** An array containing the series data. */
    data: number[]
}

/**
 * Gets an HTML string showing numeric arrays as an SVG line chart.
 * @param title Chart title.
 * @param series Array of {@link IChartSeries} objects.
 * @returns A string showing the series as an SVG line chart.
 */
export function getLineChart(title: string, ...series: IChartSeries[]): string {

    // get max and min (accounting for all series)
    let max: number = Number.NEGATIVE_INFINITY;
    let min: number = Number.POSITIVE_INFINITY;
    series.forEach((s: IChartSeries) => {
        min = Math.min(min, Math.min.apply(null, s.data));
        max = Math.max(max, Math.max.apply(null, s.data));
    });
    const rng = (max - min) || 1;

    // start chart
    let svg = `<svg xmlns='http://www.w3.org/2000/svg' class='ss-chart' fill='none'>`;

    // add box
    svg += `<rect width='100%' height='100%' stroke='black' />`;

    // chart margins
    const margin = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
    };
    
    // add each series
    series.forEach((s: IChartSeries) => {
        if (s.data.length > 1) {

            // create line group
            svg += `<g stroke='${s.color || 'black'}' stroke-width='${s.width || '3'}'>`;
            if (s.name) {
                const
                    min = Math.min.apply(null, s.data),
                    max = Math.max.apply(null, s.data),
                    rng = min < max ? ` (min: ${format(min, 0)}, max: ${format(max, 0)})` : '';
                svg += `<title>
                    ${s.name}${rng}
                </title>`;
            }

            // add lines
            for (let i = 0; i < s.data.length - 1; i++) {
                const
                    x1 = margin.left + i / (s.data.length - 1) * (100 - margin.left - margin.right), // 10% to 90%
                    y1 = 100 - margin.bottom - (s.data[i] - min) / rng * (100 - margin.top - margin.bottom),
                    x2 = margin.left + (i + 1) / (s.data.length - 1) * (100 - margin.left - margin.right),
                    y2 = 100 - margin.bottom - (s.data[i + 1] - min) / rng * (100 - margin.top - margin.bottom);
                svg += `<line x1=${x1.toFixed(1)}% y1=${y1.toFixed(1)}% x2=${x2.toFixed(1)}% y2=${y2.toFixed(1)}% />`;
            }

            // close line group
            svg += '</g>';

            // show series points
            if (s.showPoints) {

                // create point group
                svg += `<g fill='${s.color || 'black'}' stroke='none' opacity='0.4'>`;

                // add points
                for (let i = 0; i < s.data.length - 1; i++) {
                    const
                        x1 = margin.left + i / (s.data.length - 1) * (100 - margin.left - margin.right), // 10% to 90%
                        y1 = 100 - margin.bottom - (s.data[i] - min) / rng * (100 - margin.top - margin.bottom),
                        x2 = margin.left + (i + 1) / (s.data.length - 1) * (100 - margin.left - margin.right),
                        y2 = 100 - margin.bottom - (s.data[i + 1] - min) / rng * (100 - margin.top - margin.bottom),
                        radius = `r='5px'`;

                    // show first, last, inflexion, and distant points
                    if (i === 0 ||
                        i === s.data.length - 1 ||
                        x2 - x1 > 10 ||
                        (s.data[i] - s.data[i - 1]) * (s.data[i] - s.data[i + 1]) > 0) {
                        svg += `<circle cx=${x1.toFixed(1)}% cy=${y1.toFixed(1)}% ${radius}>
                            <title>${format(s.data[i], 0)}</title>
                        </circle>`;
                    }

                    // last point
                    if (i == s.data.length - 2) {
                        svg += `<circle cx=${x2.toFixed(1)}% cy=${y2.toFixed(1)}% ${radius}>
                            <title>${format(s.data[i + 1], 0)}</title>
                        </circle>`;
                    }
                }

                // close point group
                svg += '</g>';
            }
        }
    });

    // add title
    if (title) {
        svg += `<text x='50%' y='1em' text-anchor='middle' fill='black'>${title}</text>`
    }

    // add legends
    let top = 10;
    let legend = '';
    series.forEach((s: IChartSeries) => {
        if (s.name) {
            legend += `
                <rect x='${margin.left}%' y='${top}%' width='2.5%' height='1em' fill='${s.color || 'black'}' />
                <text x='${margin.left + 3}%' y='${top + 1}%' fill='black'>${s.name}</text>`;
            top += 10;
        }
    });
    if (legend) {
        svg += `<g font-size='80%' font-weight='bold' dominant-baseline='hanging'>
            ${legend}
        </g>`;
    }


    // finish and return chart
    svg += `</svg>`;
    return svg;
}
