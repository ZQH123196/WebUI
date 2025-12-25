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
    /** 分组标识，相同分组的实例可以互相拖拽 */
    group?: string;
    /** 判定该项是否允许被拖动 */
    canDrag?: (index: number, element: HTMLElement) => boolean;
    /** 当在同一个容器内交换时的回调 */
    onSwap?: (oldIndex: number, newIndex: number) => void;
    /** 当项从外部容器移入当前容器时的回调 */
    onAdd?: (oldIndex: number, newIndex: number, fromContainer: HTMLElement) => void;
}

export class MyTsDnD {
    private static allInstances: MyTsDnD[] = [];

    public container: HTMLElement;
    private options: MyTsDnDOptions;
    private startIdx: number | null = null;
    private lastTargetIdx: number | null = null;
    private lastTargetInstance: MyTsDnD | null = null;
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
        MyTsDnD.allInstances.push(this);
    }

    private init() {
        this.container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    }

    private handleMouseDown(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const itemElement = target.closest(this.options.itemSelector) as HTMLElement;

        if (itemElement && this.container.contains(itemElement)) {
            event.preventDefault();

            const items = this.getItems();
            const index = items.indexOf(itemElement);

            if (index !== -1) {
                if (this.options.canDrag && !this.options.canDrag(index, itemElement)) {
                    return;
                }
                this.startDrag(index, itemElement, event);
            }
        }
    }

    private getItems(): HTMLElement[] {
        return Array.from(this.container.querySelectorAll(this.options.itemSelector));
    }

    private startDrag(index: number, element: HTMLElement, event: MouseEvent) {
        if (this.isActive) return;
        this.isActive = true;
        this.startIdx = index;
        this.lastTargetIdx = index;
        this.lastTargetInstance = this;

        // 1. 创建镜像元素
        this.mirrorEl = element.cloneNode(true) as HTMLElement;
        this.mirrorEl.classList.remove(this.options.draggingClass!);
        if (this.options.mirrorClass) {
            this.mirrorEl.classList.add(this.options.mirrorClass);
        }

        const rect = element.getBoundingClientRect();
        Object.assign(this.mirrorEl.style, {
            position: 'fixed',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            pointerEvents: 'none',
            zIndex: '9999',
            opacity: '0.8',
            transition: 'none'
        });

        document.body.appendChild(this.mirrorEl);

        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        if (this.options.draggingClass) {
            element.classList.add(this.options.draggingClass);
        }

        const onMouseMove = (e: MouseEvent) => {
            if (this.startIdx === null || !this.mirrorEl) return;

            this.mirrorEl.style.left = `${e.clientX - offsetX}px`;
            this.mirrorEl.style.top = `${e.clientY - offsetY}px`;

            // 搜索落点，支持跨实例搜索（Shared List）
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);

            // 找到包含该元素的实例
            let targetInstance: MyTsDnD | null = null;
            let targetItem: HTMLElement | null = null;

            // 优先检查当前分组
            const groupInstances = this.options.group
                ? MyTsDnD.allInstances.filter(inst => inst.options.group === this.options.group)
                : [this];

            for (const inst of groupInstances) {
                const item = hoveredEl?.closest(inst.options.itemSelector) as HTMLElement;
                if (item && inst.container.contains(item)) {
                    targetInstance = inst;
                    targetItem = item;
                    break;
                }
                // 允许拖拽到空容器
                if (hoveredEl && (hoveredEl === inst.container || inst.container.contains(hoveredEl))) {
                    targetInstance = inst;
                    break;
                }
            }

            // 清理旧的高亮
            if (this.lastTargetInstance) {
                this.lastTargetInstance.clearTargetClasses();
            }

            if (targetInstance) {
                this.lastTargetInstance = targetInstance;
                const items = targetInstance.getItems();

                if (targetItem) {
                    const targetIdx = items.indexOf(targetItem);
                    if (targetIdx !== -1) {
                        this.lastTargetIdx = targetIdx;
                        if (targetInstance.options.targetClass) {
                            targetItem.classList.add(targetInstance.options.targetClass);
                        }
                    }
                } else {
                    // 如果命中了容器但没命中具体项，则默认排在最后
                    this.lastTargetIdx = items.length;
                    if (targetInstance.options.targetClass) {
                        targetInstance.container.classList.add(targetInstance.options.targetClass);
                    }
                }
            } else {
                this.lastTargetIdx = this.startIdx;
                this.lastTargetInstance = this;
            }
        };

        const stopDrag = () => {
            const finalStartIdx = this.startIdx;
            const finalTargetIdx = this.lastTargetIdx;
            const finalInstance = this.lastTargetInstance;

            this.isActive = false;
            this.startIdx = null;
            this.lastTargetIdx = null;
            this.lastTargetInstance = null;

            if (this.mirrorEl) {
                this.mirrorEl.remove();
                this.mirrorEl = null;
            }

            // 清理所有实例的样式
            MyTsDnD.allInstances.forEach(inst => inst.clearAllClasses());

            if (finalInstance && finalStartIdx !== null && finalTargetIdx !== null) {
                if (finalInstance === this) {
                    // 同容器内部交换
                    if (finalStartIdx !== finalTargetIdx && finalTargetIdx < this.getItems().length) {
                        if (this.options.onSwap) this.options.onSwap(finalStartIdx, finalTargetIdx);
                    }
                } else {
                    // 跨容器添加
                    if (finalInstance.options.onAdd) {
                        finalInstance.options.onAdd(finalStartIdx, finalTargetIdx, this.container);
                    }
                }
            }

            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', stopDrag);
    }

    public clearTargetClasses() {
        if (this.options.targetClass) {
            this.container.classList.remove(this.options.targetClass);
            this.container.querySelectorAll(this.options.itemSelector).forEach(el => {
                el.classList.remove(this.options.targetClass!);
            });
        }
    }

    public clearAllClasses() {
        if (this.options.draggingClass) this.container.classList.remove(this.options.draggingClass);
        if (this.options.targetClass) this.container.classList.remove(this.options.targetClass);

        this.container.querySelectorAll(this.options.itemSelector).forEach(el => {
            if (this.options.draggingClass) el.classList.remove(this.options.draggingClass!);
            if (this.options.targetClass) el.classList.remove(this.options.targetClass!);
        });
    }

    public destroy() {
        this.container.removeEventListener('mousedown', this.handleMouseDown.bind(this));
        MyTsDnD.allInstances = MyTsDnD.allInstances.filter(inst => inst !== this);
    }
}
