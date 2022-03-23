import { HttpErrorResponse } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { CoursesService } from "./courses.service";

describe('CoursesService', () => {
    let coursesService: CoursesService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                // We must use this testing module instead of the HttpClient,
                // in order to prevent actual API calls to be made.
                HttpClientTestingModule,
            ],
            providers: [
                CoursesService,
            ],
        });

        coursesService = TestBed.inject(CoursesService);
        httpTestingController = TestBed.inject(HttpTestingController); // inject this instead of an instance of HttpClient
    });

    it('should retrieve all courses', () => {
        // 1. Subscribe to method
        coursesService.findAllCourses().subscribe(
            courses => {
                // 4. Set expectations on retrieved data
                expect(courses).toBeTruthy('No courses returned'); // custom err message to be displayed if expectation fails
                expect(courses.length).toBe(12, 'incorrect number of courses');

                const course = courses.find(course => course.id === 12);
                expect(course.titles.description).toBe("Angular Testing Course");
            });

        // 2. Expect api to be called one time only and to have the proper http method
        const req = httpTestingController.expectOne('/api/courses');
        expect(req.request.method).toEqual('GET');

        // 3. Trigger the api call mocked by the HttpClientTestingModule in order to 
        // execute the code inside subscribe method.
        // As argument we are passing the value expected to be returned by the api call itself.
        req.flush({ payload: Object.values(COURSES) });
    });

    it('should find a course by id', () => {
        coursesService.findCourseById(12).subscribe(
            course => {
                expect(course).toBeTruthy('No course was found with provided id');
                expect(course.id).toBe(12, 'incorrect course id');
                expect(course.titles.description).toBe("Angular Testing Course");
            });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual('GET');
        req.flush(COURSES[12]);
    });

    it('should save the course data', () => {
        const changes = { titles: { description: 'Testing Course' } };

        coursesService.saveCourse(12, changes)
            .subscribe(course => {
                expect(course.id).toBe(12);
            });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual('PUT');
        expect(req.request.body.titles.description).toEqual('Testing Course')
        req.flush({ ...COURSES[12], ...changes });
    });

    it('should throw error if save course fails', () => {
        const changes = { titles: { description: 'Testing Course' } };

        coursesService.saveCourse(12, changes)
            .subscribe(
                () => fail('Save course operation should have failed'),
                (error: HttpErrorResponse) => {
                    expect(error.status).toBe(500);
                });

        const req = httpTestingController.expectOne('/api/courses/12');
        expect(req.request.method).toEqual('PUT');
        req.flush('Save course failed',
            {
                status: 500,
                statusText: 'Internal Server Error',
            }
        );

    });

    it('should find a list of lessons', () => {
        coursesService.findLessons(12)
            .subscribe(lessons => {
                expect(lessons).toBeTruthy();
                expect(lessons.length).toBe(3);
            });

        const req = httpTestingController.expectOne(r => r.url === '/api/lessons');
        expect(req.request.method).toEqual('GET');
        expect(req.request.params.get('courseId')).toEqual('12');
        expect(req.request.params.get('filter')).toEqual('');
        expect(req.request.params.get('sortOrder')).toEqual('asc');
        expect(req.request.params.get('pageNumber')).toEqual('0');
        expect(req.request.params.get('pageSize')).toEqual('3');

        req.flush({
            payload: findLessonsForCourse(12).slice(0, 3)
        });
    });

    afterEach(() => {
        // Make sure that whatever the expectOne() method expects is satisfied 
        // (in this case, this makes sure that we make just one api call)
        httpTestingController.verify();
    });
});