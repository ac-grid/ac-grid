/**
 * 移动数组元素的工具函数
 * @param array 原始数组
 * @param from 源索引
 * @param to 目标索引
 * @returns 新数组
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
}
