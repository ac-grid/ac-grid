import "@ac-grid/core";
import { createElement, useLayoutEffect, useRef } from "react";
import { syncGridProperties } from "@ac-grid/core";
import type { FrameworkGridProps } from "@ac-grid/core";
import type { Ref } from "react";

export type AcGridProps<TData> = FrameworkGridProps<TData>;

export function AcGrid<TData>({
  data,
  columns,
  gridProps,
}: AcGridProps<TData>) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    syncGridProperties(element, { data, columns, gridProps });
  }, [data, columns, gridProps]);

  return createElement("wsx-ac-grid", { ref: ref as Ref<HTMLElement> });
}
