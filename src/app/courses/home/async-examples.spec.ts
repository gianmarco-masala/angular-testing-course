import { fakeAsync, flush, flushMicrotasks, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

// For components that internally use browser async operations such as setTimeout, setInterval and so on.
describe('Async Testing Examples', () => {
    it('Async test example with Jasmine done()', (done: DoneFn) => {
        let test = false;

        setTimeout(() => {
            test = true;
            expect(test).toBeTruthy();
            done();
        }, 1000);
    });

    // By wrapping our arrow function with fakeAsync, we make sure that code is executed
    // inside an angular zone
    it('Async test example with setTimeout()', fakeAsync(() => {
        let test = false;

        setTimeout(() => { });
        setTimeout(() => {
            test = true;
        }, 1000);

        // tick(1000); // Simulate time passing by (in ms). It can be put only inside a fakeAsync zone
        flush(); // Upgrade from tick(): make sure that all macrotasks get executed

        expect(test).toBeTruthy();
    }));

    it('Async test example - plain Promise', fakeAsync(() => {
        let test = false;

        console.log('Creating promise');

        // Promise is considered as microtask, so it will take precedence over macrotasks such as setTimeout etc
        Promise.resolve().then(() => {
            console.log('Promise 1');
            return Promise.resolve();
        })
            .then(() => {
                console.log('Promise 2');
                test = true;
            });

        // Flush all pending microtasks before executing the next code
        flushMicrotasks();

        console.log('Running test assertions');
        expect(test).toBeTruthy();
    }));

    it('Async test example - Promises + setTimeout', fakeAsync(() => {
        let counter = 0;

        Promise.resolve().then(() => {
            counter += 10;
            setTimeout(() => {
                counter += 1;
            }, 1000);
        });

        expect(counter).toBe(0);
        flushMicrotasks();
        expect(counter).toBe(10);
        tick(500);
        expect(counter).toBe(10);
        tick(500);
        expect(counter).toBe(11);
    }));

    it('Async test example - Observables', fakeAsync(() => {
        let test = false;

        console.log('Creating observable');

        const test$ = of(test).pipe(delay(1000));

        test$.subscribe(() => {
            test = true;
        });

        tick(1000);

        console.log('Running test assertions');
        expect(test).toBeTruthy();
    }));

});
