import { Subject, ObservableInput, OperatorFunction, ObservedValueOf, 
   from, GroupedObservable} from "rxjs";
import { groupBy, mergeMap, switchMap, tap, finalize } from "rxjs/operators";

export function switchMapByKey<T, K, O extends ObservableInput<any>>(
  keySelector: (value: T) => K,
  project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>> {
  return (source) => {
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
      mergeMap((group) =>
        group.pipe(
          switchMap((e, i) =>
            from(project(e, i)).pipe(
              tap({complete: () => { vault[group.key].complete(); }})
             )
          ),
          finalize(() => { delete vault[group.key]; })
        )
      ) as OperatorFunction<GroupedObservable<K, T>, ObservedValueOf<O>>
    )
  }
}
