/*
 * Copyright (c) 2021 AccelByte Inc. All Rights Reserved.
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */

import * as React from "react";
import { default as classNames } from "classnames";
import { Enum } from "../../types";
import { CONTAINER_SIZE } from "../../constants";
import { DropdownItem, DropdownItemGroup, DropdownMenu } from "../Dropdown";
import "./index.scss";
import { translation } from "../../utils/i18n";
import "../../styles/icons/fa_icons.css";

export interface ItemTab {
  tabName: string;
  url: string;
  isActive: boolean;
  dataQa?: string | null;
  dataQaProps?: string | null;
  id?: string;
}

const NAVIGATION_OFFSET = 100;
const UPDATE_INTERVAL = 100;

export interface NavigationTabProps {
  config: ItemTab[];
  changePage?: (url: string) => void;
  isChangeRoute?: boolean;
  changePageKey?: (url: string) => void;
  isVertical?: boolean;
  containerSize?: Enum<typeof CONTAINER_SIZE>;
  noPadding?: boolean;
}

export const NavigationTab = ({
  isVertical,
  isChangeRoute = true,
  containerSize = "FULLWIDTH",
  noPadding = false,
  config,
  changePageKey,
  changePage,
}: NavigationTabProps) => {
  const [shownTabs, setShownTabs] = React.useState<ItemTab[]>(config);
  const [hiddenTabs, setHiddenTabs] = React.useState<ItemTab[]>([]);
  const [accumulativeNavWidth, setAccumulativeNavWidth] = React.useState<number[]>([]);
  const [maxShownTabs, setMaxShownTabs] = React.useState<number>(config.length);
  const [navigationWidth, setNavigationWidth] = React.useState<number>(0);

  const navigationWrapperRef = React.useRef<HTMLDivElement>(null);
  const moreButtonRef = React.useRef<HTMLDivElement>(null);

  const updateNavigationWidth = () => {
    if (navigationWrapperRef.current) {
      const { clientWidth } = navigationWrapperRef.current;
      setNavigationWidth(clientWidth);
    }
  };

  const updateNavigationWidthWithInterval = () => {
    const updateWidthInterval = setInterval(() => {
      if (navigationWrapperRef.current) {
        const { clientWidth } = navigationWrapperRef.current;
        setNavigationWidth(clientWidth);
        if (clientWidth) clearInterval(updateWidthInterval);
      }
    }, UPDATE_INTERVAL);
  };

  const calculateAccumulativeNavigationWidth = () => {
    if (navigationWrapperRef.current && !isVertical) {
      const navigationItems = Array.from(navigationWrapperRef.current.children);
      const navigationItemsWidth: number[] = [];

      navigationItems.forEach((item, index) => {
        const previousWidth = index ? navigationItemsWidth[index - 1] : 0;
        const currentWidth = item.clientWidth + previousWidth;
        navigationItemsWidth.push(currentWidth);
      });
      setAccumulativeNavWidth(navigationItemsWidth);
    }
  };

  const onClickTab = (isChangeRoute: boolean, url: string) => {
    isChangeRoute ? changePage && changePage(url) : changePageKey && changePageKey(url);
  };

  const unhideActiveHiddenTab = (maxShown: number = maxShownTabs) => {
    setTimeout(() => {
      const updatedConfig = [...config];
      const activeIndex = updatedConfig.findIndex((configItem) => configItem.isActive);

      if (activeIndex >= maxShown && maxShown > 0) {
        const activeTab = updatedConfig[activeIndex];
        updatedConfig.splice(activeIndex, 1);
        updatedConfig.splice(maxShown - 1, 0, activeTab);
      }

      setShownTabs(updatedConfig.slice(0, maxShown));
      setHiddenTabs(updatedConfig.slice(maxShown));
      if (navigationWrapperRef.current && moreButtonRef.current) {
        const navWrapperRight = navigationWrapperRef.current.getBoundingClientRect().right;
        const moreButtonRight = moreButtonRef.current.getBoundingClientRect().right;
        if (moreButtonRight > navWrapperRight) {
          unhideActiveHiddenTab(maxShown - 1);
        }
      }
    }, UPDATE_INTERVAL / 10);
  };

  React.useEffect(() => {
    if (isVertical) return;

    updateNavigationWidthWithInterval();
    window.addEventListener("resize", updateNavigationWidth);

    return () => window.removeEventListener("resize", updateNavigationWidth);
  }, []);

  React.useEffect(() => {
    if (isVertical) {
      setShownTabs(config);
      return;
    }
    unhideActiveHiddenTab();
  }, [config]);

  React.useEffect(() => {
    if (isVertical) return;
    if (!!navigationWidth && !accumulativeNavWidth.length) {
      calculateAccumulativeNavigationWidth();
    }
    if (accumulativeNavWidth.length) {
      const maxTabsToShow = accumulativeNavWidth.filter((width) => width + NAVIGATION_OFFSET < navigationWidth).length;
      setMaxShownTabs(maxTabsToShow);
      unhideActiveHiddenTab(maxTabsToShow);
    }
  }, [navigationWidth, accumulativeNavWidth]);

  const renderedTabs = shownTabs.map((tab: ItemTab) => {
    return (
      <div
        key={tab.url}
        className={classNames("tab-item", { "tab-active": tab.isActive })}
        onClick={() => onClickTab(isChangeRoute, tab.url)}
        data-qa-id={tab.dataQa}
        data-qa-props={tab.dataQaProps}
        id={tab.id}
      >
        {tab.tabName}
      </div>
    );
  });

  const renderMoreButton = () => (
    <div className="tab-item" ref={moreButtonRef}>
      <DropdownMenu
        position="bottom right"
        trigger={
          <span className="d-flex align-items-center">
            {translation("common.more")}
            <i className="fa-icon-chevron-down" />
          </span>
        }
      >
        <DropdownItemGroup>
          {hiddenTabs.map((tab, index) => {
            return (
              <DropdownItem key={`${tab.tabName}-${index}`} onClick={() => onClickTab(isChangeRoute, tab.url)}>
                {tab.tabName}
              </DropdownItem>
            );
          })}
        </DropdownItemGroup>
      </DropdownMenu>
    </div>
  );

  return (
    <div
      className={classNames(
        isVertical ? "tab-navigation--vertical" : "tab-navigation",
        containerSize === CONTAINER_SIZE.SMALL && "tab-navigation--small",
        containerSize === CONTAINER_SIZE.LARGE && "tab-navigation--large",
        containerSize === CONTAINER_SIZE.FULLWIDTH && "tab-navigation--full"
      )}
    >
      <div className={classNames("wrapper", { "no-padding": noPadding })} ref={navigationWrapperRef}>
        {renderedTabs}
        {!!hiddenTabs.length && renderMoreButton()}
      </div>
    </div>
  );
};
