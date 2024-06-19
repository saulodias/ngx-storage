# NgxStorage

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.4.

## Overview

NgxStorage provides a set of property decorators for storing data in local or session storage, leveraging RxJS `BehaviorSubject` for reactive state management. This library helps in keeping your data in sync with the browser's storage.

## Usage

### LocalStorage

Use the `LocalStorage` decorator to store data in local storage.
```typescript
import { LocalStorage } from 'ngx-storage';
import { BehaviorSubject } from 'rxjs';

class TestClass {
    @LocalStorage('key', 'defaultValue')
    public localStorageValue!: BehaviorSubject<string | null>;
}
```

### SessionStorage

Use the `SessionStorage` decorator to store data in session storage.
```typescript
import { SessionStorage } from 'ngx-storage';
import { BehaviorSubject } from 'rxjs';

class TestClass {
    @SessionStorage('key', 'defaultValue')
    public sessionStorageValue!: BehaviorSubject<string | null>;
}
```

### Custom JSON Converter

You can also provide a custom JSON converter for more complex types.
```typescript
import { JsonConverter, SessionStorage } from 'ngx-storage';
import { BehaviorSubject } from 'rxjs';

type CustomType = { date: Date };
type CustomTypeStored = { date: number };

const customConverter: JsonConverter<CustomType, CustomTypeStored> = {
    toJson: (object) => ({ date: object.date.getTime() }),
    fromJson: (object) => ({ date: new Date(object.date) }),
};

class TestClass {
    @SessionStorage('key', { date: new Date() }, customConverter)
    public sessionStorageValue!: BehaviorSubject<CustomType | null>;
}
```
### Using in an Angular Service

Here's an example of how to use these decorators in an Angular service:
```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorage, SessionStorage } from 'ngx-storage';

@Injectable({
    providedIn: 'root',
})
export class StorageService {
    @LocalStorage('localKey', 'defaultLocalValue')
    public localStorageValue!: BehaviorSubject<string | null>;

    @SessionStorage('sessionKey', 'defaultSessionValue')
    public sessionStorageValue!: BehaviorSubject<string | null>;

    constructor() {
        // Subscribe to localStorageValue
        this.localStorageValue.subscribe(value => {
            console.log('LocalStorage value:', value);
        });

        // Set a new value to localStorageValue
        this.localStorageValue.next('newLocalValue');

        // Subscribe to sessionStorageValue
        this.sessionStorageValue.subscribe(value => {
            console.log('SessionStorage value:', value);
        });

        // Set a new value to sessionStorageValue
        this.sessionStorageValue.next('newSessionValue');
    }
}
```

### Using the Service in a Component
```typescript
import { Component, OnInit } from '@angular/core';
import { StorageService } from './storage.service';

@Component({
    selector: 'app-storage-example',
    templateUrl: './storage-example.component.html',
    styleUrls: ['./storage-example.component.css']
})
export class StorageExampleComponent implements OnInit {

    constructor(private storageService: StorageService) {}

    ngOnInit() {
        // Access and use the storage service properties as needed
        console.log('LocalStorage Initial:', this.storageService.localStorageValue.value);
        console.log('SessionStorage Initial:', this.storageService.sessionStorageValue.value);

        // Update the values
        this.storageService.localStorageValue.next('updatedLocalValue');
        this.storageService.sessionStorageValue.next('updatedSessionValue');
    }
}
```

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
