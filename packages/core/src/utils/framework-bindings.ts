import type { FrameworkGridProps } from "../types/framework-bindings";

export function syncGridProperties<TData>(
  element: HTMLElement,
  props: FrameworkGridProps<TData>,
): void {
  Object.assign(element, props.gridProps, {
    data: props.data,
    columns: props.columns,
  });
}
