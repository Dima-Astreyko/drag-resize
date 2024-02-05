import { ChangeDetectionStrategy, Component, ElementRef, inject, Input } from '@angular/core';
import { CdkDrag, Point } from "@angular/cdk/drag-drop";
import { DOCUMENT } from "@angular/common";

function diff(mouseEvent: Point, startPosition: Point): Point {
  return {
    x: startPosition.x - mouseEvent.x,
    y: startPosition.y - mouseEvent.y
  }
}

interface ElementRect extends Point {
  width: number;
  height: number;
}

@Component({
  selector: 'app-resizable',
  templateUrl: './resizable.component.html',
  styleUrls: ['./resizable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ResizableComponent {
  cdkDrag = inject(CdkDrag)
  elementRef = inject(ElementRef);
  document: Document = inject(DOCUMENT);

  @Input() set initialRect(rect: ElementRect) {
    this.height = rect.height;
    this.width = rect.width;
    this.cdkDrag.setFreeDragPosition(rect);
  }

  set width(width: number) {
    this.elementRef.nativeElement.style.width = `${width}px`;
  }

  get width() {
    return (this.elementRef.nativeElement as HTMLElement).offsetWidth;
  }

  set height(height: number) {
    this.elementRef.nativeElement.style.height = `${height}px`;
  }

  get height() {
    return (this.elementRef.nativeElement as HTMLElement).offsetHeight;
  }

  startResize(event: MouseEvent, handleResize: (delta: Point, startElementRect: ElementRect, boundaryRect: ElementRect) => ElementRect) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const boundaryElement = document.querySelector(this.cdkDrag.boundaryElement as string);
    const boundaryRect = boundaryElement.getBoundingClientRect();
    const startElementRect = {
      ...this.cdkDrag.getFreeDragPosition(),
      width: this.width,
      height: this.height,
    }
    const duringResize = (mouseEvent: MouseEvent): void => {
      const delta = diff(mouseEvent, event);
      const nextElementRect = handleResize(delta, startElementRect, boundaryRect);
      this.keepInBoundaries(nextElementRect, startElementRect, boundaryRect);
      this.width = nextElementRect.width;
      this.height = nextElementRect.height;
      this.cdkDrag.setFreeDragPosition(nextElementRect);
    };

    const finishResize = (): void => {
      this.document.removeEventListener('mousemove', duringResize);
      this.document.removeEventListener('mouseup', finishResize);
    };

    this.document.addEventListener('mousemove', duringResize);
    this.document.addEventListener('mouseup', finishResize);
  }

  private keepInBoundaries(elementRect: ElementRect, startRect: ElementRect, boundaryRect: DOMRect) {
    elementRect.x = Math.min(elementRect.x, boundaryRect.width - startRect.width);
    elementRect.x = Math.max(elementRect.x, 0);
    elementRect.y = Math.min(elementRect.y, boundaryRect.height - startRect.height);
    elementRect.y = Math.max(elementRect.y, 0);
  }

  handleTopLeft = (delta: Point, startElementRect: ElementRect, boundaryRect: ElementRect) => {
    const width = startElementRect.width + delta.x;
    const height = startElementRect.height + delta.y;
    return {
      width: Math.min(width, startElementRect.x + startElementRect.width),
      height: Math.min(height, startElementRect.y + startElementRect.height),
      x: startElementRect.x - delta.x,
      y: startElementRect.y - delta.y,
    }
  }

  handleBottomLeft = (delta: Point, startElementRect: ElementRect, boundaryRect: ElementRect) => {
    const width = startElementRect.width + delta.x;
    const height = startElementRect.height - delta.y;
    return {
      width: Math.min(width, startElementRect.x + startElementRect.width),
      height: Math.min(height, boundaryRect.height - startElementRect.y),
      x: startElementRect.x - delta.x,
      y: startElementRect.y,
    }
  }

  handleTopRight = ( delta: Point, startElementRect: ElementRect, boundaryRect: ElementRect) => {
    const width = startElementRect.width - delta.x;
    const height = startElementRect.height + delta.y;
    return {
      width: Math.min(width, boundaryRect.width - startElementRect.x),
      height: Math.min(height, startElementRect.y + startElementRect.height),
      x: startElementRect.x,
      y: startElementRect.y - delta.y,
    }
  }

  handleBottomRight = (delta: Point, startElementRect: ElementRect, boundaryRect: ElementRect) => {
    const width = startElementRect.width - delta.x;
    const height = startElementRect.height - delta.y;
    return {
      width: Math.min(width, boundaryRect.width - startElementRect.x),
      height: Math.min(height, boundaryRect.height - startElementRect.y),
      x: startElementRect.x,
      y: startElementRect.y,
    }
  }
}
