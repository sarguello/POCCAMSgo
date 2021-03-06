import { Injectable } from '@angular/core';
import { Estate } from './data-model/estate';
import { db } from './my-app-database';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Lookups } from './data-model/lookups';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class EstateService {

  private estateUrl = 'http://camsgosvr1:8080/camsgo/rest/cases/';
  private pulledEstateObs: Observable<Estate>;
  private pulledEstate: Estate;

  constructor(
    private http: HttpClient,
    private datepipe: DatePipe
  ) { }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.log(error); // log to console instead
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  getEstateFromHttp(estateNumber: string): void {
    this.http.get<Estate>(this.estateUrl + estateNumber).subscribe(
      pulledEstate => { this.saveEstate(pulledEstate, true); },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('Client-side Error occured');
        } else {
          console.log('Server-side Error occured');
        }
      }
    );
  }

  getLookupsFromHttp(): void {
    
  }

  postEstateToHttp(estate: Estate): void {
    console.log(estate);
    this.http.post(this.estateUrl + 'update', estate, httpOptions).subscribe(
      res => { console.log(res); },
      err => { console.log('Error occured: ' + err.error.message + err.status); }
    );
  }

  getEstates(): Promise<Estate[]> {
    return Promise.resolve(db.estates.toArray());
  }
  getEstate(id: number): Promise<Estate> {
    return this.getEstates()
      .then(estates => estates.find(estate => estate.id === id));
  }
  saveEstate(estate: Estate, fromServer: boolean): void {
    if (fromServer) {
      for (let tempid of estate.identifiers) {
        if(tempid.expirationDate != null) {
          let date = new Date(tempid.expirationDate);
          tempid.expirationDate = this.datepipe.transform(date, 'yyyy-MM-dd');
        }
        if(tempid.issueDate != null) {
          let date = new Date(tempid.issueDate);
          tempid.issueDate = this.datepipe.transform(date, 'yyyy-MM-dd');
        }
      }
    }
    db.estates.put({
      id: Number(estate.id),
      casetypeLookup: estate.casetypeLookup,
      estateNumber: estate.estateNumber,
      courtCaseNo: estate.courtCaseNo,
      casestatLookup: estate.casestatLookup,
      caseWeight: estate.caseWeight,
      legalStatusLookup: estate.legalStatusLookup,
      interfaceSent: estate.interfaceSent,
      names: estate.names,
      identifiers: estate.identifiers
    });
  }
  update(estate: Estate): Promise<number> {
    return db.estates.put({
      id: Number(estate.id),
      casetypeLookup: estate.casetypeLookup,
      estateNumber: estate.estateNumber,
      courtCaseNo: estate.courtCaseNo,
      casestatLookup: estate.casestatLookup,
      caseWeight: estate.caseWeight,
      legalStatusLookup: estate.legalStatusLookup,
      interfaceSent: estate.interfaceSent,
      names: estate.names,
      identifiers: estate.identifiers
    });
  }
  delete(estate: Estate): void {
    db.estates.delete(estate.id);
  }
}
