import { Subject } from 'rxjs';

const subject = new Subject();

export const srs = {
    emitEvent: obj => subject.next(obj),
    catchEvent: () => subject.asObservable()
};