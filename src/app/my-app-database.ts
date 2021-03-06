import Dexie from 'dexie';
import { Estate } from './data-model/estate';

export class MyAppDatabase extends Dexie {
   estates: Dexie.Table<Estate, number>;

   constructor () {
      super('MyAppDatabase');
      this.version(1).stores({
         estates: `id, casetypLookup, &estateNumber,
                  courtCaseNo, casestatLookup, caseWeight,
                  legalStatusLookup, interfaceSent, *names, *identifiers`,
      });
      this.estates.mapToClass(Estate);
   }
}

export let db = new MyAppDatabase();
