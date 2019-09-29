import { Observable, fromEvent, Subject, OperatorFunction, EMPTY } from 'rxjs';
import {
  tap,
  groupBy,
  timeoutWith,
  ignoreElements,
  map,
  switchMap,
  mergeAll
} from 'rxjs/operators';
import { switchMapByKey } from './operator.ts'
import { setButtonEmoji, clearOutput, addToOutput, Movie, toggleStatus } from './helpers';

document.querySelector('#clear-output').addEventListener('click', clearOutput);

const button1 = document.querySelector('#movie1');
const button2 = document.querySelector('#movie2');

const movie1$: Observable<Event> = fromEvent(button1, 'click');
movie1$.subscribe(() => dispatcher.next({ movieId: 1 }));

const movie2$: Observable<Event> = fromEvent(button2, 'click');
movie2$.subscribe(() => dispatcher.next({ movieId: 2 }));

const dispatcher = new Subject<Movie>();

const actions$ = dispatcher.asObservable().pipe(
  tap(({ movieId }) => setButtonEmoji(movieId)),
  switchMapByKey((movie: Movie) => movie.movieId, (movie: Movie) => toggleStatus(movie.movieId))
);

actions$.subscribe((data: Movie) => {
  addToOutput(`Custom operator: Movie ${data.movieId} complete; state: ${data.status}`);
});
