import { Dimensions, getDimensions } from "@mendix/widget-plugin-platform/utils/get-dimensions";
import classNames from "classnames";
import { createElement, ReactElement } from "react";
import { ChartTypeEnum, CustomLayoutProps } from "../utils/configs";
import { Chart, ChartProps } from "./Chart";

export interface ChartWidgetProps extends CustomLayoutProps, Dimensions, ChartProps {
    className: string;
    type: ChartTypeEnum;
    enableThemeConfig: boolean;
    playground: React.ReactNode | null;
}

export const ChartWidget = ({
    className,
    data,
    widthUnit,
    width,
    heightUnit,
    height
}: // showLegend,
// xAxisLabel,
// yAxisLabel,
// gridLinesMode,
// customLayout,
// customConfig,
// layoutOptions,
// configOptions,
// seriesOptions,
// type,
// enableThemeConfig,
// playground
ChartWidgetProps): ReactElement => {
    console.log("[DEV] chart widget data", data);
    if (data === undefined || data === null || data.length === 0) {
        return <div></div>;
    }
    // const themeFolderConfigs = useThemeFolderConfigs(type, enableThemeConfig);

    // const initialLayoutOptions = useMemo(
    //     () =>
    //         getModelerLayoutOptions(
    //             getCustomLayoutOptions({ showLegend, xAxisLabel, gridLinesMode, yAxisLabel }),
    //             layoutOptions,
    //             themeFolderConfigs.layout
    //         ),
    //     [showLegend, xAxisLabel, gridLinesMode, yAxisLabel, layoutOptions, themeFolderConfigs.layout]
    // );

    // const initialConfigOptions = useMemo(
    //     () => getModelerConfigOptions(configOptions, themeFolderConfigs.configuration),
    //     [configOptions, themeFolderConfigs.configuration]
    // );
    // const initialSeriesOptions = useMemo(
    //     () => getModelerSeriesOptions(seriesOptions, themeFolderConfigs.series),
    //     [seriesOptions, themeFolderConfigs.series]
    // );

    // // Waiting for datasource.
    // if (data.length === 0) {
    //     return <Fragment />;
    // }

    return (
        <div
            className={classNames("widget-chart", className)}
            style={getDimensions({ widthUnit, width, heightUnit, height })}
        >
            <Chart
                // key={data.length}
                data={data}
                // layoutOptions={initialLayoutOptions}
                // customLayout={customLayout}
                // configOptions={initialConfigOptions}
                // customConfig={customConfig}
                // seriesOptions={initialSeriesOptions}
                // playground={playground}
            />
        </div>
    );
};
