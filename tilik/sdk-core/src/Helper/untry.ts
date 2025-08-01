type FnExpr<V> = (...args: any[]) => V | Promise<V>
type UntryExpr<V> = FnExpr<V> | Promise<V>

export default function untry<V = undefined, E = undefined>(expression: UntryExpr<V>, ...args: any[]): [V?, E?] {
    try {
        const result = (typeof expression === 'function')
            ? (expression as FnExpr<V>).apply(null, args)
            : expression

        if (result && (result as Promise<V>).then) {
            return (result as Promise<V>)
                .then((res: V) => [res])
                .catch((err: E) => [undefined, err]) as never as [V?, E?]
        }
        return [result, undefined] as never as [V?, E?]
    } catch (err) {
        return [undefined, err] as [V?, E?]
    }
}
