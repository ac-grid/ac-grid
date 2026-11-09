<script lang="ts" generics="TData">
    import "@ac-grid/core";
    import { syncGridProperties } from "@ac-grid/core";
    import type { FrameworkGridProps } from "@ac-grid/core";

    let { data, columns, gridProps = {} }: {
        data: TData[];
        columns: FrameworkGridProps<TData>["columns"];
        gridProps?: FrameworkGridProps<TData>["gridProps"];
    } = $props();

    let element: HTMLElement | undefined = $state();
    $effect(() => {
        if (element) syncGridProperties(element, { data, columns, gridProps });
    });
</script>

<wsx-ac-grid bind:this={element}></wsx-ac-grid>
