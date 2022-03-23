import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CoursesCardListComponent } from './courses-card-list.component';
import { CoursesModule } from '../courses.module';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { sortCoursesBySeqNo } from '../home/sort-course-by-seq';
import { setupCourses } from '../common/setup-test-data';

// PRESENTATIONAL COMPONENT TESTING 
// A component that receives data externally as input without 
// using Observables etc, then simply displays this data in the DOM.
describe('CoursesCardListComponent', () => {
  let component: CoursesCardListComponent;
  let fixture: ComponentFixture<CoursesCardListComponent>;
  let el: DebugElement;

  // Better using a unique asynchronous beforeEach, instead of
  // two as the CLI suggests.
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // Importing only the CoursesModule which contains already everything we need
      imports: [CoursesModule],
    })
      // In order to correctly compile components, 
      // we have to wait for promise to be resolved.
      // By wrapping with waitForAsync() we make sure that
      // the code block inside then() gets actually
      // executed before each spec.
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CoursesCardListComponent);
        component = fixture.componentInstance;
        el = fixture.debugElement;
      });
  }));

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });


  // DOM interaction
  it("should display the course list", () => {
    component.courses = setupCourses();
    // After assigning an arbitrary value to some component's property,
    // we must manually trigger a change detection cycle in order to 
    // force angular to take our assignment into account.
    fixture.detectChanges();
    const cards = el.queryAll(By.css('.course-card'));

    expect(cards).toBeTruthy('Could not find cards');
    expect(cards.length).toBe(12, 'Unexpected number of courses');
  });


  it("should display the first course", () => {
    component.courses = setupCourses();
    fixture.detectChanges();

    const course = component.courses[0];
    const card = el.query(By.css('.course-card:first-child')); // using first-child css pseudo selector
    const title = card.query(By.css('mat-card-title'));
    const image = card.query(By.css('img'));

    expect(card).toBeTruthy();
    expect(title.nativeElement.textContent).toBe(course.titles.description);
    expect(image.nativeElement.src).toBe(course.iconUrl);
  });
});
