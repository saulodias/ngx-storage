import { BehaviorSubject } from 'rxjs';

export const STORAGE_KEYS_PREFIX = 'rca_';

export interface JsonConverter<AppType, ParsedType> {
    toJson: (value: AppType) => ParsedType;
    fromJson: (storedValue: ParsedType) => AppType;
}
/**
 * Creates a property decorator that allows you to store data in local or session storage.
 * @param storage local or session storage.
 * @param keyPrefix a string that will be used as a prefix in local or session storage.
 * @returns 
 */
const storageFactory =
    (storage: Storage, keyPrefix: string) =>
        <AppType, ParsedType = AppType>(
            storageKey: string,
            fallbackState: AppType,
            converter?: JsonConverter<AppType, ParsedType>,
        ): BehaviorSubject<AppType> => {
            if (!storageKey)
                throw new Error(
                    `"storageKey" must be a nonempty string, but "${storageKey}" was passed.`,
                );

            const storedString = storage.getItem(keyPrefix + storageKey);
            let initialValue: AppType;
            if (storedString && converter) {
                const parsedValue = JSON.parse(storedString) as ParsedType;
                initialValue = converter.fromJson(parsedValue);
            } else if (storedString) {
                initialValue = JSON.parse(storedString) as AppType;
            } else {
                initialValue = fallbackState;
            }

            const subject = new BehaviorSubject<AppType>(initialValue);

            subject.subscribe((value) => {
                if (value == null) {
                    storage.removeItem(keyPrefix + storageKey);
                    subject.next(fallbackState);
                    return;
                } else if (converter && value != null) {
                    const jsonValue = converter.toJson(value);
                    storage.setItem(keyPrefix + storageKey, JSON.stringify(jsonValue));
                } else {
                    storage.setItem(keyPrefix + storageKey, JSON.stringify(value));
                }
            });

            return subject;
        };
/**
 * Creates a property decorator that allows you to store data in local storage.
 * @param storageKey a string that will be used as a key in local storage.
 * @param fallbackState the value that will be stored in local storage if there is no value in local storage.
 * @param converter a JSON converter that will be used to convert data to and from JSON.
 * 
 * @example
 * ```typescript
 * class TestClass {
 *   @LocalStorage('key', { date: new Date() })
 *   public date!: BehaviorSubject<{ date: Date } | null>;
 * }
 * ```
 */
function LocalStorage<AppType, ParsedType = AppType>(
    storageKey: string,
    fallbackState: AppType,
    converter?: JsonConverter<AppType, ParsedType>,
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        const localStorageSubject = storageFactory(localStorage, STORAGE_KEYS_PREFIX)(
            storageKey,
            fallbackState,
            converter,
        );

        Object.defineProperty(target, propertyKey, {
            get: () => localStorageSubject,
            enumerable: true,
            configurable: true,
        });
    };
}

/**
 * Creates a property decorator that allows you to store data in session storage.
 * @param storageKey a string that will be used as a key in session storage.
 * @param fallbackState the value that will be stored in session storage if there is no value in session storage.
 * @param converter a JSON converter that will be used to convert data to and from JSON.
 * 
 * @example
 * ```typescript
 * class TestClass {
 *   @SessionStorage('myKey', 'myFallbackState')
 *   public date!: BehaviorSubject<string | null>;
 * }
 * ```
 */
function SessionStorage<AppType, ParsedType = AppType>(
    storageKey: string,
    fallbackState: AppType,
    converter?: JsonConverter<AppType, ParsedType>,
): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        const sessionStorageSubject = storageFactory(sessionStorage, STORAGE_KEYS_PREFIX)(
            storageKey,
            fallbackState,
            converter,
        );

        Object.defineProperty(target, propertyKey, {
            get: () => sessionStorageSubject,
            enumerable: true,
            configurable: true,
        });
    };
}

export { LocalStorage, SessionStorage };

