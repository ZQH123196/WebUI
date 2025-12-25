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
    /** 跟随鼠标移动的镜像元素类名 */
    mirrorClass?: string;
    /** 判定该项是否允许被拖动 */
    canDrag?: (index: number, element: HTMLElement) => boolean;
    /** 当鼠标松开并确认落点时的回调 */
    onSwap?: (oldIndex: number, newIndex: number) => void;
}

export class MyTsDnD {
    private container: HTMLElement;
    private options: MyTsDnDOptions;
    private startIdx: number | null = null;
    private lastTargetIdx: number | null = null;
    private isActive: boolean = false;
    private mirrorEl: HTMLElement | null = null;

    constructor(container: HTMLElement, options: MyTsDnDOptions) {
        this.container = container;
        this.options = {
            draggingClass: 'is-dragging',
            targetClass: 'drop-target',
            mirrorClass: 'dnd-mirror',
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
            event.preventDefault();

            const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));
            const index = items.indexOf(itemElement);

            if (index !== -1) {
                if (this.options.canDrag && !this.options.canDrag(index, itemElement)) {
                    return;
                }
                this.startDrag(index, itemElement, event);
            }
        }
    }

    private startDrag(index: number, element: HTMLElement, event: MouseEvent) {
        if (this.isActive) return;
        this.isActive = true;
        this.startIdx = index;
        this.lastTargetIdx = index;

        // 1. 创建镜像元素 (Ghost/Mirror)
        this.mirrorEl = element.cloneNode(true) as HTMLElement;
        this.mirrorEl.classList.remove(this.options.draggingClass!);
        if (this.options.mirrorClass) {
            this.mirrorEl.classList.add(this.options.mirrorClass);
        }

        // 2. 设置镜像初始样式
        const rect = element.getBoundingClientRect();
        Object.assign(this.mirrorEl.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            pointerEvents: 'none',
            zIndex: '9999',
            margin: '0',
            opacity: '0.8',
            transition: 'none'
        });

        document.body.appendChild(this.mirrorEl);

        // 3. 记录鼠标相对于元素的偏移量
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        if (this.options.draggingClass) {
            element.classList.add(this.options.draggingClass);
        }

        const onMouseMove = (e: MouseEvent) => {
            if (this.startIdx === null || !this.mirrorEl) return;

            // 4. 更新镜像位置跟随鼠标
            this.mirrorEl.style.left = `${e.clientX - offsetX}px`;
            this.mirrorEl.style.top = `${e.clientY - offsetY}px`;

            // 5. 探测落点
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            const targetItem = hoveredEl?.closest(this.options.itemSelector) as HTMLElement;

            this.clearTargetClasses();

            if (targetItem && this.container.contains(targetItem)) {
                const items = Array.from(this.container.querySelectorAll(this.options.itemSelector));
                const targetIdx = items.indexOf(targetItem);

                if (targetIdx !== -1) {
                    this.lastTargetIdx = targetIdx;
                    if (this.options.targetClass && targetIdx !== this.startIdx) {
                        targetItem.classList.add(this.options.targetClass);
                    }
                }
            } else {
                this.lastTargetIdx = this.startIdx;
            }
        };

        const stopDrag = () => {
            const finalStartIdx = this.startIdx;
            const finalTargetIdx = this.lastTargetIdx;

            this.isActive = false;
            this.startIdx = null;
            this.lastTargetIdx = null;

            // 6. 销毁镜像
            if (this.mirrorEl) {
                this.mirrorEl.remove();
                this.mirrorEl = null;
            }

            this.clearAllClasses();

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
            if (this.options.draggingClass) el.classList.remove(this.options.draggingClass!);
            if (this.options.targetClass) el.classList.remove(this.options.targetClass!);
        });
    }

    public destroy() {
        this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    }
}
