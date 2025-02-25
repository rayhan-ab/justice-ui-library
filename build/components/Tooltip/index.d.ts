import * as React from "react";
import "./index.scss";
import "../../styles/icons/fa_icons.css";
export interface TooltipProps {
    content: string;
    children?: React.ReactNode;
    noClipboard?: boolean;
    positionRight?: boolean;
    narrow?: boolean;
    medium?: boolean;
    isBoxed?: boolean;
    onCopySuccess?: () => void;
    isTooltipShownOnOverflowOnly?: boolean;
}
export declare const Tooltip: ({ content, children, noClipboard, positionRight, narrow, medium, isBoxed, isTooltipShownOnOverflowOnly, onCopySuccess, }: TooltipProps) => JSX.Element;
