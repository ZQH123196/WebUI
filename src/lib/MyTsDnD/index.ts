/**
 * MyTsDnD - 一个为 UE WebBrowser 优化的纯 JS 拖拽库
 * 核心原理：基于 Mouse Events 和 elementFromPoint，避开不稳定的 HTML5 Drag API
 */

export interface MyTsDnDOptions {
    /** 列表中每一项的选择器 */
    itemSelector: string;
    /** 拖拽源添加的类名 */
    draggingClass?: string;
    /** 目标落点（鼠标下方）添加的类名 */
    targetClass?: string;
    /** 当鼠标松开并确认落点时的回调 */
    onSwap?: (oldIndex: number, newIndex: number) => void;
}

export class MyTsDnD {
    private container: HTMLElement;
    private options: MyTsDnDOptions;
    private startIdx: number | null = null;
    private lastTargetIdx: number | null = null;
    private isActive: boolean = false;

    constructor(container: HTMLElement, options: MyTsDnDOptions) {
        this.container = container;
        this.options = {
            draggingClass: 'is-dragging',
            targetClass: 'drop-target',
            ...options
        };
        this.init();
    }

    private init() {
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    }

    private handleMouseDown(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const itemElement = target.closest(this.options.itemSelector) as HTMLElement;

        if (itemElement && this.container.contains(itemElement)) {
            // 关键修复：防止浏览器触发原生的图片/文字拖拽行为
            // 在 UE WebBrowser 中，如果不阻止默认行为，拖拽含有内容的元素会触发系统级 DragSession
            // 导致 mousemove 事件无法正常传递给 JS 处理。
            event.preventDefault();

            const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));
            const index = items.indexOf(itemElement);

            if (index !== -1) {
                this.startDrag(index, itemElement);
            }
        }
    }

    private startDrag(index: number, element: HTMLElement) {
        if (this.isActive) return;
        this.isActive = true;
        this.startIdx = index;
        this.lastTargetIdx = index;

        if (this.options.draggingClass) {
            element.classList.add(this.options.draggingClass);
        }

        const onMouseMove = (e: MouseEvent) => {
            if (this.startIdx === null) return;

            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            const targetItem = hoveredEl?.closest(this.options.itemSelector) as HTMLElement;

            // 清理之前的目标样式
            this.clearTargetClasses();

            if (targetItem && this.container.contains(targetItem)) {
                const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));
                const targetIdx = items.indexOf(targetItem);

                if (targetIdx !== -1) {
                    this.lastTargetIdx = targetIdx;
                    // 给潜在目标添加高亮样式
                    if (this.options.targetClass && targetIdx !== this.startIdx) {
                        targetItem.classList.add(this.options.targetClass);
                    }
                }
            } else {
                // 如果鼠标移出了容器，将目标重置为起点（即不交换）
                this.lastTargetIdx = this.startIdx;
            }
        };

        const stopDrag = () => {
            const finalStartIdx = this.startIdx;
            const finalTargetIdx = this.lastTargetIdx;

            this.isActive = false;
            this.startIdx = null;
            this.lastTargetIdx = null;

            // 清理所有样式
            this.clearAllClasses();

            // 只有在鼠标松开时，才执行交换
            if (this.options.onSwap && finalStartIdx !== null && finalTargetIdx !== null && finalStartIdx !== finalTargetIdx) {
                this.options.onSwap(finalStartIdx, finalTargetIdx);
            }

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stopDrag);
    }

    private clearTargetClasses() {
        if (this.options.targetClass) {
            this.container.querySelectorAll(this.options.itemSelector).forEach(el => {
                el.classList.remove(this.options.targetClass!);
            });
        }
    }

    private clearAllClasses() {
        const selector = this.options.itemSelector;
        this.container.querySelectorAll(selector).forEach(el => {
            if (this.options.draggingClass) el.classList.remove(this.options.draggingClass);
            if (this.options.targetClass) el.classList.remove(this.options.targetClass);
        });
    }

    public destroy() {
        this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    }
}
