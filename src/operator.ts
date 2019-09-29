import { defer, Subject, ObservableInput, OperatorFunction, ObservedValueOf, 
   Observable } from "rxjs";
import { groupBy, mergeMap, switchMap, tap, finalize } from "rxjs/operators";

export function switchMapByKey<T, K, R, O extends ObservableInput<any>>(
  keySelector: (value: T) => K,
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O> | R> {
  return (source:Observable<T>) => {
    let vault: any = {};  
    return source.pipe(
      groupBy(
      (v) => {
        const key = keySelector(v);
        if (!vault[key]) vault[key] = new Subject<void>();
        return key;
      },
      item => item,
      group => vault[group.key]
      ),
      mergeMap(group =>
        group.pipe(
          switchMap((e, i) =>
            defer(() => project(e, i)).pipe(
              tap({ complete: () => { vault[group.key].complete(); }})
             )
          ),
          finalize(() => { delete vault[group.key]; })
        )
      )
    )
  }
}