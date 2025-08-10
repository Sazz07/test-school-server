import { ZodError, ZodIssue } from 'zod';

import httpStatus from 'http-status';
import { TErrorSources, TGenericErrorResponse } from '../interface/error';

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    const pathValue = issue?.path[issue.path.length - 1];
    return {
      path: typeof pathValue === 'symbol' ? pathValue.toString() : pathValue,
      message: issue?.message,
    };
  });

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: 'Validation Error!',
    errorSources,
  };
};

export default handleZodError;
