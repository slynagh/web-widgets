import { CSSProperties } from "react";
import { RichTextContainerProps } from "typings/RichTextProps";

export function constructWrapperStyle(props: RichTextContainerProps, currentStyle: CSSProperties): CSSProperties {
    const { width, height } = currentStyle;
    const { minHeight, toolbarLocation, heightUnit } = props;

    const wrapperStyle: Pick<CSSProperties, "width" | "height" | "minHeight"> = { width, height };

    if (!(toolbarLocation === "inline" && heightUnit === "pixels")) {
        delete wrapperStyle.height;
    }

    if (heightUnit !== "pixels") {
        wrapperStyle.minHeight = minHeight;
    }

    return wrapperStyle;
}
