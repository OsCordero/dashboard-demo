import React from 'react';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { ChartCanvas, Chart } from 'react-stockcharts';
import {
  CandlestickSeries,
  RSISeries,
  LineSeries,
} from 'react-stockcharts/lib/series';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import {
  CrossHairCursor,
  MouseCoordinateY,
  MouseCoordinateX,
} from 'react-stockcharts/lib/coordinates';
import { ema, rsi, atr, sma } from 'react-stockcharts/lib/indicator';
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import {
  RSITooltip,
  OHLCTooltip,
  SingleValueTooltip,
} from 'react-stockcharts/lib/tooltip';
import { last } from 'react-stockcharts/lib/utils';
import { fitWidth } from 'react-stockcharts/lib/helper';

const CandleChart = ({ data: initialData, width }) => {
  const mouseEdgeAppearance = {
    textFill: '#542605',
    stroke: '#05233B',
    strokeOpacity: 1,
    strokeWidth: 3,
    arrowWidth: 5,
    fill: '#BCDEFA',
  };
  console.log(initialData);

  const ema26 = ema()
    .id(0)
    .options({ windowSize: 26 })
    .merge((d, c) => {
      d.ema26 = c;
    })
    .accessor(d => d.ema26);

  const ema12 = ema()
    .id(1)
    .options({ windowSize: 12 })
    .merge((d, c) => {
      d.ema12 = c;
    })
    .accessor(d => d.ema12);

  const smaVolume50 = sma()
    .id(3)
    .options({ windowSize: 50, sourcePath: 'volume' })
    .merge((d, c) => {
      d.smaVolume50 = c;
    })
    .accessor(d => d.smaVolume50);

  const rsiCalculator = rsi()
    .options({ windowSize: 14 })
    .merge((d, c) => {
      d.rsi = c;
    })
    .accessor(d => d.rsi);

  const atr14 = atr()
    .options({ windowSize: 14 })
    .merge((d, c) => {
      d.atr14 = c;
    })
    .accessor(d => d.atr14);

  const calculatedData = ema26(
    ema12(smaVolume50(rsiCalculator(atr14(initialData))))
  );

  const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
    d => new Date(d.date)
  );

  const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
    calculatedData
  );

  const start = xAccessor(last(data));
  const end = xAccessor(data[Math.max(0, data.length - 150)]);
  const xExtents = [start, end];
  return (
    <ChartCanvas
      height={600}
      width={width}
      ratio={1}
      margin={{ left: 50, right: 50, top: 20, bottom: 30 }}
      type="svg"
      seriesName="MSFT"
      data={data}
      xScale={xScale}
      xAccessor={xAccessor}
      displayXAccessor={displayXAccessor}
      xExtents={xExtents}
    >
      <Chart
        id={1}
        height={300}
        yExtents={[d => [d.high, d.low], ema26.accessor(), ema12.accessor()]}
        padding={{ top: 10, bottom: 20 }}
      >
        <XAxis
          axisAt="bottom"
          orient="bottom"
          showTicks={false}
          outerTickSize={0}
        />
        <YAxis axisAt="right" orient="right" ticks={5} />

        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format('.2f')}
          {...mouseEdgeAppearance}
        />

        <OHLCTooltip origin={[-40, 0]} />
        <CandlestickSeries />
      </Chart>
      <Chart
        id={3}
        yExtents={[0, 100]}
        height={125}
        origin={(w, h) => [0, h - 250]}
      >
        <XAxis
          axisAt="bottom"
          orient="bottom"
          showTicks={false}
          outerTickSize={0}
        />
        <YAxis axisAt="right" orient="right" tickValues={[30, 50, 70]} />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format('.2f')}
        />

        <RSISeries yAccessor={d => d.rsi} />

        <RSITooltip
          origin={[-38, 15]}
          yAccessor={d => d.rsi}
          options={rsiCalculator.options()}
        />
      </Chart>
      <Chart
        id={8}
        yExtents={atr14.accessor()}
        height={125}
        origin={(w, h) => [0, h - 125]}
        padding={{ top: 10, bottom: 10 }}
      >
        <XAxis axisAt="bottom" orient="bottom" />
        <YAxis axisAt="right" orient="right" ticks={2} />

        <MouseCoordinateX
          at="bottom"
          orient="bottom"
          displayFormat={timeFormat('%Y-%m-%d')}
        />
        <MouseCoordinateY
          at="right"
          orient="right"
          displayFormat={format('.2f')}
        />

        <LineSeries yAccessor={atr14.accessor()} stroke={atr14.stroke()} />
        <SingleValueTooltip
          yAccessor={atr14.accessor()}
          yLabel={`ATR (${atr14.options().windowSize})`}
          yDisplayFormat={format('.2f')}
          /* valueStroke={atr14.stroke()} - optional prop */
          /* labelStroke="#4682B4" - optional prop */
          origin={[-40, 15]}
        />
      </Chart>
      <CrossHairCursor />
    </ChartCanvas>
  );
};

const CandleChartFixed = fitWidth(CandleChart);
export default CandleChartFixed;
