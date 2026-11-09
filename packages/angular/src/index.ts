import "@ac-grid/core";
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { syncGridProperties } from "@ac-grid/core";
import type { ColumnDef, GridConfiguration } from "@ac-grid/core";

@Component({
  selector: "ac-grid",
  standalone: true,
  template: "<wsx-ac-grid #grid></wsx-ac-grid>",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AcGrid<TData> implements AfterViewInit, OnChanges {
  @Input({ required: true }) data!: TData[];
  @Input({ required: true }) columns!: ColumnDef<TData, any>[];
  @Input() gridProps: GridConfiguration = {};
  @ViewChild("grid", { static: true })
  private gridElement!: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    this.syncProperties();
  }
  ngOnChanges(_changes: SimpleChanges): void {
    this.syncProperties();
  }

  private syncProperties(): void {
    const element = this.gridElement?.nativeElement;
    if (element)
      syncGridProperties(element, {
        data: this.data,
        columns: this.columns,
        gridProps: this.gridProps,
      });
  }
}
