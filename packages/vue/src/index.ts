import "@ac-grid/core";
import { defineComponent, h, onMounted, onUpdated, ref } from "vue";
import type { PropType } from "vue";
import { syncGridProperties } from "@ac-grid/core";
import type { ColumnDef, FrameworkGridProps } from "@ac-grid/core";

export type AcGridProps<TData> = FrameworkGridProps<TData>;

export const AcGrid = defineComponent({
  name: "AcGrid",
  props: {
    data: { type: Array as PropType<{ userId?: string }[]>, required: true },
    columns: {
      type: Array as PropType<ColumnDef<any, any>[]>,
      required: true,
    },
    gridProps: {
      type: Object as PropType<FrameworkGridProps<any>["gridProps"]>,
      default: () => ({}),
    },
  },
  setup(props) {
    const element = ref<HTMLElement | null>(null);
    const sync = () => {
      if (!element.value) return;
      syncGridProperties(element.value, {
        data: props.data,
        columns: props.columns,
        gridProps: props.gridProps,
      });
    };
    onMounted(sync);
    onUpdated(sync);
    return () => h("wsx-ac-grid", { ref: element });
  },
});
