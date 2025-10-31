import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError, timer } from 'rxjs';
import { retry, timeout, catchError } from 'rxjs/operators';

export const httpRetryInterceptor: HttpInterceptorFn = (req, next) => {
  // Set timeout to 45 seconds (Render free tier can take up to 30s to wake)
  const timeoutDuration = 45000;
  const maxRetries = 2;
  const retryDelay = 1000;

  return next(req).pipe(
    timeout(timeoutDuration),
    retry({
      count: maxRetries,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Don't retry on 4xx errors (client errors)
        if (error.status >= 400 && error.status < 500) {
          return throwError(() => error);
        }

        console.log(`Retry attempt ${retryCount} for ${req.url}`);
        return timer(retryDelay * retryCount); // Exponential backoff
      }
    }),
    catchError((error: any) => {
      if (error.name === 'TimeoutError') {
        console.error('Request timeout:', req.url);
        return throwError(() => new Error(
          'Request took too long. The server might be starting up (this can take 30+ seconds on free hosting). Please try again.'
        ));
      }
      return throwError(() => error);
    })
  );
};
