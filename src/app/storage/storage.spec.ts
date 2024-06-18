import { BehaviorSubject } from 'rxjs';
import { JsonConverter, LocalStorage, SessionStorage } from './storage';

type CustomType = { date: Date };
type CustomeTypeStored = { date: number };

const testkey2Converter: JsonConverter<CustomType, CustomeTypeStored> = {
    toJson: (object) => ({ date: object.date.getTime() }),
    fromJson: (object) => ({ date: new Date(object.date) }),
}

const DEFAULT_DATE = new Date('2024-01-01');

// Test class
class TestClass {
    @LocalStorage('testKey', 'defaultValue')
    public localStorageValue!: BehaviorSubject<string | null>;

    @SessionStorage('testKey', 'defaultValue')
    public sessionStorageValue!: BehaviorSubject<string | null>;

    @SessionStorage('testKey2', { date: DEFAULT_DATE }, testkey2Converter)
    public sessionStorageValue2!: BehaviorSubject<CustomType | null>;

    // Test class for emition test. Do not use in other tests.
    @SessionStorage('testKey3', 'emitionTestValue')
    public sessionStorageValue3!: BehaviorSubject<string>;
}

describe('Storage decorators', () => {
    let testClass: TestClass;

    beforeEach(() => {
        // Clear storage before each test
        localStorage.clear();
        sessionStorage.clear();

        testClass = new TestClass();
    });

    it('should set and get localStorage value', () => {
        testClass.localStorageValue.next('newValue');
        expect(testClass.localStorageValue.value).toBe('newValue');
        expect(localStorage.getItem('rca_testKey')).toBe(JSON.stringify('newValue'));
    });

    it('should set and get sessionStorage value', () => {
        testClass.sessionStorageValue.next('newValue');
        expect(testClass.sessionStorageValue.value).toBe('newValue');
        expect(sessionStorage.getItem('rca_testKey')).toBe(JSON.stringify('newValue'));
    });

    it('should set and get sessionStorage value with custom converter', () => {
        const date = new Date();
        testClass.sessionStorageValue2.next({ date });
        expect(testClass.sessionStorageValue2.value).toEqual({ date });
        expect(sessionStorage.getItem('rca_testKey2')).toBe(
            JSON.stringify({ date: date.getTime() }),
        );
    });

    it('should clear and emit fallback state for localStorage when value is nullish', () => {
        // Set value to null
        testClass.localStorageValue.next(null);

        // Expect the value to be the fallback state
        expect(testClass.localStorageValue.value).toBe('defaultValue');
    });

    it('should clear and emit fallback state for sessionStorage when value is nullish', () => {
        // Set value to null
        testClass.sessionStorageValue.next(null);

        // Expect the value to be the fallback state
        expect(testClass.sessionStorageValue.value).toBe('defaultValue');
    });

    it('should clear and emit fallback state for sessionStorage with custom converter when value is nullish', () => {
        // Set value to a valid value
        testClass.sessionStorageValue2.next({ date: new Date() });

        // Set value to null
        testClass.sessionStorageValue2.next(null);

        // Expect the value to be the fallback state
        expect(testClass.sessionStorageValue2.value).toEqual({ date: DEFAULT_DATE });
    });
});



describe('sessionStorageValue', () => {
    let emitionTestClass: TestClass;

    beforeAll(() => {
        emitionTestClass = new TestClass();
    });

    afterAll(() => {
        sessionStorage.clear();
    });

    it('should emit correct values', (done) => {
        const expectedValues: string[] = ['emitionTestValue', 'value1', 'value2', 'value3'];

        emitionTestClass.sessionStorageValue3.subscribe((value) => {
            expect(value).toBe(expectedValues.shift() as string); // Check and remove the first value
            if (expectedValues.length === 0) {
                done();
            }
        });

        // Emit the values
        emitionTestClass.sessionStorageValue3.next('value1');
        emitionTestClass.sessionStorageValue3.next('value2');
        emitionTestClass.sessionStorageValue3.next('value3');
    });
});